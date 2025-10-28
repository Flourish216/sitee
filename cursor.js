// p5.js instance mode cursor trail overlay
const cursorTrailSketch = (p) => {
  const trailLength = 22;
  const trail = [];
  let lastPointer = null;

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

    for (let i = 0; i < trailLength; i++) {
      trail.push({
        x: p.windowWidth / 2,
        y: p.windowHeight / 2,
        size: p.map(i, 0, trailLength - 1, 28, 8),
        alpha: p.map(i, 0, trailLength - 1, 230, 40),
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

    trail[trailLength - 1].x = p.lerp(trail[trailLength - 1].x, targetX, 0.35);
    trail[trailLength - 1].y = p.lerp(trail[trailLength - 1].y, targetY, 0.35);

    for (let i = 0; i < trailLength - 1; i++) {
      trail[i].x = p.lerp(trail[i].x, trail[i + 1].x, 0.45);
      trail[i].y = p.lerp(trail[i].y, trail[i + 1].y, 0.45);
    }

    p.clear();
    p.noStroke();
    p.drawingContext.save();
    p.drawingContext.shadowBlur = 24;
    p.drawingContext.shadowColor = 'rgba(17, 17, 17, 0.22)';

    for (let i = 0; i < trailLength; i++) {
      const { x, y, size, alpha } = trail[i];
      p.fill(17, 17, 17, alpha);
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
