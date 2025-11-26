import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Box } from "@mui/material";

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
  "----": "/tiles/empty.png",
  "W---": "/tiles/W.png",
  "-N--": "/tiles/S.png",
  "--E-": "/tiles/E.png",
  "---S": "/tiles/S.png",
  "W-E-": "/tiles/W.png",
  "WN--": "/tiles/WN.png",
  "W--S": "/tiles/WS.png",
  "-N-S": "/tiles/S.png",
  "-NE-": "/tiles/NE.png",
  "--ES": "/tiles/ES.png",
  "WNE-": "/tiles/WNE.png",
  "WN-S": "/tiles/WNS.png",
  "W-ES": "/tiles/WES.png",
  "-NES": "/tiles/NES.png",
  //prettier-ignore
  "WNES": "/tiles/WNES.png",
};

// ----------------------------------------------
// TEMP hardcoded sample graph
// ----------------------------------------------

const SAMPLE_GRAPH = [
  [1, null, null, null], // 0
  [null, null, 0, 2], // 1
  [null, 1, 3, null], // 2
  [2, null, 4, null], // 3
  [3, null, 5, null], // 4
  [4, null, 6, null], // 5
  [5, 7, null, null], // 6
  [null, null, 8, 6], // 7
  [7, null, null, 9], // 8
  [null, 8, null, 10], // 9
  [null, 9, 11, null], // 10
  [10, 12, null, null], // 11
  [null, 13, null, 11], // 12
  [null, 14, null, 12], // 13
  [null, 15, null, 13], // 14
  [null, 16, 17, 14], // 15
  [null, null, null, 16], // 16
  [15, null, 18, null], // 17
  [17, null, 19, null], // 18
  [19, null, null, null], // 19
];

export default function Map() {
  const location = useLocation();
  const { playerId } = location.state || {};

  const [graph, setGraph] = useState(null);
  const [discoveredMap, setDiscoveredMap] = useState({});
  const [bounds, setBounds] = useState({ minX: 0, minY: 0, maxX: 0, maxY: 0 });

  // ---------------------------------------------------
  // Load graph (right now using SAMPLE_GRAPH)
  // ---------------------------------------------------
  useEffect(() => {
    setGraph(SAMPLE_GRAPH);
  }, []);

  // ---------------------------------------------------
  // Discover all rooms and map them to coordinates
  // ---------------------------------------------------

  useEffect(() => {
    if (!graph) return;

    const discovered = {};
    const visited = new Set();

    let minX = Infinity,
      minY = Infinity;
    let maxX = -Infinity,
      maxY = -Infinity;

    function discover(x, y, roomIndex) {
      if (visited.has(roomIndex)) return;
      visited.add(roomIndex);

      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);

      let tileType = "";

      for (let i = 0; i < 4; i++) {
        const nextRoom = graph[roomIndex][i];

        if (nextRoom === null || nextRoom === undefined) {
          tileType += "-";
          continue;
        }

        tileType += CARDINAL[i];

        const [dx, dy] = DIRECTIONS[i];
        discover(x + dx, y + dy, nextRoom);
      }

      discovered[`${x},${y}`] = tileType;
    }

    discover(0, 0, 0); // Start at room 0, coordinate (0,0)

    setDiscoveredMap(discovered);
    setBounds({ minX, minY, maxX, maxY });
  }, [graph]);

  // ---------------------------------------------------
  // Compute grid layout
  // ---------------------------------------------------

  const width = bounds.maxX - bounds.minX + 1;
  const height = bounds.maxY - bounds.minY + 1;

  // ---------------------------------------------------
  // Render discovered tiles
  // ---------------------------------------------------

  return (
    <Box
      sx={{
        width: `1280px`,
        height: `720px`,
        border: `3px solid black`,
        p: 2,
        overflow: "auto",
        display: "grid",
        gridTemplateColumns: `repeat(${width}, 64px)`,
        gridTemplateRows: `repeat(${height}, 64px)`,
        gap: "2px",
      }}
    >
      {Object.entries(discoveredMap).map(([coord, tileType]) => {
        const [x, y] = coord.split(",").map(Number);
        const imgSrc = TILE_IMAGES[tileType] || "/tiles/empty.png";

        return (
          <Box
            key={coord}
            component="img"
            src={imgSrc}
            alt={tileType}
            sx={{
              width: "64px",
              height: "64px",
              gridColumn: x - bounds.minX + 1,
              gridRow: y - bounds.minY + 1,
            }}
          />
        );
      })}
    </Box>
  );
}
