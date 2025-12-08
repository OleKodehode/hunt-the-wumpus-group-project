import React from "react";
import { Button, Stack } from "@mui/material";
import { useNavigate } from "react-router-dom";

const DeathPage = () => {
  const navigate = useNavigate();

  const handleMainMenu = () => {
    navigate("/");
  };

  const deathButtonStyle = {
    minWidth: "20dvw",
    fontFamily: "var(--font-button)",
    fontSize: "1.1rem",
    color: "#fff",
    textTransform: "none",

    background: "linear-gradient(to bottom, #3a0000, #1a0000)",
    border: "2px solid #ff0000",
    borderRadius: "6px",

    padding: "8px 24px",
    letterSpacing: "1px",

    boxShadow: `
      inset 0 2px 6px rgba(255, 100, 100, 0.15),
      0 0 8px rgba(0,0,0,0.6)
    `,

    "&:hover": {
      background: "linear-gradient(to bottom, #1a0000, #3a0000)",
      boxShadow: `
        inset 0 2px 6px rgba(255, 100, 100, 0.25),
        0 0 10px rgba(0,0,0,0.8)
      `,
    },

    "&::before": {
      content: '""',
      position: "absolute",
      top: "4px",
      left: "4px",
      right: "4px",
      bottom: "4px",
      border: "1px solid #ff0000",
      borderRadius: "4px",
      pointerEvents: "none",
    },
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex flex-col justify-center items-center z-50">
      <h1 className="font-cherry text-[10rem] text-[#ff0000] [text-shadow:0_0_5px_#ff0000,0_0_10px_#ff0000,0_0_15px_#ff0000]">
        YOU DIED
      </h1>
      <Stack spacing={2} sx={{ mt: 4 }}>
        <Button
          size="large"
          variant="text"
          sx={deathButtonStyle}
          onClick={handleMainMenu}
        >
          Main Menu
        </Button>
      </Stack>
    </div>
  );
};

export default DeathPage;
