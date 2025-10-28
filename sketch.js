let grid = [];
let nextGrid = [];
let cols, rows;
let cellSize = 24;
let speed = 24;

function setup() {
  createCanvas(windowWidth, windowHeight);
  initGrid();
  noStroke(); // ✅ 无边线
}

function initGrid() {
  cols = floor(width / cellSize);
  rows = floor(height / cellSize);
  grid = Array.from({ length: cols }, () =>
    Array.from({ length: rows }, () => (random(1) < 0.18 ? 1 : 0))
  );
  nextGrid = Array.from({ length: cols }, () => Array(rows).fill(0));
}

function draw() {
  background(255, 70); // ✅ 柔白背景，淡化尾迹
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      if (grid[i][j] === 1) {
        fill(0, 70); // ✅ 更柔和的半透明块
        rect(i * cellSize, j * cellSize, cellSize, cellSize);
      }
    }
  }

  if (frameCount % speed === 0) step();
}

function step() {
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      let state = grid[i][j];
      let neighbors = countNeighbors(i, j);
      nextGrid[i][j] =
        state === 1
          ? neighbors === 2 || neighbors === 3
            ? 1
            : 0
          : neighbors === 3
          ? 1
          : 0;
    }
  }
  [grid, nextGrid] = [nextGrid, grid];
}

function countNeighbors(x, y) {
  let sum = 0;
  for (let i = -1; i <= 1; i++)
    for (let j = -1; j <= 1; j++)
      if (i || j)
        sum += grid[(x + i + cols) % cols][(y + j + rows) % rows];
  return sum;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  initGrid();
}
