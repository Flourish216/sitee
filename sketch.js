let grid = [];
let nextGrid = [];
let cb = 20;
let speed = 15; 

function setup() {
  createCanvas(canvasHeight,canvasWidth);

  for (let i = 0; i < 21; i++) {
    grid[i] = [];
    nextGrid[i] = [];
    for (let j = 0; j < 21; j++) {
      grid[i][j] = 0;
      nextGrid[i][j] = 0;
    }
  }

  let mX = 11;
  let mY = 11;
  for (let i = -2; i <= 2; i++) {
    for (let j = -2; j <= 2; j++) {
      if (random(1) < 0.4) {
        grid[mX + i][mY + j] = 1;
      }
    }
  }
}

function draw() {
  background(220);

  for (let i = 0; i < 21; i++) {
    for (let j = 0; j < 21; j++) {
      let x = i * cb;
      let y = j * cb;
      stroke(200);
      if (grid[i][j] === 1) {
        fill(0); 
      } else {
        fill(255);
      }
      rect(x, y, cb);
    }
  }

  if (frameCount % speed == 0) {
    step();
  }
}

function step() {
  for (let i = 0; i < 21; i++) {
    for (let j = 0; j < 21; j++) {
      let state = grid[i][j];
      let neighbors = countNeighbors(i, j);

      if (state == 0 && neighbors == 3) {
        nextGrid[i][j] = 1;
      } else if (state == 1 && (neighbors < 2 || neighbors > 3)) {
        nextGrid[i][j] = 0;
      } else {
        nextGrid[i][j] = state;
      }
    }
  }

  for (let i = 0; i < 21; i++) {
    for (let j = 0; j < 21; j++) {
      grid[i][j] = nextGrid[i][j];
    }
  }
}

function countNeighbors(x, y) {
  let sum = 0;
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      if (i == 0 && j == 0) continue;
      let col = (x + i + 21) % 21;
      let row = (y + j + 21) % 21;
      sum += grid[col][row];
    }
  }
  return sum;
}
