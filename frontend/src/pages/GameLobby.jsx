import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import TextField from "@mui/material/TextField";
import { useState } from "react";

const BASE_URL = `http://localhost:9001/api/game`;

function GameLobby() {
  const { gameId } = useParams();
  const location = useLocation();
  const { playerId } = location.state || {}; // Get playerId from state, with a fallback
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleJoin = async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (!inputValue) {
        setError("Please enter a Game ID.");
        return;
      }

      const response = await fetch(`${BASE_URL}/${inputValue}/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();

      if (!response.ok) {
        const errorMessage =
          data.message || `HTTP error! status: ${response.status}`;
        throw new Error(errorMessage);
      }

      navigate(`/game/${inputValue}`, {
        state: { playerId: data.playerId },
      });
    } catch (e) {
      setError(e);
    } finally {
      setIsLoading(false);
    }
  };

  const buttonStyle = {
    minWidth: "20dvw",
    fontFamily: "var(--font-button)",
    fontWeight: "bold",
    fontSize: "1rem",
    color: "#FFD700",
    backgroundColor: "#7B1E1E",
    border: "3px solid #FFD700",
    borderRadius: "15px",
    padding: "12px 24px",
    boxShadow: "4px 4px 0 #000",
    // backgroundImage: "url(buttonTexture.jpg)",
    // backgroundSize: "cover",
    // backgroundPosition: "center",

    "&:hover": {
      backgroundColor: "#531111ff",
      boxShadow: "2px 2px 0 #000",
      transform: "translateY(-2px)",
    },

    "&:active": {
      boxShadow: "inset 2px 2px 0 #000",
      transform: "translateY(2px)",
    },
  };

  return (
    <Box
      sx={{
        backgroundImage: "url('/bgMenu.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        width: "100%",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      <h1
        style={{
          fontFamily: "var(--font-title)",
          WebkitTextStroke: "0.5px #000",
          WebkitTextFillColor: "var(--color-title)",
          textShadow: "0px 10px 4px rgba(0,0,0,0.7)",
        }}
        className="text-6xl flex justify-self-center self-center pt-35 font-extrabold text-stroke"
      >
        Slay the Dragon
      </h1>
      <Stack
        spacing={2}
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "70%",
        }}
      >
        {gameId && playerId ? (
          <div className="flex flex-col max-w-[20dvw] gap-5">
            <p>Here is your Game ID: {gameId}</p>
            <TextField
              id="outlined-basic"
              label="Enter Game ID to join"
              variant="outlined"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <Button
              size="large"
              variant="contained"
              sx={buttonStyle}
              onClick={handleJoin}
            >
              Join the Game
            </Button>
          </div>
        ) : (
          <p>Loading game details...</p>
        )}
      </Stack>
    </Box>
  );
}

export default GameLobby;
