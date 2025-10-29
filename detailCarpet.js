(() => {
  const mount = document.getElementById('carpet-canvas');
  if (!mount) return;

  new p5((p) => {
    let time = 0;
    const trails = [];

    const resize = () => {
      p.resizeCanvas(window.innerWidth, window.innerHeight);
    };

    const addTrail = () => {
      if (trails.length > 120) trails.shift();
      trails.push({
        x: p.mouseX,
        y: p.mouseY,
        hue: (time * 180) % 360,
        life: 1,
      });
    };

    p.setup = () => {
      p.createCanvas(window.innerWidth, window.innerHeight).parent(mount);
      p.colorMode(p.HSB, 360, 100, 100, 1);
      p.noiseDetail(2, 0.4);
    };

    p.windowResized = resize;

    const drawBackground = () => {
      const ctx = p.drawingContext;
      ctx.save();
      const g = ctx.createRadialGradient(
        p.width / 2,
        p.height / 2,
        0,
        p.width / 2,
        p.height / 2,
        Math.max(p.width, p.height)
      );
      g.addColorStop(0, 'rgba(6, 10, 20, 0.98)');
      g.addColorStop(0.45, 'rgba(4, 8, 18, 0.95)');
      g.addColorStop(1, 'rgba(1, 2, 8, 1)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, p.width, p.height);
      ctx.restore();
    };

    const drawTrails = () => {
      trails.forEach((t) => {
        t.life *= 0.96;
        p.noStroke();
        p.fill(t.hue, 90, 100, t.life * 0.3);
        const size = (1 - t.life) * 80 + 6;
        p.circle(t.x, t.y, size);
      });
    };

    const drawCarpet = () => {
      const segs = 28;
      const rows = 16;
      const tiltX = p.map(p.mouseX, 0, p.width, -0.4, 0.4);
      const tiltY = p.map(p.mouseY, 0, p.height, -0.3, 0.3);
      const centerX = p.width / 2;
      const centerY = p.height / 2;
      const w = p.width * 0.5;
      const h = p.height * 0.28;

      p.push();
      p.translate(centerX, centerY);
      p.rotate(tiltX * 0.3);
      p.strokeWeight(1.2);

      for (let r = 0; r <= rows; r++) {
        const t = r / rows;
        const hue = (time * 60 + r * 12) % 360;
        p.stroke(hue, 80, 100, 0.4);
        p.noFill();
        p.beginShape();
        for (let c = 0; c <= segs; c++) {
          const s = c / segs;
          const noiseFactor = p.noise(s * 1.5, t * 1.5, time * 0.2);
          const x = (s - 0.5) * w * (1 + tiltY * 0.4) + Math.sin(time + t * 4 + s * 6) * 30;
          const y = (t - 0.5) * h * (1 + tiltX * 0.2) + Math.sin(time * 0.8 + s * 12) * 18 * (1 - t);
          const lift = Math.sin(time * 0.6 + s * 5) * 14 * (0.5 - Math.abs(t - 0.5));
          p.curveVertex(x, y + lift + (noiseFactor - 0.5) * 60);
        }
        p.endShape();
      }

      // edges
      p.stroke(0, 0, 100, 0.5);
      p.noFill();
      p.rectMode(p.CENTER);
      p.rect(0, 0, w * 1.02, h * 1.05, 20);

      // tassels
      p.strokeWeight(1.5);
      for (let i = -segs / 2; i <= segs / 2; i++) {
        const pos = i / (segs / 2);
        const tasselX = pos * w * 0.5;
        const sway = Math.sin(time * 1.2 + pos * 6) * 18;
        p.line(tasselX, h * 0.55, tasselX + sway * 0.1, h * 0.55 + 24 + sway);
        p.line(tasselX, -h * 0.55, tasselX - sway * 0.1, -h * 0.55 - 24 - sway);
      }

      p.pop();
    };

    p.draw = () => {
      time += 0.008;
      drawBackground();
      drawCarpet();
      if (p.mouseIsPressed || p.touches.length) addTrail();
      drawTrails();
    };

    p.mouseMoved = () => {
      if (p.mouseIsPressed) addTrail();
    };

    p.touchMoved = () => {
      addTrail();
      return false;
    };
  }, mount);
})();
