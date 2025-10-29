// p5.js instance mode cursor trail overlay with idle "pet" greetings
const cursorTrailSketch = (p) => {
  const trailLength = 24;
  const trail = [];
  const palette = [
    [255, 115, 161],
    [255, 173, 89],
    [123, 210, 255],
    [90, 160, 255],
    [168, 118, 255],
  ];
  const petMessages = [
    'hi dreamer ✨',
    '我们在这儿～',
    'creative break time!',
    '想画点什么吗？',
    '静静地飘一会儿…',
  ];

  const idleDelay = 3400;
  let maxSize = 36;
  let minSize = 14;
  let lastPointer = null;
  let lastMoveMillis = performance.now();
  let petMode = false;
  let petMessage = petMessages[0];
  let petMessageAlpha = 0;

  const recalcSizes = () => {
    const base = Math.max(p.windowWidth, p.windowHeight);
    maxSize = p.constrain(base * 0.03, 26, 54);
    minSize = maxSize * 0.38;
  };

  const resetIdle = () => {
    lastMoveMillis = performance.now();
    if (petMode) {
      petMode = false;
    }
  };

  if (!window.__cursorTrailListenersAdded) {
    ['pointermove', 'pointerdown', 'touchstart'].forEach((evt) => {
      window.addEventListener(evt, resetIdle, { passive: true });
    });
    window.__cursorTrailListenersAdded = true;
  }

  const pickPetMessage = () =>
    petMessages[Math.floor(Math.random() * petMessages.length)];

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

    recalcSizes();

    for (let i = 0; i < trailLength; i++) {
      trail.push({
        x: p.windowWidth / 2,
        y: p.windowHeight / 2,
        size: p.map(i, 0, trailLength - 1, minSize, maxSize),
        alpha: p.map(i, 0, trailLength - 1, 190, 35),
      });
    }
  };

  p.draw = () => {
    if (!trail.length) return;

    const now = performance.now();
    if (!petMode && now - lastMoveMillis > idleDelay) {
      petMode = true;
      petMessage = pickPetMessage();
    } else if (petMode && now - lastMoveMillis <= idleDelay) {
      petMode = false;
    }

    let targetX = p.mouseX;
    let targetY = p.mouseY;

    const pointerValid =
      Number.isFinite(targetX) &&
      Number.isFinite(targetY) &&
      targetX >= 0 &&
      targetX <= p.width &&
      targetY >= 0 &&
      targetY <= p.height;

    if (pointerValid) {
      lastPointer = { x: targetX, y: targetY };
    } else if (lastPointer) {
      targetX = lastPointer.x;
      targetY = lastPointer.y;
    } else {
      targetX = p.width / 2;
      targetY = p.height / 2;
      lastPointer = { x: targetX, y: targetY };
    }

    if (petMode) {
      const centerX = p.width / 2;
      const centerY = p.height / 2;
      lastPointer = { x: centerX, y: centerY };

      for (let i = 0; i < trailLength; i++) {
        const angle = p.frameCount * 0.05 + i * 0.45;
        const radius = minSize * 0.6 + i * 2.4;
        trail[i].x = p.lerp(trail[i].x, centerX + Math.cos(angle) * radius, 0.18);
        trail[i].y = p.lerp(trail[i].y, centerY + Math.sin(angle) * radius, 0.18);
      }
    } else {
      trail[trailLength - 1].x = p.lerp(
        trail[trailLength - 1].x,
        targetX,
        0.54
      );
      trail[trailLength - 1].y = p.lerp(
        trail[trailLength - 1].y,
        targetY,
        0.54
      );

      for (let i = 0; i < trailLength - 1; i++) {
        trail[i].x = p.lerp(trail[i].x, trail[i + 1].x, 0.52);
        trail[i].y = p.lerp(trail[i].y, trail[i + 1].y, 0.52);
      }
    }

    p.clear();
    p.noStroke();
    p.drawingContext.save();
    p.drawingContext.shadowBlur = petMode ? 30 : 18;
    p.drawingContext.shadowColor = petMode
      ? 'rgba(255, 205, 240, 0.45)'
      : 'rgba(120, 165, 255, 0.38)';

    for (let i = 0; i < trailLength; i++) {
      const { x, y, size, alpha } = trail[i];
      const gradientPos = i / (trailLength - 1);
      const colorIndex = gradientPos * (palette.length - 1);
      const lowerIndex = Math.floor(colorIndex);
      const upperIndex = Math.min(palette.length - 1, lowerIndex + 1);
      const mix = colorIndex - lowerIndex;
      const lower = palette[lowerIndex];
      const upper = palette[upperIndex];
      const r = Math.round(lower[0] + (upper[0] - lower[0]) * mix);
      const g = Math.round(lower[1] + (upper[1] - lower[1]) * mix);
      const b = Math.round(lower[2] + (upper[2] - lower[2]) * mix);
      p.fill(r, g, b, alpha);
      p.ellipse(x, y, size);
    }
    p.drawingContext.restore();

    petMessageAlpha = p.lerp(
      petMessageAlpha,
      petMode ? 1 : 0,
      petMode ? 0.06 : 0.12
    );
    if (petMessageAlpha > 0.02) {
      p.push();
      p.textAlign(p.CENTER, p.CENTER);
      p.textFont('Playfair Display');
      p.textSize(Math.min(30, p.width * 0.035));
      p.fill(40, 40, 40, 230 * petMessageAlpha);
      p.text(petMessage, p.width / 2, p.height / 2 - maxSize * 1.6);
      p.pop();
    }
  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
    recalcSizes();
    for (let i = 0; i < trailLength; i++) {
      trail[i].size = p.map(i, 0, trailLength - 1, minSize, maxSize);
    }
  };
};

new p5(cursorTrailSketch);
