// 修改后的代码
let grid = [];
let nextGrid = [];
let cols, rows;
let cb = 15; // 单个方格的大小
let speed = 10;

function setup() {
  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent('game-of-life-container');
  
  initGrid();
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
      grid[i][j] = random(1) < 0.08 ? 1 : 0;
      nextGrid[i][j] = 0;
    }
  }
}

function draw() {
  // 使用更透明的背景创建淡出效果
  background(255, 255, 255, 15); 
  noStroke();

  // 居中绘制整个网格
  let offsetX = (width - cols * cb) / 2;
  let offsetY = (height - rows * cb) / 2;

  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      if (grid[i][j] === 1) {
        fill(0, 0, 0, 40); 
      } else {
        fill(255, 255, 255, 0); // 完全透明
      }
      rect(offsetX + i * cb, offsetY + j * cb, cb, cb);
    }
  }

  if (frameCount % speed == 0) {
    step();
  }
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

  // 复制新状态
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

// ✅ 当窗口大小改变时自动调整网格
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  initGrid();
}