/* Simple p5 prototype of the galaxy scene. Global mode for Web Editor. */
const basicPlanets = [
  { name: 'Robot', hue: 200, orbit: 150, speed: 0.01 },
  { name: 'Bear', hue: 330, orbit: 220, speed: -0.008 },
  { name: 'Cycle', hue: 150, orbit: 290, speed: 0.006 },
];

let planetAngles = [];
let glowAlpha = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100, 1);
  textFont('Manrope');
  textAlign(CENTER, CENTER);
  planetAngles = basicPlanets.map(() => random(TWO_PI));
}

function draw() {
  background(220, 40, 6);
  drawBackdrop();
  translate(width / 2, height / 2);

  basicPlanets.forEach((planet, idx) => {
    const angle = planetAngles[idx];
    const x = cos(angle) * planet.orbit;
    const y = sin(angle) * planet.orbit * 0.6;

    stroke(planet.hue, 50, 80, 0.15);
    noFill();
    ellipse(0, 0, planet.orbit * 2, planet.orbit * 1.2);

    noStroke();
    fill(planet.hue, 80, 95);
    circle(x, y, 40);
    fill(planet.hue, 30, 100);
    circle(x, y, 22);
    fill(0, 0, 100);
    textSize(16);
    text(planet.name, x, y - 35);

    planetAngles[idx] += planet.speed;
  });

  if (mouseIsPressed) {
    glowAlpha = lerp(glowAlpha, 0.35, 0.1);
  } else {
    glowAlpha = lerp(glowAlpha, 0, 0.05);
  }

  noStroke();
  fill(190, 30, 100, glowAlpha);
  circle(0, 0, 220);
}

function drawBackdrop() {
  noStroke();
  for (let i = 0; i < 120; i++) {
    fill(210, 30, 100, random(0.02, 0.08));
    circle(random(width), random(height), random(1, 4));
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
