(() => {
  const host = document.getElementById('bear-canvas');
  if (!host) return;

  new p5((p) => {
    const offerings = [];
    const shards = [];
    const fragments = [];
    const aura = [];
    let saturation = 0;
    let rupture = false;
    let resetTimer = 0;

    const spawnOffering = (x, y) => {
      offerings.push({
        x,
        y,
        vx: p.random(-0.8, 0.8),
        vy: -p.random(1, 2),
        hue: p.random([320, 20, 120, 180, 260]),
        mass: p.random(6, 11),
      });
    };

    const resetBeast = () => {
      offerings.length = 0;
      shards.length = 0;
      fragments.length = 0;
      saturation = 0;
      rupture = false;
      resetTimer = 0;
    };

    const explodeBeast = (cx, cy, baseRadius) => {
      shards.length = 0;
      fragments.length = 0;

      const fragmentCount = 7;
      for (let i = 0; i < fragmentCount; i++) {
        const angle = (p.TWO_PI / fragmentCount) * i + p.random(-0.2, 0.2);
        const spread = baseRadius * 0.45;
        fragments.push({
          x: cx,
          y: cy,
          vx: Math.cos(angle) * spread * 0.08 + p.random(-1, 1),
          vy: Math.sin(angle) * spread * 0.08 - p.random(1, 3),
          rot: p.random(-p.PI, p.PI),
          spin: p.random(-0.08, 0.08),
          w: baseRadius * p.random(0.22, 0.35),
          h: baseRadius * p.random(0.15, 0.28),
          hue: (320 + i * 18) % 360,
          life: 1,
        });
      }

      for (let i = 0; i < 280; i++) {
        shards.push({
          x: cx + p.random(-baseRadius * 0.15, baseRadius * 0.15),
          y: cy + p.random(-baseRadius * 0.1, baseRadius * 0.15),
          vx: p.random(-4, 4),
          vy: p.random(-4.5, 3),
          hue: (p.random(360) + i * 1.5) % 360,
          life: 1,
          size: p.random(8, 16),
        });
      }

      rupture = true;
    };

    p.setup = () => {
      p.createCanvas(window.innerWidth, window.innerHeight).parent(host);
      p.colorMode(p.HSB, 360, 100, 100, 1);
      resetBeast();
    };

    p.windowResized = () => {
      p.resizeCanvas(window.innerWidth, window.innerHeight);
    };

    const drawBackground = () => {
      const ctx = p.drawingContext;
      ctx.save();
      const g = ctx.createRadialGradient(
        p.width * 0.5,
        p.height * 0.55,
        p.width * 0.12,
        p.width * 0.5,
        p.height * 0.6,
        Math.max(p.width, p.height)
      );
      g.addColorStop(0, 'rgba(18, 6, 16, 0.95)');
      g.addColorStop(0.5, 'rgba(8, 4, 12, 0.92)');
      g.addColorStop(1, 'rgba(1, 0, 4, 1)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, p.width, p.height);
      ctx.restore();

      p.push();
      p.stroke(315, 30, 60, 0.1);
      p.noFill();
      for (let i = 0; i < 20; i++) {
        p.ellipse(p.width / 2, p.height * 0.65, p.width * (0.3 + i * 0.05), p.width * (0.08 + i * 0.02));
      }
      p.pop();
    };

    const drawBeast = () => {
      const cx = p.width / 2;
      const cy = p.height * 0.55;
      const base = p.width * 0.16 + saturation * 6;

      p.push();
      p.translate(cx, cy);
      p.noStroke();
      for (let layer = 5; layer >= 1; layer--) {
        const r = base * (0.5 + layer * 0.18);
        const hue = (320 + layer * 6 + saturation * 3) % 360;
        p.fill(hue, 60, 100, 0.18 + layer * 0.08);
        p.beginShape();
        for (let a = 0; a < p.TWO_PI; a += p.TWO_PI / 140) {
          const radial = r + Math.sin(a * 3 + p.frameCount * 0.02 + layer) * 18 + Math.sin(a * 8 + layer) * 6;
          const x = Math.cos(a) * radial;
          const y = Math.sin(a) * radial * 0.72;
          p.vertex(x, y);
        }
        p.endShape(p.CLOSE);
      }

      // eyes
      p.fill(0, 0, 10, 0.8);
      const eyeOffset = base * 0.6;
      const eyeSize = base * 0.32 + Math.sin(p.frameCount * 0.1) * base * 0.05;
      p.circle(-eyeOffset, -base * 0.4, eyeSize);
      p.circle(eyeOffset, -base * 0.4, eyeSize);
      p.fill(0, 0, 100);
      p.circle(-eyeOffset + Math.sin(p.frameCount * 0.12) * base * 0.07, -base * 0.38, eyeSize * 0.35);
      p.circle(eyeOffset + Math.sin(p.frameCount * 0.1 + 1.1) * base * 0.07, -base * 0.38, eyeSize * 0.35);

      // mouth slit
      p.fill(330, 80, 100, 0.6);
      const mouth = base * (0.4 + saturation * 0.008);
      p.beginShape();
      p.vertex(-mouth, base * 0.1);
      p.vertex(-mouth * 0.4, base * 0.28);
      p.vertex(mouth * 0.4, base * 0.28);
      p.vertex(mouth, base * 0.1);
      p.vertex(0, -base * 0.05);
      p.endShape(p.CLOSE);

      p.pop();
    };

    const updateOfferings = () => {
      const cx = p.width / 2;
      const cy = p.height * 0.55;

      for (let i = offerings.length - 1; i >= 0; i--) {
        const o = offerings[i];
        o.vy += 0.01;
        o.x += o.vx;
        o.y += o.vy;
        const target = p.createVector(cx, cy - p.width * 0.05);
        const pos = p.createVector(o.x, o.y);
        const toCenter = target.sub(pos).setMag(0.8);
        o.vx += toCenter.x * 0.04;
        o.vy += toCenter.y * 0.04;

        p.noStroke();
        p.fill(o.hue, 80, 100, 0.8);
        p.circle(o.x, o.y, o.mass);

        if (p.dist(o.x, o.y, cx, cy) < p.width * 0.12) {
          offerings.splice(i, 1);
          saturation += 1;
          if (saturation >= 18 && !rupture) {
            const baseRadius = p.width * 0.16 + saturation * 6;
            explodeBeast(cx, cy - p.width * 0.02, baseRadius);
          }
        }
      }
    };

    const updateFragments = () => {
      for (let i = fragments.length - 1; i >= 0; i--) {
        const f = fragments[i];
        f.x += f.vx;
        f.y += f.vy;
        f.vx *= 0.97;
        f.vy += 0.12;
        f.rot += f.spin;
        f.life *= 0.982;
        if (f.life <= 0.08) fragments.splice(i, 1);
      }
    };

    const drawFragments = () => {
      p.push();
      fragments.forEach((f) => {
        p.push();
        p.translate(f.x, f.y);
        p.rotate(f.rot);
        p.noStroke();
        p.fill(f.hue, 70, 100, f.life * 0.75);
        p.beginShape();
        const w = f.w;
        const h = f.h;
        p.vertex(-w * 0.6, -h * 0.5);
        p.vertex(w * 0.5, -h * 0.3);
        p.vertex(w * 0.7, h * 0.4);
        p.vertex(-w * 0.3, h * 0.6);
        p.endShape(p.CLOSE);
        p.fill(f.hue, 50, 95, f.life * 0.4);
        p.ellipse(0, 0, w * 0.4, h * 0.3);
        p.pop();
      });
      p.pop();
    };

    const updateShards = () => {
      for (let i = shards.length - 1; i >= 0; i--) {
        const s = shards[i];
        s.x += s.vx;
        s.y += s.vy;
        s.vx *= 0.98;
        s.vy += 0.04;
        s.life *= 0.978;
        if (s.life <= 0.015) {
          shards.splice(i, 1);
          continue;
        }
        p.noStroke();
        p.fill(s.hue, 75, 100, s.life * 0.55);
        p.circle(s.x, s.y, s.size * s.life);
      }

      if (rupture && shards.length === 0 && fragments.length === 0) {
        resetTimer += 1;
        if (resetTimer > 90) resetBeast();
      }
    };

    p.draw = () => {
      drawBackground();

      const auraCount = 80;
      while (aura.length < auraCount) {
        aura.push({ angle: Math.random() * p.TWO_PI, radius: p.random(0.4, 0.9), speed: p.random(-0.002, 0.002) });
      }
      const cx = p.width / 2;
      const cy = p.height * 0.55;
      p.push();
      p.translate(cx, cy);
      p.blendMode(p.ADD);
      aura.forEach((node, idx) => {
        node.angle += node.speed;
        const r = Math.sin(idx * 0.1 + p.frameCount * 0.01) * 40 + node.radius * p.width * 0.22;
        const x = Math.cos(node.angle) * r;
        const y = Math.sin(node.angle) * r * 0.6;
        p.noStroke();
        p.fill((320 + idx * 4 + saturation * 4) % 360, 80, 90, 0.18);
        p.circle(x, y, 6);
      });
      p.pop();
      p.blendMode(p.BLEND);

      if (!rupture) drawBeast();
      else drawFragments();
      updateOfferings();
      updateFragments();
      updateShards();
    };

    p.mousePressed = () => {
      if (rupture) {
        for (let i = shards.length - 1; i >= 0; i--) {
          if (p.dist(p.mouseX, p.mouseY, shards[i].x, shards[i].y) < shards[i].size * 0.45) {
            shards.splice(i, 1);
          }
        }
        for (let i = fragments.length - 1; i >= 0; i--) {
          const frag = fragments[i];
          if (p.dist(p.mouseX, p.mouseY, frag.x, frag.y) < Math.max(frag.w, frag.h) * 0.45) {
            fragments.splice(i, 1);
          }
        }
        return false;
      }
      spawnOffering(p.mouseX, Math.min(p.mouseY, p.height * 0.3));
      return false;
    };

    p.touchStarted = () => {
      p.mousePressed();
      return false;
    };
  }, host);
})();
