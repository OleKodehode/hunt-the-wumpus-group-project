import { useParams, useLocation } from "react-router-dom";
import GameBoard from "../components/Map";
import { useState, useEffect, useCallback } from "react";
import Snackbar from "@mui/material/Snackbar";

const BASE_URL = "http://localhost:9001/api/game";

function Game() {
  const { gameId } = useParams();
  const { playerId } = useLocation().state || {};

  const [open, setOpen] = useState(false);
  const [playerLocation, setPlayerLocation] = useState(null);
  const [playerStatus, setPlayerStatus] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [coordinates, setCoordinates] = useState([]);
  const [graph, setGraph] = useState(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isMoving, setIsMoving] = useState(false);

  // Fetching player status
  const fetchPlayerStatus = useCallback(async () => {
    if (!playerId) {
      return <div>No player selected.</div>;
    }

    try {
      const response = await fetch(`${BASE_URL}/${playerId}/status`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      setPlayerStatus(data);
      setPlayerLocation(data.location);

      setError(null);
    } catch (err) {
      console.log("Failed to fetch data: ", err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [playerId, setIsLoading, setPlayerLocation, setPlayerStatus, setError]);

  // Fetching potential tile to move
  const handleMove = useCallback(
    async (targetCave) => {
      if (isMoving || playerStatus?.currentPlayer !== playerId) {
        console.log(
          "Move blocked: either moving already or not current player's turn."
        );
        return;
      }

      setIsMoving(true);
      setError(null);

      try {
        const response = await fetch(`${BASE_URL}/${playerId}/move`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ targetCave }),
        });

        const result = await response.json(); // Await the JSON parsing

        if (
          !response.ok ||
          result.status === "error" ||
          result.status === "lost" ||
          result.status === "win"
        ) {
          // If the game ends or there's an error, update status then throw
          await fetchPlayerStatus();
          throw new Error(result.message || "Failed to move.");
        }

        // Immediately fetch new status to reflect the move
        await fetchPlayerStatus();
      } catch (err) {
        console.error("Failed to move:", err);
        setError(err);
      } finally {
        setIsMoving(false);
      }
    },
    [isMoving, playerStatus, playerId, fetchPlayerStatus]
  );

  // Fetching map data (coordinates and graph)
  useEffect(() => {
    const fetchMapData = async () => {
      if (!playerId) {
        return;
      }
      setIsLoadingData(true);
      try {
        // Fetch both coordinates and graph
        const [coordsRes, graphRes] = await Promise.all([
          fetch(`${BASE_URL}/${playerId}/coordinates`),
          fetch(`${BASE_URL}/${playerId}/map`),
        ]);

        if (!coordsRes.ok) {
          throw new Error(`Failed to fetch coordinates: ${coordsRes.status}`);
        }
        if (!graphRes.ok) {
          throw new Error(`Failed to fetch graph: ${graphRes.status}`);
        }

        const coordsData = await coordsRes.json();
        const graphData = await graphRes.json();

        setCoordinates(coordsData);
        setGraph(graphData);
      } catch (err) {
        console.error("Failed to fetch map data:", err);
        setError(err);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchMapData();
  }, [playerId]);

  // WASD movement
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (playerLocation === null || !graph) return;

      const key = e.key.toLowerCase();
      const neighbors = graph[playerLocation];
      if (!neighbors) return;

      let targetCave = null;

      switch (key) {
        case "w": //North
          targetCave = neighbors[1];
          break;
        case "a": //West
          targetCave = neighbors[0];
          break;
        case "s": //South
          targetCave = neighbors[3];
          break;
        case "d": //East
          targetCave = neighbors[2];
          break;
        default:
          return;
      }

      if (targetCave !== null) {
        handleMove(targetCave);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [playerLocation, graph, handleMove]);

  //Periodically refreshing player status
  useEffect(() => {
    if (!playerId) return;
    fetchPlayerStatus();
    const intervalId = setInterval(fetchPlayerStatus, 3000);

    return () => {
      clearInterval(intervalId);
    };
  }, [playerId]);

  //Copy function
  const copy = () => {
    navigator.clipboard.writeText(gameId);
    setOpen(true);
  };

  if (isLoading || isLoadingData) {
    return <p>Loading game data...</p>;
  }

  if (error) {
    return <p>Error loading game data: {error.message}</p>;
  }

  return (
    <div className="h-screen flex flex-row gap-50 bg-(--bg)">
      <GameBoard
        playerLocation={playerLocation}
        coordinates={coordinates}
        graph={graph}
        handleMove={handleMove}
        playerId={playerId}
        playerStatus={playerStatus}
      />
      <div>
        <h1
          className="cursor-pointer hover:text-(--color-title)"
          onClick={copy}
        >
          Game {gameId}
        </h1>
        <p>Player ID: {playerId}</p>
        {playerStatus && (
          <>
            <p>Current Location: {playerLocation}</p>
            <p>Arrows: {playerStatus.arrows}</p>
            <p>Alive: {playerStatus.isAlive ? "Yes" : "No"}</p>
            <p>Perceptions: {playerStatus.perceptions.join(", ")}</p>
            <p>Current Player: {playerStatus.currentPlayer}</p>
          </>
        )}

        <Snackbar
          open={open}
          autoHideDuration={2000}
          message="Copied!"
          onClose={() => setOpen(false)}
        />
      </div>
    </div>
  );
}

export default Game;
