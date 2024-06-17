const gridSize = 10;
const ships = { player1: [], player2: [] };
const shipSizes = [4, 3, 3, 2, 2, 2, 1, 1, 1, 1];
const player1Grid = [];
const player2Grid = [];
let currentPlayer = 1;

function createEmptyField(grid) {
  for (let i = 0; i < gridSize; i++) {
    grid[i] = [];
    for (let j = 0; j < gridSize; j++) {
      grid[i][j] = createEmptyCell();
    }
  }
}

let player1ShipsCount = shipSizes.length;
let player2ShipsCount = shipSizes.length;

function displayGrid(grid, tableId, shipsHidden = true) {
  const table = document.getElementById(tableId);
  table.innerHTML = '';

  for (let i = 0; i < gridSize; i++) {
    const row = document.createElement('tr');
    for (let j = 0; j < gridSize; j++) {
      const cell = document.createElement('td');

      cell.setAttribute('data-x', j);
      cell.setAttribute('data-y', i);
      cell.classList.add('cell');
      if (grid[i][j].ship) {
        cell.classList.add('ship');
      }

      if (grid[i][j].boom && grid[i][j].ship) {
        cell.textContent = 'boom';
      } else if (grid[i][j].ship && shipsHidden) {
        cell.textContent = 'X';
      } else {
        cell.textContent = '';
      }
      row.appendChild(cell);
    }
    table.appendChild(row);
  }

  table.addEventListener('click', (event) => {
    const el = event.target;
    if (el.classList.contains('cell')) {
      const { x, y } = el.dataset;
      const cell = grid[y][x];

      if (
        (currentPlayer === 1 && tableId === 'player1-grid') ||
        (currentPlayer === 2 && tableId === 'player2-grid')
      ) {
        if (cell.boom === false) {
          el.classList.add('boom');
          cell.boom = true;

          if (cell.ship) {
            const shipIndex = (currentPlayer === 1 ? ships.player1 : ships.player2).findIndex((ship) => {
              return ship.some((cell) => cell[0] === +x && cell[1] === +y);
            });

            if (checkFullBoom(shipIndex, currentPlayer)) {
              colorizeBoomedShip(shipIndex, currentPlayer);
            }
          } else {
            switchPlayer();
            alert('Промах. Наступний хід гравця #' + currentPlayer);
          }
          if (currentPlayer === 1) {
            player1ShipsCount = countAllShipsPlayer(player2Grid);
          } else {
            player2ShipsCount = countAllShipsPlayer(player1Grid);
          }
          checkWhoWinner();
        }
      }
    }
  });
}

function checkFullBoom(shipIndex, currentPlayer) {
  const ship = (currentPlayer === 1 ? ships.player1 : ships.player2)[shipIndex];
  const grid = currentPlayer === 1 ? player1Grid : player2Grid;
  return ship.every((cell) => {
    return grid[cell[1]][cell[0]].boom;
  });
}

function colorizeBoomedShip(shipIndex, currentPlayer) {
  const ship = (currentPlayer === 1 ? ships.player1 : ships.player2)[shipIndex];
  const grid = currentPlayer === 1 ? player1Grid : player2Grid;
  const table = document.querySelector(currentPlayer === 1 ? '#player1-grid' : '#player2-grid');

  ship.forEach((cell) => {
    directions.forEach(([dx, dy]) => {
      const neighborX = cell[0] + dx;
      const neighborY = cell[1] + dy;
      if (
        neighborX >= 0 && neighborX < gridSize &&
        neighborY >= 0 && neighborY < gridSize &&
        !grid[neighborY][neighborX].ship
      ) {
        grid[neighborY][neighborX].boom = true;
        const neighborCell = table.querySelector(`[data-x="${neighborX}"][data-y="${neighborY}"]`);
        neighborCell.classList.add('neighbor'); // Add a class to mark it as a neighboring cell
      }
    });
  });
}

function switchPlayer() {
  currentPlayer = currentPlayer === 1 ? 2 : 1;
}

function createEmptyCell() {
  return {
    ship: false,
    boom: false,
  };
}

function generateShips(grid) {
  for (const size of shipSizes) {
    generateRandomShip(grid, size);
  }
}

function generateRandomShip(grid, size) {
  const ship = [];
  while (true) {
    let startX = Math.floor(Math.random() * gridSize);
    let startY = Math.floor(Math.random() * gridSize);
    const direction = Math.random() < 0.5 ? 'horizontal' : 'vertical';

    if (canPlaceShip(grid, startX, startY, direction, size)) {
      for (let i = 0; i < size; i++) {
        let cellX = startX + (direction === 'horizontal' ? i : 0);
        let cellY = startY + (direction === 'vertical' ? i : 0);
        grid[cellY][cellX].ship = true;
        ship.push([cellX, cellY]);
      }
      if (grid === player1Grid) ships.player1.push(ship);
      else ships.player2.push(ship);
      break;
    }
  }
}

function canPlaceShip(grid, startX, startY, direction, size) {
  for (let i = 0; i < size; i++) {
    let cellX = startX + (direction === 'horizontal' ? i : 0);
    let cellY = startY + (direction === 'vertical' ? i : 0);
    if (
      cellX >= gridSize ||
      cellY >= gridSize ||
      grid[cellY][cellX].ship ||
      !checkPlaceShips(grid, cellY, cellX)
    ) {
      return false;
    }
  }
  return true;
}

const directions = [
  [-1, -1],
  [-1, 0],
  [-1, 1],
  [0, -1],
  [0, 1],
  [1, -1],
  [1, 0],
  [1, 1],
];

function checkPlaceShips(grid, y, x) {
  for (const [dirY, dirX] of directions) {
    const newY = y + dirY;
    const newX = x + dirX;
    if (newY >= 0 && newY < gridSize && newX >= 0 && newX < gridSize) {
      if (grid[newY][newX].ship) {
        return false;
      }
    }
  }
  return true;
}

function countAllShipsPlayer(grid) {
  let count = 0;
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      if (grid[i][j].ship && !grid[i][j].boom) {
        count++;
      }
    }
  }
  return count;
}

function checkWhoWinner() {
  if (player1ShipsCount === 0) {
    alert('Гравець 2 переміг!');
    location.reload();
  } else if (player2ShipsCount === 0) {
    alert('Гравець 1 переміг!');
    location.reload();
  }
}

document.getElementById('playButton').addEventListener('click', function () {
  createEmptyField(player1Grid);
  createEmptyField(player2Grid);

  generateShips(player1Grid);
  generateShips(player2Grid);

  displayGrid(player1Grid, 'player1-grid');
  displayGrid(player2Grid, 'player2-grid');
  document.getElementById('startButton').style.display = 'block';
});

document.getElementById('startButton').addEventListener('click', function () {
  displayGrid(player1Grid, 'player1-grid', false);
  displayGrid(player2Grid, 'player2-grid', false);
});
