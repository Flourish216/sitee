let cols = 20;
let rows = 20;
let circleColors = [];

function setup() {
  createCanvas(windowWidth,windowHeight);
  for (let i = 0; i < cols * rows; i++) {
    circleColors[i] = color(200);
  }
}

function draw() {
  background(255);
  let index = 0;
  
  for (let x = 0; x < cols; x++) {
    for (let y = 0; y < rows; y++) {
      fill(circleColors[index]);
      ellipse(x * 20 + 20, y * 20 + 20, 15);
      index++;
    }
  }
}

function mousePressed() {
  let index = 0;
  for (let x = 0; x < cols; x++) {
    for (let y = 0; y < rows; y++) {
      let cx = x * 20 + 20;
      let cy = y * 20 + 20;
      if (dist(mouseX, mouseY, cx, cy) < 20) {
        circleColors[index] = color(random(255), random(255), random(255));
      }
      index++;
    }
  }
}
