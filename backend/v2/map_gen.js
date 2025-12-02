import seedrandom from "seedrandom";

class GridSquare {
  #type = null; // Room type
  #x = null; // x coord
  #y = null; // y coord
  #grid = null; // the grid the square is tied to

  connectedRooms = [null, null, null, null]; // W N E S
  connectedRoomsTypes = [];

  /**
   *
   * @param {Number} x X coordinate in a grid as a number
   * @param {Number} y Y coordinate in a grid as a number
   * @param {Grid} grid The instance of the Grid the GridSquare is a part of
   * @param {String} type The type of room the GridSquare is. Optional - Gets set to null if nothing is provided.
   */
  constructor(x, y, grid, type = null) {
    this.#type = type; // Value optional - Null means void/no room
    this.#x = x;
    this.#y = y;
    this.#grid = grid;
  }

  get info() {
    return [this.#x, this.#y, this.#grid, this.#type]; // mostly debugging
  }

  get value() {
    return this.#type; // get the room type
  }

  set value(value) {
    this.#type = value;
  }

  get index() {
    return this.#x + this.#y * this.#grid.width;
  }

  get x() {
    return this.#x;
  }
  get y() {
    return this.#y;
  }

  connect(direction, neighbor) {
    this.connectedRooms[direction] = neighbor.index;
    neighbor.connectedRooms[(direction + 2) % 4] = this.index;
  }

  toString() {
    return `\nX position: ${this.#x} - Y Position: ${this.#y} - Type: ${
      this.#type
    } - Index in Grid: ${this.index}\nConnected Rooms: ${this.connectedRooms}`;
  }
}

export class Grid {
  #gridSquares = [];

  /**
   *
   * @param {Number} width Width of the grid
   * @param {Number} height Height of the grid
   */
  constructor(width, height) {
    this.width = width ?? 5;
    this.height = height ?? 5;

    for (let i = 0; i < this.width * this.height; i++) {
      const x = i % this.width;
      const y = Math.floor(i / this.width);
      this.#gridSquares[i] = new GridSquare(x, y, this);
    }
  }

  get(x, y) {
    // Check to see if it goes outside of the grid
    if (x < 0 || y < 0 || x >= this.width || y >= this.height) {
      return undefined;
    }
    return this.#gridSquares[x + y * this.width];
  }

  getValue(x, y) {
    return this.#gridSquares[x + y * this.width].value;
  }

  set(x, y, value) {
    this.#gridSquares[x + y * this.width].value = value;
  }

  get gridSquares() {
    return this.#gridSquares;
  }

  squareIndex(index) {
    return this.#gridSquares[index].value;
  }

  get map() {
    const dungeonMap = [];
    this.#gridSquares.forEach((square) =>
      dungeonMap.push(square.connectedRooms)
    );
    return dungeonMap;
  }

  getIndexOfSquare(square) {
    return square.index;
  }

  neighbors(square, walkableOnly = false) {
    const dirs = [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
    ];

    return dirs
      .map(([dx, dy]) => this.get(square.x + dx, square.y + dy))
      .filter((r) => r !== undefined && (!walkableOnly || r.value === "trap"));
  }

  neighborsType(square) {
    const dirs = [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
    ];

    return dirs.map(([dx, dy]) => this.get(square.x + dx, square.y + dy).value);
  }
}

export class GameMap {
  #margin = 2;
  #generated = false;
  wumpusPos = null;
  player1Pos = null;
  player2Pos = null;
  player3Pos = null;
  player4Pos = null;

  /**
   *
   * @param {Any} seed Seed for RNG - Can be strings or numbers.
   * @param {Grid} grid a new instance of the class "Grid". Optional - Default is new Grid(8,8)
   * @param {Number} roomCount Number of base rooms to add to the map - Will end up with more rooms than this number. Optional - Default is 30
   * @param {Number} trapCount Number of traps placed. Be reasonable. Optional - Default is 4
   * @param {Number} batCount Number of bats placed. Be reasonable. Optional - Default is 4
   */
  constructor(seed, grid = new Grid(8, 8), roomCount, trapCount, batCount) {
    this.grid = grid;
    this.width = grid.width;
    this.height = grid.height;
    this.roomCount = roomCount ?? 30; // Map is populated with more rooms than this due to pathing
    this.trapCount = trapCount ?? 4;
    this.batCount = batCount ?? 4;
    this.rng = seedrandom(seed);
    this.playerSpawns = [];
    this.wumpusSpawn = null;
    this.pits = [];
    this.bats = [];

    if (this.width * this.height < this.roomCount) {
      throw new Error(`
            Too many rooms for the given width & height.\n
            Width: ${this.width} | Heigth: ${this.height} | Rooms: ${this.roomCount}`);
    }

    if (this.trapCount >= Math.floor(this.roomCount * 0.6)) {
      throw new Error(`
            Too many traps for the given map size. Rooms: ${this.roomCount} - Traps: ${this.trapCount}`);
    }
  }

  rng() {
    return this.rng();
  }

  set wumpusPos(newPos) {
    console.log(newPos);
    this.wumpusPos = newPos;
  }

