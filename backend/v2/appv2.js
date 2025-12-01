import "dotenv/config";
import express from "express";
import cors from "cors";
// game server stuff
import { createGame, getGameList, joinGame } from "./game_servicev2.js";

import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
// const swaggerDocument = YAML.load();

const PORT = process.env.PORT || 3000;
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// endpoints
app.use("/api/game/create", (req, res) => {
  const result = createGame(req, res);
  res.json(result);
});

app.use("/api/game/:gameId/join", (req, res) => {
  const result = joinGame(req, res);
  if (result.status === "error") {
    return res.status(404).json(result);
  }
  res.json(result);
});

app.use("/api/game/list", (req, res) => {
  const result = getGameList();
  res.json(result);
});

app.use("/", (req, res) => {
  res.json({
    status: "ok",
    message: "Test",
  });
});

app.listen(PORT, () => {
  console.log(`Server listening to port ${PORT}`);
});
