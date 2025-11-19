import GameLobby from "./GameLobby";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";

function GameMenu() {
  const buttonStyle = {
    minWidth: "20dvw",
    textTransform: "none",
    fontFamily: "var(--font-button)",
    fontWeight: "bold",
    fontSize: "1rem",
    color: "#FFD700",
    backgroundColor: "#7B1E1E",
    border: "3px solid #FFD700",
    borderRadius: "15px",
    padding: "12px 24px",
    boxShadow: "4px 4px 0 #000",

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
        <Button size="large" variant="contained" sx={buttonStyle}>
          Start Game
        </Button>
        <Button size="large" variant="contained" sx={buttonStyle}>
          Settings
        </Button>
      </Stack>
    </Box>
  );
}

export default GameMenu;
