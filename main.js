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
    const safeRadius = 52;
    const flashDuration = 220;
    const heroRect = hero.getBoundingClientRect();
    const buttonRect = ctaButton.getBoundingClientRect();
    const buttonWidth = buttonRect.width;
    const buttonHeight = buttonRect.height;
    const heroWidth = hero.clientWidth;
    const heroHeight = hero.clientHeight;
    const baseCenter = {
      x: buttonRect.left - heroRect.left + buttonWidth / 2,
      y: buttonRect.top - heroRect.top + buttonHeight / 2,
    };
    const baseOffsetX = baseCenter.x - heroWidth / 2;
    const baseTop = baseCenter.y - buttonHeight / 2;
    const paddingX = Math.min(120, Math.max(36, heroWidth * 0.08));
    const paddingY = Math.min(120, Math.max(40, heroHeight * 0.12));
    const minCenterX = paddingX + buttonWidth / 2;
    const maxCenterX = heroWidth - paddingX - buttonWidth / 2;
    const minCenterY = paddingY + buttonHeight / 2;
    const maxCenterY = heroHeight - paddingY - buttonHeight / 2;
    let resetTimer = null;

    const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

    const applyPosition = (offsetX, offsetY) => {
      ctaButton.style.transform = `translate(-50%, 0) translate(${baseOffsetX + offsetX}px, ${offsetY}px)`;
    };

    const scheduleReset = () => {
      clearTimeout(resetTimer);
      resetTimer = setTimeout(() => {
        resetPosition();
      }, 1800);
    };

    const teleportButton = () => {
      const radiusX = Math.min(hero.clientWidth * 0.28, 220);
      const radiusY = Math.min(hero.clientHeight * 0.22, 180);
      const theta = Math.random() * (Math.PI * 2);
      let nextCenterX = baseCenter.x + Math.cos(theta) * radiusX;
      let nextCenterY = baseCenter.y + Math.sin(theta) * radiusY;
      nextCenterX = clamp(nextCenterX, minCenterX, maxCenterX);
      nextCenterY = clamp(nextCenterY, minCenterY, maxCenterY);
      const offsetX = nextCenterX - baseCenter.x;
      const offsetY = nextCenterY - baseCenter.y;
      applyPosition(offsetX, offsetY);
      ctaButton.classList.add('cta-flash');
      setTimeout(() => ctaButton.classList.remove('cta-flash'), flashDuration);
      flashCooldown = Date.now() + 260;
      scheduleReset();
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
        teleportButton();
      }
    };

    const resetPosition = () => {
      applyPosition(0, 0);
      ctaButton.classList.remove('cta-flash');
    };

    hero.style.position = 'relative';
    ctaButton.style.position = 'absolute';
    ctaButton.style.left = '50%';
    ctaButton.style.top = `${baseTop}px`;
    applyPosition(0, 0);

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
