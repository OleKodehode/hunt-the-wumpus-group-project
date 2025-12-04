import { useMemo } from "react";
import { Box } from "@mui/material";
import Player from "./Player";

const CARDINAL = ["W", "N", "E", "S"];

const TILE_IMAGES = {
  "----": ["/tiles/empty.png"],
  "W---": ["/tiles/W.png"],
  "-N--": ["/tiles/N.png"],
  "--E-": ["/tiles/E_border.png"],
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
  WNES: ["/tiles/WNES.png"],
};

export default function GameBoard({
  playerLocation,
  coordinates,
  graph,
  handleMove,
  playerId,
  playerStatus,
}) {
  const { bounds, coordToRoomIndex } = useMemo(() => {
    if (!coordinates || coordinates.length === 0) {
      return {
        bounds: { minX: 0, minY: 0, maxX: 0, maxY: 0 },
        coordToRoomIndex: new Map(),
      };
    }

    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;
    const mapping = new Map();

    coordinates.forEach((coord, index) => {
      if (coord) {
        minX = Math.min(minX, coord.x);
        minY = Math.min(minY, coord.y);
        maxX = Math.max(maxX, coord.x);
        maxY = Math.max(maxY, coord.y);
        mapping.set(`${coord.x},${coord.y}`, index);
      }
    });

    return {
      bounds: { minX, minY, maxX, maxY },
      coordToRoomIndex: mapping,
    };
  }, [coordinates]);

  const width = bounds.maxX - bounds.minX + 1;
  const height = bounds.maxY - bounds.minY + 1;

  if (!graph || !coordinates || coordinates.length === 0) {
    return <div>Loading map...</div>;
  }

  const playerCoords =
    playerLocation !== null && coordinates[playerLocation]
      ? coordinates[playerLocation]
      : null;

  const neighbors = graph[playerLocation] || [];
  const isCurrentPlayer = playerStatus?.currentPlayer === playerId;

  return (
    <Box
      sx={{
        p: 2,
        overflow: "auto",
        display: "grid",
        gridTemplateColumns: `repeat(${width}, 96px)`,
        gridTemplateRows: `repeat(${height}, 96px)`,
        gap: "0px",
        position: "relative",
      }}
    >
      {Array.from({ length: height }, (_, y) =>
        Array.from({ length: width }, (_, x) => {
          const gridX = x + bounds.minX;
          const gridY = y + bounds.minY;
          const roomIndex = coordToRoomIndex.get(`${gridX},${gridY}`);

          if (roomIndex === undefined) return null;

          const connections = graph[roomIndex];
          if (!connections) return null;

          const tileType = connections
            .map((conn, i) => (conn !== null ? CARDINAL[i] : "-"))
            .join("");

          const imgSrc = TILE_IMAGES[tileType]?.[0] || "/tiles/pithole.png";

          const isNeighbor = neighbors.includes(roomIndex);
          const isClickable = isNeighbor && isCurrentPlayer;

          return (
            <Box
              key={`${gridX},${gridY}`}
              component="img"
              src={imgSrc}
              alt={tileType}
              onClick={() => isClickable && handleMove(roomIndex)}
              sx={{
                width: "96px",
                height: "96px",
                gridColumn: x + 1,
                gridRow: y + 1,
                cursor: isClickable ? "pointer" : "default",
                "&:hover": {
                  filter: isClickable ? "brightness(1.2)" : "none",
                },
              }}
            />
          );
        })
      )}

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
            zIndex: 1,
            pointerEvents: "none",
            paddingBottom: "1.2rem",
          }}
        >
          <Player />
        </Box>
      )}
    </Box>
  );
}
