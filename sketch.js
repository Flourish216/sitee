let grid = [];
let nextGrid = [];
let cols, rows;
let cb = 15; // cell size
let speed = 10;

function setup() {
  createCanvas(windowWidth, windowHeight);
  initGrid();
  noStroke();
}

function initGrid() {
  cols = floor(width / cb);
  rows = floor(height / cb);

  grid = [];
  nextGrid = [];

  for (let i = 0; i < cols; i++) {
    grid[i] = [];
    nextGrid[i] = [];
    for (let j = 0; j < rows; j++) {
      grid[i][j] = random(1) < 0.2 ? 1 : 0;
      nextGrid[i][j] = 0;
    }
  }
}

function draw() {
  background(255, 60); // ✅ 半透明白背景，让残影柔和
  let offsetX = (width - cols * cb) / 2;
  let offsetY = (height - rows * cb) / 2;

  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      if (grid[i][j] === 1) fill(0, 80);
      else fill(255, 0);
      rect(offsetX + i * cb, offsetY + j * cb, cb, cb);
    }
  }

  if (frameCount % speed == 0) step();
}

function step() {
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      let state = grid[i][j];
      let neighbors = countNeighbors(i, j);

      if (state == 0 && neighbors == 3) nextGrid[i][j] = 1;
      else if (state == 1 && (neighbors < 2 || neighbors > 3)) nextGrid[i][j] = 0;
      else nextGrid[i][j] = state;
    }
  }

  // copy nextGrid
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      grid[i][j] = nextGrid[i][j];
    }
  }
}

function countNeighbors(x, y) {
  let sum = 0;
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      if (i === 0 && j === 0) continue;
      let col = (x + i + cols) % cols;
      let row = (y + j + rows) % rows;
      sum += grid[col][row];
    }
  }
  return sum;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  initGrid();
}
