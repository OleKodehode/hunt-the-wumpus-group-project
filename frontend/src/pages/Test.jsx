// import { useEffect, useState } from "react";

// const BASE_URL = "http://localhost:9001";

export default function Test() {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [gameData, setGameData] = useState(null);

  useEffect(() => {
    const createGame = async () => {
      setIsLoading(true);

      try {
        const response = await fetch(`${BASE_URL}/api/game/create`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const data = await response.json();
        setGameData(data);
      } catch (e) {
        setError(e);
      } finally {
        setIsLoading(false);
      }
    };

    createGame();
  }, []);

  return (
    <div className="tutorial">
      <h1 className="mb-4 text-2xl">Create Game</h1>

      {isLoading && <div>Loading...</div>}
      {gameData && (
        <div>
          <p>Game ID: {gameData.gameId}</p>
          <p>Player ID: {gameData.playerId}</p>
        </div>
      )}

      {error && <div>Error: {error.message}</div>}
    </div>
  );
}

/**********************************************/
/*
/* THIS IS EXAMPLE CODE!
/* DO NOT USE THIS IN PRODUCTION!
/*
/* This code is merely here to illustrate
/* how we can do a recursive search in order
/* to create a map-grid from a node-graph.
/*
/**********************************************/

/**
 * Represents a single node in the map graph. The array contains the indices
 * of connected nodes in each of the four cardinal directions.
 * @typedef {[?number,?number,?number,?number]} RawMapNode
 */

/**
 * Represents the entire map graph as an array of RawMapNode entries.
 * @typedef {RawMapNode[]} RawMapGraph
 */

/** @type {RawMapGraph} */
// The node-graph we're traversing
const graph = [
  [1, null, null, null], // 0th
  [null, null, 0, 2], // 1st
  [null, 1, 3, null], //...
  [2, null, 4, null],
  [3, null, 5, null], // 4th
  [4, null, 6, null], // 5th
  [5, 7, null, null], // 6th
  [null, null, 8, 6], // 7th
  [7, null, null, 9], // 8th
  [null, 8, null, 10], // 9th
  [null, 9, 11, null], // 10th
  [10, 12, null, null], // 11th
  [null, 13, null, 11], // 12th
  [null, 14, null, 12], // 13th
  [null, 15, null, 13], // 14th
  [null, 16, 17, 14], // 15th
  [null, null, null, 16], // 16th
  [15, null, 18, null], // 17th
  [17, null, 19, null], // 18th
  [19, null, null, null], // 18th
];

// Different types of room junctions
const roomJunctions = {
  "----": " ",
  "W---": "╸",
  "-N--": "╹",
  "--E-": "╺",
  "---S": "╻",
  "W-E-": "━",
  "-N-S": "│",
  "--ES": "┍",
  "W--S": "┑",
  "-NE-": "┕",
  "WN--": "┙",
  "-NES": "┝",
  "WN-S": "┥",
  "W-ES": "┭",
  "WNE-": "┵",
  WNES: "╂",
};

/** @typedef {keyof typeof roomJunctions} TileType */

const dir = [
  [-1, 0], // WEST
  [0, -1], // NORTH
  [1, 0], // EAST
  [0, 1], // SOUTH
];

/** @type { "W" | "N" | "E" | "S" } */
const numberToCardinal = ["W", "N", "E", "S"];

// Relevant declarations:
const discoveredMap = {}; // Holds the map as it is traversed

// Discovered min/max x/y coords
let discoveredMinX = Infinity;
let discoveredMinY = Infinity;
let discoveredMaxX = -Infinity;
let discoveredMaxY = -Infinity;

/**
 * Recursively traverses a node-graph in order
 * to create a grid-representation of a connected
 * node-graph.
 *
 * @param {number} x
 * @param {number} y
 * @param {number} roomIndex
 * @param {RawMapGraph} map
 * @param {number} depth
 * @returns
 */
function discover(x, y, roomIndex, map, depth = 0) {
  // ...Keep track of grid min/max x/y
  discoveredMinX = Math.min(discoveredMinX, x);
  discoveredMinY = Math.min(discoveredMinY, y);
  discoveredMaxX = Math.max(discoveredMaxX, x + 1);
  discoveredMaxY = Math.max(discoveredMaxY, y + 1);

  // Check if we've already visited the room
  if (discoveredMap[`${x},${y}`] !== undefined) return;

  // Explicitly set current coords to `null`
  // so that it is not `undefined`. This way we avoid
  // traversing the same path again, causing an infinite loop.
  discoveredMap[`${x},${y}`] = null;

  // Declare the `tileType`-string
  /** @type {TileType | ""} */
  let tileType = "";

  // We check all four directions the node
  // can be connected to other nodes
  for (let i = 0; i < 4; i++) {
    // If the direction corresponding to the current index `i`
    // is `null` or `undefined`, add a dash/hyphen to indicate this...
    if (map[roomIndex][i] === null || map[roomIndex][i] === undefined) {
      tileType += "-";
      continue;
    }

    // ...but if the node is not `undefined` or `null`,
    // then we add the corresponding cardinal direction indicator
    // ("W" = West, "N" = North, and so on...)
    tileType += numberToCardinal[i];

    // Get the new (potential) coordinates
    const nx = x + dir[i][0];
    const ny = y + dir[i][1];

    // If the room has been visited, skip it!
    if (discoveredMap[`${nx},${ny}`] !== undefined) {
      continue;
    }

    // Recursively call the function with the
    // next adjacent room coordinates.
    discover(nx, ny, map[roomIndex][i], map, depth + 1);
  }

  // Set the new tile type of the room in the
  // `discoveredMap`-object, allowing us to
  // use the correct tile for the room.
  discoveredMap[`${x},${y}`] = tileType;
}

// Run the search
discover(0, 0, 0, graph);

// Calculate the map width and height
const mapWidth = discoveredMaxX - discoveredMinX;
const mapHeight = discoveredMaxY - discoveredMinY;

// Print info to console
console.log("Rooms discovered:", Object.keys(discoveredMap).length);
console.log("Map width: ", mapWidth, discoveredMaxX, discoveredMinX);
console.log("Map height:", mapHeight, discoveredMaxY, discoveredMinY);

// Draw the map in the console
for (let iy = discoveredMinY; iy < discoveredMaxY; iy++) {
  let line = "";
  for (let ix = discoveredMinX; ix < discoveredMaxX; ix++) {
    line += roomJunctions[discoveredMap[`${ix},${iy}`] || "----"];
  }
  console.log(line);
}
