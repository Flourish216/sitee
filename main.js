(() => {
  const KONAMI_SEQUENCE = [
    'ArrowUp',
    'ArrowUp',
    'ArrowDown',
    'ArrowDown',
    'ArrowLeft',
    'ArrowRight',
    'ArrowLeft',
    'ArrowRight',
    'KeyB',
    'KeyA',
  ];

  let konamiIndex = 0;
  let konamiActive = false;

  const setKonamiState = (state) => {
    konamiActive = state;
    window.konamiActive = state;
    document.body.classList.toggle('konami-mode', state);
    window.dispatchEvent(new CustomEvent('konami:change', { detail: { active: state } }));
    showKonamiToast(state ? 'Konami Dreamland: ON' : 'Calm lab restored');
  };

  const showKonamiToast = (message) => {
    const toast = document.createElement('div');
    toast.className = 'konami-toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('visible'));
    setTimeout(() => {
      toast.classList.remove('visible');
      setTimeout(() => toast.remove(), 320);
    }, 1800);
  };

  window.konamiActive = false;

  window.addEventListener('keydown', (event) => {
    const key = event.code || event.key;

    if (key === KONAMI_SEQUENCE[konamiIndex]) {
      konamiIndex += 1;
      if (konamiIndex === KONAMI_SEQUENCE.length) {
        setKonamiState(!konamiActive);
        konamiIndex = 0;
      }
    } else {
      konamiIndex = key === KONAMI_SEQUENCE[0] ? 1 : 0;
    }
  });

  const hero = document.querySelector('.hero');
  const ctaButton = hero ? hero.querySelector('.btn') : null;
  if (hero && ctaButton) {
    let escapes = 0;
    const maxEscapes = 2;
    const resetTransform = () => {
      ctaButton.style.transform = 'translate(0, 0)';
    };

    const runAway = () => {
      const offsetX = (Math.random() - 0.5) * 360;
      const offsetY = (Math.random() - 0.3) * 220;
      ctaButton.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
      escapes += 1;
      setTimeout(resetTransform, 420);
      if (escapes >= maxEscapes) {
        hero.removeEventListener('pointermove', handleMove);
        setTimeout(resetTransform, 600);
      }
    };

    const handleMove = (event) => {
      if (escapes >= maxEscapes) return;
      const rect = ctaButton.getBoundingClientRect();
      const pointerX = event.clientX;
      const pointerY = event.clientY;
      const distX = pointerX - (rect.left + rect.width / 2);
      const distY = pointerY - (rect.top + rect.height / 2);
      const distance = Math.hypot(distX, distY);
      if (distance < 120) {
        runAway();
      }
    };

    hero.addEventListener('pointermove', handleMove);
    ctaButton.addEventListener('pointerleave', resetTransform);
    ctaButton.addEventListener('click', () => (escapes = maxEscapes));
  }
})();
