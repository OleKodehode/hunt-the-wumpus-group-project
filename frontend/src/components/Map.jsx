import { useMemo } from "react";
import { Box } from "@mui/material";
import Player from "./Player";
import Monster from "./Monster";
import Bat from "./Bat";
import Pithole from "./Pithole";

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
  // prettier-ignore
  "WNES": ["/tiles/WNES.png"],
};

export default function GameBoard({
  playerLocation,
  coordinates,
  graph,
  handleMove,
  playerId,
  playerStatus,
  wumpusLocation,
  batLocations,
  pitLocations,
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
        m: 2,
        display: "grid",
        gridTemplateColumns: `repeat(${width}, 88px)`,
        gridTemplateRows: `repeat(${height}, 88px)`,
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

          const imgSrc = TILE_IMAGES[tileType]?.[0] || "/tiles/empty.png";

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
                width: "88px",
                height: "88px",
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
            width: "88px",
            height: "88px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1,
            pointerEvents: "none",
            paddingBottom: "1.5rem",
          }}
        >
          <Player />
        </Box>
      )}

      {wumpusLocation && coordinates[wumpusLocation] && (
        <Box
          sx={{
            gridColumn: coordinates[wumpusLocation].x - bounds.minX + 1,
            gridRow: coordinates[wumpusLocation].y - bounds.minY + 1,
            width: "88px",
            height: "88px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1,
            pointerEvents: "none",
          }}
        >
          <Monster />
        </Box>
      )}

      {batLocations.map((batLocation) => {
        if (!coordinates[batLocation]) return null;
        const batCoords = coordinates[batLocation];
        return (
          <Box
            key={`bat-${batLocation}`}
            sx={{
              gridColumn: batCoords.x - bounds.minX + 1,
              gridRow: batCoords.y - bounds.minY + 1,
              width: "88px",
              height: "88px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1,
              pointerEvents: "none",
            }}
          >
            <Bat />
          </Box>
        );
      })}

      {pitLocations.map((pitLocation) => {
        if (!coordinates[pitLocation]) return null;
        const pitCoords = coordinates[pitLocation];
        return (
          <Box
            key={`pit-${pitLocation}`}
            sx={{
              gridColumn: pitCoords.x - bounds.minX + 1,
              gridRow: pitCoords.y - bounds.minY + 1,
              width: "88px",
              height: "88px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1,
              pointerEvents: "none",
            }}
          >
            <Pithole />
          </Box>
        );
      })}
    </Box>
  );
}
