(() => {
  const container = document.getElementById('matrix-project');
  if (!container) return;

  const startBtn = document.getElementById('matrix-start');
  const captureBtn = document.getElementById('matrix-capture');
  const resetBtn = document.getElementById('matrix-reset');
  const statusEl = document.querySelector('[data-matrix-status]');

  const state = {
    stage: 'idle',
    message: 'Enable the camera to begin.',
    revealed: 0,
    total: 0,
  };

  const updateInstructions = () => {
    if (!statusEl) return;
    if (state.stage === 'painting' && state.total) {
      if (state.revealed >= state.total) {
        statusEl.textContent = 'Portrait complete! Reset to capture again.';
      } else {
        statusEl.textContent = `Reveal the portrait square by square (${state.revealed}/${state.total})`;
      }
    } else {
      statusEl.textContent = state.message;
    }
  };

  const updateControls = () => {
    if (startBtn) startBtn.disabled = state.stage === 'live';
    if (captureBtn) captureBtn.disabled = state.stage !== 'live';
    if (resetBtn) resetBtn.disabled = state.stage === 'idle';
    updateInstructions();
  };

  const setStage = (stage, message) => {
    state.stage = stage;
    if (message) state.message = message;
    updateControls();
  };

  const controller = {
    start: () => {},
    capture: () => {},
    reset: () => {},
    progress: (revealed, total) => {
      state.revealed = revealed;
      state.total = total;
      updateInstructions();
    },
  };

  startBtn?.addEventListener('click', () => controller.start());
  captureBtn?.addEventListener('click', () => controller.capture());
  resetBtn?.addEventListener('click', () => controller.reset());

  updateControls();

  const sketch = (p) => {
    const gridCols = 48;
    const gridRows = 36;
    const messages = {
      idle: 'Enable the camera to begin.',
      live: 'Frame yourself and freeze when ready.',
      painting: 'Click tiles to bring the portrait back to life.',
    };

    let video = null;
    let stage = 'idle';
    let cells = [];
    let revealCount = 0;
    let cellW = 1;
    let cellH = 1;
    let canvas;

    const computeCanvasSize = () => {
      const width = container.clientWidth || 480;
      const height = Math.min(width * 0.75, window.innerHeight * 0.65);
      return { width, height };
    };

    const applyCanvasSize = () => {
      const { width, height } = computeCanvasSize();
      if (canvas) {
        p.resizeCanvas(width, height);
      } else {
        canvas = p.createCanvas(width, height);
        canvas.parent(container);
      }
      cellW = p.width / gridCols;
      cellH = p.height / gridRows;
    };

    const stopVideo = () => {
      if (!video) return;
      try {
        video.stop();
      } catch (error) {
        /* ignored */
      }
      video.remove();
      video = null;
    };

    const revealAt = (x, y) => {
      if (stage !== 'painting' || !cells.length) return;
      if (x < 0 || x >= p.width || y < 0 || y >= p.height) return;
      const col = Math.floor(p.constrain(x, 0, p.width - 1) / cellW);
      const row = Math.floor(p.constrain(y, 0, p.height - 1) / cellH);
      const index = row * gridCols + col;
      const cell = cells[index];
      if (!cell || cell.revealed) return;
      cell.revealed = true;
      revealCount += 1;
      controller.progress(revealCount, cells.length);
      if (revealCount === cells.length) {
        setStage('painting', 'Portrait complete! Reset to capture again.');
      }
    };

    controller.start = () => {
      if (stage === 'live') return;
      stopVideo();
      cells = [];
      revealCount = 0;
      controller.progress(0, 0);
      try {
        setStage('live', 'Grant camera access, frame yourself, then freeze the moment.');
        video = p.createCapture(
          {
            video: {
              facingMode: 'user',
              width: gridCols,
              height: gridRows,
            },
            audio: false,
          },
          () => {
            video.elt.setAttribute('playsinline', '');
            video.size(gridCols, gridRows);
            stage = 'live';
            setStage('live', messages.live);
          }
        );
        video.hide();
        stage = 'live';
      } catch (error) {
        console.error(error);
        setStage('idle', 'Camera access was blocked. Check permissions and try again.');
      }
    };

    controller.capture = () => {
      if (stage !== 'live' || !video) return;
      video.loadPixels();
      if (!video.pixels.length) {
        setStage('live', 'Hold still for a moment longer, then freeze again.');
        return;
      }

      cells = [];
      revealCount = 0;

      for (let y = 0; y < gridRows; y += 1) {
        for (let x = 0; x < gridCols; x += 1) {
          const idx = (y * gridCols + x) * 4;
          const r = video.pixels[idx];
          const g = video.pixels[idx + 1];
          const b = video.pixels[idx + 2];
          const gray = 0.2126 * r + 0.7152 * g + 0.0722 * b;
          cells.push({
            r,
            g,
            b,
            gray,
            revealed: false,
          });
        }
      }

      controller.progress(revealCount, cells.length);
      stage = 'painting';
      setStage('painting', messages.painting);
      stopVideo();
    };

    controller.reset = () => {
      stopVideo();
      cells = [];
      revealCount = 0;
      stage = 'idle';
      controller.progress(0, 0);
      setStage('idle', messages.idle);
    };

    p.setup = () => {
      applyCanvasSize();
      p.pixelDensity(1);
      p.noStroke();
      p.textFont('Manrope');
      p.textAlign(p.CENTER, p.CENTER);
      setStage('idle', messages.idle);
    };

    p.draw = () => {
      p.background(246);

      if (stage === 'live' && video) {
        p.push();
        p.translate(p.width, 0);
        p.scale(-1, 1);
        p.image(video, 0, 0, p.width, p.height);
        p.pop();

        p.stroke(255, 255, 255, 110);
        p.noFill();
        for (let x = 0; x <= p.width; x += cellW * 4) {
          p.line(x, 0, x, p.height);
        }
        for (let y = 0; y <= p.height; y += cellH * 4) {
          p.line(0, y, p.width, y);
        }
      } else if (stage === 'painting' && cells.length) {
        p.noStroke();
        let idx = 0;
        for (let row = 0; row < gridRows; row += 1) {
          for (let col = 0; col < gridCols; col += 1) {
            const cell = cells[idx];
            const x = col * cellW;
            const y = row * cellH;
            if (cell.revealed) {
              p.fill(cell.r, cell.g, cell.b);
            } else {
              p.fill(cell.gray);
            }
            p.rect(x, y, cellW + 0.5, cellH + 0.5);
            idx += 1;
          }
        }
      } else {
        p.fill(235);
        p.noStroke();
        p.rect(0, 0, p.width, p.height, 16);
        p.fill(120);
        p.textSize(Math.min(26, p.width * 0.05));
        p.text(messages.idle, p.width / 2, p.height / 2);
      }
    };

    const reveal = () => {
      revealAt(p.mouseX, p.mouseY);
      return false;
    };

    p.mousePressed = reveal;
    p.mouseDragged = reveal;
    p.touchStarted = reveal;
    p.touchMoved = reveal;

    p.windowResized = () => {
      applyCanvasSize();
    };
  };

  new p5(sketch, container);
})();
