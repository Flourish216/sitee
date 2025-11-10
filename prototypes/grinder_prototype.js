/* Webcam shred prototype: simple version for p5 Web Editor. */
let cam;
let fragments = [];
let pointerDown = false;

function setup() {
  createCanvas(windowWidth, windowHeight);
  cam = createCapture({ video: { facingMode: 'user' }, audio: false });
  cam.size(width, height);
  cam.hide();
  textFont('Manrope');
}

function draw() {
  background(0);
  push();
  translate(width, 0);
  scale(-1, 1); // mirror
  image(cam, 0, 0, width, height);
  pop();

  if (pointerDown && frameCount % 5 === 0) {
    spawnFragment(mouseX, mouseY);
  }

  updateFragments();
  renderFragments();

  fill(255);
  textSize(20);
  textAlign(CENTER, BOTTOM);
  text('Hold mouse to shred · Scroll to clear', width / 2, height - 20);
}

function spawnFragment(x, y) {
  const w = random(40, 120);
  const h = random(40, 120);
  const img = cam.get(width - x - w / 2, y - h / 2, w, h);
  fragments.push({
    img,
    pos: createVector(x, y),
    vel: p5.Vector.random2D().mult(random(3, 8)),
    life: 255,
  });
  if (fragments.length > 80) fragments.shift();
}

function updateFragments() {
  fragments.forEach((frag) => {
    frag.pos.add(frag.vel);
    frag.vel.mult(0.95);
    frag.life -= 4;
  });
  fragments = fragments.filter((frag) => frag.life > 0);
}

function renderFragments() {
  fragments.forEach((frag) => {
    push();
    tint(255, frag.life);
    imageMode(CENTER);
    image(frag.img, frag.pos.x, frag.pos.y);
    pop();
  });
}

function mousePressed() {
  pointerDown = true;
}

function mouseReleased() {
  pointerDown = false;
}

function touchStarted() {
  pointerDown = true;
  return false;
}

function touchEnded() {
  pointerDown = false;
  return false;
}

function mouseWheel() {
  fragments = [];
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
