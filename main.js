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
    let flashCooldown = 0;
    const safeRadius = 60;
    const flashDuration = 220;
    let resetTimer = null;

    const initial = {
      left: parseFloat(getComputedStyle(ctaButton).left) || ctaButton.offsetLeft,
      top: parseFloat(getComputedStyle(ctaButton).top) || ctaButton.offsetTop,
    };

    const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

    const scheduleReset = () => {
      clearTimeout(resetTimer);
      resetTimer = setTimeout(() => {
        resetPosition();
      }, 1800);
    };

    const handleMove = (event) => {
      if (!event.isPrimary) return;
      const rect = ctaButton.getBoundingClientRect();
      const pointerX = event.clientX;
      const pointerY = event.clientY;
      const distX = pointerX - (rect.left + rect.width / 2);
      const distY = pointerY - (rect.top + rect.height / 2);
      const distance = Math.hypot(distX, distY);

      if (distance < safeRadius && Date.now() > flashCooldown) {
        flashCooldown = Date.now() + 360;
        const offsetX = clamp((Math.random() - 0.5) * 220, -180, 180);
        const offsetY = clamp((Math.random() - 0.5) * 160, -120, 140);
        ctaButton.style.left = `${initial.left + offsetX}px`;
        ctaButton.style.top = `${initial.top + offsetY}px`;
        ctaButton.classList.add('cta-flash');
        setTimeout(() => ctaButton.classList.remove('cta-flash'), flashDuration);
        scheduleReset();
      }
    };

    const resetPosition = () => {
      ctaButton.style.left = `${initial.left}px`;
      ctaButton.style.top = `${initial.top}px`;
      ctaButton.classList.remove('cta-flash');
    };

    hero.style.position = 'relative';
    ctaButton.style.position = 'absolute';
    resetPosition();

    hero.addEventListener('pointermove', handleMove);
    hero.addEventListener('pointerleave', () => {
      flashCooldown = Date.now() + 320;
      resetPosition();
      clearTimeout(resetTimer);
    });

    ['click', 'pointerdown'].forEach((type) =>
      ctaButton.addEventListener(type, (event) => {
        event.preventDefault();
        event.stopPropagation();
      })
    );

    ctaButton.setAttribute('aria-disabled', 'true');
    ctaButton.setAttribute('tabindex', '-1');
  }

  const fakeNavLink = document.querySelector('.nav-link-fake');
  if (fakeNavLink) {
    const realLink = document.querySelector('.accent-link');
    fakeNavLink.setAttribute('role', 'button');
    fakeNavLink.setAttribute('tabindex', '0');
    fakeNavLink.setAttribute('aria-label', 'This link is a decoy');

    const nudgeSecret = () => {
      showKonamiToast('Decoy! Follow the glow in the title instead.');
      if (realLink) {
        realLink.classList.add('attention');
        setTimeout(() => realLink.classList.remove('attention'), 3600);
      }
    };

    fakeNavLink.addEventListener('click', (event) => {
      event.preventDefault();
      nudgeSecret();
    });

    fakeNavLink.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        nudgeSecret();
      }
    });
  }
})();
