(() => {
  const mount = document.getElementById('bear-canvas');
  if (!mount) return;

  const sketch = (p) => {
    const candies = [];
    const shards = [];
    let bearScale = 1;
    let hunger = 0;
    let burst = false;
    let resetTimer = 0;

    const spawnCandy = (x, y) => {
      candies.push({
        x,
        y,
        vy: 2,
        wobble: p.random(10),
        eaten: false,
        color: p.random([p.color('#ffb3c1'), p.color('#ffd166'), p.color('#baffc9')]),
      });
    };

    const resetBear = () => {
      bearScale = 1;
      hunger = 0;
      burst = false;
      candies.length = 0;
      shards.length = 0;
      resetTimer = 0;
    };

    const launchShards = () => {
      shards.length = 0;
      const cx = p.width / 2;
      const cy = p.height * 0.55;
      for (let i = 0; i < 100; i++) {
        shards.push({
          x: cx,
          y: cy,
          vx: p.random(-3, 3),
          vy: p.random(-3, 2),
          alpha: 255,
          size: p.random(4, 12),
          hue: p.random([0, 30, 120, 200, 320]),
        });
      }
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

    const drawBear = () => {
      const cx = p.width / 2;
      const cy = p.height * 0.55;
      const s = p.width * 0.18 * bearScale;
      const breathe = Math.sin(p.frameCount * 0.03) * s * 0.06;

      p.push();
      p.translate(cx, cy + breathe);
      p.noStroke();
      p.fill(330, 35, 95, 0.35);
      p.ellipse(0, s * 0.3, s * 2, s * 1.1);
      p.fill(330, 35, 90, 0.5);
      p.ellipse(0, 0, s * 1.6, s * 1.8);
      p.ellipse(-s * 0.8, -s * 1.1, s * 1.1, s * 1.4);
      p.ellipse(s * 0.8, -s * 1.1, s * 1.1, s * 1.4);

      // ears
      p.fill(330, 55, 95, 0.8);
      p.ellipse(-s, -s * 1.8, s * 0.8, s * 0.9);
      p.ellipse(s, -s * 1.8, s * 0.8, s * 0.9);

      // eyes
      p.fill(0, 0, 10);
      p.circle(-s * 0.4, -s * 0.8, s * 0.35);
      p.circle(s * 0.4, -s * 0.8, s * 0.35);
      p.fill(0, 0, 100);
      p.circle(-s * 0.35 + Math.sin(p.frameCount * 0.1) * s * 0.05, -s * 0.8, s * 0.12);
      p.circle(s * 0.35 + Math.sin(p.frameCount * 0.1 + 1) * s * 0.05, -s * 0.8, s * 0.12);

      // snout
      p.fill(330, 40, 95, 0.9);
      p.ellipse(0, -s * 0.5, s * 0.9, s * 0.7);
      p.fill(0, 0, 20);
      p.ellipse(0, -s * 0.48, s * 0.3, s * 0.2);

      // arms
      const armSwing = Math.sin(p.frameCount * 0.08) * s * 0.3;
      p.fill(330, 35, 90, 0.6);
      p.push();
      p.translate(-s * 1.1, -s * 0.15);
      p.rotate(-0.8 + armSwing * 0.001);
      p.ellipse(0, 0, s * 0.8, s * 1.4);
      p.pop();

      p.push();
      p.translate(s * 1.1, -s * 0.15);
      p.rotate(0.8 - armSwing * 0.001);
      p.ellipse(0, 0, s * 0.8, s * 1.4);
      p.pop();

      // belly gloss
      p.fill(330, 35, 100, 0.3);
      p.ellipse(-s * 0.2, s * 0.2, s * 1.1, s * 1.2);

      p.pop();
    };

    const updateCandies = () => {
      for (let i = candies.length - 1; i >= 0; i--) {
        const c = candies[i];
        if (c.eaten) {
          candies.splice(i, 1);
          continue;
        }
        c.y += c.vy;
        c.vy += 0.04;
        const wobble = Math.sin(p.frameCount * 0.2 + c.wobble) * 3;
        p.fill(c.color);
        p.noStroke();
        p.circle(c.x + wobble, c.y, p.width * 0.025);
        if (c.y > p.height * 0.53) {
          const dx = c.x - p.width / 2;
          const dy = c.y - p.height * 0.5;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < p.width * 0.14 * bearScale) {
            c.eaten = true;
            hunger += 1;
            bearScale = 1 + hunger * 0.12;
            if (hunger >= 5 && !burst) {
              burst = true;
              launchShards();
            }
          }
        }
      }
    };

    const updateShards = () => {
      for (let i = shards.length - 1; i >= 0; i--) {
        const s = shards[i];
        s.x += s.vx;
        s.y += s.vy;
        s.vy += 0.05;
        s.alpha -= 2.2;
        p.noStroke();
        p.fill(s.hue, 80, 100, Math.max(0, s.alpha / 255));
        p.circle(s.x, s.y, s.size);
        if (s.alpha <= 0) {
          shards.splice(i, 1);
        }
      }
      if (burst && shards.length === 0) {
        resetTimer += 1;
        if (resetTimer > 90) {
          resetBear();
        }
      }
    };

    p.draw = () => {
      p.background(315, 40, 8);
      p.fill(0, 0, 100, 0.08);
      p.rect(0, p.height * 0.62, p.width, p.height * 0.4);

      if (!burst) drawBear();
      updateCandies();
      if (burst) {
        updateShards();
        p.fill(0, 0, 90, 0.8);
        p.textAlign(p.CENTER, p.CENTER);
        p.textFont('Playfair Display');
        p.textSize(p.width * 0.035);
        p.text('The bear became stardust. Collect the sweets.', p.width / 2, p.height * 0.18);
      } else {
        p.fill(0, 0, 70, 0.75);
        p.textAlign(p.CENTER, p.CENTER);
        p.textFont('Playfair Display');
        p.textSize(p.width * 0.032);
        p.text('Click to feed gummy comets', p.width / 2, p.height * 0.18);
      }
    };

    p.mousePressed = () => {
      if (burst) {
        for (let i = shards.length - 1; i >= 0; i--) {
          const s = shards[i];
          if (p.dist(p.mouseX, p.mouseY, s.x, s.y) < s.size * 0.8) {
            shards.splice(i, 1);
          }
        }
        return false;
      }
      spawnCandy(p.mouseX, Math.min(p.mouseY, p.height * 0.2));
      return false;
    };

    p.touchStarted = () => {
      const x = p.mouseX;
      const y = Math.min(p.mouseY, p.height * 0.2);
      if (burst) {
        for (let i = shards.length - 1; i >= 0; i--) {
          const s = shards[i];
          if (p.dist(x, y, s.x, s.y) < s.size * 0.8) {
            shards.splice(i, 1);
          }
        }
      } else {
        spawnCandy(x, y);
      }
      return false;
    };
  };

  new p5(sketch, mount);
})();
