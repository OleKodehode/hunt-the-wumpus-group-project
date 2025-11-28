import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import GameMenu from "./pages/GameMenu.jsx";
import ErrorPage from "./pages/ErrorPage.jsx";
import "./styles/globals.css";
import GameLobby from "./pages/GameLobby.jsx";
import Game from "./pages/Game.jsx";
// import Test from "./pages/Test.jsx";

const router = createBrowserRouter([
  { path: `/`, element: <GameMenu />, errorElement: <ErrorPage /> },
  { path: `/lobby/:gameId`, element: <GameLobby /> },
  { path: `/lobby/join`, element: <GameLobby /> },
  { path: `/game/:gameId`, element: <Game /> },
  // { path: `/test`, element: <Test /> },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
