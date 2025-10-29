(() => {
  const host = document.getElementById('bear-canvas');
  if (!host) return;

  new p5((p) => {
    const cats = [];
    const hues = [0, 32, 55, 120, 200, 280];
    const stars = Array.from({ length: 160 }, () => ({
      x: Math.random(),
      y: Math.random(),
      depth: Math.random() * 0.8 + 0.2,
      phase: Math.random() * Math.PI * 2,
    }));

    class NyanCat {
      constructor(x, y) {
        this.pos = p.createVector(x, y);
        const dir = p5.Vector.random2D();
        this.speed = p.random(2.6, 4.2);
        this.vel = dir.mult(this.speed);
        this.trail = [];
        this.maxTrail = 55;
        this.pulse = p.random(p.TWO_PI);
        this.turnTimer = 0;
        this.turnInterval = p.random(40, 90);
        this.wobble = p.random(0.4, 1.1);
        this.size = p.random(38, 54);
      }

      update() {
        this.turnTimer += 1;
        this.pulse += 0.05 + this.wobble * 0.01;

        if (this.turnTimer >= this.turnInterval) {
          const target = p5.Vector.random2D().mult(this.speed);
          this.vel.lerp(target, 0.18);
          this.turnTimer = 0;
          this.turnInterval = p.random(40, 90);
        }

        this.pos.add(this.vel);

        if (this.pos.x < -140) this.pos.x = p.width + 140;
        if (this.pos.x > p.width + 140) this.pos.x = -140;
        if (this.pos.y < -140) this.pos.y = p.height + 140;
        if (this.pos.y > p.height + 140) this.pos.y = -140;

        this.trail.unshift({
          x: this.pos.x,
          y: this.pos.y,
          heading: this.vel.heading(),
        });
        if (this.trail.length > this.maxTrail) {
          this.trail.pop();
        }
      }

      drawTrail() {
        p.push();
        for (let i = this.trail.length - 1; i >= 0; i--) {
          const segment = this.trail[i];
          const t = i / this.maxTrail;
          const hue = hues[i % hues.length];
          const w = p.lerp(this.size * 0.12, this.size * 0.6, 1 - t);
          const len = p.lerp(this.size * 0.38, this.size * 1.25, 1 - t);
          const alpha = p.lerp(12, 72, 1 - t);

          p.push();
          p.translate(segment.x, segment.y);
          p.rotate(segment.heading);
          p.noStroke();
          p.fill(hue, 90, 100, alpha);
          p.rectMode(p.CENTER);
          p.rect(-len * 0.4, 0, len, w, w * 0.4);
          p.pop();
        }
        p.pop();
      }

      drawBody() {
        const bob = Math.sin(this.pulse * 1.2) * this.size * 0.08;
        const tailSwing = Math.sin(this.pulse * 1.6) * this.size * 0.18;

        p.push();
        p.translate(this.pos.x, this.pos.y + bob);
        p.noStroke();

        p.push();
        p.rotate(tailSwing * 0.02);
        p.fill(280, 90, 100, 85);
        p.rect(-this.size * 0.95, this.size * 0.1, this.size * 0.6, this.size * 0.18, this.size * 0.1);
        p.pop();

        p.fill(320, 12, 100, 85);
        p.rect(-this.size * 0.28, 0, this.size * 1.05, this.size * 0.58, this.size * 0.3);

        p.fill(320, 18, 100, 90);
        p.rect(this.size * 0.3, -this.size * 0.35, this.size * 0.75, this.size * 0.75, this.size * 0.28);

        p.fill(320, 80, 100, 100);
        p.ellipse(this.size * 0.58, -this.size * 0.1, this.size * 0.22, this.size * 0.22);
        p.ellipse(this.size * 0.02, -this.size * 0.1, this.size * 0.22, this.size * 0.22);

        p.fill(0, 0, 100, 100);
        p.ellipse(this.size * 0.2, -this.size * 0.2, this.size * 0.16, this.size * 0.2);
        p.ellipse(this.size * 0.52, -this.size * 0.2, this.size * 0.16, this.size * 0.2);
        p.fill(0, 0, 0, 90);
        p.ellipse(this.size * 0.22, -this.size * 0.22, this.size * 0.08, this.size * 0.1);
        p.ellipse(this.size * 0.5, -this.size * 0.22, this.size * 0.08, this.size * 0.1);

        p.fill(340, 80, 100, 95);
        p.triangle(this.size * 0.36, -this.size * 0.12, this.size * 0.46, -this.size * 0.12, this.size * 0.41, -this.size * 0.02);

        const legOffset = this.size * 0.28;
        for (let i = -1; i <= 1; i += 2) {
          const y = this.size * 0.28;
          const phase = this.pulse * 2 + i;
          const lift = Math.sin(phase) * this.size * 0.08;
          p.fill(320, 12, 100, 95);
          p.rect(i * legOffset, y + lift, this.size * 0.26, this.size * 0.4, this.size * 0.12);
          p.fill(320, 70, 100, 95);
          p.rect(i * legOffset, y + lift + this.size * 0.2, this.size * 0.26, this.size * 0.12, this.size * 0.12);
        }

        p.pop();
      }

      draw() {
        this.drawTrail();
        this.drawBody();
      }
    }

    const spawnCat = (x, y) => {
      cats.push(new NyanCat(x, y));
    };

    const drawStars = () => {
      p.push();
      p.noStroke();
      stars.forEach((star, idx) => {
        const flicker = Math.sin(p.frameCount * 0.02 + star.phase) * 0.5 + 1.1;
        const x = star.x * p.width + Math.sin(p.frameCount * 0.001 + idx) * 40 * star.depth;
        const y = star.y * p.height + Math.cos(p.frameCount * 0.0012 + idx) * 30 * star.depth;
        p.fill(200, 5, 100, 40 * star.depth);
        p.circle(x, y, (1 + star.depth) * 2.6 * flicker);
        p.fill(320, 5, 100, 22 * star.depth);
        p.circle(x, y, (1 + star.depth) * 1.2 * flicker);
      });
      p.pop();
    };

    const drawBackground = () => {
      p.push();
      const ctx = p.drawingContext;
      const gradient = ctx.createRadialGradient(
        p.width * 0.5,
        p.height * 0.45,
        Math.max(p.width, p.height) * 0.12,
        p.width * 0.5,
        p.height * 0.5,
        Math.max(p.width, p.height)
      );
      gradient.addColorStop(0, 'rgba(10, 8, 28, 0.95)');
      gradient.addColorStop(0.4, 'rgba(18, 9, 38, 0.92)');
      gradient.addColorStop(1, 'rgba(2, 0, 12, 1)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, p.width, p.height);
      p.pop();
    };

    p.setup = () => {
      const canvas = p.createCanvas(host.clientWidth || window.innerWidth, host.clientHeight || window.innerHeight);
      canvas.parent(host);
      p.colorMode(p.HSB, 360, 100, 100, 100);
      p.pixelDensity(Math.min(2, window.devicePixelRatio || 1));
      spawnCat(p.width * 0.5, p.height * 0.55);
    };

    p.windowResized = () => {
      p.resizeCanvas(host.clientWidth || window.innerWidth, host.clientHeight || window.innerHeight);
    };

    p.draw = () => {
      drawBackground();
      drawStars();
      cats.forEach((cat) => {
        cat.update();
        cat.draw();
      });
    };

    p.mousePressed = () => {
      spawnCat(p.mouseX, p.mouseY);
      return false;
    };

    p.touchStarted = () => {
      spawnCat(p.mouseX, p.mouseY);
      return false;
    };
  }, host);
})();
