import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Link from "@mui/material/Link";
import { useState } from "react";

const BASE_URL = `http://localhost:9001/api/game`;

function GameMenu() {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleCreateGame = async () => {
    setIsLoading(true);

    try {
      const response = await fetch(`${BASE_URL}/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      if (data.gameId && data.playerId) {
        navigate(`/game/${data.gameId}`, {
          state: { playerId: data.playerId },
        });
      }
    } catch (e) {
      setError(e);
    } finally {
      setIsLoading(false);
    }
  };

  const buttonStyle = {
    minWidth: "20dvw",
    fontFamily: "var(--font-button)",
    fontSize: "1.1rem",
    color: "#d8c27a",
    textTransform: "none",

    background: "linear-gradient(to bottom, #000000, #1a0e07)",
    border: "2px solid #bfa46a",
    borderRadius: "6px",

    padding: "8px 24px",
    letterSpacing: "1px",

    boxShadow: `
      inset 0 2px 6px rgba(255, 215, 130, 0.15),
      0 0 8px rgba(0,0,0,0.6)
    `,
    // backgroundImage: "url(buttonTexture.jpg)",
    // backgroundSize: "cover",
    // backgroundPosition: "center",

    "&:hover": {
      background: "linear-gradient(to bottom, #1a0e07, #000000)",
      boxShadow: `
        inset 0 2px 6px rgba(255, 215, 130, 0.25),
        0 0 10px rgba(0,0,0,0.8)
      `,
    },

    "&::before": {
      content: '""',
      position: "absolute",
      top: "4px",
      left: "4px",
      right: "4px",
      bottom: "4px",
      border: "1px solid #bfa46a",
      borderRadius: "4px",
      pointerEvents: "none",
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
        <Button
          size="large"
          variant="text"
          sx={buttonStyle}
          onClick={handleCreateGame}
          disabled={isLoading}
        >
          <p className="text-[#d8c27a]">
            {isLoading ? "Creating Game..." : "Start Game"}
          </p>
        </Button>

        <Link href="/lobby/join">
          <Button
            size="large"
            variant="text"
            sx={buttonStyle}
            disabled={isLoading}
          >
            <p className="text-[#d8c27a]">Join game</p>
          </Button>
        </Link>
        {error && <p>Error: {error.message}</p>}
      </Stack>
    </Box>
  );
}

export default GameMenu;
