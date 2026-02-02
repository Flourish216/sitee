(() => {
  const host = document.getElementById('project-galaxy');
  if (!host) return;

  const pointer = { x: 0, y: 0, active: false };

  const planets = [
    { type: 'robot', url: 'projects/robot.html', radius: 0.28, speed: 0.006, wobble: Math.random() * 1000, hue: 200, size: 28 },
    { type: 'bear', url: 'projects/bear.html', radius: 0.39, speed: -0.0048, wobble: Math.random() * 1000, hue: 330, size: 34 },
    { type: 'person', url: 'projects/carpet.html', radius: 0.5, speed: 0.0038, wobble: Math.random() * 1000, hue: 150, size: 26 },
    { type: 'photo', url: 'projects/photography.html', radius: 0.61, speed: -0.003, wobble: Math.random() * 1000, hue: 45, size: 30 },
  ].map((planet, idx) => ({
    ...planet,
    phase: Math.random() * Math.PI * 2 + idx * 0.8,
    pos: null,
    trail: [],
    fluxSeed: Math.random() * 1000,
  }));

  const stars = Array.from({ length: 260 }, () => ({
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
      const scale = Math.max(p.width, p.height);
      const rx = planet.radius * scale;
      const ry = rx * 0.58;
      const warp = (p.noise(planet.wobble + p.frameCount * 0.002) - 0.5) * rx * 0.16;
      const pulse = Math.sin(p.frameCount * 0.005 + planet.fluxSeed) * rx * 0.04;
      return p.createVector(
        Math.cos(angle) * (rx + pulse) + warp,
        Math.sin(angle) * (ry + pulse * 0.7)
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

        basePositions.forEach((other, jdx) => {
          if (idx === jdx) return;

          const delta = p.createVector(base.x - other.x, base.y - other.y);
          const dist = delta.mag() + 0.0001;

          if (dist < 260) {
            const repel = delta.copy().setMag((260 - dist) * 0.58);
            offset.add(repel);
          }

          const swirlDir = idx % 2 === 0 ? 1 : -1;
          const tangential = p.createVector(-delta.y, delta.x);
          if (tangential.magSq() > 0.05) {
            const swirlStrength = Math.min(240 / dist, 1.9) * (1 + Math.sin(p.frameCount * 0.015 + idx + jdx));
            tangential.setMag(swirlStrength * 24 * swirlDir);
            offset.add(tangential);
          }

          const breathing = delta.copy().mult(0.002 * Math.sin(p.frameCount * 0.01 + dist * 0.01));
          offset.add(breathing);
        });

        if (pointer.active) {
          const pointerVec = p.createVector(pointer.x, pointer.y).sub(c);
          const diff = pointerVec.copy().sub(base);
          const dist = diff.mag() + 1;
          diff.setMag(Math.min(320, 420 / dist));
          offset.add(diff.mult(0.42));

          const swirl = p.createVector(-diff.y, diff.x);
          if (swirl.magSq() > 0.05) {
            swirl.setMag(Math.min(220 / dist, 1.6) * 36);
            offset.add(swirl);
          }
        } else {
          offset.add(p.createVector(
            Math.sin(p.frameCount * 0.004 + idx) * 16,
            Math.cos(p.frameCount * 0.005 + idx * 1.3) * 12
          ));
        }

        return base.copy().add(offset);
      });

      planets.forEach((planet, idx) => {
        const target = targets[idx];
        if (!planet.pos) {
          planet.pos = target.copy();
        } else {
          planet.pos.lerp(target, 0.22);
        }

        planet.trail.unshift({ pos: planet.pos.copy(), alpha: 1 });
        if (planet.trail.length > 160) planet.trail.pop();

        planet.fluxSeed += 0.008 + idx * 0.001;
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
        const r = cloud.radius * Math.max(p.width, p.height) * (0.7 + Math.sin(p.frameCount * 0.003 + idx) * 0.12);
        const x = Math.cos(cloud.phase) * p.width * 0.3;
        const y = Math.sin(cloud.phase * 0.7) * p.height * 0.25;
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, r);
        const hue = (cloud.hue + p.frameCount * 0.2) % 360;
        gradient.addColorStop(0, `hsla(${hue}, 85%, 65%, 0.22)`);
        gradient.addColorStop(0.6, `hsla(${hue}, 45%, 40%, 0.12)`);
        gradient.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();
    };

    const drawStars = () => {
      stars.forEach((star, idx) => {
        const flicker = Math.sin(p.frameCount * 0.03 + star.phase) * 0.5 + 0.9;
        const x = star.x * p.width + Math.sin(p.frameCount * 0.0008 + idx) * 12 * star.depth;
        const y = star.y * p.height + Math.cos(p.frameCount * 0.0006 + idx) * 16 * star.depth;
        const alpha = (0.35 + star.depth * 0.55) * flicker;

        p.noStroke();
        p.fill(220, 12, 98, alpha * 0.6);
        p.circle(x, y, (1 + star.depth * 1.2) * 3 * flicker);

        p.fill(180, 8, 90, alpha * 0.35);
        p.circle(x + Math.sin(p.frameCount * 0.12 + idx) * 1.5, y + Math.cos(p.frameCount * 0.1 + idx) * 1.5, (0.6 + star.depth) * 2.2);

        p.stroke(220, 50, 100, alpha * 0.45);
        p.strokeWeight(0.6);
        p.line(x - 3 * star.depth, y, x + 3 * star.depth, y);
        p.line(x, y - 3 * star.depth, x, y + 3 * star.depth);
      });
    };

    const drawFieldRipples = (scaleFactor) => {
      const c = center();
      p.push();
      p.translate(c.x, c.y);
      planets.forEach((planet, idx) => {
        if (!planet.pos) return;
        const s = planet.size * scaleFactor;
        for (let ring = 1; ring <= 3; ring++) {
          const radius = s * (2.6 + ring * 1.2 + Math.sin(p.frameCount * 0.02 + planet.fluxSeed + ring) * 0.3);
          p.noFill();
          p.stroke(planet.hue, 70, 100, 0.05 + ring * 0.05);
          p.strokeWeight(0.6 + ring * 0.5);
          p.ellipse(planet.pos.x, planet.pos.y, radius * 2, radius * 1.25);
        }
      });
      p.pop();
    };

    const drawFilaments = (scaleFactor) => {
      const c = center();
      p.push();
      p.translate(c.x, c.y);
      for (let i = 0; i < planets.length; i++) {
        for (let j = i + 1; j < planets.length; j++) {
          const a = planets[i];
          const b = planets[j];
          if (!a.pos || !b.pos) continue;
          const diff = p.createVector(b.pos.x - a.pos.x, b.pos.y - a.pos.y);
          const dist = diff.mag();
          const maxDist = Math.max(p.width, p.height) * 0.8;
          const intensity = p.constrain(p.map(dist, 90, maxDist, 0.9, 0), 0, 1);
          if (intensity <= 0.02) continue;

          const mid = p.createVector((a.pos.x + b.pos.x) / 2, (a.pos.y + b.pos.y) / 2);
          const normal = p.createVector(-diff.y, diff.x);
          if (normal.magSq() > 0.05) {
            const wobble = (Math.sin(p.frameCount * 0.02 + a.fluxSeed + j) * 0.5 + 0.5) * (dist * 0.25 + 40);
            normal.setMag(wobble);
          }
          const ctrl1 = p.createVector(mid.x + normal.x, mid.y + normal.y);
          const ctrl2 = p.createVector(mid.x - normal.x, mid.y - normal.y);

          p.noFill();
          p.stroke((a.hue + b.hue) / 2, 90, 100, intensity * 0.65);
          p.strokeWeight(scaleFactor * 1.4);
          p.bezier(a.pos.x, a.pos.y, ctrl1.x, ctrl1.y, ctrl2.x, ctrl2.y, b.pos.x, b.pos.y);

          for (let k = 0; k < 3; k++) {
            let t = (k / 3 + (p.frameCount * 0.008 + a.fluxSeed * 0.1)) % 1;
            if (t < 0) t += 1;
            const px = p.bezierPoint(a.pos.x, ctrl1.x, ctrl2.x, b.pos.x, t);
            const py = p.bezierPoint(a.pos.y, ctrl1.y, ctrl2.y, b.pos.y, t);
            const pulse = (Math.sin((t + p.frameCount * 0.01) * Math.PI * 2) * 0.5 + 0.6);
            p.noStroke();
            p.fill((a.hue + b.hue) / 2, 90, 100, intensity * 0.55);
            p.circle(px, py, (scaleFactor * 5 + 3) * pulse);
          }
        }
      }
      p.pop();
    };

    const drawPlanet = (planet, scaleFactor) => {
      if (!planet.pos) return;
      const c = center();
      const pos = planet.pos.copy().add(c);
      const s = planet.size * scaleFactor;

      p.push();
      p.translate(c.x, c.y);

      p.noFill();
      planet.trail.forEach((node, idx) => {
        node.alpha *= 0.965;
        if (node.alpha <= 0.03) return;
        const hue = (planet.hue + idx * 4 + p.frameCount * 0.6) % 360;
        p.stroke(hue, 95, 100, node.alpha * 0.35);
        p.strokeWeight(Math.max(1.1, s * 0.04 * node.alpha));
        const current = node.pos;
        const previous = planet.trail[idx + 1]?.pos;
        if (previous) {
          p.line(previous.x, previous.y, current.x, current.y);
        } else {
          p.point(current.x, current.y);
        }
      });

      const haloPulse = Math.sin(p.frameCount * 0.04 + planet.fluxSeed) * 0.2 + 0.8;
      p.noStroke();
      p.fill(planet.hue, 90, 100, 0.12);
      p.circle(planet.pos.x, planet.pos.y, s * (4.2 + haloPulse));
      p.fill(planet.hue, 45, 100, 0.18);
      p.circle(planet.pos.x, planet.pos.y, s * (2.8 + Math.sin(p.frameCount * 0.03 + planet.fluxSeed * 1.2)));

      const drawIcon = {
        robot: () => {
          p.push();
          p.translate(planet.pos.x, planet.pos.y);
          p.rotate(Math.sin(p.frameCount * 0.01 + planet.fluxSeed) * 0.08);
          p.rectMode(p.CENTER);
          p.fill(planet.hue, 55, 95, 0.92);
          p.rect(0, 0, s * 1.65, s * 1.28, 8);
          p.fill(planet.hue, 30, 60, 0.6);
          p.rect(0, s * 0.68, s * 1.2, s * 0.65, 10);
          p.fill(planet.hue, 20, 100);
          p.rect(0, -s * 0.78, s * 1.05, s * 0.85, 6);
          p.fill(0, 0, 8);
          const eyeYOffset = s * 0.22;
          const eyeWidth = s * 0.32;
          p.ellipse(-s * 0.42, -eyeYOffset, eyeWidth, eyeWidth * 1.1);
          p.ellipse(s * 0.42, -eyeYOffset, eyeWidth, eyeWidth * 1.1);
          p.fill(planet.hue, 60, 100);
          p.rect(0, -s * 0.28, s * 0.55, s * 0.2, 3);
          p.stroke(planet.hue, 50, 100, 0.85);
          p.strokeWeight(2);
          p.noFill();
          p.bezier(-s * 0.9, -s * 1.15, -s * 0.6, -s * 1.35, s * 0.6, -s * 1.35, s * 0.9, -s * 1.15);
          p.pop();
        },
        bear: () => {
          p.push();
          p.translate(planet.pos.x, planet.pos.y);
          const wobble = Math.sin(p.frameCount * 0.018 + planet.fluxSeed) * 0.1;
          p.scale(1 + wobble * 0.2, 1 - wobble * 0.2);
          p.fill(planet.hue, 70, 100, 0.9);
          p.circle(0, 0, s * 1.95);
          p.fill(planet.hue, 45, 100);
          p.circle(-s * 0.6, -s * 0.62, s * 0.85);
          p.circle(s * 0.6, -s * 0.62, s * 0.85);
          p.fill(0, 0, 10);
          p.circle(-s * 0.38, -s * 0.28, s * 0.36);
          p.circle(s * 0.38, -s * 0.28, s * 0.36);
          p.fill(planet.hue, 65, 100);
          p.arc(0, s * 0.22, s * 0.8, s * 0.72, 0, p.PI);
          p.pop();
        },
        person: () => {
          p.push();
          p.translate(planet.pos.x, planet.pos.y);
          p.rotate(Math.sin(p.frameCount * 0.02 + planet.fluxSeed) * 0.15);
          
          // 头部
          p.fill(planet.hue, 70, 100, 0.9);
          p.noStroke();
          p.ellipse(0, 0, s * 1.6, s * 1.8);
          
          // 眼睛
          p.fill(0, 0, 10);
          const eyeY = -s * 0.1;
          p.ellipse(-s * 0.3, eyeY, s * 0.25, s * 0.3);
          p.ellipse(s * 0.3, eyeY, s * 0.25, s * 0.3);
          
          // 嘴巴
          p.noFill();
          p.stroke(0, 0, 10);
          p.strokeWeight(2);
          const mouthY = s * 0.3;
          p.bezier(-s * 0.3, mouthY, -s * 0.1, mouthY + s * 0.2, s * 0.1, mouthY + s * 0.2, s * 0.3, mouthY);
          
          // 头发
          p.stroke(planet.hue, 90, 100, 0.85);
          p.strokeWeight(3);
          const hairY = -s * 0.7;
          for (let i = -4; i <= 4; i++) {
            const x = i * s * 0.15;
            const waveOffset = Math.sin(p.frameCount * 0.05 + i * 0.5) * s * 0.1;
            p.bezier(x, hairY, x - s * 0.1, hairY - s * 0.3 + waveOffset, 
                    x + s * 0.1, hairY - s * 0.6 + waveOffset, x, hairY - s * 0.9);
          }
          
          p.pop();
        },
        photo: () => {
          p.push();
          p.translate(planet.pos.x, planet.pos.y);
          p.rotate(Math.sin(p.frameCount * 0.015 + planet.fluxSeed) * 0.08);
          p.rectMode(p.CENTER);

          // body
          p.fill(planet.hue, 70, 100, 0.92);
          p.rect(0, 0, s * 2.1, s * 1.3, 8);

          // top prism
          p.fill(planet.hue, 40, 90, 0.9);
          p.rect(0, -s * 0.65, s * 1.4, s * 0.45, 6);

          // lens
          p.fill(0, 0, 8, 0.9);
          p.circle(0, 0, s * 1.05);
          p.fill(planet.hue, 85, 100, 0.9);
          p.circle(0, 0, s * 0.7);
          p.fill(planet.hue, 15, 95, 0.9);
          p.circle(0, 0, s * 0.35);

          // shutter sparkle
          p.noFill();
          p.stroke(planet.hue, 90, 100, 0.85);
          p.strokeWeight(2);
          p.arc(0, 0, s * 1.3, s * 1.3, p.frameCount * 0.03, p.frameCount * 0.03 + p.PI * 1.4);

          // strap dots
          p.noStroke();
          p.fill(planet.hue, 60, 100, 0.9);
          p.circle(-s * 1.05, -s * 0.15, s * 0.2);
          p.circle(s * 1.05, -s * 0.15, s * 0.2);

          p.pop();
        },
      };

      drawIcon[planet.type]();
      p.pop();

      planet.screenPos = pos;
      planet.drawSize = s;
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
      const scaleFactor = Math.min(Math.max(Math.max(p.width, p.height) / 780, 0.95), 1.9);
      if (!pointer.active) return;
      const pt = p.createVector(pointer.x, pointer.y);
      for (const planet of planets) {
        if (!planet.screenPos) continue;
        const radius = (planet.drawSize || planet.size * scaleFactor) * 2.1;
        if (pt.dist(planet.screenPos) < radius) {
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
      const scaleFactor = Math.min(Math.max(Math.max(p.width, p.height) / 780, 0.95), 1.9);
      drawNebulae();
      drawStars();
      updatePlanets();
      drawFieldRipples(scaleFactor);
      drawFilaments(scaleFactor);
      planets.forEach((planet) => drawPlanet(planet, scaleFactor));
    };
  };

  new p5(sketch, host);
})();
