(() => {
  const mount = document.getElementById('sketch-bear');
  if (!mount) return;

  const sketch = (p) => {
    const candies = [];
    const shards = [];
    let bearScale = 1;
    let hunger = 0;
    let burst = false;
    let resetTimer = 0;

    const spawnCandy = (x, y) => {
      candies.push({ x, y, vy: 1.6, wobble: p.random(10), eaten: false });
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
      for (let i = 0; i < 60; i++) {
        shards.push({
          x: p.random(p.width * 0.2, p.width * 0.8),
          y: p.random(p.height * 0.35, p.height * 0.55),
          vx: p.random(-2, 2),
          vy: p.random(-2, 1),
          alpha: 255,
          size: p.random(6, 12),
        });
      }
    };

    p.setup = () => {
      const size = Math.min(360, Math.floor(window.innerWidth * 0.65));
      p.createCanvas(size, size * 0.75).parent(mount);
    };

    p.windowResized = () => {
      const size = Math.min(360, Math.floor(window.innerWidth * 0.65));
      p.resizeCanvas(size, size * 0.75);
    };

    const drawBear = () => {
      const cx = p.width / 2;
      const cy = p.height * 0.55;
      const pulse = Math.sin(p.frameCount * 0.04) * 4;
      p.push();
      p.translate(cx, cy + pulse);
      p.scale(bearScale);
      p.noStroke();
      p.fill(255, 180, 220, 160);
      p.ellipse(-40, -60, 60, 72);
      p.ellipse(40, -60, 60, 72);
      p.ellipse(0, -40, 110, 120);
      p.fill(255, 200, 230, 200);
      p.ellipse(0, 30, 140, 150);
      p.fill(30, 30, 30, 180);
      p.ellipse(-28, -50, 20, 28);
      p.ellipse(28, -50, 20, 28);
      p.fill(0, 0, 0, 120);
      p.arc(0, -10, 26, 22, 0, p.PI);
      p.pop();
    };

    const drawCandies = () => {
      for (let i = candies.length - 1; i >= 0; i--) {
        const c = candies[i];
        if (c.eaten) {
          candies.splice(i, 1);
          continue;
        }
        c.y += c.vy;
        c.vy += 0.02;
        const wobble = Math.sin(p.frameCount * 0.15 + c.wobble) * 2;
        p.fill(255, 220, 120);
        p.noStroke();
        p.circle(c.x + wobble, c.y, 12);
        if (c.y > p.height * 0.55) {
          const dx = c.x - p.width / 2;
          const dy = c.y - p.height * 0.6;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 70 * bearScale) {
            c.eaten = true;
            hunger += 1;
            bearScale = 1 + hunger * 0.08;
            if (hunger >= 6 && !burst) {
              burst = true;
              launchShards();
            }
          }
        }
      }
    };

    const drawShards = () => {
      for (let i = shards.length - 1; i >= 0; i--) {
        const s = shards[i];
        s.x += s.vx;
        s.y += s.vy;
        s.vy += 0.03;
        s.alpha -= 1.3;
        p.fill(255, 200, 120, Math.max(0, s.alpha));
        p.noStroke();
        p.circle(s.x, s.y, s.size);
        if (s.alpha <= 0) {
          shards.splice(i, 1);
        }
      }
      if (burst && shards.length === 0) {
        resetTimer += 1;
        if (resetTimer > 60) {
          resetBear();
        }
      }
    };

    p.draw = () => {
      p.background(12, 12, 18);
      p.fill(255, 255, 255, 10);
      p.rect(0, p.height * 0.65, p.width, p.height * 0.35);

      if (!burst) {
        drawBear();
      }
      drawCandies();
      if (burst) {
        drawShards();
        p.fill(255, 220, 220, 160);
        p.textAlign(p.CENTER, p.CENTER);
        p.textFont('Manrope');
        p.textSize(14);
        p.text('Click the sugar dust to clear the orbit', p.width / 2, p.height * 0.18);
      } else {
        p.fill(220, 220, 220, 150);
        p.textAlign(p.CENTER, p.CENTER);
        p.textFont('Manrope');
        p.textSize(13);
        p.text('Click to toss gummy stars', p.width / 2, p.height * 0.18);
      }

    };

    p.mousePressed = () => {
      if (burst) {
        for (let i = shards.length - 1; i >= 0; i--) {
          const s = shards[i];
          if (p.dist(p.mouseX, p.mouseY, s.x, s.y) < s.size) {
            shards.splice(i, 1);
          }
        }
        return false;
      }
      spawnCandy(p.mouseX, Math.min(p.mouseY, p.height * 0.15));
      return false;
    };

    p.touchStarted = () => {
      p.mousePressed();
      return false;
    };
  };

  new p5(sketch, mount);
})();
