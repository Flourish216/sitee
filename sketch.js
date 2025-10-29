let grid = [];
let nextGrid = [];
let cols, rows;
let cellSize = 24;
const baseInterval = 24;
const konamiPalette = [
  [255, 99, 164],
  [255, 173, 64],
  [132, 224, 108],
  [111, 197, 255],
  [171, 133, 255],
];

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
  const konami = Boolean(window.konamiActive);
  background(255, konami ? 60 : 70); // ✅ 柔白背景，淡化尾迹
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      if (grid[i][j] === 1) {
        if (konami) {
          const colorIndex = Math.abs(floor(i + j + frameCount * 0.08)) % konamiPalette.length;
          const color = konamiPalette[colorIndex];
          const alpha = 140 + 60 * sin(frameCount * 0.12 + (i + j) * 0.3);
          fill(color[0], color[1], color[2], constrain(alpha, 90, 220));
        } else {
          fill(0, 70); // ✅ 更柔和的半透明块
        }
        rect(i * cellSize, j * cellSize, cellSize, cellSize);
      }
    }
  }

  const interval = konami ? 8 : baseInterval;
  if (frameCount % interval === 0) step(konami);
}

function step(konami = false) {
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
      if (konami && random(1) < 0.0025) {
        nextGrid[i][j] = 1;
      }
    }
  }
  [grid, nextGrid] = [nextGrid, grid];
  if (konami && frameCount % 320 === 0) {
    sprinkleKonami();
  }
}

function sprinkleKonami() {
  for (let k = 0; k < cols * 0.4; k++) {
    const i = floor(random(cols));
    const j = floor(random(rows));
    grid[i][j] = 1;
  }
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
