import Box from "@mui/material/Box";
import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";

const BASE_URL = `http://localhost:9001/api/game`;

function Map() {
  const location = useLocation();
  const { playerId } = location.state || {};

  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [map, setMap] = useState(null);
  const [positions, setPositions] = useState({});

  const mapData = async () => {
    if (!playerId) {
      setError("Player ID missing");
      return;
    }
    setIsLoading(true);

    try {
      const response = await fetch(`${BASE_URL}/${playerId}/map`);

      if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}`);
      }

      const data = await response.json();
      setMap(data.map);
    } catch (e) {
      setError(e);
      console.log(e);
    } finally {
      setIsLoading(false);
    }
  };

  //map generation
  useEffect(() => {
    mapData();
  }, [playerId]);

  useEffect(() => {
    if (!map) return;

    const newPositions = {};
    Object.keys(map).forEach((id) => {
      newPositions[id] = {
        x: Math.random() * 500 + 50,
        y: Math.random() * 300 + 50,
      };
    });

    setPositions(newPositions);
  }, [map]);

  if (isLoading) return <div>Loading map...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!map) return null;

  return (
    <>
      <Box
        sx={{
          width: `1280px`,
          height: `720px`,
          border: `3px solid black`,
        }}
      >
        <svg width={600} height={400} style={{ border: "1px solid #ccc" }}>
          {Object.entries(positions).map(([id, pos]) => (
            <g key={id}>
              <circle cx={pos.x} cy={pos.y} r={18} fill="#4F46E5" />
              <text
                x={pos.x}
                y={pos.y + 4}
                textAnchor="middle"
                fill="#fff"
                fontSize="12"
                fontFamily="sans-serif"
              >
                {id}
              </text>
            </g>
          ))}
        </svg>
      </Box>
    </>
  );
}

export default Map;
