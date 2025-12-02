import { useParams } from "react-router-dom";
import Map from "../components/Map";
import { useState } from "react";
import Snackbar from "@mui/material/Snackbar";
function Game() {
  const { gameId } = useParams();
  const [open, setOpen] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(gameId);
    setOpen(true);
  };
  // fetch game data here
  // useEffect(() => fetch(`/api/game/${gameId}`), [])

  return (
    <div className="m-5">
      <h1 className="cursor-pointer hover:text-(--color-title)" onClick={copy}>
        Game {gameId}
      </h1>
      <Snackbar
        open={open}
        autoHideDuration={2000}
        message="Copied!"
        onClose={() => setOpen(false)}
      />
      <Map />
    </div>
  );
}

export default Game;
