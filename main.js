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
    const safeRadius = 180;
    const flashDuration = 220;
    const initialHeroRect = hero.getBoundingClientRect();
    const initialButtonRect = ctaButton.getBoundingClientRect();
    const anchor = {
      x: initialButtonRect.left - initialHeroRect.left,
      y: initialButtonRect.top - initialHeroRect.top,
    };

    const teleportButton = () => {
      const heroWidth = hero.clientWidth;
      const heroHeight = hero.clientHeight;
      const buttonWidth = ctaButton.offsetWidth;
      const buttonHeight = ctaButton.offsetHeight;
      const paddingX = Math.min(120, Math.max(36, heroWidth * 0.08));
      const paddingY = Math.min(120, Math.max(40, heroHeight * 0.1));
      const minX = paddingX;
      const maxX = Math.max(minX, heroWidth - paddingX - buttonWidth);
      const minY = paddingY;
      const maxY = Math.max(minY, heroHeight - paddingY - buttonHeight);
      const rangeX = Math.min(heroWidth * 0.45, 340);
      const rangeY = Math.min(heroHeight * 0.35, 220);
      let targetX = anchor.x + (Math.random() - 0.5) * rangeX * 2;
      let targetY = anchor.y + (Math.random() - 0.5) * rangeY * 2;
      targetX = Math.min(Math.max(targetX, minX), maxX);
      targetY = Math.min(Math.max(targetY, minY), maxY);
      const offsetX = maxX > minX ? targetX : (heroWidth - buttonWidth) / 2;
      const offsetY = maxY > minY ? targetY : (heroHeight - buttonHeight) / 2;
      ctaButton.style.left = `${offsetX}px`;
      ctaButton.style.top = `${offsetY}px`;
      ctaButton.style.transform = 'translate(0, 0)';
      ctaButton.classList.add('cta-flash');
      setTimeout(() => ctaButton.classList.remove('cta-flash'), flashDuration);
      flashCooldown = Date.now() + 260;
    };

    const handleMove = (event) => {
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
      ctaButton.style.left = `${anchor.x}px`;
      ctaButton.style.top = `${anchor.y}px`;
      ctaButton.style.transform = 'translate(0, 0)';
    };

    hero.style.position = 'relative';
    ctaButton.style.position = 'absolute';
    resetPosition();

    hero.addEventListener('pointermove', handleMove);
    hero.addEventListener('pointerleave', () => {
      flashCooldown = Date.now() + 320;
      resetPosition();
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
