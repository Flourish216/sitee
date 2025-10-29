(() => {
  const mount = document.getElementById('sketch-carpet');
  if (!mount) return;

  const sketch = (p) => {
    let tilt = 0;
    let targetTilt = 0;
    let wave = 0;
    const trails = [];

    const resize = () => {
      const w = Math.min(380, Math.floor(window.innerWidth * 0.7));
      const h = Math.max(220, Math.floor(w * 0.6));
      p.resizeCanvas(w, h);
    };

    const addTrail = () => {
      if (trails.length > 80) trails.shift();
      trails.push({
        x: p.width / 2,
        y: p.height / 2,
        hue: (wave * 25) % 360,
        life: 1,
      });
    };

    p.setup = () => {
      p.createCanvas(340, 210).parent(mount);
      p.colorMode(p.HSB, 360, 100, 100, 1);
    };

    p.windowResized = () => resize();

    p.draw = () => {
      p.background(220, 10, 8);
      targetTilt = p.map(p.mouseX, 0, p.width, -0.4, 0.4);
      tilt = p.lerp(tilt, targetTilt, 0.08);
      wave += 0.01;

      addTrail();
      for (let i = trails.length - 1; i >= 0; i--) {
        const t = trails[i];
        t.life -= 0.01;
        if (t.life <= 0) {
          trails.splice(i, 1);
          continue;
        }
        p.noStroke();
        p.fill(t.hue, 70, 90, t.life * 0.25);
        p.circle(t.x + Math.sin(wave + i * 0.1) * 40, t.y + Math.cos(wave + i * 0.1) * 18, 4 + i * 0.06);
      }

      p.push();
      p.translate(p.width / 2, p.height / 2);
      p.rotate(tilt);
      const w = p.width * 0.65;
      const h = p.height * 0.35;

      for (let i = -6; i <= 6; i++) {
        const t = (wave * 140 + i * 14) % 360;
        p.fill((t + 360) % 360, 60, 100, 0.85);
        const stripeW = w * 0.2;
        const offset = i * (stripeW * 0.22);
        p.beginShape();
        p.vertex(-w / 2 + offset, -h / 2 - Math.sin(wave + i * 0.2) * 18);
        p.vertex(-w / 2 + offset + stripeW, -h / 2 + Math.sin(wave + i * 0.3) * 14);
        p.vertex(-w / 2 + offset + stripeW, h / 2 + Math.sin(wave * 0.8 + i) * 16);
        p.vertex(-w / 2 + offset, h / 2 - Math.sin(wave + i * 0.25) * 18);
        p.endShape(p.CLOSE);
      }

      p.noFill();
      p.stroke(0, 0, 100, 0.6);
      p.strokeWeight(2);
      p.rect(-w / 2, -h / 2, w, h, 10);

      // tassels
      p.strokeWeight(1.4);
      for (let i = -6; i <= 6; i++) {
        const tasselX = -w / 2 + (i + 6) / 12 * w;
        const sway = Math.sin(wave * 2 + i) * 6;
        p.line(tasselX, h / 2, tasselX + sway * 0.2, h / 2 + 14 + sway);
        p.line(tasselX, -h / 2, tasselX - sway * 0.2, -h / 2 - 14 - sway);
      }

      p.pop();

      p.fill(0, 0, 80, 0.6);
      p.textAlign(p.CENTER, p.CENTER);
      p.textFont('Manrope');
      p.textSize(13);
      p.text('Guide the carpet with your cursor ✦', p.width / 2, p.height * 0.85);
    };
  };

  new p5(sketch, mount);
})();
