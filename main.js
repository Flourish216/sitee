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
  const ctaWrapper = hero ? hero.querySelector('.cta-wrapper') : null;
  const ctaButton = ctaWrapper ? ctaWrapper.querySelector('.btn') : null;
  if (hero && ctaWrapper && ctaButton) {
    let flashCooldown = 0;
    const safeRadius = 60;
    const flashDuration = 220;
    let resetTimer = null;

    const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

    const applyTransform = (x, y) => {
      ctaWrapper.style.transform = `translate(${x}px, ${y}px)`;
    };

    const resetTransform = () => {
      applyTransform(0, 0);
      ctaWrapper.classList.remove('cta-ghost');
    };

    const scheduleReset = () => {
      clearTimeout(resetTimer);
      resetTimer = setTimeout(() => {
        resetTransform();
      }, 1800);
    };

    const handleMove = (event) => {
      if (!event.isPrimary) return;
      const rect = ctaWrapper.getBoundingClientRect();
      const pointerX = event.clientX;
      const pointerY = event.clientY;
      const distX = pointerX - (rect.left + rect.width / 2);
      const distY = pointerY - (rect.top + rect.height / 2);
      const distance = Math.hypot(distX, distY);

      if (distance < safeRadius && Date.now() > flashCooldown) {
        flashCooldown = Date.now() + 360;
        const maxOffsetX = Math.min(hero.clientWidth * 0.25, 160);
        const maxOffsetY = Math.min(hero.clientHeight * 0.18, 110);
        const offsetX = clamp((Math.random() - 0.5) * 2 * maxOffsetX, -maxOffsetX, maxOffsetX);
        const offsetY = clamp((Math.random() - 0.5) * 2 * maxOffsetY, -maxOffsetY, maxOffsetY);
        applyTransform(offsetX, offsetY);
        ctaWrapper.classList.add('cta-ghost');
        setTimeout(() => ctaWrapper.classList.remove('cta-ghost'), flashDuration);
        scheduleReset();
      }
    };

    hero.style.position = 'relative';
    resetTransform();

    hero.addEventListener('pointermove', handleMove);
    hero.addEventListener('pointerleave', () => {
      flashCooldown = Date.now() + 320;
      resetTransform();
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
