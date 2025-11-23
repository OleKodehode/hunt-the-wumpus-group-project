import { useEffect, useState } from "react";

const BASE_URL = "http://localhost:9001";

export default function Test() {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [gameData, setGameData] = useState(null);

  useEffect(() => {
    const createGame = async () => {
      setIsLoading(true);

      try {
        const response = await fetch(`${BASE_URL}/api/game/create`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const data = await response.json();
        setGameData(data);
      } catch (e) {
        setError(e);
      } finally {
        setIsLoading(false);
      }
    };

    createGame();
  }, []);

  return (
    <div className="tutorial">
      <h1 className="mb-4 text-2xl">Create Game</h1>

      {isLoading && <div>Loading...</div>}
      {gameData && (
        <div>
          <p>Game ID: {gameData.gameId}</p>
          <p>Player ID: {gameData.playerId}</p>
        </div>
      )}

      {error && <div>Error: {error.message}</div>}
    </div>
  );
}
