import { useParams, useLocation } from "react-router-dom";
import Map from "../components/Map";
import { useState, useEffect } from "react";
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
  const [isLoadingCoords, setIsLoadingCoords] = useState(true);

  // Fetching player status

  const fetchPlayerStatus = async () => {
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
  };

  // Fetching map coordinates

  useEffect(() => {
    const fetchMapCoordinates = async () => {
      if (!playerId) {
        return <div>No player selected.</div>;
      }

      try {
        const response = await fetch(`${BASE_URL}/${playerId}/coordinates`);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        setCoordinates(data);
      } catch (err) {
        console.error(`Failed to fetch map coordinates`, err);
        setError(err);
      } finally {
        setIsLoadingCoords(false);
      }
    };
    fetchMapCoordinates();
  }, [playerId]);

  //Periodically refreshing player status
  useEffect(() => {
    fetchPlayerStatus();
    const intervalId = setInterval(fetchPlayerStatus, 3000);

    return () => {
      clearInterval(intervalId);
    };
  }, [playerId]);

  const copy = () => {
    navigator.clipboard.writeText(gameId);
    setOpen(true);
  };

  if (isLoading) {
    return <p>Loading game status...</p>;
  }

  if (error) {
    return <p>Error loading game status: {error.message}</p>;
  }

  return (
    <div className="m-5 flex flex-row gap-50">
      <Map playerLocation={playerLocation} coordinates={coordinates} />
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
