import { useMemo } from "react";
import { Box } from "@mui/material";
import Player from "./Player";

// ----------------------------------------------
// Direction + tile lookup constants
// ----------------------------------------------

const DIRECTIONS = [
  [-1, 0], // WEST
  [0, -1], // NORTH
  [1, 0], // EAST
  [0, 1], // SOUTH
];

const CARDINAL = ["W", "N", "E", "S"];

const TILE_IMAGES = {
  "----": ["/tiles/empty.png"],
  "W---": ["/tiles/W.png"],
  "-N--": ["/tiles/N.png"],
  "--E-": ["/tiles/E.png"],
  "---S": ["/tiles/S.png"],
  "W-E-": ["/tiles/WE.png"],
  "WN--": ["/tiles/WN.png"],
  "W--S": ["/tiles/WS.png"],
  "-N-S": ["/tiles/NS.png"],
  "-NE-": ["/tiles/NE.png"],
  "--ES": ["/tiles/ES.png"],
  "WNE-": ["/tiles/WNE.png"],
  "WN-S": ["/tiles/WNS.png"],
  "W-ES": ["/tiles/WES.png"],
  "-NES": ["/tiles/NES.png"],
  //prettier-ignore
  "WNES": ["/tiles/WNES.png"],
};

function discoverGraph(graph, startRoomIndex = 0) {
  // If we don't have a graph yet (e.g. still fetching), return empty
  if (!graph) {
    return {
      discoveredMap: {},
      bounds: { minX: 0, minY: 0, maxX: 0, maxY: 0 },
    };
  }

  const discovered = {};
  const visited = new Set();

  // start from 0 so bounds grow from there
  let minX = 0;
  let minY = 0;
  let maxX = 0;
  let maxY = 0;

  function discover(x, y, roomIndex) {
    if (visited.has(roomIndex)) return;
    visited.add(roomIndex);

    // update bounding box
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);

    let tileType = "";

    // loop over 4 directions: 0=W, 1=N, 2=E, 3=S
    for (let i = 0; i < 4; i++) {
      const nextRoom = graph[roomIndex] ? graph[roomIndex][i] : null;

      if (nextRoom == null) {
        // no connection in this direction
        tileType += "-";
        continue;
      }

      // there IS a connection in this direction
      tileType += CARDINAL[i];

      const [dx, dy] = DIRECTIONS[i];
      discover(x + dx, y + dy, nextRoom);
    }

    // store the tile type by its coordinate
    discovered[`${x},${y}`] = tileType;
  }

  // start exploring from room 0 at coordinate (0,0)
  discover(0, 0, startRoomIndex);

  return {
    discoveredMap: discovered,
    bounds: { minX, minY, maxX, maxY },
  };
}

export default function Map({ playerLocation, coordinates, graph }) {
  const { discoveredMap, bounds } = useMemo(
    () => discoverGraph(graph),
    [graph]
  );

  const width = bounds.maxX - bounds.minX + 1;
  const height = bounds.maxY - bounds.minY + 1;

  // If graph isn't loaded yet, show loading
  if (!graph || Object.keys(discoveredMap).length === 0) {
    return <div>Loading map...</div>;
  }

  const playerCoords =
    playerLocation !== null && coordinates[playerLocation]
      ? coordinates[playerLocation]
      : null;

  return (
    <Box
      sx={{
        p: 2,
        overflow: "auto",
        display: "grid",
        gridTemplateColumns: `repeat(${width}, 96px)`,
        gridTemplateRows: `repeat(${height}, 96px)`,
        gap: "0px",
        position: "relative", // Needed for z-indexed children
      }}
    >
      {Object.entries(discoveredMap).map(([coord, tileType]) => {
        const [x, y] = coord.split(",").map(Number);
        const imgSrc =
          TILE_IMAGES[tileType]?.[
            Math.floor(Math.random() * (TILE_IMAGES[tileType]?.length || 1))
          ] || "/tiles/empty.png";

        return (
          <Box
            key={coord}
            component="img"
            src={imgSrc}
            alt={tileType}
            sx={{
              width: "96px",
              height: "96px",
              // shift coordinates so minX/minY map to grid cell 1,1
              gridColumn: x - bounds.minX + 1,
              gridRow: y - bounds.minY + 1,
            }}
          />
        );
      })}

      {/* Render Player */}
      {playerCoords && (
        <Box
          sx={{
            gridColumn: playerCoords.x - bounds.minX + 1,
            gridRow: playerCoords.y - bounds.minY + 1,
            width: "96px",
            height: "96px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1, // Ensure player is on top of tiles
          }}
        >
          <Player />
        </Box>
      )}
    </Box>
  );
}
