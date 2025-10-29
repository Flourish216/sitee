(() => {(() => {

  const host = document.getElementById('bear-canvas');  const host = document.getElementById('bear-canvas');

  if (!host) return;  if (!host) return;



  new p5((p) => {  new p5((p) => {

    let cats = []; // 存储所有的猫    let cats = []; // 存储所有的猫

    const colors = [ // 彩虹颜色    const colors = [ // 彩虹颜色

        '#ff0000', // 红        '#ff0000', // 红

        '#ff9900', // 橙        '#ff9900', // 橙

        '#ffff00', // 黄        '#ffff00', // 黄

        '#33ff00', // 绿        '#33ff00', // 绿

        '#0099ff', // 蓝        '#0099ff', // 蓝

        '#6633ff'  // 紫        '#6633ff'  // 紫

    ];    ];



    class NyanCat {    class NyanCat {

        constructor(x, y) {        constructor(x, y) {

            this.pos = p.createVector(x, y);            this.pos = p.createVector(x, y);

            this.vel = p5.Vector.random2D().mult(p.random(3, 6));            this.vel = p5.Vector.random2D().mult(p.random(3, 6));

            this.trail = []; // 彩虹轨迹            this.trail = []; // 彩虹轨迹

            this.trailLength = 20; // 彩虹长度            this.trailLength = 20; // 彩虹长度

            this.size = p.random(30, 50); // 猫的大小            this.size = p.random(30, 50); // 猫的大小

            this.bobTime = 0; // 用于上下浮动动画            this.bobTime = 0; // 用于上下浮动动画

            this.alive = true;            this.alive = true;

        }        }

      down: false,

        update() {      dragging: false,

            // 更新位置      dragCandidate: false,

            this.pos.add(this.vel);      pendingSpawn: false,

                  startX: 0,

            // 记录轨迹      startY: 0,

            this.trail.unshift({x: this.pos.x, y: this.pos.y});    };

            if (this.trail.length > this.trailLength) {    let saturation = 0;

                this.trail.pop();    let rupture = false;

            }    let resetTimer = 0;

    let gulpPulse = 0;

            // 边界检查    let bass, hiss, gulpOsc, burstOsc, gulpEnv, burstEnv;

            if (this.pos.x < -100 || this.pos.x > p.width + 100 ||    let bassLevel = 0;

                this.pos.y < -100 || this.pos.y > p.height + 100) {    let hissLevel = 0;

                this.alive = false;    let audioReady = false;

            }

    const spawnOffering = (x, y, heavy = false) => {

            // 更新浮动动画      const spawnX = p.constrain(x, p.width * 0.08, p.width * 0.92);

            this.bobTime += 0.2;      const spawnY = Math.min(y, p.height * 0.35);

        }      const massRange = heavy ? [14, 24] : [6, 11];

      offerings.push({

        draw() {        x: spawnX,

            p.push();        y: spawnY,

                    vx: p.random(-0.8, 0.8),

            // 绘制彩虹轨迹        vy: -p.random(1, 2),

            p.noStroke();        hue: p.random([320, 20, 120, 180, 260]),

            for (let i = this.trail.length - 1; i >= 0; i--) {        mass: p.random(massRange[0], massRange[1]),

                const t = this.trail[i];      });

                const alpha = p.map(i, 0, this.trail.length - 1, 255, 100);    };

                for (let j = 0; j < colors.length; j++) {

                    p.fill(p.color(colors[j] + p.hex(p.int(alpha), 2)));    const ensureAudio = () => {

                    const yOffset = j * (this.size/8) - (this.size/3);      if (audioReady) return;

                    p.rect(t.x - this.size, t.y + yOffset, this.size/1.2, this.size/8);      if (typeof p5 === 'undefined' || !p5.Oscillator) return;

                }      if (p.userStartAudio) p.userStartAudio();

            }      bass = new p5.Oscillator('sawtooth');

      bass.start();

            // 绘制猫咪      bass.amp(0, 0.1);

            p.translate(this.pos.x, this.pos.y + p.sin(this.bobTime) * 5);      hiss = new p5.Noise('pink');

                  hiss.start();

            // 身体（粉色）      hiss.amp(0, 0.1);

            p.fill('#ffb3da');      gulpOsc = new p5.Oscillator('triangle');

            p.noStroke();      gulpOsc.start();

            p.rect(-this.size/2, -this.size/2, this.size, this.size, this.size/5);      gulpOsc.amp(0);

                  burstOsc = new p5.Oscillator('square');

            // 头部      burstOsc.start();

            p.rect(-this.size/3, -this.size/1.5, this.size/1.5, this.size/1.5, this.size/6);      burstOsc.amp(0);

                  gulpEnv = new p5.Envelope();

            // 耳朵      gulpEnv.setADSR(0.005, 0.08, 0, 0.06);

            p.triangle(-this.size/3, -this.size/1.5, -this.size/6, -this.size/1.5, -this.size/4, -this.size);      gulpEnv.setRange(0.22, 0);

            p.triangle(this.size/6, -this.size/1.5, 0, -this.size/1.5, 0, -this.size);      burstEnv = new p5.Envelope();

                  burstEnv.setADSR(0.01, 0.18, 0, 0.4);

            // 面部表情      burstEnv.setRange(0.3, 0);

            // 眼睛      audioReady = true;

            p.fill(0);    };

            const blinkRate = p.sin(this.bobTime * 2) > 0.9;

            if (blinkRate) {    const triggerGulp = () => {

                p.strokeWeight(2);      ensureAudio();

                p.stroke(0);      if (!gulpEnv || !gulpOsc) return;

                p.line(-this.size/4, -this.size/1.8, -this.size/8, -this.size/1.8);      gulpOsc.freq(220 + Math.random() * 160);

                p.line(0, -this.size/1.8, this.size/8, -this.size/1.8);      gulpEnv.play(gulpOsc);

            } else {      bassLevel = Math.min(0.4, bassLevel + 0.08);

                p.noStroke();      hissLevel = Math.min(0.28, hissLevel + 0.04);

                p.ellipse(-this.size/6, -this.size/1.8, this.size/10);    };

                p.ellipse(this.size/10, -this.size/1.8, this.size/10);

            }    const triggerBurst = () => {

                  ensureAudio();

            // 嘴巴 (:3 形状)      if (burstEnv && burstOsc) {

            p.fill('#ff9999');        burstOsc.freq(50 + Math.random() * 22);

            p.arc(this.size/5, -this.size/2.2, this.size/4, this.size/6, 0, p.PI);        burstEnv.play(burstOsc);

                  }

            p.pop();      bassLevel = Math.max(bassLevel, 0.38);

        }      hissLevel = Math.max(hissLevel, 0.32);

    }    };



    p.setup = () => {    const teardownAudio = () => {

        const canvas = p.createCanvas(host.clientWidth || window.innerWidth, host.clientHeight || window.innerHeight);      [bass, hiss, gulpOsc, burstOsc].forEach((node) => {

        canvas.parent(host);        if (!node) return;

        p.colorMode(p.RGB);        try {

        p.background(20);          node.stop();

    };        } catch (_) {

          // ignore

    p.draw = () => {        }

        // 渐变淡化背景，创造拖尾效果        if (node.dispose) node.dispose();

        p.background(20, 20, 20, 10);      });

              bass = hiss = gulpOsc = burstOsc = null;

        // 更新和绘制所有的猫      gulpEnv = burstEnv = null;

        for (let i = cats.length - 1; i >= 0; i--) {      audioReady = false;

            cats[i].update();      bassLevel = 0;

            cats[i].draw();      hissLevel = 0;

                };

            // 移除离开屏幕的猫

            if (!cats[i].alive) {    const resetBeast = () => {

                cats.splice(i, 1);      offerings.length = 0;

            }      shards.length = 0;

        }      fragments.length = 0;

              offspring.length = 0;

        // 显示提示文本      saturation = 0;

        p.fill(255);      rupture = false;

        p.noStroke();      resetTimer = 0;

        p.textSize(16);      bassLevel = 0;

        p.textAlign(p.LEFT, p.TOP);      hissLevel = 0;

        p.text('Click anywhere to create a Nyan Cat!', 20, 20);      if (bass) bass.amp(0, 0.05);

        p.text('Active Cats: ' + cats.length, 20, 45);      if (hiss) hiss.amp(0, 0.05);

    };      const base = p.createVector(p.width / 2, p.height * 0.55);

      beast.pos = base.copy();

    p.mousePressed = () => {      beast.drag = false;

        // 创建新的彩虹猫      beast.dragOffset = p.createVector(0, 0);

        if (p.mouseX >= 0 && p.mouseX <= p.width && p.mouseY >= 0 && p.mouseY <= p.height) {      beast.radius = p.width * 0.16;

            cats.push(new NyanCat(p.mouseX, p.mouseY));      pointer.down = false;

        }      pointer.dragging = false;

    };      pointer.dragCandidate = false;

      pointer.pendingSpawn = false;

    p.windowResized = () => {    };

        p.resizeCanvas(host.clientWidth || window.innerWidth, host.clientHeight || window.innerHeight);

        p.background(20);    const updatePointer = (x, y) => {

    };      pointer.x = p.constrain(x, -p.width * 0.1, p.width * 1.1);

  });      pointer.y = p.constrain(y, -p.height * 0.1, p.height * 1.1);

})();    };

    const handlePointerDown = (x, y) => {
      updatePointer(x, y);
      pointer.down = true;
      pointer.startX = x;
      pointer.startY = y;

      if (rupture) {
        pointer.dragCandidate = false;
        pointer.pendingSpawn = false;
        pointer.dragging = false;
        return;
      }

      const center = beast.pos || p.createVector(p.width / 2, p.height * 0.55);
      const radius = (beast.radius || currentRadius()) * 1.1;
      const dist = p.dist(x, y, center.x, center.y);

      if (dist <= radius) {
        pointer.dragCandidate = true;
        pointer.pendingSpawn = true;
        pointer.dragging = false;
        beast.dragOffset = p.createVector(x - center.x, y - center.y);
      } else {
        pointer.dragCandidate = false;
        pointer.pendingSpawn = false;
        pointer.dragging = false;
        spawnOffering(x, y, true);
      }
    };

    const handlePointerMove = (x, y) => {
      updatePointer(x, y);
      if (!pointer.down || rupture) return;

      if (pointer.dragCandidate && !pointer.dragging) {
        const moved = Math.hypot(x - pointer.startX, y - pointer.startY);
        if (moved > 14) {
          pointer.dragging = true;
          pointer.pendingSpawn = false;
          const center = beast.pos || p.createVector(p.width / 2, p.height * 0.55);
          beast.dragOffset = p.createVector(x - center.x, y - center.y);
        }
      }

      beast.drag = pointer.dragging;
    };

    const handlePointerUp = (x, y) => {
      if (typeof x === 'number' && typeof y === 'number') updatePointer(x, y);
      if (!pointer.down) return;
      pointer.down = false;
      if (!rupture && pointer.pendingSpawn) {
        spawnOffering(pointer.x, pointer.y, true);
      }
      pointer.dragging = false;
      pointer.dragCandidate = false;
      pointer.pendingSpawn = false;
      beast.drag = false;
    };

    const updateBeastCenter = () => {
      const base = p.createVector(p.width / 2, p.height * 0.55);
      beast.radius = currentRadius();
      const desired = base.copy();

      if (!rupture) {
        if (beast.drag && pointer.down) {
          const dragTarget = p.createVector(pointer.x, pointer.y).sub(beast.dragOffset || p.createVector(0, 0));
          desired.lerp(dragTarget, 0.9);
        } else if (pointer.down && pointer.dragCandidate) {
          const pointerVec = p.createVector(pointer.x, pointer.y);
          const pull = pointerVec.sub(base);
          pull.mult(0.22);
          desired.add(pull);
        }
      }

      desired.x = p.constrain(desired.x, p.width * 0.2, p.width * 0.8);
      desired.y = p.constrain(desired.y, p.height * 0.28, p.height * 0.78);

      if (!beast.pos) {
        beast.pos = desired.copy();
      } else {
        beast.pos.lerp(desired, 0.18);
      }

      return beast.pos.copy();
    };

    const currentRadius = () => Math.max(p.width * 0.12, p.width * 0.16 + saturation * 6);

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

      const splitOffset = baseRadius * 0.55;
      const survivorIndex = Math.random() < 0.5 ? 0 : 1;
      const home = p.createVector(cx, cy);
      for (let i = 0; i < 2; i++) {
        const angle = i === 0 ? -0.7 : 0.7;
        const initialPos = p.createVector(
          cx + Math.cos(angle) * splitOffset,
          cy + Math.sin(angle) * baseRadius * 0.35
        );
        const velocity = p.createVector(Math.cos(angle), Math.sin(angle) * 0.6 - 0.8).mult(baseRadius * 0.035);
        offspring.push({
          pos: initialPos,
          vel: velocity,
          base: baseRadius,
          scale: baseRadius * (0.62 + i * 0.08),
          timer: 0,
          state: 'split',
          alpha: 1,
          survivor: i === survivorIndex,
          vanish: i !== survivorIndex,
          seed: Math.random() * 1000,
          home: home.copy(),
          dragVec: velocity.copy(),
        });
      }

      triggerBurst();
      if (bass) bass.freq(80, 0.02);

      rupture = true;
      beast.drag = false;
      pointer.dragging = false;
      pointer.down = false;
      pointer.dragCandidate = false;
      pointer.pendingSpawn = false;
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

    const renderSlime = (center, baseRadius, opts = {}) => {
      const dragVec = opts.drag ? opts.drag.copy() : p.createVector(0, 0);
      const seed = opts.seed || 0;
      const alpha = opts.alpha ?? 1;
      const sat = opts.saturation ?? saturation;
      const smilePulse = opts.mouth ?? gulpPulse;
      const hueShift = opts.hueShift || 0;
      const drawEyes = opts.eyes !== false;
      const dragSpan = opts.dragSpan || 2.4;
      const dragMax = opts.dragMax ?? 0.95;
      const ripplePhase = opts.ripplePhase || 0;

      const dragStrength = p.constrain(dragVec.mag() / (baseRadius * dragSpan), 0, dragMax);
      const dragAngle = dragVec.heading();
      const ripple = Math.sin(p.frameCount * 0.03 + seed + ripplePhase) * baseRadius * 0.04;

      p.push();
      p.translate(center.x, center.y + ripple);
      p.noStroke();

      for (let layer = 5; layer >= 1; layer--) {
        const r = baseRadius * (0.52 + layer * 0.2);
        const hue = (320 + hueShift + layer * 6 + sat * 3) % 360;
        const layerAlpha = (0.16 + layer * 0.09) * alpha;
        p.fill(hue, 55, 100, layerAlpha);
        p.beginShape();
        const STEP = 150;
        for (let i = 0; i <= STEP; i++) {
          const a = (p.TWO_PI / STEP) * i;
          const directional = Math.cos(a - dragAngle) * dragStrength;
          const radial =
            r +
            Math.sin(a * 3 + p.frameCount * 0.02 + layer + seed) * 18 +
            Math.sin(a * 8 + layer + seed * 0.5) * 6 +
            directional * baseRadius * 0.55;
          const yWarp = Math.sin(a - dragAngle) * dragStrength * baseRadius * 0.18;
          const x = Math.cos(a) * (radial + yWarp * 0.25);
          const y = Math.sin(a) * radial * (0.72 + directional * 0.08) + yWarp;
          p.vertex(x, y);
        }
        p.endShape(p.CLOSE);
      }

      if (drawEyes) {
        const eyeOffset = baseRadius * (0.55 + dragStrength * 0.08);
        const eyeSize = baseRadius * 0.32 + Math.sin(p.frameCount * 0.1 + seed) * baseRadius * 0.05;
        p.fill(0, 0, 10, 0.85 * alpha);
        p.circle(-eyeOffset, -baseRadius * 0.4, eyeSize);
        p.circle(eyeOffset, -baseRadius * 0.4, eyeSize);
        p.fill(0, 0, 100, alpha);
        p.circle(-eyeOffset + Math.sin(p.frameCount * 0.12 + seed) * baseRadius * 0.07, -baseRadius * 0.38, eyeSize * 0.35);
        p.circle(eyeOffset + Math.sin(p.frameCount * 0.1 + 1.1 + seed) * baseRadius * 0.07, -baseRadius * 0.38, eyeSize * 0.35);

        const mouthWidth = baseRadius * (0.4 + sat * 0.008);
        p.fill(330, 80, 100, (0.58 + smilePulse * 0.2) * alpha);
        p.beginShape();
        p.vertex(-mouthWidth, baseRadius * 0.1);
        p.vertex(-mouthWidth * 0.4, baseRadius * 0.28 + smilePulse * 6);
        p.vertex(mouthWidth * 0.4, baseRadius * 0.28 + smilePulse * 6);
        p.vertex(mouthWidth, baseRadius * 0.1);
        p.vertex(0, -baseRadius * 0.05 - smilePulse * 4);
        p.endShape(p.CLOSE);
      }

      p.pop();
    };

    const drawBeast = () => {
      const center = beast.pos || p.createVector(p.width / 2, p.height * 0.55);
      const base = currentRadius();
      const home = p.createVector(p.width / 2, p.height * 0.55);
      const offset = center.copy().sub(home);
      renderSlime(center, base, { drag: offset });
      beast.radius = base;
    };

    const updateOfferings = () => {
      const center = beast.pos || p.createVector(p.width / 2, p.height * 0.55);
      const cx = center.x;
      const cy = center.y;
      const baseRadius = currentRadius();

      for (let i = offerings.length - 1; i >= 0; i--) {
        const o = offerings[i];
        o.vy += 0.01;
        o.x += o.vx;
        o.y += o.vy;
        const target = p.createVector(cx, cy - baseRadius * 0.25);
        const pos = p.createVector(o.x, o.y);
        const toCenter = target.sub(pos).setMag(0.8);
        o.vx += toCenter.x * 0.04;
        o.vy += toCenter.y * 0.04;

        p.noStroke();
        p.fill(o.hue, 80, 100, 0.8);
        p.circle(o.x, o.y, o.mass);

        if (p.dist(o.x, o.y, cx, cy) < baseRadius * 0.8) {
          offerings.splice(i, 1);
          saturation += 1;
          gulpPulse = 1;
          triggerGulp();
          if (bass) bass.freq(160 + Math.random() * 90, 0.08);
          if (saturation >= 18 && !rupture) {
            explodeBeast(cx, cy - baseRadius * 0.12, baseRadius);
          }
        }
      }
    };

    const reassembleFromCub = (cub) => {
      beast.pos = cub.home.copy();
      beast.drag = false;
      beast.dragOffset = p.createVector(0, 0);
      beast.radius = cub.base;
      saturation = 0;
      offerings.length = 0;
      shards.length = 0;
      fragments.length = 0;
      offspring.length = 0;
      rupture = false;
      resetTimer = 0;
      pointer.down = false;
      pointer.dragging = false;
      pointer.dragCandidate = false;
      pointer.pendingSpawn = false;
      bassLevel = 0;
      hissLevel = 0;
      if (bass) bass.amp(0, 0.08);
      if (hiss) hiss.amp(0, 0.08);
    };

    const updateOffspring = () => {
      for (let i = offspring.length - 1; i >= 0; i--) {
        const cub = offspring[i];
        cub.timer += 1;

        if (cub.state === 'split') {
          cub.vel.mult(0.96);
          cub.vel.y += 0.08;
          cub.pos.add(cub.vel);
          cub.dragVec = cub.vel.copy().mult(16);
          if (cub.timer > 70) {
            cub.state = cub.survivor ? 'return' : 'vanish';
            cub.timer = 0;
          }
        } else if (cub.state === 'vanish') {
          cub.vel.mult(0.9);
          cub.pos.add(cub.vel);
          cub.alpha = p.lerp(cub.alpha, 0, 0.08);
          cub.scale = p.lerp(cub.scale, cub.base * 0.25, 0.06);
          cub.dragVec.mult(0.8);
          if (cub.alpha < 0.02) {
            offspring.splice(i, 1);
            continue;
          }
        } else if (cub.state === 'return') {
          const target = cub.home;
          cub.pos.lerp(target, 0.12);
          cub.scale = p.lerp(cub.scale, cub.base, 0.08);
          cub.alpha = p.lerp(cub.alpha, 1, 0.1);
          cub.dragVec = cub.pos.copy().sub(target).mult(0.6);
          if (
            p5.Vector.dist(cub.pos, target) < 1.5 &&
            Math.abs(cub.scale - cub.base) < 1.2
          ) {
            reassembleFromCub(cub);
            break;
          }
        }
      }
    };

    const drawOffspring = () => {
      offspring.forEach((cub) => {
        renderSlime(cub.pos, cub.scale, {
          drag: cub.dragVec,
          mouth: Math.max(0, gulpPulse * 0.6),
          saturation: Math.max(6, saturation * 0.4),
          alpha: cub.alpha,
          seed: cub.seed,
        });
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
      const center = beast.pos || p.createVector(p.width / 2, p.height * 0.55);
      const cx = center.x;
      const cy = center.y;
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
      updateBeastCenter();
      drawBackground();
      gulpPulse = p.lerp(gulpPulse, 0, 0.15);
      bassLevel = p.lerp(bassLevel, 0, 0.07);
      hissLevel = p.lerp(hissLevel, 0, 0.08);
      if (bass) bass.amp(bassLevel, 0.05);
      if (hiss) hiss.amp(hissLevel, 0.06);

      drawOffscreenAura();

      if (rupture) updateOffspring();

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
      updatePointer(p.mouseX, p.mouseY);
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
      handlePointerDown(p.mouseX, p.mouseY);
      return false;
    };

    p.mouseDragged = () => {
      handlePointerMove(p.mouseX, p.mouseY);
      return false;
    };

    p.mouseReleased = () => {
      handlePointerUp(p.mouseX, p.mouseY);
      return false;
    };

    p.mouseMoved = () => {
      updatePointer(p.mouseX, p.mouseY);
      return false;
    };

    p.touchStarted = () => {
      updatePointer(p.mouseX, p.mouseY);
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
      handlePointerDown(p.mouseX, p.mouseY);
      return false;
    };

    p.touchMoved = () => {
      handlePointerMove(p.mouseX, p.mouseY);
      return false;
    };

    p.touchEnded = () => {
      handlePointerUp(p.mouseX, p.mouseY);
      return false;
    };

    const originalRemove = p.remove.bind(p);
    p.remove = () => {
      teardownAudio();
      originalRemove();
    };
  }, host);
})();
