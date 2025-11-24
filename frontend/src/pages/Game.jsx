import { useParams } from "react-router-dom";
import Bat from "../components/Bat";

function Game() {
  const { gameId } = useParams();

  // fetch game data here
  // useEffect(() => fetch(`/api/game/${gameId}`), [])

  return (
    <div>
      <h1>Game {gameId}</h1>
    </div>
  );
}

export default Game;
