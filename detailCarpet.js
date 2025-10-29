(() => {
  const host = document.getElementById('carpet-canvas');
  if (!host) return;

  new p5((p) => {
    const TRAIL_MAX = 220;
    const cycle = {
      pos: null,
      dir: p.createVector(1, 0),
      speed: 6,
      hue: 190,
      boost: 0,
    };
    const trail = [];
    const sparks = [];
    const keys = { left: false, right: false, up: false, down: false };

    const resetCycle = () => {
      cycle.pos = p.createVector(p.width * 0.25, p.height * 0.55);
      cycle.dir = p5.Vector.fromAngle(0);
      cycle.speed = Math.min(p.width, p.height) * 0.0045 * 60;
      cycle.hue = 190;
      cycle.boost = 0;
      trail.length = 0;
      sparks.length = 0;
    };

    p.setup = () => {
      p.createCanvas(window.innerWidth, window.innerHeight).parent(host);
      p.colorMode(p.HSB, 360, 100, 100, 1);
      resetCycle();
    };

    p.windowResized = () => {
      p.resizeCanvas(window.innerWidth, window.innerHeight);
      resetCycle();
    };

    const updateInput = () => {
      const turnSpeed = 0.09;
      if (keys.left) cycle.dir.rotate(-turnSpeed);
      if (keys.right) cycle.dir.rotate(turnSpeed);
      if (keys.up) cycle.boost = p.lerp(cycle.boost, 1, 0.08);
      else cycle.boost = p.lerp(cycle.boost, 0, 0.1);
    };

    const spawnSpark = (position, hue) => {
      for (let i = 0; i < 10; i++) {
        sparks.push({
          x: position.x,
          y: position.y,
          vx: p.random(-3, 3),
          vy: p.random(-3, 3),
          life: 1,
          hue: (hue + p.random(-20, 20)) % 360,
        });
      }
    };

    const updateCycle = () => {
      updateInput();
      const maxSpeed = cycle.speed * (1.3 + cycle.boost * 0.6);
      const step = cycle.dir.copy().setMag(maxSpeed / 60 * p.deltaTime);
      const nextPos = cycle.pos.copy().add(step);

      if (
        nextPos.x < p.width * 0.05 ||
        nextPos.x > p.width * 0.95 ||
        nextPos.y < p.height * 0.1 ||
        nextPos.y > p.height * 0.9
      ) {
        spawnSpark(nextPos, cycle.hue);
        resetCycle();
        return;
      }

      trail.unshift({
        a: cycle.pos.copy(),
        b: nextPos.copy(),
        hue: (cycle.hue + cycle.boost * 90 + p.frameCount * 0.3) % 360,
        alpha: 1,
      });
      if (trail.length > TRAIL_MAX) trail.pop();

      cycle.pos = nextPos;
      cycle.hue = (cycle.hue + 0.6 + cycle.boost * 2) % 360;
    };

    const drawBackground = () => {
      const ctx = p.drawingContext;
      ctx.save();
      const grad = ctx.createRadialGradient(
        p.width / 2,
        p.height / 2,
        p.width * 0.2,
        p.width / 2,
        p.height / 2,
        Math.max(p.width, p.height)
      );
      grad.addColorStop(0, 'rgba(3, 8, 20, 0.95)');
      grad.addColorStop(1, 'rgba(0, 0, 5, 1)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, p.width, p.height);
      ctx.restore();

      p.stroke(200, 30, 50, 0.1);
      p.noFill();
      const spacing = p.width * 0.06;
      for (let x = spacing; x < p.width; x += spacing) {
        p.line(x, p.height * 0.12, x, p.height * 0.88);
      }
      for (let y = p.height * 0.12; y < p.height * 0.9; y += spacing * 0.6) {
        p.line(p.width * 0.05, y, p.width * 0.95, y);
      }
    };

    const drawTrail = () => {
      p.strokeWeight(4);
      for (const segment of trail) {
        segment.alpha *= 0.985;
        p.stroke(segment.hue, 90, 100, segment.alpha * 0.8);
        p.line(segment.a.x, segment.a.y, segment.b.x, segment.b.y);
      }
    };

    const drawCycle = () => {
      const dir = cycle.dir.copy().setMag(1);
      const perp = dir.copy().rotate(p.HALF_PI).setMag(14);
      const tail = cycle.pos.copy().sub(dir.copy().mult(24));

      p.noStroke();
      p.fill(cycle.hue, 90, 100, 0.85);
      p.beginShape();
      const nose = cycle.pos.copy().add(dir.copy().mult(26));
      const left = cycle.pos.copy().add(perp);
      const right = cycle.pos.copy().sub(perp);
      p.vertex(nose.x, nose.y);
      p.vertex(left.x, left.y);
      p.vertex(tail.x, tail.y);
      p.vertex(right.x, right.y);
      p.endShape(p.CLOSE);

      p.fill(cycle.hue, 60, 90, 0.6);
      p.circle(cycle.pos.x, cycle.pos.y, 24);
      p.fill(0, 0, 100, 0.8);
      p.circle(cycle.pos.x + perp.x * 0.25, cycle.pos.y + perp.y * 0.25, 6);
      p.circle(cycle.pos.x - perp.x * 0.25, cycle.pos.y - perp.y * 0.25, 6);
    };

    const drawSparks = () => {
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.x += s.vx;
        s.y += s.vy;
        s.vx *= 0.97;
        s.vy += 0.05;
        s.life *= 0.94;
        if (s.life <= 0.03) {
          sparks.splice(i, 1);
          continue;
        }
        p.noStroke();
        p.fill(s.hue, 90, 100, s.life);
        p.circle(s.x, s.y, 4 + s.life * 16);
      }
    };

    p.draw = () => {
      time += 0.02;
      drawBackground();
      updateCycle();
      drawTrail();
      drawCycle();
      drawSparks();
      p.fill(200, 10, 90, 0.4);
      p.textAlign(p.RIGHT, p.BOTTOM);
      p.textSize(14);
      p.text('Arrow keys / A D to steer · hold W / ↑ to boost', p.width - 32, p.height - 24);
    };

    p.keyPressed = () => {
      if (p.key === 'ArrowLeft' || p.key === 'a' || p.key === 'A') keys.left = true;
      if (p.key === 'ArrowRight' || p.key === 'd' || p.key === 'D') keys.right = true;
      if (p.key === 'ArrowUp' || p.key === 'w' || p.key === 'W') keys.up = true;
      if (p.key === 'ArrowDown' || p.key === 's' || p.key === 'S') keys.down = true;
      return false;
    };

    p.keyReleased = () => {
      if (p.key === 'ArrowLeft' || p.key === 'a' || p.key === 'A') keys.left = false;
      if (p.key === 'ArrowRight' || p.key === 'd' || p.key === 'D') keys.right = false;
      if (p.key === 'ArrowUp' || p.key === 'w' || p.key === 'W') keys.up = false;
      if (p.key === 'ArrowDown' || p.key === 's' || p.key === 'S') keys.down = false;
      return false;
    };

    p.mousePressed = () => {
      spawnSpark(cycle.pos, cycle.hue);
      return false;
    };

    p.touchStarted = () => {
      spawnSpark(cycle.pos, cycle.hue);
      return false;
    };
  }, mount);
})();
