// p5.js instance mode cursor trail overlay
const cursorTrailSketch = (p) => {
  const trailLength = 22;
  const trail = [];

  p.setup = () => {
    const canvas = p.createCanvas(p.windowWidth, p.windowHeight);
    const container = document.getElementById('cursor-container');
    if (!container) {
      canvas.remove();
      p.noLoop();
      return;
    }
    canvas.parent(container);
    canvas.elt.style.pointerEvents = 'none';
    p.pixelDensity(1);
    p.frameRate(60);

    for (let i = 0; i < trailLength; i++) {
      trail.push({
        x: p.windowWidth / 2,
        y: p.windowHeight / 2,
        size: p.map(i, 0, trailLength - 1, 6, 18),
        alpha: p.map(i, 0, trailLength - 1, 40, 210),
      });
    }
  };

  p.draw = () => {
    if (!trail.length) return;

    // Ease the target for smoother motion
    const targetX = Number.isFinite(p.mouseX) ? p.mouseX : p.windowWidth / 2;
    const targetY = Number.isFinite(p.mouseY) ? p.mouseY : p.windowHeight / 2;

    trail[trailLength - 1].x = p.lerp(trail[trailLength - 1].x, targetX, 0.35);
    trail[trailLength - 1].y = p.lerp(trail[trailLength - 1].y, targetY, 0.35);

    for (let i = 0; i < trailLength - 1; i++) {
      trail[i].x = p.lerp(trail[i].x, trail[i + 1].x, 0.45);
      trail[i].y = p.lerp(trail[i].y, trail[i + 1].y, 0.45);
    }

    p.clear();
    p.noStroke();

    for (let i = 0; i < trailLength; i++) {
      const { x, y, size, alpha } = trail[i];
      p.fill(17, 17, 17, alpha);
      p.ellipse(x, y, size);
    }
  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
    trail.forEach((point) => {
      point.x = p.constrain(point.x, 0, p.windowWidth);
      point.y = p.constrain(point.y, 0, p.windowHeight);
    });
  };
};

new p5(cursorTrailSketch);
