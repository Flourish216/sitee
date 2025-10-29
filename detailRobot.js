(() => {
  const host = document.getElementById('robot-canvas');
  if (!host) return;

  let osc, noise, reverb;

  const chars = '░▒▓▞▚▟◊◬◮◰◱◲◳△▽✦✧✩✪✫✬✭✮✯✰✱✲✳✴✵✶✷';

  const sketch = (p) => {
    const voice = [];
    let bodyPulse = 0;
    let mouthPhase = 0;
    let glitch = 0;
    let talking = false;

    const resetVoice = () => {
      voice.length = 0;
      for (let i = 0; i < 20; i++) {
        voice.push('');
      }
    };

    const randomGlyphs = () => {
      let line = '';
      const count = p.int(p.random(10, 18));
      for (let i = 0; i < count; i++) {
        line += chars[p.floor(p.random(chars.length))];
      }
      return line;
    };

    const addLine = () => {
      voice.pop();
      voice.unshift(randomGlyphs());
    };

    const animateHands = (side) => {
      const amp = 16 + Math.sin(p.frameCount * 0.2 + side) * 6;
      return amp;
    };

    p.setup = () => {
      const size = Math.min(window.innerWidth, window.innerHeight);
      p.createCanvas(size, size).parent(host);
      resetVoice();
      osc = new p5.Oscillator('triangle');
      noise = new p5.Noise('pink');
      reverb = new p5.Reverb();
      osc.amp(0, 0.1);
      osc.start();
      noise.amp(0, 0.1);
      noise.start();
      reverb.process(osc, 2, 0.3);
      reverb.process(noise, 2, 0.3);
    };

    p.windowResized = () => {
      const size = Math.min(window.innerWidth, window.innerHeight);
      p.resizeCanvas(size, size);
    };

    const drawRobot = () => {
      const cx = p.width / 2;
      const cy = p.height / 2;
      const scale = p.width * 0.25;
      const breathe = Math.sin(p.frameCount * 0.03) * 0.04;

      p.push();
      p.translate(cx, cy + Math.sin(p.frameCount * 0.03) * 8);

      // torso
      p.stroke(255);
      p.strokeWeight(3);
      p.fill(0, 0, 0, 180);
      p.rectMode(p.CENTER);
      p.rect(0, 0, scale * 1.4, scale * 1.9, 22);

      // chest glyphs
      p.textAlign(p.CENTER, p.CENTER);
      p.textFont('Manrope');
      p.textSize(scale * 0.18);
      p.fill(255, 200);
      for (let i = 0; i < 3; i++) {
        const y = -scale * 0.4 + i * scale * 0.35;
        p.text(randomGlyphs().slice(0, 6), 0, y + Math.sin(p.frameCount * 0.02 + i) * 4);
      }

      // arms
      const armOffset = scale * 0.9;
      const leftAmp = animateHands(-1);
      const rightAmp = animateHands(1);
      p.stroke(255);
      p.strokeWeight(8);
      p.line(-armOffset, -scale * 0.4, -armOffset - leftAmp, -scale * 0.9);
      p.line(armOffset, -scale * 0.4, armOffset + rightAmp, -scale * 0.9);
      p.line(-armOffset, scale * 0.4, -armOffset - leftAmp * 0.4, scale * 0.9);
      p.line(armOffset, scale * 0.4, armOffset + rightAmp * 0.4, scale * 0.9);

      // head
      p.noStroke();
      p.fill(0, 0, 0, 210);
      p.rect(0, -scale * 1.2, scale * 1.1, scale * 0.9, 16);
      p.stroke(255);
      p.strokeWeight(3);
      p.rect(0, -scale * 1.2, scale * 1.1, scale * 0.9, 16);

      // eyes
      p.noStroke();
      p.fill(180 + Math.sin(p.frameCount * 0.6) * 60, 100, 100);
      const eyeOffset = scale * 0.28;
      const eyeSize = scale * 0.16 + Math.sin(p.frameCount * 0.2) * scale * 0.02;
      p.circle(-eyeOffset, -scale * 1.25, eyeSize);
      p.circle(eyeOffset, -scale * 1.25, eyeSize);

      // antenna
      p.stroke(255);
      p.strokeWeight(4);
      p.line(0, -scale * 1.6, 0, -scale * 2.1);
      p.noStroke();
      p.fill(255, 80, 120);
      p.circle(0, -scale * 2.15, scale * 0.18 + Math.sin(p.frameCount * 0.4) * scale * 0.04);

      // mouth
      const mouthOpen = talking ? scale * (0.18 + Math.sin(mouthPhase) * 0.07) : scale * 0.12;
      p.fill(0, 0, 0, 220);
      p.rect(0, -scale * 1.05, scale * 0.5, mouthOpen, 8);
      p.fill(255, 80, 120, 150);
      p.rect(0, -scale * 1.04, scale * 0.5, mouthOpen * 0.4, 6);

      p.pop();
    };

    p.draw = () => {
      p.background(6, 6, 12);
      p.stroke(255, 15);
      for (let i = 0; i < 40; i++) {
        const radius = p.width * 0.35 + i * 12;
        p.circle(p.width / 2, p.height / 2, radius);
      }

      drawRobot();

      if (talking) {
        if (p.frameCount % 6 === 0) addLine();
        mouthPhase += 0.4;
        bodyPulse = Math.sin(p.frameCount * 0.1) * 0.2;
      } else {
        bodyPulse *= 0.9;
        if (p.frameCount % 18 === 0) addLine();
      }

      // textual chatter overlay
      p.push();
      p.translate(p.width * 0.1, p.height * 0.12);
      p.fill(255, 60);
      p.textAlign(p.LEFT, p.TOP);
      p.textFont('Manrope');
      p.textSize(p.width * 0.03);
      voice.forEach((line, idx) => {
        const y = idx * p.width * 0.03;
        const xJitter = Math.sin(p.frameCount * 0.02 + idx) * 4;
        p.text(line, xJitter, y);
      });
      p.pop();

      if (talking && osc) {
        const freq = p.map(p.noise(p.frameCount * 0.015), 0, 1, 140, 520);
        osc.freq(freq);
        noise.amp(0.05 + Math.sin(p.frameCount * 0.08) * 0.02, 0.1);
      }
    };

    const toggle = () => {
      talking = !talking;
      if (talking) {
        if (osc) osc.amp(0.12, 0.2);
        if (noise) noise.amp(0.04, 0.2);
        glitch = 0;
      } else {
        if (osc) osc.amp(0, 0.3);
        if (noise) noise.amp(0, 0.3);
      }
      return false;
    };

    p.mousePressed = toggle;
    p.touchStarted = toggle;
  };

  new p5(sketch, host);
})();