  set player1Pos(newPos) {
    this.player1Pos = newPos;
  }

  set player2Pos(newPos) {
    this.player1Pos = newPos;
  }

  set player3Pos(newPos) {
    this.player1Pos = newPos;
  }

  set player4Pos(newPos) {
    this.player1Pos = newPos;
  }

  // private function to add players and Wumpus
  #placeEntities() {
    const p1x = Math.round(this.rng() * this.#margin);
    const p1y = Math.round(this.rng() * this.#margin);

    const p2x = Math.round(this.width - this.rng() * this.#margin - 1);
    const p2y = Math.round(this.rng() * this.#margin);

    const p3x = Math.round(this.rng() * this.#margin);
    const p3y = Math.round(this.height - this.rng() * this.#margin - 1);

    const p4x = Math.round(this.width - this.rng() * this.#margin - 1);
    const p4y = Math.round(this.height - this.rng() * this.#margin - 1);

    this.grid.set(p1x, p1y, "player1");
    this.grid.set(p2x, p2y, "player2");
    this.grid.set(p3x, p3y, "player3");
    this.grid.set(p4x, p4y, "player4");

    // Place center
    const centerX = Math.round(this.width / 2);
    const centerY = Math.round(this.height / 2);
    this.grid.set(centerX, centerY, "room");

    // Place Wumpus around the center.
    const wumpX = Math.round(centerX + this.rng() * this.#margin);
    const wumpY = Math.round(centerY + this.rng() * this.#margin);
    this.grid.set(wumpX, wumpY, "wumpus");

    // Get the placed rooms and connect them to the center via astar path finding
    const p1 = this.grid.get(p1x, p1y);
    const p2 = this.grid.get(p2x, p2y);
    const p3 = this.grid.get(p3x, p3y);
    const p4 = this.grid.get(p4x, p4y);
    const wumpus = this.grid.get(wumpX, wumpY);
    const centerRoom = this.grid.get(centerX, centerY);

    this.#connectRooms(this.#aStar(p1, p2));
    this.#connectRooms(this.#aStar(p3, p4));

    [p1, p2, p3, p4, wumpus].forEach((room) => {
      this.#connectRooms(this.#aStar(room, centerRoom));
    });

    this.playerSpawns.push(p1.index, p2.index, p3.index, p4.index);
    this.wumpusSpawn = wumpus.index;
    this.player1Pos = p1.index;
    this.player2Pos = p2.index;
    this.player3Pos = p3.index;
    this.player4Pos = p4.index;
    this.wumpusPos = wumpus.index;
  }

  // function to place rooms
  generate() {
    if (this.#generated) throw new Error("Map has already been generated.");
    this.#generated = true; // Flag to prevent multiple calls to the function
    this.#placeEntities(); // Placing of 4 players, center tile and Wumpus.

    const placedRooms = [];
    let placedTraps = 0;
    let placedBats = 0;
    while (placedRooms.length < this.roomCount) {
      // Room coordinates
      const rx = Math.floor(this.rng() * this.width);
      const ry = Math.floor(this.rng() * this.height);

      // Placing trap and bat conditions
      const placeTrap = this.rng() > 0.25 && placedTraps < this.trapCount;
      const placeBat = this.rng() > 0.25 && placedBats < this.batCount;

      if (this.grid.getValue(rx, ry) !== null) continue;

      if (placeTrap) {
        placedTraps++;
        this.grid.set(rx, ry, "trap");
        this.pits.push(rx + ry * this.width);
        placedRooms.push(this.grid.get(rx, ry));
        continue;
      } else if (placeBat) {
        placedBats++;
        this.grid.set(rx, ry, "bat");
        this.bats.push(rx + ry * this.width);
        placedRooms.push(this.grid.get(rx, ry));
        continue;
      } else {
        this.grid.set(rx, ry, "room");
        placedRooms.push(this.grid.get(rx, ry));
        continue;
      }
    }

    const centerRoom = this.grid.get(
      Math.round(this.width / 2),
      Math.round(this.height / 2)
    );
    // Loop over placed rooms and connect them to each other.
    placedRooms.forEach((room, index) => {
      const roomPath =
        index === 0
          ? this.#aStar(centerRoom, room) // Connect the first room to center instead
          : this.#aStar(placedRooms[index - 1], room);

      if (roomPath) {
        this.#connectRooms(roomPath);
      } else {
        console.log("No room path was found - Something went wrong.");
      }

      const connectToCenter =
        this.rng() > 0.25 && index > 0 ? this.#aStar(room, centerRoom) : null;
      if (connectToCenter) {
        this.#connectRooms(connectToCenter);
      }
    });
  }
  // private function for astar
  #aStar(start, goal) {
    const openSet = [start];
    const cameFrom = new Map();

    const gScore = new Map();
    const fScore = new Map();

    /**
     * Manhattan Heuristic function
     * @param {Number} a
     * @param {Number} b
     * @returns {Number}
     */
    const heuristic = (a, b) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);

    gScore.set(start, 0);
    fScore.set(start, heuristic(start, goal));

    while (openSet.length > 0) {
      // Pick the node with the lowest fScore
      let current = openSet.reduce((a, b) =>
        (fScore.get(a) ?? Infinity) < (fScore.get(b) ?? Infinity) ? a : b
      );

      if (current === goal) {
        const path = [];
        while (cameFrom.has(current)) {
          path.unshift(current);
          current = cameFrom.get(current);
        }
        path.unshift(start);
        return path;
      }

      openSet.splice(openSet.indexOf(current), 1);

      for (let neighbor of this.grid.neighbors(current)) {
        let stepCost = 1;
        if (neighbor.value === "room" || neighbor.value === "path")
          stepCost = 0.1; // Lower step cost to try to make sure we don't get parallel coridoors.

        if (neighbor.value === "trap") stepCost = 10; // avoid traps

        let tentativeG = (gScore.get(current) ?? Infinity) + stepCost;

        // Check for trying to avoid zig-zaging
        if (cameFrom.has(current)) {
          // cameFrom shouldn't have the current from the start, check to see if we're at the start or not
          const prev = cameFrom.get(current);
          if (prev.x !== current.x && prev.y !== current.y) {
            tentativeG += 5;
          }
        }

        // Check for adjecent rooms to try to avoid too many parallel paths.
        const adjPaths = this.grid
          .neighbors(neighbor)
          .filter((room) => room.value === "path");
        if (adjPaths.length > 0 && neighbor.value === null) tentativeG += 5;

        if (tentativeG < (gScore.get(neighbor) ?? Infinity)) {
          cameFrom.set(neighbor, current);
          gScore.set(neighbor, tentativeG);
          fScore.set(neighbor, tentativeG + heuristic(neighbor, goal));
          if (!openSet.includes(neighbor)) openSet.push(neighbor);
        }
      }
    }
    return null; // no path
  }

  // private function for connecting rooms
  #connectRooms(path) {
    for (let i = 0; i < path.length - 1; i++) {
      const a = path[i];
      const b = path[i + 1];

      if (a.value === null) a.value = "room";
      if (b.value === null) b.value = "room";

      const dx = b.x - a.x;
      const dy = b.y - a.y;

      let dir;
      if (dx === -1) dir = 0; // West
      else if (dy === -1) dir = 1; // North
      else if (dx === 1) dir = 2; // East
      else if (dy === 1) dir = 3; // South

      a.connect(dir, b);
    }
  }

  neighbors(sq) {
    return this.grid.gridSquares[sq].connectedRooms;
  }

  get map() {
    return this.grid.map;
  }
}

const testGrid = new Grid(8, 8);
const testMap = new GameMap("test");
testMap.generate();

// test function to visualize the grid made
// Console Visualization
const SYMBOLS = {
  start: "S",
  end: "E",
  room: "■",
  path: "◂",
  null: "-",
  trap: "X",
  bat: "B",
  arrow: "A",
  player1: "1",
  player2: "2",
  player3: "3",
  player4: "4",
  wumpus: "W",
};

// Console Visualization
const mapping = {
  // W N E S format
  // single
  W: "╸", // left only
  N: "╹", // down only
  E: "╺", // right only
  S: "╻", // up only
  // doubles
  WE: "━",
  NS: "┃",
  NE: "┗", // up + right
  WN: "┛", // up + left
  ES: "┏", // down + right
  WS: "┓", // down + left
  // triples
  WNE: "┻", // T up
  WNS: "┫", // T right
  WES: "┳", // T down
  NES: "┣", // T left
  // quad
  WNES: "╋",
};

function displayMap(grid, showRooms = true) {
  for (let iy = 0; iy < grid.height; iy++) {
    let line = "";
    for (let ix = 0; ix < grid.width; ix++) {
      const sq = grid.get(ix, iy);
      if (sq.value === "room" || sq.value === "path") {
        line += getJunctionSymbol(sq);
      } else {
        showRooms
          ? (line += SYMBOLS[grid.getValue(ix, iy)])
          : (line += getJunctionSymbol(sq));
      }
    }
    console.log(line);
  }
}

function getJunctionSymbol(square) {
  if (!square) return "X";
  const dirs = ["W", "N", "E", "S"];
  let key = "";

  square.connectedRooms.forEach((junc, ind) => {
    if (junc !== null) key += dirs[ind];
  });

  return mapping[key] || " ";
}

/*
Debugging lines:
RNG with "test":
0.6138032459118583
0.28640606678869696
*/

/* console.log("=".repeat(30));
displayMap(testMap.grid);
console.log("=".repeat(30));
displayMap(testMap.grid, false);
console.log("=".repeat(30));

console.log(testMap.rng());
console.log(testMap.rng());

console.log(`Player spawns:${testMap.playerSpawns}
    \nWumpus: ${testMap.wumpusSpawn}
    \nPits: ${testMap.pits}
    \nBats: ${testMap.bats}`);

console.log(testMap.grid.squareIndex(0));
console.log(testMap.grid.squareIndex(1));
console.log(testMap.grid.squareIndex(2));
console.log(testMap.grid.squareIndex(3)); */

// console.log(testMap.map);
