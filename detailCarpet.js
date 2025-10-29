(() => {
  const mount = document.getElementById('carpet-canvas');
  if (!mount) return;

  const sketch = (p) => {
    let tilt = 0;
    let targetTilt = 0;
    let hueBase = 180;
    const trails = [];

    const addTrail = () => {
      if (trails.length > 120) trails.shift();
      trails.push({
        x: p.width / 2,
        y: p.height / 2,
        hue: (hueBase + trails.length * 4) % 360,
        life: 1,
      });
    };

    p.setup = () => {
      const size = Math.min(window.innerWidth, window.innerHeight);
      p.createCanvas(size, size).parent(mount);
      p.colorMode(p.HSB, 360, 100, 100, 1);
    };

    p.windowResized = () => {
      const size = Math.min(window.innerWidth, window.innerHeight);
      p.resizeCanvas(size, size);
    };

    p.draw = () => {
      p.background(220, 20, 6);
      targetTilt = p.map(p.mouseX, 0, p.width, -0.35, 0.35);
      tilt = p.lerp(tilt, targetTilt, 0.06);
      hueBase = (hueBase + 0.4) % 360;
      addTrail();

      trails.forEach((t, idx) => {
        t.life -= 0.01;
        if (t.life <= 0) return;
        const wobble = Math.sin(p.frameCount * 0.015 + idx * 0.12) * 60;
        const yy = Math.cos(p.frameCount * 0.018 + idx * 0.08) * 26;
        p.noStroke();
        p.fill(t.hue, 70, 100, t.life * 0.25);
        p.circle(t.x + wobble, t.y + yy, 6 + idx * 0.045);
      });

      p.push();
      p.translate(p.width / 2, p.height / 2);
      p.rotate(tilt);
      const carpetW = p.width * 0.6;
      const carpetH = p.height * 0.33;

      for (let i = -6; i <= 6; i++) {
        const stripeHue = (hueBase + i * 18) % 360;
        p.fill(stripeHue, 75, 90, 0.85);
        const offset = i * carpetW * 0.1;
        const wobble = Math.sin(p.frameCount * 0.04 + i) * 18;
        p.beginShape();
        p.vertex(-carpetW / 2 + offset, -carpetH / 2 - wobble);
        p.vertex(-carpetW / 2 + offset + carpetW * 0.15, -carpetH / 2 + wobble * 0.4);
        p.vertex(-carpetW / 2 + offset + carpetW * 0.15, carpetH / 2 + wobble * 0.2);
        p.vertex(-carpetW / 2 + offset, carpetH / 2 - wobble);
        p.endShape(p.CLOSE);
      }

      p.noFill();
      p.stroke(0, 0, 100, 0.6);
      p.strokeWeight(2);
      p.rect(-carpetW / 2, -carpetH / 2, carpetW, carpetH, 14);

      p.strokeWeight(1.5);
      for (let i = -6; i <= 6; i++) {
        const tasselX = -carpetW / 2 + (i + 6) / 12 * carpetW;
        const sway = Math.sin(p.frameCount * 0.08 + i) * 12;
        p.line(tasselX, carpetH / 2, tasselX + sway * 0.2, carpetH / 2 + 24 + sway);
        p.line(tasselX, -carpetH / 2, tasselX - sway * 0.2, -carpetH / 2 - 24 - sway);
      }

      p.pop();

      p.fill(0, 0, 90, 0.8);
      p.textAlign(p.CENTER, p.CENTER);
      p.textFont('Playfair Display');
      p.textSize(p.width * 0.03);
      p.text('Tilt and steer with your cursor', p.width / 2, p.height * 0.85);
    };
  };

  new p5(sketch, mount);
})();
