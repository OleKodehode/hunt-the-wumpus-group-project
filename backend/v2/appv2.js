import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "node:path";
// game server stuff
import {
  advanceTurn,
  checkPlayerAndTurn,
  createGame,
  deleteGame,
  getGameList,
  joinGame,
  leaveGame,
  getTurnStatus,
  getHazardLocation,
} from "./game_servicev2.js";

import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
const swaggerDocument = YAML.load("./swagger.yaml");

const PORT = process.env.PORT || 3000;
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// endpoints
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use("/api/game/create", (req, res) => {
  const result = createGame(req, res);
  res.json(result);
});

app.post("/api/game/:gameId/join", (req, res) => {
  const result = joinGame(req, res);
  if (result.status === "error") {
    return res.status(404).json(result);
  }
  res.json(result);
});

app.post("/api/game/:playerId/leave", (req, res) => {
  const { playerId } = req.params;
  const result = leaveGame(playerId);

  if (result.status === "erorr") {
    return res.status(404).json(result);
  }
  res.json(result);
});

app.get("/api/game/:playerId/connect", (req, res) => {
  const { playerId } = req.params;
  if (!playerId) {
    res.status(400).json({ status: "error", message: "Missing playerId." });
    return;
  }

  //SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  // Initial message
  res.write(`data: Connected to the server\n\n`);
  // Periodic updates (placeholder logic)
  const intervalId = setInterval(() => {
    const msg = `data: Current turn check: ${new Date().toISOString()}\n\n`;
    res.write(msg);
  }, 2000);

  //cleanup on disconnect
  res.on("close", () => {
    console.log(`Client ${playerId} disconnected. Cleaning up resources.`);
    clearInterval(intervalId);
    leaveGame(playerId); // Remove player and maybe close the lobby
    res.end();
  });
});

app.get("/api/game/list", (req, res) => {
  const result = getGameList();
  res.json(result);
});

app.get("/api/game/:gameId/turn", (req, res) => {
  const { gameId } = req.params;
  const result = getTurnStatus(gameId);

  if (result.status === "error") {
    return res.status(404).json(result);
  }
  res.json(result);
});

app.get("/api/game/:playerId/status", checkPlayerAndTurn, (req, res) => {
  const playerStatus = req.gameServer.getPlayerStatus(req.playerId);

  res.json({
    status: "ok",
    location: playerStatus.location,
    arrows: playerStatus.arrows,
    perceptions: playerStatus.perceptions,
    isAlive: playerStatus.is_alive,
    visitedLocations: playerStatus.visitedLocations,
    currentPlayer: req.game.playerOrder[req.game.currentPlayerIndex],
  });
});

app.get("/api/game/:playerId/map", checkPlayerAndTurn, (req, res) => {
  res.json({
    status: "ok",
    map: req.gameServer.getMapData(),
  });
});

app.get("/api/game/:playerId/ways", checkPlayerAndTurn, (req, res) => {
  const ways = req.gameServer.getNeighbors(req.playerId);

  console.log(location);

  res.json({
    status: "ok",
    ways: ways,
  });
});

app.post("/api/game/:playerId/move", checkPlayerAndTurn, (req, res) => {
  const { targetCave } = req.body;
  const target = parseInt(targetCave);

  if (isNan(target)) {
    return res.status(400).json({ status: "error", message: "Invalid target" });
  }

  if (req.game.status === "open") {
    req.game.status = "playing";
  }

  const result = req.gameServer.handlePlayerTurn(req.playerId, "move", target);

  if (result.status !== "error") {
    advanceTurn(req.gameId);
  }

  if (result?.status === "win" || result?.status === "lost") {
    if (req?.gameId) {
      deleteGame(req.gameId);
    }
  }

  res.json({
    ...result,
    currentPlayer: req.game.playerOrder[req.game.currentPlayerIndex],
  });
});

app.post("/api/game/:playerId/pass", checkPlayerAndTurn, (req, res) => {
  const result = req.gameServer.handlePlayerTurn(
    req.playerId,
    "pass",
    undefined
  );
});

app.get("/api/game/:gameId/hazards", (req, res) => {
  const { gameId } = req.params;
  console.log(gameId);
  const result = getHazardLocation(gameId);

  if (result.status === "error") {
    return res.status(404).json({ status: "error", message: result.message });
  }

  res.json(result);
});

app.get("/", (req, res) => {
  res.sendFile(path.join(process.cwd(), "/test.html"));
});

app.listen(PORT, () => {
  console.log(`Server listening to port ${PORT}`);
});
console.log(process.cwd());
