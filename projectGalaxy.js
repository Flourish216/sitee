(() => {
  const host = document.getElementById('project-galaxy');
  if (!host) return;

  const pointer = { x: 0, y: 0, active: false };

  const planets = [
    { label: 'VOX', url: 'projects/robot.html', radius: 0.26, speed: 0.0065, wobble: Math.random() * 1000, hue: 210, size: 22 },
    { label: 'CANDY', url: 'projects/bear.html', radius: 0.36, speed: -0.0052, wobble: Math.random() * 1000, hue: 320, size: 26 },
    { label: 'CYCLE', url: 'projects/carpet.html', radius: 0.46, speed: 0.0042, wobble: Math.random() * 1000, hue: 140, size: 18 },
  ].map((planet, idx) => ({
    ...planet,
    phase: Math.random() * Math.PI * 2 + idx * 0.8,
    pos: null,
    trail: [],
  }));

  const stars = Array.from({ length: 240 }, () => ({
    x: Math.random(),
    y: Math.random(),
    depth: Math.random() * 0.9 + 0.1,
    phase: Math.random() * Math.PI * 2,
  }));

  const nebulas = Array.from({ length: 4 }, () => ({
    phase: Math.random() * Math.PI * 2,
    radius: Math.random() * 0.35 + 0.25,
    drift: Math.random() * 0.0007 + 0.00025,
    hue: Math.random() * 360,
  }));

  const sketch = (p) => {
    let canvas;

    const resize = () => {
      const { clientWidth, clientHeight } = host;
      if (!canvas) {
        canvas = p.createCanvas(clientWidth, clientHeight);
        canvas.parent(host);
        canvas.canvas.addEventListener('pointerleave', () => {
          pointer.active = false;
        });
      } else {
        p.resizeCanvas(clientWidth, clientHeight);
      }
    };

    const center = () => p.createVector(p.width / 2, p.height / 2);

    const basePosition = (planet) => {
      const angle = planet.phase;
      const rx = planet.radius * p.width;
      const ry = planet.radius * p.height * 0.6;
      const noiseWarp = (p.noise(planet.wobble + p.frameCount * 0.002) - 0.5) * rx * 0.12;
      return p.createVector(
        Math.cos(angle) * rx + noiseWarp,
        Math.sin(angle) * ry
      );
    };

    const updatePlanets = () => {
      const c = center();

      const basePositions = planets.map((planet) => {
        planet.phase += planet.speed;
        return basePosition(planet);
      });

      const targets = basePositions.map((base, idx) => {
        const offset = p.createVector(0, 0);

        if (pointer.active) {
          const pointerVec = p.createVector(pointer.x, pointer.y).sub(c);
          const diff = pointerVec.copy().sub(base);
          const dist = diff.mag() + 1;
          diff.setMag(Math.min(150, 260 / dist));
          offset.add(diff.mult(0.35));
        }

        basePositions.forEach((other, jdx) => {
          if (idx === jdx) return;
          const sep = base.copy().sub(other);
          const dist = sep.mag() + 0.001;
          if (dist < 160) {
            sep.setMag((160 - dist) * 0.55);
            offset.add(sep);
          }
        });

        const drift = p.createVector(
          Math.sin(p.frameCount * 0.004 + idx * 1.7) * 14,
          Math.cos(p.frameCount * 0.003 + idx) * 12
        );
        offset.add(drift);

        return base.copy().add(offset);
      });

      planets.forEach((planet, idx) => {
        const target = targets[idx];
        if (!planet.pos) {
          planet.pos = target.copy();
        } else {
          planet.pos.lerp(target, 0.18);
        }

        planet.trail.unshift({ pos: planet.pos.copy(), alpha: 1 });
        if (planet.trail.length > 120) planet.trail.pop();
      });
    };

    const drawNebulae = () => {
      const ctx = p.drawingContext;
      ctx.save();
      const c = center();
      ctx.translate(c.x, c.y);
      ctx.globalCompositeOperation = 'lighter';
      nebulas.forEach((cloud, idx) => {
        cloud.phase += cloud.drift;
        const r = cloud.radius * Math.max(p.width, p.height) * (0.6 + Math.sin(p.frameCount * 0.003 + idx) * 0.1);
        const x = Math.cos(cloud.phase) * p.width * 0.3;
        const y = Math.sin(cloud.phase * 0.7) * p.height * 0.2;
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, r);
        const hue = (cloud.hue + p.frameCount * 0.2) % 360;
        gradient.addColorStop(0, `hsla(${hue}, 80%, 65%, 0.18)`);
        gradient.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();
    };

    const drawStars = () => {
      p.noStroke();
      stars.forEach((star, idx) => {
        const flicker = Math.sin(p.frameCount * 0.02 + star.phase) * 0.5 + 0.8;
        const x = star.x * p.width + Math.sin(p.frameCount * 0.0008 + idx) * 10 * star.depth;
        const y = star.y * p.height + Math.cos(p.frameCount * 0.0006 + idx) * 14 * star.depth;
        p.fill(220, 5, 95, 0.25 * star.depth * flicker);
        p.circle(x, y, (0.8 + star.depth) * 2.5 * flicker);
      });
    };

    const drawPlanet = (planet) => {
      const c = center();
      const pos = planet.pos.copy().add(c);

      // trail
      p.push();
      p.strokeWeight(3);
      planet.trail.forEach((node, idx) => {
        node.alpha *= 0.97;
        if (node.alpha <= 0.02) return;
        const hue = (planet.hue + idx * 2 + p.frameCount * 0.4) % 360;
        p.stroke(hue, 90, 100, node.alpha * 0.5);
        const current = node.pos.copy().add(c);
        p.line(current.x, current.y, current.x, current.y);
      });
      p.pop();

      // halo
      p.noStroke();
      p.fill(planet.hue, 90, 100, 0.25);
      p.circle(pos.x, pos.y, planet.size * 4.6);
      p.fill(planet.hue, 85, 100, 0.7);
      p.circle(pos.x, pos.y, planet.size * 2.6);
      p.fill(planet.hue, 30, 100, 0.9);
      p.circle(pos.x + planet.size * 0.2, pos.y - planet.size * 0.2, planet.size * 1.6);

      // label ring
      p.noFill();
      p.stroke(planet.hue, 30, 100, 0.45);
      p.strokeWeight(1.6);
      p.circle(pos.x, pos.y, planet.size * 5.4);

      // label
      p.textAlign(p.CENTER, p.CENTER);
      p.textFont('Manrope');
      p.textSize(planet.size * 0.85);
      p.fill(planet.hue, 20, 100, 0.7);
      p.text(planet.label, pos.x, pos.y - planet.size * 3.2);

      planet.screenPos = pos;
    };

    p.setup = () => {
      resize();
      p.colorMode(p.HSB, 360, 100, 100, 1);
      p.frameRate(60);
    };

    p.windowResized = resize;

    p.mouseMoved = () => {
      pointer.x = p.mouseX;
      pointer.y = p.mouseY;
      pointer.active = pointer.x >= 0 && pointer.x <= p.width && pointer.y >= 0 && pointer.y <= p.height;
    };

    p.mousePressed = () => {
      if (!pointer.active) return;
      const pt = p.createVector(pointer.x, pointer.y);
      for (const planet of planets) {
        if (planet.screenPos && pt.dist(planet.screenPos) < planet.size * 2.2) {
          window.location.href = planet.url;
          break;
        }
      }
    };

    p.touchMoved = () => {
      pointer.x = p.mouseX;
      pointer.y = p.mouseY;
      pointer.active = true;
      return false;
    };

    p.touchStarted = () => {
      pointer.x = p.mouseX;
      pointer.y = p.mouseY;
      pointer.active = true;
      p.mousePressed();
      return false;
    };

    p.draw = () => {
      p.background(0, 0, 0);
      drawNebulae();
      drawStars();
      updatePlanets();
      planets.forEach(drawPlanet);
    };
  };

  new p5(sketch, host);
})();
