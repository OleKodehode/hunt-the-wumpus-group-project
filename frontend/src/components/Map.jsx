import { useEffect, useState, useMemo } from "react";
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
  "-N--": "/tiles/N.png",
  "--E-": "/tiles/E.png",
  "---S": "/tiles/S.png",
  "W-E-": "/tiles/W.png",
  "WN--": "/tiles/WN.png",
  "W--S": "/tiles/W.png",
  "-N-S": "/tiles/N.png",
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

// const SAMPLE_GRAPH = [
//   [1, null, null, null], // 0
//   [null, null, 0, 2], // 1
//   [null, 1, 3, null], // 2
//   [2, null, 4, null], // 3
//   [3, null, 5, null], // 4
//   [4, null, 6, null], // 5
//   [5, 7, null, null], // 6
//   [null, null, 8, 6], // 7
//   [7, null, null, 9], // 8
//   [null, 8, null, 10], // 9
//   [null, 9, 11, null], // 10
//   [10, 12, null, null], // 11
//   [null, 13, null, 11], // 12
//   [null, 14, null, 12], // 13
//   [null, 15, null, 13], // 14
//   [null, 16, 17, 14], // 15
//   [null, null, null, 16], // 16
//   [15, null, 18, null], // 17
//   [17, null, 19, null], // 18
//   [19, null, null, null], // 19
// ];

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
      const nextRoom = graph[roomIndex][i];

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

const BASE_URL = `http://localhost:9001/api/game`;

export default function Map() {
  const location = useLocation();
  const { playerId } = location.state || {};

  const [graph, setGraph] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetching map from API:
  useEffect(() => {
    if (!playerId) {
      return <div>No player selected.</div>;
    }

    let isMounted = true;

    const fetchMap = async () => {
      setIsLoading(true);

      try {
        const response = await fetch(`${BASE_URL}/${playerId}/map`, {
          headers: { "Content-Type": "application/json" },
        });

        const data = await response.json();
        if (isMounted) setGraph(data);
      } catch (e) {
        if (isMounted) setError(e);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchMap();

    return () => {
      isMounted = false;
    };
  }, [playerId]);

  console.log(graph);

  // ✅ useMemo: derive discoveredMap + bounds from graph
  // This runs only when `graph` changes.
  const { discoveredMap, bounds } = useMemo(
    () => discoverGraph(graph),
    [graph]
  );

  const width = bounds.maxX - bounds.minX + 1;
  const height = bounds.maxY - bounds.minY + 1;

  // If graph isn't loaded yet (e.g. fetching), show loading
  if (!graph || Object.keys(discoveredMap).length === 0) {
    return <div>Loading map...</div>;
  }

  return (
    <Box
      sx={{
        width: "1280px",
        height: "720px",
        border: "3px solid black",
        p: 2,
        overflow: "auto",
        display: "grid",
        gridTemplateColumns: `repeat(${width}, 64px)`,
        gridTemplateRows: `repeat(${height}, 64px)`,
        gap: "0px",
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
              // shift coordinates so minX/minY map to grid cell 1,1
              gridColumn: x - bounds.minX + 1,
              gridRow: y - bounds.minY + 1,
            }}
          />
        );
      })}
    </Box>
  );
}
