/* Minimal robot portrait prototype in global p5 style. */
let speaking = false;
let mouthOpen = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100, 1);
  textFont('Manrope');
  textAlign(CENTER, CENTER);
}

function draw() {
  background(210, 30, 8);
  translate(width / 2, height / 2);
  const size = min(width, height) * 0.25;

  mouthOpen = lerp(mouthOpen, speaking ? 1 : 0, 0.12);

  noStroke();
  fill(210, 30, 30, 0.4);
  rectMode(CENTER);
  rect(0, size * 0.2, size * 0.9, size * 1.2, 24);
  fill(210, 15, 12, 0.5);
  rect(0, size * 0.2, size * 0.6, size, 18);

  // Arms
  stroke(200, 20, 90, 0.6);
  strokeWeight(10);
  line(-size * 0.55, size * 0.1, -size * 1.1, size * 0.4 + sin(frameCount * 0.04) * size * 0.1);
  line(size * 0.55, size * 0.1, size * 1.1, size * 0.4 - sin(frameCount * 0.04) * size * 0.1);

  // Head
  noStroke();
  fill(210, 25, 18, 0.65);
  rect(0, -size * 0.75, size, size * 0.7, 18);
  fill(0, 0, 100);
  ellipse(-size * 0.25, -size * 0.75, size * 0.28, size * 0.3);
  ellipse(size * 0.25, -size * 0.75, size * 0.28, size * 0.3);

  fill(210, 70, 100);
  const mouthHeight = map(mouthOpen, 0, 1, size * 0.05, size * 0.14);
  rect(0, -size * 0.45, size * 0.32, mouthHeight, 6);

  // Status text
  resetMatrix();
  fill(0, 0, 100);
  textSize(28);
  text(speaking ? 'Robot says: hello!' : 'Click to make robot speak', width / 2, height * 0.82);
}

function mousePressed() {
  speaking = !speaking;
}

function touchStarted() {
  speaking = !speaking;
  return false;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
