(() => {
  const host = document.getElementById('project-galaxy');
  if (!host) return;

  const satellites = [
    {
      label: 'VOX',
      target: 'projects/robot.html',
      radius: 120,
      speed: 0.012,
      size: 12,
      angle: Math.random() * Math.PI * 2,
      jitter: 0,
    },
    {
      label: 'CANDY',
      target: 'projects/bear.html',
      radius: 170,
      speed: -0.0095,
      size: 14,
      angle: Math.random() * Math.PI * 2,
      jitter: 0,
    },
    {
      label: 'CARPET',
      target: 'projects/carpet.html',
      radius: 210,
      speed: 0.007,
      size: 10,
      angle: Math.random() * Math.PI * 2,
      jitter: 0,
    },
  ];

  const stars = Array.from({ length: 180 }, () => ({
    x: Math.random(),
    y: Math.random(),
    brightness: 40 + Math.random() * 60,
    size: Math.random() * 1.4 + 0.6,
  }));

  const sketch = (p) => {
    const pointer = { x: 0, y: 0, active: false };
    const nodes = satellites.map((sat) => ({ ...sat, pos: p.createVector(0, 0), drift: p.createVector(0, 0) }));
    let canvas;

    const resizeCanvas = () => {
      const width = host.clientWidth;
      const height = Math.max(320, Math.min(width * 0.6, 480));
      if (canvas) {
        p.resizeCanvas(width, height);
      } else {
        canvas = p.createCanvas(width, height);
        canvas.parent(host);
      }
    };

    const openTarget = (href) => {
      window.location.href = href;
    };

    p.setup = () => {
      resizeCanvas();
      p.frameRate(60);
      p.noiseSeed(Math.random() * 1e6);
    };

    p.windowResized = () => resizeCanvas();

    p.mouseMoved = () => {
      pointer.x = p.mouseX;
      pointer.y = p.mouseY;
      pointer.active = pointer.x >= 0 && pointer.x <= p.width && pointer.y >= 0 && pointer.y <= p.height;
    };

    p.mousePressed = () => {
      if (!pointer.active) return;
      const center = p.createVector(p.width / 2, p.height / 2);
      for (const node of nodes) {
        if (p5.Vector.dist(center.copy().add(node.pos), p.createVector(p.mouseX, p.mouseY)) < node.size * 2.4) {
          openTarget(node.target);
          break;
        }
      }
    };

    p.draw = () => {
      p.background(2, 2, 6);
      // starfield
      p.noStroke();
      stars.forEach((star, idx) => {
        const twinkle = Math.sin(p.frameCount * 0.02 + idx) * 0.4 + 0.6;
        p.fill(200, 200, 255, star.brightness * twinkle);
        p.circle(star.x * p.width, star.y * p.height, star.size * twinkle * 1.2);
      });
      const center = p.createVector(p.width / 2, p.height / 2);

      // draw faint orbit rings
      p.noFill();
      satellites.forEach((sat, idx) => {
        p.stroke(255, 255, 255, 12 + idx * 6);
        p.strokeWeight(1);
        p.circle(center.x, center.y, sat.radius * 2);
      });

      // draw connecting lines
        p.stroke(255, 255, 255, 18);
      p.strokeWeight(1);
      p.beginShape();
      nodes.forEach((node) => {
        const pos = node.pos.copy().add(center);
        p.vertex(pos.x, pos.y);
      });
      p.endShape(p.CLOSE);

      nodes.forEach((node, idx) => {
        node.angle += node.speed;
        const orbitX = Math.cos(node.angle) * node.radius;
        const orbitY = Math.sin(node.angle) * node.radius;

        // pointer gravity influence
        const targetPos = p.createVector(orbitX, orbitY);
        if (pointer.active) {
          const mouseVec = p.createVector(pointer.x, pointer.y).sub(center);
          const diff = mouseVec.copy().sub(targetPos);
          const dist = diff.mag() + 1;
          diff.normalize().mult(Math.min(60, 220 / dist));
          node.drift.lerp(diff, 0.08);
        } else {
          node.drift.mult(0.92);
        }

        node.pos = targetPos.copy().add(node.drift);

        const pos = node.pos.copy().add(center);

        // trailing glow
        p.noStroke();
        const glow = 42 + idx * 18;
        p.fill(255, 255, 255, glow * 0.35);
        p.circle(pos.x, pos.y, node.size * 5);

        // satellite body
        p.fill(255);
        p.circle(pos.x, pos.y, node.size * 1.6);

        // label
        p.textAlign(p.CENTER, p.CENTER);
        p.textFont('Manrope');
        p.textSize(node.size * 0.9);
        p.fill(255, 255, 255, 180);
        p.text(node.label, pos.x, pos.y - node.size * 2.4);
      });
    };
  };

  new p5(sketch, host);
})();
