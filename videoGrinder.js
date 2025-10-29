(() => {
  const host = document.getElementById('carpet-canvas');
  if (!host) return;

  new p5((p) => {
    const fragments = [];
    const pointer = { x: 0, y: 0, down: false };

    let canvas;
    let capture;
    let frameBuffer;
    let ready = false;
    let spawnCounter = 0;
    let spawnThreshold = 5;

    const MAX_FRAGMENTS = 170;

    const devicePixelRatio = () => Math.min(2, window.devicePixelRatio || 1);

    const resetShredState = () => {
      fragments.length = 0;
      spawnCounter = 0;
      spawnThreshold = p.int(p.random(3, 8));
    };

    const ensureFrameBuffer = () => {
      if (!frameBuffer) {
        frameBuffer = p.createGraphics(p.width, p.height);
      } else {
        frameBuffer.resizeCanvas(p.width, p.height);
      }
      frameBuffer.pixelDensity(p.pixelDensity());
      frameBuffer.clear();
    };

    const initCapture = () => {
      capture = p.createCapture(
        {
          video: {
            facingMode: 'user',
            width: 1920,
            height: 1080,
          },
          audio: false,
        },
        () => {
          ready = true;
        }
      );

      if (capture && capture.elt) {
        capture.elt.setAttribute('playsinline', 'true');
        capture.elt.muted = true;
      }
      capture.hide();
    };

    const resumeCapture = () => {
      if (capture && capture.elt && capture.elt.paused) {
        capture.elt.play();
      }
    };

    const updateFrameBuffer = () => {
      if (!ready || !capture) {
        frameBuffer.push();
        frameBuffer.background(0);
        frameBuffer.pop();
        return;
      }

      frameBuffer.push();
      frameBuffer.translate(frameBuffer.width, 0);
      frameBuffer.scale(-1, 1);
      frameBuffer.image(capture, 0, 0, frameBuffer.width, frameBuffer.height);
      frameBuffer.pop();
    };

    const spawnFragment = () => {
      if (!frameBuffer) return;

      const baseSize = p.random(p.width * 0.08, p.width * 0.18);
      const aspect = p.random(0.55, 1.35);
      const w = Math.max(24, Math.round(baseSize));
      const h = Math.max(24, Math.round(baseSize * aspect));
      const halfW = w / 2;
      const halfH = h / 2;

      const centerX = p.constrain(pointer.x + p.random(-halfW * 0.8, halfW * 0.8), halfW, p.width - halfW);
      const centerY = p.constrain(pointer.y + p.random(-halfH * 0.8, halfH * 0.8), halfH, p.height - halfH);

      const sx = Math.round(centerX - halfW);
      const sy = Math.round(centerY - halfH);

      const fragmentImg = frameBuffer.get(sx, sy, w, h);

      fragments.push({
        img: fragmentImg,
        baseX: centerX,
        baseY: centerY,
        w,
        h,
        offset: p.createVector(0, 0),
        velocity: p.createVector(p.random(-16, 16), p.random(-14, 12)),
        spin: p.random(-0.09, 0.09),
        rotation: p.random(-0.22, 0.22),
        drag: p.random(0.9, 0.96),
        gravity: p.random(0.18, 0.28),
        life: 1,
        decay: p.random(0.015, 0.024),
        tint: p.random(0.55, 0.95),
        warp: p.random(-0.22, 0.22),
        jitter: p.random(-12, 12),
      });

      if (fragments.length > MAX_FRAGMENTS) {
        fragments.splice(0, fragments.length - MAX_FRAGMENTS);
      }
    };

    const updateFragments = () => {
      for (let i = fragments.length - 1; i >= 0; i--) {
        const frag = fragments[i];
        frag.offset.add(frag.velocity);
        frag.velocity.mult(frag.drag);
        frag.velocity.y += frag.gravity;
        frag.rotation += frag.spin;
        frag.life = Math.max(0, frag.life - frag.decay);

        if (frag.life <= 0.01) {
          fragments.splice(i, 1);
        }
      }
    };

    const drawFragments = () => {
      fragments.forEach((frag) => {
        const alpha = p.map(frag.life, 0, 1, 0, 255);
        const scaleFactor = 1 + (1 - frag.life) * 0.4;

        p.push();
        p.translate(frag.baseX + frag.offset.x, frag.baseY + frag.offset.y);
        p.rotate(frag.rotation);
        p.imageMode(p.CENTER);
        p.tint(255, alpha * frag.tint);
        p.image(frag.img, frag.jitter, 0, frag.w * scaleFactor, frag.h * (scaleFactor + frag.warp * frag.life));
        p.noTint();
        p.pop();

        p.push();
        p.translate(frag.baseX + frag.offset.x, frag.baseY + frag.offset.y + frag.h * 0.12);
        p.rotate(frag.rotation * 0.6);
        p.stroke(255, alpha * 0.18);
        p.strokeWeight(1.2);
        p.line(-frag.w * 0.4, 0, frag.w * 0.4, 0);
        p.pop();
      });
    };

    const drawPosterFrame = () => {
      p.push();
      p.noFill();
      p.stroke(255, 220);
      p.strokeWeight(2);
      const margin = Math.min(p.width, p.height) * 0.08;
      p.line(margin, margin * 0.6, p.width - margin, margin * 0.6);
      p.pop();
    };

    const drawHUD = () => {
      p.push();
      p.textFont('Manrope');
      p.textAlign(p.RIGHT, p.TOP);
      p.fill(255, 210);
      p.textSize(Math.max(16, p.width * 0.018));
      p.text('Hold mouse to shred · Scroll to reset', p.width - 40, 36);
      p.textSize(Math.max(32, p.width * 0.052));
      p.textStyle(p.BOLD);
      p.text('VIDEO GRINDER', p.width - 40, 96);
      p.pop();
    };

    const drawPointerTear = () => {
      if (!pointer.down) return;

      const bandWidth = Math.max(40, p.width * 0.06);
      const bandHeight = Math.max(50, p.width * 0.09);
      const jitter = p.sin(p.frameCount * 0.3) * 18;

      p.push();
      p.translate(pointer.x, pointer.y);
      p.rotate(p.sin(p.frameCount * 0.02) * 0.06);
      p.blendMode(p.SCREEN);
      p.noStroke();
      p.fill(255, 30);
      p.rectMode(p.CENTER);
      p.rect(0, 0, bandWidth, bandHeight, 8);
      p.fill(255, 18);
      p.rect(0, jitter * 0.4, bandWidth * 1.35, bandHeight * 0.35, 6);
      p.pop();
      p.blendMode(p.BLEND);
    };

    const updatePointer = (x, y) => {
      pointer.x = p.constrain(x, 0, p.width);
      pointer.y = p.constrain(y, 0, p.height);
    };

    p.setup = () => {
      canvas = p.createCanvas(host.clientWidth || window.innerWidth, host.clientHeight || window.innerHeight);
      canvas.parent(host);
      p.pixelDensity(devicePixelRatio());

      ensureFrameBuffer();
      initCapture();
      resetShredState();
    };

    p.windowResized = () => {
      const w = host.clientWidth || window.innerWidth;
      const h = host.clientHeight || window.innerHeight;
      p.resizeCanvas(w, h);
      ensureFrameBuffer();
    };

    p.draw = () => {
      updateFrameBuffer();

      p.background(0);
      if (frameBuffer) {
        p.image(frameBuffer, 0, 0, p.width, p.height);
      }

      if (pointer.down && ready) {
        spawnCounter += 1;
        if (spawnCounter >= spawnThreshold) {
          spawnFragment();
          if (Math.random() > 0.55) spawnFragment();
          spawnCounter = 0;
          spawnThreshold = p.int(p.random(3, 8));
        }
      }

      updateFragments();
      drawFragments();
      drawPointerTear();
      drawPosterFrame();
      drawHUD();
    };

    p.mousePressed = () => {
      resumeCapture();
      pointer.down = true;
      updatePointer(p.mouseX, p.mouseY);
      return false;
    };

    p.mouseReleased = () => {
      pointer.down = false;
      return false;
    };

    p.mouseMoved = () => {
      updatePointer(p.mouseX, p.mouseY);
      return false;
    };

    p.mouseDragged = () => {
      updatePointer(p.mouseX, p.mouseY);
      return false;
    };

    p.touchStarted = () => {
      resumeCapture();
      pointer.down = true;
      updatePointer(p.mouseX, p.mouseY);
      return false;
    };

    p.touchMoved = () => {
      updatePointer(p.mouseX, p.mouseY);
      return false;
    };

    p.touchEnded = () => {
      pointer.down = false;
      return false;
    };

    p.mouseWheel = () => {
      resetShredState();
      return false;
    };
  }, host);
})();
