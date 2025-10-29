(() => {
  const host = document.getElementById('project-galaxy');
  if (!host) return;

  const pointer = { x: 0, y: 0, active: false };
  const planets = [
    {
      label: 'VOX',
      url: 'projects/robot.html',
      radius: 140,
      speed: 0.009,
      hue: 200,
      size: 18,
      phase: Math.random() * Math.PI * 2,
      wobble: Math.random() * 1000,
      trail: [],
    },
    {
      label: 'CANDY',
      url: 'projects/bear.html',
      radius: 200,
      speed: -0.0075,
      hue: 330,
      size: 22,
      phase: Math.random() * Math.PI * 2,
      wobble: Math.random() * 1000,
      trail: [],
    },
    {
      label: 'CARPET',
      url: 'projects/carpet.html',
      radius: 260,
      speed: 0.006,
      hue: 120,
      size: 16,
      phase: Math.random() * Math.PI * 2,
      wobble: Math.random() * 1000,
      trail: [],
    },
  ];

  const stars = Array.from({ length: 260 }, () => ({
    x: Math.random(),
    y: Math.random(),
    depth: Math.random() * 0.8 + 0.2,
    phase: Math.random() * Math.PI * 2,
  }));

  const nebulaSeeds = Array.from({ length: 4 }, () => ({
    angle: Math.random() * Math.PI * 2,
    radius: 0.2 + Math.random() * 0.4,
    speed: Math.random() * 0.0006 + 0.0002,
    hue: Math.random() * 360,
  }));

  const sketch = (p) => {
    let canvas;
    const center = () => p.createVector(p.width / 2, p.height / 2);

    const resizeCanvas = () => {
      canvas = canvas || p.createCanvas(host.clientWidth, host.clientHeight);
      p.resizeCanvas(host.clientWidth, host.clientHeight);
    };

    const drawGradient = () => {
      const ctx = p.drawingContext;
      ctx.save();
      const g = ctx.createRadialGradient(
        p.width / 2,
        p.height / 2,
        p.width * 0.1,
        p.width / 2,
        p.height / 2,
        Math.max(p.width, p.height) * 0.7
      );
      g.addColorStop(0, 'rgba(8, 10, 18, 0.95)');
      g.addColorStop(0.5, 'rgba(5, 7, 14, 0.9)');
      g.addColorStop(1, 'rgba(0, 0, 2, 1)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, p.width, p.height);
      ctx.restore();
    };

    const drawNebula = () => {
      const c = center();
      p.push();
      p.translate(c.x, c.y);
      p.blendMode(p.ADD);
      nebulaSeeds.forEach((seed, idx) => {
        seed.angle += seed.speed;
        const nx = Math.cos(seed.angle) * seed.radius * p.width * 0.45;
        const ny = Math.sin(seed.angle * 0.9) * seed.radius * p.height * 0.45;
        const radius = p.width * (0.12 + Math.sin(p.frameCount * 0.002 + idx) * 0.03);
        const gradient = p.drawingContext.createRadialGradient(0, 0, radius * 0.1, 0, 0, radius);
        const hue = (seed.hue + p.frameCount * 0.08) % 360;
        gradient.addColorStop(0, `hsla(${hue}, 80%, 80%, 0.18)`);
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        p.drawingContext.save();
        p.drawingContext.translate(nx, ny);
        p.drawingContext.fillStyle = gradient;
        p.drawingContext.beginPath();
        p.drawingContext.arc(0, 0, radius, 0, Math.PI * 2);
        p.drawingContext.fill();
        p.drawingContext.restore();
      });
      p.pop();
      p.blendMode(p.BLEND);
    };

    const drawStars = () => {
      p.blendMode(p.ADD);
      stars.forEach((star, idx) => {
        const flicker = 0.4 + Math.sin(p.frameCount * 0.02 + star.phase) * 0.6;
        const x = star.x * p.width + Math.sin(p.frameCount * 0.0006 + idx) * 8 * star.depth;
        const y = star.y * p.height + Math.cos(p.frameCount * 0.0004 + idx) * 8 * star.depth;
        p.noStroke();
        p.fill(200, 200, 255, 60 * star.depth * flicker);
        p.circle(x, y, (star.depth * 2 + 1.5) * flicker);
      });
      p.blendMode(p.BLEND);
    };

    const drawPlanet = (planet) => {
      planet.phase += planet.speed;
      const c = center();
      const orbitNoise = p.noise(planet.wobble + p.frameCount * 0.001) * 0.6 - 0.3;
      const r = planet.radius + orbitNoise * 40;
      const basePos = p.createVector(
        Math.cos(planet.phase) * r,
        Math.sin(planet.phase) * r * 0.72
      );
      let finalPos = basePos.copy();

      if (pointer.active) {
        const mouseVec = p.createVector(pointer.x, pointer.y).sub(c);
        const diff = mouseVec.copy().sub(basePos);
        const dist = Math.max(40, diff.mag());
        diff.normalize().mult(Math.min(80, 160 / dist));
        finalPos.add(diff);
      }

      planet.trail.unshift({ pos: finalPos.copy(), life: 1 });
      if (planet.trail.length > 90) planet.trail.pop();

      // orbit ring
      p.stroke(255, 20);
      p.noFill();
      p.push();
      p.translate(c.x, c.y);
      p.ellipse(0, 0, planet.radius * 2, planet.radius * 1.4);
      p.pop();

      // trail glow
      p.push();
      p.translate(c.x, c.y);
      p.blendMode(p.ADD);
      planet.trail.forEach((node, idx) => {
        node.life *= 0.97;
        const alpha = Math.max(0, node.life) * (0.9 - idx / planet.trail.length);
        if (alpha <= 0.01) return;
        p.fill((planet.hue + idx * 3) % 360, 80, 90, alpha * 0.4);
        p.noStroke();
        p.circle(node.pos.x, node.pos.y, planet.size * 1.2 * (1 - idx / planet.trail.length));
      });
      p.blendMode(p.BLEND);

      // planet body
      const highlight = pointer.active && finalPos.copy().add(c).dist(p.createVector(pointer.x, pointer.y)) < planet.size * 3;
      const planetVec = finalPos.copy();
      p.translate(c.x, c.y);
      p.noStroke();
      p.fill(planet.hue, 70, highlight ? 100 : 80, 0.9);
      p.circle(planetVec.x, planetVec.y, planet.size * 2.2);
      p.fill(planet.hue, 40, 100, 0.65);
      p.ellipse(
        planetVec.x + planet.size * 0.2,
        planetVec.y - planet.size * 0.2,
        planet.size * 1.2,
        planet.size * 1.2
      );

      // glyph halo
      p.noFill();
      p.stroke(planet.hue, 40, 100, 0.3);
      p.strokeWeight(1.6);
      const haloR = planet.size * 2.8;
      p.ellipse(planetVec.x, planetVec.y, haloR, haloR * 0.9);

      // luminescent sparks
      p.blendMode(p.ADD);
      for (let i = 0; i < 3; i++) {
        const sparkAngle = planet.phase + i * (Math.PI * 2) / 3 + p.frameCount * 0.01;
        const sx = planetVec.x + Math.cos(sparkAngle) * planet.size * 3;
        const sy = planetVec.y + Math.sin(sparkAngle) * planet.size * 1.8;
        p.fill(planet.hue, 80, 100, 0.5);
        p.noStroke();
        p.circle(sx, sy, 6);
      }
      p.blendMode(p.BLEND);

      planet.screenPos = planetVec.add(c);
    };

    p.setup = () => {
      resizeCanvas();
      p.colorMode(p.HSB, 360, 100, 100, 1);
      canvas.canvas.addEventListener('pointerleave', () => {
        pointer.active = false;
      });
    };

    p.windowResized = () => resizeCanvas();

    p.mouseMoved = () => {
      pointer.x = p.mouseX;
      pointer.y = p.mouseY;
      pointer.active = pointer.x >= 0 && pointer.x <= p.width && pointer.y >= 0 && pointer.y <= p.height;
    };

    p.touchMoved = () => {
      pointer.x = p.mouseX;
      pointer.y = p.mouseY;
      pointer.active = true;
      return false;
    };

    p.draw = () => {
      drawGradient();
      drawNebula();
      drawStars();
      planets.forEach(drawPlanet);
    };

    p.mousePressed = () => {
      if (!pointer.active) return;
      const pos = p.createVector(pointer.x, pointer.y);
      for (const planet of planets) {
        if (planet.screenPos && pos.dist(planet.screenPos) < planet.size * 1.8) {
          window.location.href = planet.url;
          break;
        }
      }
    };

    p.touchStarted = () => {
      pointer.x = p.mouseX;
      pointer.y = p.mouseY;
      pointer.active = true;
      p.mousePressed();
      return false;
    };
  };

  new p5(sketch, host);
})();
