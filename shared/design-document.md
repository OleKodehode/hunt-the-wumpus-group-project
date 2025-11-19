# Multiplayer Hunt the Wumpus
*KodeHode Kristiansund - November, 2025*

*Project Lead: OO /
Designers: V & J /
Frontend: O /
Backend: H /
Micro-Controller: J-I /
Project lead will help out where necessary*

---

## Overview

We will make a modernized multiplayer version of “Hunt the Wumpus” from the 1970s with slightly tweaked rules and theming.


First of all - Focus on developing the original game itself but played with 2 players on a slightly larger map. This should all be run on a webpage, using React, MaterialUI & Tailwindcss, communicating with a backend through API calls. The Backend should handle the gamestate and logic: The clients should only get the information they need. (Player position, player state (Alive/Dead), Rooms explored, neighboring rooms and any senses (stench, breeze, chirping))


One player should be able to connect a microcontroller to their PC to use the microcontroller as a physical controller. The microcontroller itself shouldn’t handle any logic. The microcontroller should at least be a physical controller, but can have added functionality as well. (I.E lights and/or LCD Screen to show the game state or the player’s adjacent rooms).


If there is time, we should implement more behavior to the Wumpus enemy, different game modes (No Wumpus/“PvP”, multiple Wumpuses) and more pick-ups (ladders, bat repellents etc).

## Goals

1. Recreate the original “Hunt the Wumpus” game for two players

  Setup the backend to handle all game logic and be the authoritative source. Focus on getting a bugfree experience with the original game and its’ rules in place first of all before adding pick ups and other behavior to Wumpus. Keep parameters in mind. (Player slots, map size, starting arrows, maximum arrows, how many pits and bats should be on the map, multiple Wumpuses etc)

2. Design and implement a modern UI with modern UX in mind

While the logic is being developed, frontend and designers should work together to create a modern and beautiful looking webpage. 
Setup wireframes for each page/component needed (Landing page, lobby page, loading page, game page, game over etc.). 
Nail down the layout of the site and components before working on the visual design of the site.
Keep a consistent theming between UI elements and assets.

3. Implement the Frontend - Setup the basic functionality at first

Follow the wireframes developed by the designer to set up the frontend’s layout and routing. Use placeholders while developing, and implement assets as they are completed by the design team.

4.  Hook up backend with the frontend

Make sure the frontend can communicate with the backend, and make sure the gameloop is playable from beginning to end. The frontend should primarily communicate with the backend through API calls, no logic should be run on the frontend as the game should be server authoritative.

5. Hook up the micro-controller to be able to control the game

One player should be able to hook up the breadboard with the microcontroller to use it as a physical controller. It could utilize the keybindings and API calls set up by the frontend.

6. If there is time, add more pick-ups and functionality to the game

We don’t have a lot of time to finish the project - Focus on nailing down original “Hunt the Wumpus” with 2 players first before adding on more functionality. 
Things to implement could be more pick-ups (Ladders to negate pits, bat repellents, shield to prevent a hit from Wumpus), Different Wumpus behavior (Nesting, hunting, roaming etc), adding ability for more than one Wumpus, no Wumpus (PvP battle-royale) etc.  

## Specifications
### Design
Make a wireframe of the entire project:
- Landing Page (Page to create lobby or join lobby)
- Lobby Page (wait for another player before starting the game)
- Loading Page (Waiting for the backend to run the initial logic and send the results to the frontend)
- Game Page (Main game loop - Stays on this page until the game is lost or won)
- Game Over page (Could be a modal/dialogue with the game results, whether the game was won or lost)

Once Wireframes are done you can start working on the visual design of it.

Start with placeholders if necessary, but replace placeholders with your own original designs and assets. The more you make the more you can put on your portfolio!

Make high resolution UI elements and assets ready for use in the frontend. (Vector Graphics for instance)

Try to develop a design system for this project [Colors, Typography, Spacing, Components]

Try to follow the WCAG A & AA contrast ratios.

---
### Frontend
Setup a React project with Tailwindcss and MaterialUI. 

Try to create components that are reusable in several parts of the UI and game itself.

Loading state for cases where the frontend is waiting on data from the backend.

Make sure to have some sort of Errorhandling

Communicate with the backend through API calls to progress the game.

Process information passed from the backend and display the results.

---
### Backend
Develop the logic for the original game with 2 players and have it run on the backend, being able to progress the game through mock API calls (I.E through the console).

Backend should keep track of each lobby’s game state, to allow multiple lobbies to run at the same time.

Make API end-points for the frontend to call for progressing their game.

Probably needs lobby ID, players and their moves for that turn. Sends back the result of running those moves for their game state. 

Test to make sure each lobby’s state can’t be manipulated from outside - Only the lobby-creator/players should be able to have influence on their own lobby state.

Make it so a micro-controller can communicate with the API as well. 

Might just be a case of the micro-controller utilizing the same API endpoints as the frontend.

---
### Micro-Controller
As a base assignment - Make a Breadboard microcontroller that can be connected to a computer and can be used as a physical controller to play the game.

Look into HID (Human Interface Devices) for controlling the game.

For more of a challenge, add in lights and/or the LCD Screen to show the game state.

*(Could use some input from the Course Advisor for more specifications on this)*

---
### Games Rules
Tick based - 30 seconds by default. Parameter-based (minimum 10 seconds), maybe an option for no timer. 

2 players for now - Possibly adding more players later, up to 4 players.

The Map should be parameter-based as well, minimum of 30 nodes, maximum to a sensible amount. (Original game had 20 nodes for 1 player, could scale the nodes based on players, difficulty setting, or custom input)

Each player starts with 1 arrow, and there are arrow pickups on the map. Each player can hold up to 3 arrows each. Could be parameterized (minimum of 1)

Between 1-4 Bats for each map. When the player enters a node with a bat on it, the player will be carried to another node, selected at random. (Can’t be a pit or the same node as Wumpus)

Between 2-4 pits on each map. If the player enters a node with a pit, the player is dead. (For later: 1-2 ladders can be found within the cave to negate a pit)

Wumpus ideally shouldn’t move to begin with, allowing the players to move around and gather arrows and other items, mapping out the cave. Wumpus could have a state machine, going from nesting, to hunting and back to nesting. From the start/During nesting, Wumpus could have a small chance of moving, between 5-15% each turn. In the hunting state it should move most of the time (80-100%).

If the Wumpus enters the same tile as the player, the player is killed.

If the player shoots an arrow into the tile the wumpus is at, the wumpus dies and the players win.

If all players die the Wumpus wins.

