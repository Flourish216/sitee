// p5.js instance mode cursor trail overlay
const cursorTrailSketch = (p) => {
  const trailLength = 22;
  const trail = [];
  let lastPointer = null;
  const palette = [
    [255, 139, 139],
    [255, 181, 129],
    [136, 190, 255],
    [104, 162, 255],
    [162, 118, 255],
  ];

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
    canvas.elt.style.zIndex = '6';
    p.pixelDensity(1);
    p.frameRate(60);
    p.clear();

    const base = Math.max(p.windowWidth, p.windowHeight);
    const maxSize = p.constrain(base * 0.028, 24, 48);
    const minSize = maxSize * 0.45;

    for (let i = 0; i < trailLength; i++) {
      trail.push({
        x: p.windowWidth / 2,
        y: p.windowHeight / 2,
        size: p.map(i, 0, trailLength - 1, minSize, maxSize),
        alpha: p.map(i, 0, trailLength - 1, 170, 25),
      });
    }
  };

  p.draw = () => {
    if (!trail.length) return;

    // Ease the target for smoother motion
    let targetX = p.mouseX;
    let targetY = p.mouseY;

    const inBounds =
      Number.isFinite(targetX) &&
      Number.isFinite(targetY) &&
      targetX >= 0 &&
      targetX <= p.width &&
      targetY >= 0 &&
      targetY <= p.height;

    if (inBounds) {
      lastPointer = { x: targetX, y: targetY };
    } else if (lastPointer) {
      targetX = lastPointer.x;
      targetY = lastPointer.y;
    } else {
      targetX = p.width / 2;
      targetY = p.height / 2;
    }

    trail[trailLength - 1].x = p.lerp(trail[trailLength - 1].x, targetX, 0.5);
    trail[trailLength - 1].y = p.lerp(trail[trailLength - 1].y, targetY, 0.5);

    for (let i = 0; i < trailLength - 1; i++) {
      trail[i].x = p.lerp(trail[i].x, trail[i + 1].x, 0.5);
      trail[i].y = p.lerp(trail[i].y, trail[i + 1].y, 0.5);
    }

    p.clear();
    p.noStroke();
    p.drawingContext.save();
    p.drawingContext.shadowBlur = 22;
    p.drawingContext.shadowColor = 'rgba(255, 210, 240, 0.35)';

    for (let i = 0; i < trailLength; i++) {
      const { x, y, size, alpha } = trail[i];
      const t = i / (trailLength - 1);
      const paletteIndex = Math.floor(t * (palette.length - 1));
      const [r, g, b] = palette[paletteIndex];
      p.fill(r, g, b, alpha);
      p.ellipse(x, y, size);
    }

    p.drawingContext.restore();
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
