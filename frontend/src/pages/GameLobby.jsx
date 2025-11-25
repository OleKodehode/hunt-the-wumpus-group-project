import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Link from "@mui/material/Link";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const BASE_URL = `http://localhost:9001/api/game`;

function GameLobby() {
  //Params
  const { gameId } = useParams();
  const location = useLocation();
  const { playerId } = location.state || {}; // Get playerId from state, with a fallback

  // States
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lobbies, setLobbies] = useState([]);

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

  const handleFetchLobbies = async () => {
    if (isLoading) return;
    setIsLoading(true);
    setError(null);
    setLobbies([]); // reset the array before fetching the updated list
    try {
      const response = await fetch(`${BASE_URL}/list`);
      const data = await response.json();
      const newLobbies = [];
      data.games.forEach((game) => {
        if (game.status === "open" && !lobbies.includes(game.gameId)) {
          setLobbies((prev) => [...prev, [game.gameId, game.numPlayers]]);
        }
      });
    } catch (e) {
      setError(e);
    } finally {
      setIsLoading(false);
    }
  };

  // fetch once at load
  useEffect(() => {
    setLobbies([]);
    handleFetchLobbies();
  }, []);

  // debugging
  // useEffect(() => {
  //   console.log("Lobbies changed: ", lobbies);
  // }, [lobbies]);

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
      <Box className="absolute left-10 xl:left-20 top-60 xl:top-20 h-4/6 xl:h-5/6 w-3/10 xl:w-2/8 bg-black/60 rounded-lg outline-2 outline-amber-300/50 p-2">
        <List>
          <Button
            sx={{ color: "orange", fontSize: "18px" }}
            onClick={handleFetchLobbies}
          >
            &#10226;
          </Button>
          {lobbies.map((value, index) => (
            <ListItem
              key={`lobby-${index}`}
              secondaryAction={
                <Button
                  size="small"
                  variant="text"
                  onClick={() => {
                    setInputValue(value[0]);
                  }}
                  sx={{
                    color: "orange",
                    display: "flex",
                    flexDirection: "col",
                  }}
                >
                  Set to join
                </Button>
              }
            >
              <ListItemText
                sx={{ color: "white", maxWidth: "50%" }}
                primary={`Lobby: ${value[0].slice(0, 8)}`}
              />
              <ListItemText
                sx={{ color: "white", maxWidth: "50%" }}
                primary={`Players: ${value[1]}`}
              />
            </ListItem>
          ))}
        </List>
      </Box>
      <Stack
        spacing={2}
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "70%",
        }}
      >
        <div className="flex flex-col max-w-[20dvw] gap-5">
          <TextField
            id="outlined-basic"
            label="Enter Game ID to join"
            variant="outlined"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <Button
            size="large"
            variant="text"
            sx={buttonStyle}
            onClick={handleJoin}
          >
            Join the Game
          </Button>
          <Link href="/">
            <Button
              size="large"
              variant="text"
              sx={buttonStyle}
              onClick={handleJoin}
            >
              Back to Menu
            </Button>
          </Link>
        </div>
      </Stack>
    </Box>
  );
}

export default GameLobby;
