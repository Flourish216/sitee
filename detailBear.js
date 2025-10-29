(() => {
  const host = document.getElementById('bear-canvas');
  if (!host) return;

  new p5((p) => {
    const offerings = [];
    const shards = [];
    const fragments = [];
    const aura = [];
    const offspring = [];
    let saturation = 0;
    let rupture = false;
    let resetTimer = 0;
    let gulpPulse = 0;
    let bass, hiss, gulpOsc, burstOsc, gulpEnv, burstEnv;
    let bassLevel = 0;
    let hissLevel = 0;
    let audioReady = false;

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

    const ensureAudio = () => {
      if (audioReady) return;
      if (typeof p5 === 'undefined' || !p5.Oscillator) return;
      if (p.userStartAudio) p.userStartAudio();
      bass = new p5.Oscillator('sawtooth');
      bass.start();
      bass.amp(0, 0.1);
      hiss = new p5.Noise('pink');
      hiss.start();
      hiss.amp(0, 0.1);
      gulpOsc = new p5.Oscillator('triangle');
      gulpOsc.start();
      gulpOsc.amp(0);
      burstOsc = new p5.Oscillator('square');
      burstOsc.start();
      burstOsc.amp(0);
      gulpEnv = new p5.Envelope();
      gulpEnv.setADSR(0.005, 0.08, 0, 0.06);
      gulpEnv.setRange(0.22, 0);
      burstEnv = new p5.Envelope();
      burstEnv.setADSR(0.01, 0.18, 0, 0.4);
      burstEnv.setRange(0.3, 0);
      audioReady = true;
    };

    const triggerGulp = () => {
      ensureAudio();
      if (!gulpEnv || !gulpOsc) return;
      gulpOsc.freq(220 + Math.random() * 160);
      gulpEnv.play(gulpOsc);
      bassLevel = Math.min(0.4, bassLevel + 0.08);
      hissLevel = Math.min(0.28, hissLevel + 0.04);
    };

    const triggerBurst = () => {
      ensureAudio();
      if (burstEnv && burstOsc) {
        burstOsc.freq(50 + Math.random() * 22);
        burstEnv.play(burstOsc);
      }
      bassLevel = Math.max(bassLevel, 0.38);
      hissLevel = Math.max(hissLevel, 0.32);
    };

    const teardownAudio = () => {
      [bass, hiss, gulpOsc, burstOsc].forEach((node) => {
        if (!node) return;
        try {
          node.stop();
        } catch (_) {
          // ignore
        }
        if (node.dispose) node.dispose();
      });
      bass = hiss = gulpOsc = burstOsc = null;
      gulpEnv = burstEnv = null;
      audioReady = false;
      bassLevel = 0;
      hissLevel = 0;
    };

    const resetBeast = () => {
      offerings.length = 0;
      shards.length = 0;
      fragments.length = 0;
      offspring.length = 0;
      saturation = 0;
      rupture = false;
      resetTimer = 0;
      bassLevel = 0;
      hissLevel = 0;
      if (bass) bass.amp(0, 0.05);
      if (hiss) hiss.amp(0, 0.05);
    };

    const explodeBeast = (cx, cy, baseRadius) => {
      shards.length = 0;
      fragments.length = 0;
      offspring.length = 0;

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

      const splitOffset = baseRadius * 0.45;
      const doomed = Math.random() < 0.5 ? 0 : 1;
      for (let i = 0; i < 2; i++) {
        offspring.push({
          x: cx + (i === 0 ? -splitOffset : splitOffset),
          y: cy + baseRadius * 0.18,
          scale: baseRadius * 0.55,
          pulse: 0,
          dead: i === doomed,
          drift: p.random(-0.6, 0.6),
          life: 1,
          collapse: 0,
        });
      }

      triggerBurst();
      if (bass) bass.freq(80, 0.02);

      rupture = true;
    };

    p.setup = () => {
      p.createCanvas(window.innerWidth, window.innerHeight).parent(host);
      p.colorMode(p.HSB, 360, 100, 100, 1);
      resetBeast();
    };

    p.windowResized = () => {
      p.resizeCanvas(window.innerWidth, window.innerHeight);
      resetBeast();
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
      p.stroke(315, 30, 60, 0.08);
      p.noFill();
      for (let i = 0; i < 22; i++) {
        p.ellipse(p.width / 2, p.height * 0.65, p.width * (0.28 + i * 0.05), p.width * (0.08 + i * 0.02));
      }
      p.pop();
    };

    const drawBeast = () => {
      const cx = p.width / 2;
      const cy = p.height * 0.55;
      const base = p.width * 0.16 + saturation * 6;
      const ripple = Math.sin(p.frameCount * 0.03) * base * 0.04;

      p.push();
      p.translate(cx, cy + ripple);
      p.noStroke();
      for (let layer = 5; layer >= 1; layer--) {
        const r = base * (0.52 + layer * 0.2);
        const hue = (320 + layer * 6 + saturation * 3) % 360;
        p.fill(hue, 55, 100, 0.16 + layer * 0.09);
        p.beginShape();
        for (let a = 0; a < p.TWO_PI; a += p.TWO_PI / 150) {
          const radial = r + Math.sin(a * 3 + p.frameCount * 0.02 + layer) * 18 + Math.sin(a * 8 + layer) * 6;
          const x = Math.cos(a) * radial;
          const y = Math.sin(a) * radial * 0.72;
          p.vertex(x, y);
        }
        p.endShape(p.CLOSE);
      }

      const eyeOffset = base * 0.6;
      const eyeSize = base * 0.32 + Math.sin(p.frameCount * 0.1) * base * 0.05;
      p.fill(0, 0, 10, 0.85);
      p.circle(-eyeOffset, -base * 0.4, eyeSize);
      p.circle(eyeOffset, -base * 0.4, eyeSize);
      p.fill(0, 0, 100);
      p.circle(-eyeOffset + Math.sin(p.frameCount * 0.12) * base * 0.07, -base * 0.38, eyeSize * 0.35);
      p.circle(eyeOffset + Math.sin(p.frameCount * 0.1 + 1.1) * base * 0.07, -base * 0.38, eyeSize * 0.35);

      p.fill(330, 80, 100, 0.58 + gulpPulse * 0.2);
      const mouth = base * (0.4 + saturation * 0.008);
      p.beginShape();
      p.vertex(-mouth, base * 0.1);
      p.vertex(-mouth * 0.4, base * 0.28 + gulpPulse * 6);
      p.vertex(mouth * 0.4, base * 0.28 + gulpPulse * 6);
      p.vertex(mouth, base * 0.1);
      p.vertex(0, -base * 0.05 - gulpPulse * 4);
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
          gulpPulse = 1;
          triggerGulp();
          if (bass) bass.freq(160 + Math.random() * 90, 0.08);
          if (saturation >= 18 && !rupture) {
            const baseRadius = p.width * 0.16 + saturation * 6;
            explodeBeast(cx, cy - p.width * 0.02, baseRadius);
          }
        }
      }
    };

    const drawOffspring = () => {
      offspring.forEach((cub) => {
        cub.pulse += 0.018 + (cub.dead ? -0.0025 : 0.004);
        if (cub.dead) {
          cub.collapse = Math.min(1, cub.collapse + 0.012);
          cub.life = Math.max(0, cub.life - 0.009);
          cub.y += 0.35 + cub.collapse * 0.3;
        } else {
          cub.y += Math.sin(p.frameCount * 0.01 + cub.drift) * 0.35;
          cub.x += Math.sin(p.frameCount * 0.012 + cub.drift * 2) * 0.45;
          cub.life = Math.min(1, cub.life + 0.01);
        }
        const breathing = Math.sin(p.frameCount * 0.04 + cub.pulse) * 0.04;
        const s = cub.scale * (cub.dead ? 0.72 : 0.9 + breathing * 0.5);
        p.push();
        p.translate(cub.x, cub.y);
        p.noStroke();
        if (cub.dead) {
          const flatten = Math.max(0.3, 1 - cub.collapse * 0.55);
          p.scale(1 + cub.collapse * 0.25, flatten);
          p.fill(330, 10, 25, 0.65 * cub.life);
          p.circle(0, 0, s * 2.1);
          p.fill(0, 0, 10, 0.6 * cub.life);
          p.beginShape();
          p.vertex(-s * 0.7, -s * 0.4);
          p.vertex(0, -s * 0.1);
          p.vertex(s * 0.4, -s * 0.5);
          p.vertex(s * 0.6, s * 0.5);
          p.vertex(-s * 0.6, s * 0.6);
          p.endShape(p.CLOSE);
          p.stroke(330, 30, 80, 0.5 * cub.life);
          p.noFill();
          p.strokeWeight(2);
          p.bezier(-s * 0.9, -s * 0.1, -s * 0.3, s * 0.2, s * 0.3, -s * 0.2, s * 0.95, s * 0.3);
        } else {
          p.scale(1 + breathing * 0.6, 1 - breathing * 0.4);
          p.fill(330, 60, 100, 0.82);
          p.circle(0, 0, s * 2);
          p.fill(0, 0, 12, 0.85);
          p.circle(-s * 0.45, -s * 0.28, s * 0.55);
          p.circle(s * 0.45, -s * 0.28, s * 0.55);
          p.fill(330, 75, 100, 0.72);
          p.arc(0, s * 0.28, s * 1.1, s * 0.8, 0, p.PI);
        }
        p.pop();
      });
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

    const drawOffscreenAura = () => {
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
    };

    p.draw = () => {
      drawBackground();
      gulpPulse = p.lerp(gulpPulse, 0, 0.15);
      bassLevel = p.lerp(bassLevel, 0, 0.07);
      hissLevel = p.lerp(hissLevel, 0, 0.08);
      if (bass) bass.amp(bassLevel, 0.05);
      if (hiss) hiss.amp(hissLevel, 0.06);

      drawOffscreenAura();

      if (!rupture) drawBeast();
      else {
        drawFragments();
        drawOffspring();
      }
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

    const originalRemove = p.remove.bind(p);
    p.remove = () => {
      teardownAudio();
      originalRemove();
    };
  }, host);
})();
