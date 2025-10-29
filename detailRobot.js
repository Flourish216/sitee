(() => {
  const host = document.getElementById('robot-canvas');
  if (!host) return;

  const glyphs = '▒▓▞▚▒░◊◬◮◰◱◲◳△▽✦✧✩✪✫✬✭✮✯✰✱✲✳✴✵✶✷✸✹✺✻✼';
  let osc, mod, hiss;

  const initAudio = () => {
    if (osc) return;
    osc = new p5.Oscillator('triangle');
    mod = new p5.Oscillator('sine');
    hiss = new p5.Noise('pink');
    mod.freq(2);
    mod.amp(120);
    osc.start();
    mod.start();
    hiss.start();
    osc.amp(0, 0.1);
    hiss.amp(0, 0.1);
  };

  new p5((p) => {
    let lines = Array.from({ length: 32 }, () => '');
    let speaking = false;
    let pulse = 0;
    let glitch = 0;

    const resize = () => {
      p.resizeCanvas(window.innerWidth, window.innerHeight);
    };

    const makeLine = () => {
      let out = '';
      const count = p.int(p.random(12, 20));
      for (let i = 0; i < count; i++) out += glyphs[p.floor(p.random(glyphs.length))];
      return out;
    };

    p.setup = () => {
      p.createCanvas(window.innerWidth, window.innerHeight).parent(host);
      p.colorMode(p.HSB, 360, 100, 100, 1);
      p.frameRate(60);
    };

    p.windowResized = resize;

    const drawBackdrop = () => {
      const ctx = p.drawingContext;
      ctx.save();
      const g = ctx.createRadialGradient(
        p.width / 2,
        p.height / 2,
        p.width * 0.1,
        p.width / 2,
        p.height / 2,
        Math.max(p.width, p.height)
      );
      g.addColorStop(0, 'rgba(5, 8, 15, 0.95)');
      g.addColorStop(0.4, 'rgba(4, 6, 12, 0.95)');
      g.addColorStop(1, 'rgba(0, 0, 0, 1)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, p.width, p.height);
      ctx.restore();

      p.push();
      p.stroke(255, 12);
      p.noFill();
      for (let i = 0; i < 40; i++) {
        const w = p.width * (0.4 + i * 0.01);
        const h = p.height * (0.25 + i * 0.008);
        p.ellipse(p.width / 2, p.height / 2, w, h);
      }
      p.pop();
    };

    const drawGlyphStream = () => {
      if (speaking && p.frameCount % 4 === 0) {
        lines.pop();
        lines.unshift(makeLine());
      } else if (!speaking && p.frameCount % 14 === 0) {
        lines.pop();
        lines.unshift('');
      }

      p.push();
      p.translate(p.width * 0.1, p.height * 0.12);
      p.textFont('Manrope');
      p.textAlign(p.LEFT, p.TOP);
      p.textSize(p.width * 0.022);
      lines.forEach((line, idx) => {
        const jitter = Math.sin(p.frameCount * 0.02 + idx) * 3;
        p.fill(200, 10, 90, 0.22 + (speaking ? 0.2 : 0));
        p.text(line, jitter, idx * p.width * 0.022);
      });
      p.pop();
    };

    const drawRobot = () => {
      const cx = p.width / 2;
      const cy = p.height / 2;
      const s = Math.min(p.width, p.height) * 0.22;
      pulse = p.lerp(pulse, speaking ? 1 : 0, 0.04);

      p.push();
      p.translate(cx, cy + Math.sin(p.frameCount * 0.03) * s * 0.05);

      // halo
      p.noFill();
      p.stroke(200, 40, 90, 0.2 + pulse * 0.2);
      p.strokeWeight(4);
      p.ellipse(0, 0, s * 3.4, s * 2.7);

      // torso core
      p.noStroke();
      p.fill(210, 40, 18, 0.55 + pulse * 0.2);
      p.rectMode(p.CENTER);
      p.rect(0, 0, s * 1.7, s * 2.2, 24);
      p.fill(210, 20, 12, 0.4);
      p.rect(0, 0, s * 1.05, s * 1.75, 16);

      // rib lattice
      p.stroke(210, 40, 95, 0.4 + pulse * 0.3);
      p.strokeWeight(2.2);
      for (let i = -3; i <= 3; i++) {
        const y = i * s * 0.22;
        const wobble = Math.sin(p.frameCount * 0.08 + i * 0.7) * s * 0.12 * (1 + pulse);
        p.line(-s * 0.75, y, s * 0.75, y + wobble);
      }
      p.stroke(210, 35, 95, 0.3);
      p.ellipse(0, 0, s * 1.32, s * 0.6);

      // limbs
      const swing = Math.sin(p.frameCount * 0.09) * s * 0.18 * (1 + pulse * 0.6);
      p.stroke(200, 25, 100, 0.65);
      p.strokeWeight(9);
      p.line(-s * 1.1, -s * 0.05, -s * 1.95, -s * 0.85 + swing);
      p.line(s * 1.1, -s * 0.05, s * 1.95, -s * 0.85 - swing);
      p.line(-s * 0.95, s * 0.65, -s * 1.6, s * 1.4 - swing * 0.35);
      p.line(s * 0.95, s * 0.65, s * 1.6, s * 1.4 + swing * 0.35);
      p.strokeWeight(4);
      p.stroke(200, 20, 95, 0.35);
      p.bezier(-s * 1.85, -s * 0.9 + swing, -s * 2.2, -s * 0.4, -s * 1.9, s * 0.2, -s * 1.5, s * 0.6);
      p.bezier(s * 1.85, -s * 0.9 - swing, s * 2.2, -s * 0.4, s * 1.9, s * 0.2, s * 1.5, s * 0.6);

      // head
      p.push();
      p.translate(0, -s * 1.35);
      p.rotate(Math.sin(p.frameCount * 0.01) * 0.05);
      p.noStroke();
      p.fill(220, 25, 10, 0.45);
      p.rect(0, 0, s * 1.5, s * 0.85, 18);
      p.stroke(210, 30, 95, 0.8);
      p.strokeWeight(3.2);
      p.noFill();
      p.rect(0, 0, s * 1.5, s * 0.85, 18);
      p.strokeWeight(2);
      p.line(-s * 0.6, -s * 0.2, -s * 0.3, -s * 0.55);
      p.line(s * 0.6, -s * 0.2, s * 0.3, -s * 0.55);
      p.pop();

      // face hardware
      const eyeGlow = speaking ? 0.9 : 0.4;
      p.noStroke();
      p.fill(180, 60, 100, eyeGlow);
      p.ellipse(-s * 0.4, -s * 1.4, s * 0.36 + pulse * s * 0.12, s * 0.28);
      p.ellipse(s * 0.4, -s * 1.4, s * 0.36 + pulse * s * 0.12, s * 0.28);

      p.fill(200, 20, 90, 0.7);
      const mouthOpen = s * (0.18 + pulse * 0.15);
      p.rect(0, -s, s * 0.6, mouthOpen, 8);
      p.fill(200, 15, 95, 0.4);
      p.rect(0, -s * 0.95, s * 0.8, mouthOpen * 0.6, 10);

      // cables
      p.stroke(200, 10, 70, 0.35 + pulse * 0.3);
      p.strokeWeight(2.5);
      for (let i = -2; i <= 2; i++) {
        const anchorX = s * 0.4 * i;
        p.bezier(
          anchorX,
          s * 0.9,
          anchorX * 1.1,
          s * 1.5 + Math.sin(p.frameCount * 0.04 + i) * s * 0.3,
          anchorX * 1.4,
          s * 1.9 + Math.cos(p.frameCount * 0.03 + i) * s * 0.3,
          anchorX * 0.6,
          s * 2.2
        );
      }

      // antenna crown
      p.stroke(200, 30, 100);
      p.strokeWeight(4);
      p.line(0, -s * 1.9, 0, -s * 2.6);
      p.noStroke();
      p.fill(320, 50, 100, 0.85);
      p.circle(0, -s * 2.7, s * (0.22 + pulse * 0.08));
      p.stroke(210, 30, 100, 0.4);
      p.noFill();
      p.circle(0, -s * 2.7, s * (0.3 + pulse * 0.1));

      p.pop();
    };

    const drawSignalRings = () => {
      p.push();
      p.translate(p.width / 2, p.height / 2);
      p.rotate(Math.sin(p.frameCount * 0.005) * 0.2);
      p.noFill();
      p.stroke(210, 25, 95, 0.25 + pulse * 0.25);
      p.strokeWeight(1.5);
      for (let i = 1; i <= 4; i++) {
        const r = i * Math.min(p.width, p.height) * 0.18;
        p.ellipse(0, 0, r * 1.4, r);
      }
      p.pop();
    };

    p.draw = () => {
      drawBackdrop();
      drawSignalRings();
      drawRobot();
      drawGlyphStream();

      if (speaking && osc) {
        const carrier = 200 + Math.sin(p.frameCount * 0.05) * 40 + p.noise(p.frameCount * 0.02) * 160;
        const modulation = 40 + p.noise(p.frameCount * 0.01 + 99) * 60;
        mod.freq(modulation);
        osc.freq(carrier + mod.getAmp());
        hiss.amp(0.06 + Math.sin(p.frameCount * 0.09) * 0.02, 0.1);
        osc.amp(0.14 + Math.sin(p.frameCount * 0.04) * 0.03, 0.1);
      }
    };

    const toggleSpeech = () => {
      initAudio();
      speaking = !speaking;
      glitch = 0;
      if (speaking) {
        osc.amp(0.14, 0.2);
        hiss.amp(0.05, 0.2);
      } else {
        osc.amp(0, 0.3);
        hiss.amp(0, 0.3);
      }
      return false;
    };

    p.mousePressed = toggleSpeech;
    p.touchStarted = toggleSpeech;
  }, host);
})();
