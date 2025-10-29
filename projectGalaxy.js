(() => {
  const host = document.getElementById('project-galaxy');
  if (!host) return;

  const pointer = { x: 0, y: 0, active: false };

  const planets = [
    { type: 'robot', url: 'projects/robot.html', radius: 0.28, speed: 0.006, wobble: Math.random() * 1000, hue: 200, size: 28 },
    { type: 'bear', url: 'projects/bear.html', radius: 0.39, speed: -0.0048, wobble: Math.random() * 1000, hue: 330, size: 34 },
    { type: 'cycle', url: 'projects/carpet.html', radius: 0.5, speed: 0.0038, wobble: Math.random() * 1000, hue: 150, size: 26 },
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
      const w = host.clientWidth || window.innerWidth;
      const h = host.clientHeight || window.innerHeight;
      if (!canvas) {
        canvas = p.createCanvas(w, h);
        canvas.parent(host);
        canvas.canvas.addEventListener('pointerleave', () => {
          pointer.active = false;
        });
      } else {
        p.resizeCanvas(w, h);
      }
    };

    const center = () => p.createVector(p.width / 2, p.height / 2);

    const basePosition = (planet) => {
      const angle = planet.phase;
      const rx = planet.radius * Math.max(p.width, p.height);
      const ry = rx * 0.6;
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
          Math.sin(p.frameCount * 0.004 + idx * 1.7) * 18,
          Math.cos(p.frameCount * 0.003 + idx) * 16
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

      p.push();
      p.translate(c.x, c.y);

      p.strokeWeight(3);
      planet.trail.forEach((node, idx) => {
        node.alpha *= 0.97;
        if (node.alpha <= 0.02) return;
        const hue = (planet.hue + idx * 3 + p.frameCount * 0.5) % 360;
        p.stroke(hue, 90, 100, node.alpha * 0.4);
        const current = node.pos;
        p.line(current.x, current.y, current.x, current.y);
      });

      p.noStroke();
      p.fill(planet.hue, 80, 100, 0.25);
      p.circle(planet.pos.x, planet.pos.y, planet.size * 4.2);

      const drawIcon = {
        robot: () => {
          const s = planet.size;
          p.push();
          p.translate(planet.pos.x, planet.pos.y);
          p.fill(planet.hue, 50, 90, 0.85);
          p.rectMode(p.CENTER);
          p.rect(0, 0, s * 1.5, s * 1.3, 6);
          p.fill(planet.hue, 20, 100);
          p.rect(0, -s * 0.7, s, s * 0.8, 4);
          p.fill(0, 0, 10);
          p.ellipse(-s * 0.25, -s * 0.75, s * 0.28, s * 0.32);
          p.ellipse(s * 0.25, -s * 0.75, s * 0.28, s * 0.32);
          p.fill(planet.hue, 60, 100);
          p.rect(0, -s * 0.35, s * 0.55, s * 0.18, 3);
          p.pop();
        },
        bear: () => {
          const s = planet.size;
          p.push();
          p.translate(planet.pos.x, planet.pos.y);
          p.fill(planet.hue, 70, 100, 0.9);
          p.circle(0, 0, s * 1.9);
          p.fill(planet.hue, 45, 100);
          p.circle(-s * 0.55, -s * 0.6, s * 0.8);
          p.circle(s * 0.55, -s * 0.6, s * 0.8);
          p.fill(0, 0, 10);
          p.circle(-s * 0.35, -s * 0.25, s * 0.35);
          p.circle(s * 0.35, -s * 0.25, s * 0.35);
          p.arc(0, s * 0.2, s * 0.8, s * 0.8, 0, p.PI);
          p.pop();
        },
        cycle: () => {
          const s = planet.size;
          p.push();
          p.translate(planet.pos.x, planet.pos.y);
          p.stroke(planet.hue, 90, 100, 0.75);
          p.strokeWeight(3);
          p.noFill();
          p.ellipse(-s * 0.9, s * 0.4, s, s * 0.9);
          p.ellipse(s * 0.9, s * 0.4, s, s * 0.9);
          p.line(-s * 0.6, -s * 0.5, s * 0.6, -s * 0.1);
          p.line(-s * 0.6, -s * 0.5, -s * 0.9, s * 0.4);
          p.line(s * 0.6, -s * 0.1, s * 0.9, s * 0.4);
          p.pop();
        },
      };

      drawIcon[planet.type]();
      p.pop();

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
