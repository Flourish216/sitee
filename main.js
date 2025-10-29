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
    const safeRadius = 170;
    const flashDuration = 220;

    const teleportButton = () => {
      const heroRect = hero.getBoundingClientRect();
      const buttonRect = ctaButton.getBoundingClientRect();
      const padding = 60;
      const minX = heroRect.left + padding;
      const maxX = heroRect.right - padding - buttonRect.width;
      const minY = heroRect.top + padding;
      const maxY = heroRect.bottom - padding - buttonRect.height;
      const randomX = Math.random() * (maxX - minX) + minX;
      const randomY = Math.random() * (maxY - minY) + minY;
      ctaButton.style.left = `${randomX - heroRect.left}px`;
      ctaButton.style.top = `${randomY - heroRect.top}px`;
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
      ctaButton.style.left = '50%';
      ctaButton.style.top = '0';
      ctaButton.style.transform = 'translate(-50%, 0)';
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
    const secretLink = document.querySelector('.secret-see-projects');
    fakeNavLink.setAttribute('role', 'button');
    fakeNavLink.setAttribute('tabindex', '0');
    fakeNavLink.setAttribute('aria-label', 'This link is a decoy');

    const nudgeSecret = () => {
      showKonamiToast('Decoy! The real portal is hiding down left.');
      if (secretLink) {
        secretLink.classList.add('attention');
        setTimeout(() => secretLink.classList.remove('attention'), 5200);
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
