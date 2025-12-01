// Based on master_controller.js made by MrHryhorii
// Trying to make map_gen.js fit into this.

import { GameMap, Grid } from "./map_gen.js";

export default class WumpusServerV2 {
  numPlayers = 0;
  constructor() {
    // this.gameSeed = Math.floor(Math.random() * 242000);
    this.gameSeed = 1234;

    this.mapObject = new GameMap(this.gameSeed);
    this.mapObject.generate();

    this.gameState = {};

    this.wumpusLocation = this.mapObject.wumpusSpawn;
    this.pits = this.mapObject.pits;
    this.bats = this.mapObject.bats;
    this.playerSpawns = this.mapObject.playerSpawns;
    this.map = this.mapObject.map;
    this.numTiles = this.map.length;
  }

  initializePlayer(playerId) {
    if (this.numPlayers > 3) {
      console.log("Can't add more than 4 players.");
      return;
    }

    const startCave = this.playerSpawns[this.numPlayers];

    this.gameState[playerId] = {
      location: startCave,
      arrows: 5,
      is_alive: true,
      visitedLocations: [startCave],
    };

    this.numPlayers++;

    return startCave;
  }

  _getPreceptions(caveId) {
    const perceptions = [];
    const neighbors = this.mapObject.neighbors(caveId);

    if (
      this.wumpusLocation !== null &&
      neighbors.includes(this.wumpusLocation)
    ) {
      perceptions.push("There's a stench coming from a nearby room.");
    }
    if (neighbors.some((n) => this.pits.includes(n))) {
      perceptions.push("There's a cold breeze coming from a nearby room.");
    }
    if (neighbors.some((n) => this.bats.includes(n))) {
      perceptions.push("There are some chirping coming from a nearby room.");
    }

    const otherPlayers = Object.entries(this.gameState)
      .filter(
        ([pid, state]) =>
          state.is_alive &&
          state.location !== caveId &&
          neighbors.includes(state.location)
      )
      .map(([pid]) => pid);

    if (otherPlayers.length > 0) {
      perceptions.push(
        "Sounds like there is a fellow adventurer in a nearby room."
      );
    }

    return perceptions;
  }

  _checkForHazards(playerId, newLocation, result) {
    const player = this.gameState[playerId];
    if (!player || !player.is_alive) return;

    if (newLocation === this.wumpusLocation) {
      result.status = "lost";
      result.message += " You bumped into Wumpus! Wumpus ate you. Game over!";
      player.is_alive = false;
      return;
    }

    if (this.pits.includes(newLocation)) {
      result.status = "lost";
      result.message += " You fell into a pit! Game over.";
      player.is_alive = false;
      return;
    }

    if (this.bats.includes(newLocation)) {
      // TODO: add a check to make sure the bat can't put you into a pit.
      const newCave = Math.floor(Math.random() * this.numTiles);
      player.location = newCave;
      result.message += ` A Giant bat picks you up and flies you to room ${newCave}`;
      result.status = "Caught by a bat";
      this._checkForHazards(playerId, newCave, result);
      return;
    }
  }

  _moveWumpus() {
    if (this.wumpusLocation === null) return;
    if (Math.random() >= 1) return;

    const neighbors = this.map[this.wumpusLocation] || [];
    if (neighbors.length === 0) return;

    this.wumpusLocation =
      neighbors[Math.floor(Math.random() * neighbors.length)];
  }

  handlePlayerTurn(playerId, action, targetCave = undefined) {
    const player = this.gameState[playerId];
    if (!player || !player.is_alive) {
      return {
        status: "lost",
        message: "You are dead and cannot move.",
        perceptions: [],
      };
    }

    const current = player.location;

    const result = {
      status: "ok",
      message: `Your current cave: ${current}`,
      perceptions: this._getPreceptions(current),
    };

    if (action === "move") {
      if (targetCave === undefined || !this.map[current].includes(targetCave)) {
        return {
          status: "error",
          message: "Invalid move. Choose an adjacent cave.",
          perceptions: this._getPreceptions(current),
        };
      }
      player.location = targetCave;
      player.visitedLocations.push(targetCave);
      result.message = `You moved to room ${targetCave}.`;
      this._checkForHazards(playerId, targetCave, result);
    } else if (action === "shoot") {
      if (player.arrows <= 0) {
        return {
          status: "error",
          message: "You have no arrows left!",
          perceptions: this._getPreceptions(current),
        };
      }
      if (targetCave === undefined || !this.map[current].includes(targetCave)) {
        return {
          status: "error",
          message: "Invalid target. You can only shoot into an adjacent cave.",
          perceptions: this._getPreceptions(current),
        };
      }

      player.arrows -= 1;
      result.message = `You shoot into room ${targetCave}. Arrows remaining: ${player.arrows}.`;

      if (targetCave === this.wumpusLocation) {
        result.status = "win";
        result.message = "Victory! You killed the Wumpus!";
        this.wumpusLocation = null;
      }

      for (const pid in this.gameState) {
        const state = this.gameState[pid];
        if (
          pid !== playerId &&
          state.is_alive &&
          state.location === targetCave
        ) {
          state.is_alive = false;
          result.message += ` You shot and killed player ${pid}!`;
        }
      }

      if (result.status !== "win" && this.wumpusLocation !== null) {
        this._moveWumpus();
        if (this.wumpusLocation === player.location) {
          player.is_alive = false;
          result.status = "lost";
          result.message += "The Wumpus woke up and ate you!";
        }
      }
    } else if (action === "pass") {
      result.status = "ok";
      result.message = "You passed your turn.";
    } else {
      return {
        status: "error",
        message: "Unknown Action.",
        perceptions: this._getPreceptions(current),
      };
    }

    if (player.is_alive) {
      result.perceptions = this._getPreceptions(player.location);
    } else {
      result.perceptions = [];
    }

    return result;
  }

  getPlayerStatus(playerId) {
    const player = this.gameState[playerId];
    if (!player || !player.is_alive) {
      return {
        location: null,
        arrows: 0,
        perceptions: [],
        is_alive: false,
        visitedLocations: [],
      };
    }

    return {
      location: player.location,
      arrows: player.arrows,
      perceptions: this._getPreceptions(player.location),
      is_alive: player.is_alive,
      visitedLocations: player.visitedLocations,
    };
  }

  getNeighbors(playerId) {
    const player = this.gameState[playerId];
    if (!player || !player.is_alive) {
      return {
        location: null,
        arrows: 0,
        perceptions: [],
        is_alive: false,
        visitedLocations: [],
      };
    }

    return this.mapObject.neighbors(player.location);
  }

  getHazardLocation() {
    if (this.numTiles === 0) {
      return { error: "Number of generated map = 0" };
    }

    return {
      nummap: this.numTiles,
      hazards: {
        wumpus: this.wumpusLocation,
        pits: Array.from(this.pits),
        bats: Array.from(this.bats),
      },
    };
  }

  getMapData() {
    return this.map;
  }
}

const test = new WumpusServerV2();

/* console.log(test);
console.log(test.map[52]);
console.log(test.mapObject.neighbors(52));
console.log(test.getHazardLocation());
console.log(test.gameSeed);
 */
