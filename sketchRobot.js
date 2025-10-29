(() => {
  const mount = document.getElementById('sketch-robot');
  if (!mount) return;

  const glyphs = '◇△◆▢◎◉○□◇△░▒▓✶✳✺✻✼✽✾✿∿≈≋❖✧✦▱▰▀▄';
  const chatter = [];
  let speaking = false;
  let osc = null;

  const sketch = (p) => {
    let w = 320;
    let h = 260;
    let glitchTimer = 0;

    const resize = () => {
      w = Math.min(360, Math.floor(window.innerWidth * 0.7));
      h = Math.max(220, Math.floor(w * 0.75));
      p.resizeCanvas(w, h);
    };

    const makeLine = () => {
      let str = '';
      const length = p.int(p.random(8, 16));
      for (let i = 0; i < length; i++) {
        str += glyphs.charAt(p.floor(p.random(glyphs.length)));
      }
      const noise = p.random(1) > 0.7 ? p.nf(p.random(0, 1), 1, 3) : '';
      return `${str}${noise}`;
    };

    const drawRobot = () => {
      p.push();
      p.translate(w / 2, h / 2 - 10);
      const bob = Math.sin(p.frameCount * 0.05) * 3;
      p.translate(0, bob);

      p.stroke(255);
      p.noFill();
      p.strokeWeight(2);
      p.rect(-40, -40, 80, 80, 12);
      p.strokeWeight(3);
      p.line(-30, -5, -10, -5);
      p.line(10, -5, 30, -5);

      p.noStroke();
      p.fill(255, 255, 255, 40);
      p.rect(-25, -28, 50, 12, 4);
      p.fill(255);
      p.circle(-20, -12, 14 + (speaking ? Math.sin(p.frameCount * 0.2) * 3 : 0));
      p.circle(20, -12, 14 + (speaking ? Math.cos(p.frameCount * 0.2) * 3 : 0));

      p.noFill();
      p.stroke(255);
      p.strokeWeight(2);
      p.beginShape();
      p.vertex(-22, 20);
      p.vertex(-10, 28);
      p.vertex(0, 26 + (speaking ? 6 : 0));
      p.vertex(10, 28);
      p.vertex(22, 20);
      p.endShape();

      p.pop();
    };

    p.setup = () => {
      p.createCanvas(w, h).parent(mount);
      p.frameRate(60);
      p.background(0);
    };

    p.windowResized = () => resize();

    p.draw = () => {
      p.background(8, 8, 12);

      p.stroke(255, 60);
      p.noFill();
      p.rect(10, 10, w - 20, h - 20, 14);
      p.stroke(255, 20);
      p.rect(6, 6, w - 12, h - 12, 18);

      drawRobot();

      if (speaking && p.frameCount % 6 === 0) {
        chatter.unshift(makeLine());
        if (chatter.length > 10) chatter.pop();
      }

      glitchTimer += 1;
      if (glitchTimer > 240) {
        glitchTimer = 0;
        chatter.length = 0;
      }

      p.textFont('Manrope');
      p.textSize(12);
      p.textAlign(p.LEFT, p.TOP);
      p.fill(255, 180);
      const baseX = 24;
      let baseY = h - 90;
      chatter.forEach((line, idx) => {
        const jitterX = Math.sin(p.frameCount * 0.2 + idx) * 1.5;
        const jitterY = Math.cos(p.frameCount * 0.17 + idx) * 1.5;
        p.text(line, baseX + jitterX, baseY + jitterY);
        baseY += 12;
      });

      if (speaking && osc) {
        const freq = p.map(p.noise(p.frameCount * 0.02), 0, 1, 160, 640);
        osc.freq(freq);
      }
    };

    const toggleVoice = () => {
      speaking = !speaking;
      if (speaking) {
        if (!osc) {
          osc = new p5.Oscillator('square');
          osc.freq(200);
          osc.amp(0);
          osc.start();
        }
        osc.amp(0.08, 0.2);
      } else if (osc) {
        osc.amp(0, 0.2);
      }
    };

    p.mousePressed = () => {
      toggleVoice();
      return false;
    };

    p.touchStarted = () => {
      toggleVoice();
      return false;
    };
  };

  new p5(sketch, mount);
})();
