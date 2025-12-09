import WumpusServer from "./new_server.js";
import { v4 as uuidv4 } from "uuid";

// --- Game State Storage ---

/**
 * @typedef {Object} GameEntry
 * @property {WumpusServer} server - Instance of the game logic.
 * @property {string[]} playerOrder - Turn order for players.
 * @property {number} currentPlayerIndex - Index of the current player's turn.
 * @property {"open"|"ok"|"error"|"lost"} status - The server status.
 */

/** @type {Object.<string, GameEntry>} - Active games indexed by gameId */
export const activeGames = {};

/** @type {Object.<string, string>} - Maps playerId to its gameId */
export const playerToGame = {};

export function createGame(req, res) {
  const gameId = uuidv4();
  const server = new WumpusServer();
  const playerId = uuidv4();

  const startLocation = server.initializePlayer(playerId);

  activeGames[gameId] = {
    server,
    playerOrder: [playerId],
    currentPlayerIndex: 0,
    status: "open",
  };

  playerToGame[playerId] = gameId;

  return {
    status: "ok",
    message: "New game created. Share this gameId for others to join.",
    preceptions: server._getPreceptions(startLocation),
    gameId,
    playerId,
    startLocation,
    numCaves: server.numTiles,
    currentPlayer: playerId,
  };
}

export function joinGame(req, res) {
  const { gameId } = req.params;
  const game = activeGames[gameId];

  if (!game) {
    return {
      status: "error",
      message: "Game not found.",
    };
  }

  if (game.status !== "open") {
    return {
      status: "error",
      message: "Cannot join. The game has already started.",
    };
  }

  const playerId = uuidv4();
  const startLocation = game.server.initializePlayer(playerId);

  game.playerOrder.push(playerId);
  playerToGame[playerId] = gameId;

  return {
    status: "ok",
    message: `Joined game ${gameId}. Go kill wumpus!`,
    preceptions: game.server._getPreceptions(startLocation),
    playerId,
    startLocation,
    numCaves: game.server.numTiles,
    currentPlayer: game.playerOrder[game.currentPlayerIndex],
  };
}

export function leaveGame(playerId) {
  if (!playerId) {
    return { status: "error", message: "Invalid playerId" };
  }

  const gameId = playerToGame[playerId];

  if (!gameId) {
    return { status: "error", message: "Player not in any active games." };
  }

  const game = activeGames[gameId];

  if (!game) {
    delete playerToGame[playerId];
    return { status: "error", message: "Game not found" };
  }

  // Remove player from queue
  game.playerOrder = game.playerOrder.filter((id) => id !== playerId);

  // Detach mapping
  delete playerToGame[playerId];

  // If the lobby is empty then remove the game
  if (game.playerOrder.length === 0) {
    delete activeGames[gameId];
    return {
      status: "ok",
      message: "You have left the game. Lobby closed due to zero players.",
    };
  }

  // Normalize currentPlayerIndex after removal
  if (game.currentPlayerIndex >= game.playerOrder.length) {
    game.currentPlayerIndex = 0;
  }

  return { status: "ok", message: "You left the game." };
}

export function deleteGame(gameId) {
  if (!gameId) return;

  const game = activeGames[gameId];
  if (!game) return;

  for (const playerId of game.playerOrder) {
    if (!playerToGame[playerId]) continue;
    delete playerToGame[playerId];
  }

  delete activeGames[gameId];

  console.log(`Game ${gameId} successfully terminated.`);
}

export function getGameList() {
  const gameList = [];

  for (const gameId in activeGames) {
    const game = activeGames[gameId];

    if (!game) continue;

    const players = Array.isArray(game.playerOrder) ? game.playerOrder : [];
    const numPlayers = players.length;

    // Safe access to server.numcaves
    const maxCaves =
      game.server && typeof game.server.numTiles === "number"
        ? game.server.numTiles
        : null;

    // safe current player (null when index invalid)
    const idx =
      typeof game.currentPlayerIndex === "number"
        ? game.currentPlayerIndex
        : -1;
    const currentPlayer =
      idx >= 0 && idx < players.length ? players[idx] : null;

    gameList.push({
      gameId,
      status: game.status,
      numPlayers,
      maxCaves,
      currentPlayer,
    });
  }

  return gameList;
}

export function advanceTurn(gameId) {
  const game = activeGames[gameId];
  if (!game) return;

  game.currentPlayerIndex =
    (game.currentPlayerIndex + 1) % game.playerOrder.length;

  // Skip dead players
  let attempts = 0;
  while (
    !game.server.gameState[game.playerOrder[game.currentPlayerIndex]]
      ?.is_alive &&
    attempts < game.playerOrder.length
  ) {
    game.currentPlayerIndex =
      (game.currentPlayerIndex + 1) % game.playerOrder.length;
    attempts++;
  }
}

export function checkPlayerAndTurn(req, res, next) {
  const { playerId } = req.params;
  const gameId = playerToGame[playerId];
  const game = activeGames[gameId];

  if (!game) {
    delete playerToGame[playerId];
    return res.status(404).json({
      status: "error",
      message: "Game over! The game has ended and been closed by the server.",
    });
  }

  if (!playerId || !gameId || !game) {
    return res.status(404).json({
      status: "error",
      message: "Player or game not found.",
    });
  }

  /* Try to have names match up with the key name
    if they are to be assigned to an object. */
  const gameServer = game.server;

  if (!gameServer.gameState[playerId] || !gameServer.gameState[playerId].is_alive) {
    return res.status(400).json({
      status: "lost",
      message: "You are dead and cannot act.",
    });
  }

  // Check turn order for action routes.
  const isActionRoute =
    req.path.includes("/move") || req.path.includes("/shoot");

  const currentPlayerId = game.playerOrder[game.currentPlayerIndex];

  if (isActionRoute && playerId !== currentPlayerId) {
    return res.status(403).json({
      status: "error",
      message: `It is currently ${currentPlayerId}'s turn. Please wait!`,
    });
  }

  /* Just "assign" to the object instead */
  Object.assign(req, {
    gameServer,
    gameId,
    playerId,
    game
  });

  next();
}

export function getTurnStatus(gameId) {
  const game = activeGames[gameId];

  if (!game) {
    return {
      status: "error",
      message: `Game not found. ${gameId} - ${game}`,
      currentPlayer: null,
    };
  }

  const players = Array.isArray(game.playerOrder) ? game.playerOrder : [];
  const idx =
    typeof game.currentPlayerIndex === "number" ? game.currentPlayerIndex : -1;
  const currentPlayer = idx >= 0 && idx < players.length ? players[idx] : null;

  return {
    status: "ok",
    message: "Current turn status retrieved successfully.",
    currentPlayer, // `currentPlayer: currentPlayer` is equivalent to `currentPlayer` in this context
  };
}

export function getHazardLocation(gameId) {
  const game = activeGames[gameId];

  if (!game) {
    return {
      status: "error",
      message: "Game not found.",
      hazards: null,
    };
  }

  const hazards = game.server.getHazardLocation();

  if (hazards.error) {
    return { status: "error", message: hazards.error, hzards: null };
  }

  return {
    status: "ok",
    message: "Hazard locations retrieved successfully.",
    hazards: hazards.hazards,
  };
}
