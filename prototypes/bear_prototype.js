/* Prototype inspired by neon-cat page: spawn simple cats with rainbow trails. */
const trailLength = 35;
const hues = [0, 45, 90, 180, 225, 300];
let cats = [];

class SimpleCat {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.vel = p5.Vector.random2D().mult(random(2, 4));
    this.trail = Array.from({ length: trailLength }, () => this.pos.copy());
    this.size = random(35, 55);
  }

  update() {
    this.trail.pop();
    this.trail.unshift(this.pos.copy());

    this.pos.add(this.vel);
    if (this.pos.x < -100) this.pos.x = width + 100;
    if (this.pos.x > width + 100) this.pos.x = -100;
    if (this.pos.y < -100) this.pos.y = height + 100;
    if (this.pos.y > height + 100) this.pos.y = -100;

    if (frameCount % 120 === 0) {
      const turn = p5.Vector.random2D().mult(this.vel.mag());
      this.vel.lerp(turn, 0.4);
    }
  }

  draw() {
    noStroke();
    for (let i = this.trail.length - 1; i >= 0; i--) {
      const t = i / this.trail.length;
      const hue = hues[i % hues.length];
      fill(hue, 80, 100, 0.2 + 0.6 * (1 - t));
      const pos = this.trail[i];
      circle(pos.x, pos.y, this.size * (0.2 + 0.8 * (1 - t)));
    }

    push();
    translate(this.pos.x, this.pos.y);
    rotate(sin(frameCount * 0.02) * 0.1);

    fill(330, 20, 100);
    rectMode(CENTER);
    rect(0, 0, this.size * 1.2, this.size * 0.8, 12);
    fill(330, 60, 100);
    rect(this.size * 0.4, -this.size * 0.2, this.size * 0.7, this.size * 0.7, 10);
    fill(0, 0, 100);
    ellipse(this.size * 0.55, -this.size * 0.25, this.size * 0.18, this.size * 0.22);
    ellipse(this.size * 0.25, -this.size * 0.25, this.size * 0.18, this.size * 0.22);
    pop();
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100, 1);
  textFont('Manrope');
  spawnCat(width / 2, height / 2);
}

function draw() {
  background(230, 40, 6);
  drawStars();
  cats.forEach((cat) => {
    cat.update();
    cat.draw();
  });
  fill(0, 0, 100);
  textSize(24);
  textAlign(CENTER, BOTTOM);
  text('Click to spawn more rainbow cats', width / 2, height - 30);
}

function drawStars() {
  noStroke();
  for (let i = 0; i < 120; i++) {
    fill(200, 10, 100, random(0.05, 0.2));
    circle(random(width), random(height), random(1, 3));
  }
}

function mousePressed() {
  spawnCat(mouseX, mouseY);
}

function touchStarted() {
  spawnCat(mouseX, mouseY);
  return false;
}

function spawnCat(x, y) {
  cats.push(new SimpleCat(x, y));
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
