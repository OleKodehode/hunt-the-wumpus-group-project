import WumpusServer from "./new_server.js";
import { v4 as uuidv4 } from "uuid";

// --- Game State Storage ---

/**
 * @typedef {Object} GameEntry
 * @property {WumpusServer} server - Instance of the game logic.
 * @property {string[]} playerOrder - Turn order for players.
 * @property {number} currentPlayerIndex - Index of the current player's turn.
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

  playerToGame[playerId];
  gameId;

  return {
    status: "ok",
    message: "New game created. Share this gameId for others to join.",
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
    playerId,
    startLocation,
    numPlayers: game.playerOrder.length,
  };
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
      numPlayers,
      maxCaves,
      status: game.status,
      currentPlayer,
    });
  }

  return {
    status: "ok",
    count: gameList.length,
    games: gameList,
  };
}
