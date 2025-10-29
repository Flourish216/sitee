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

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

  const hero = document.querySelector('.hero');
  const ctaButton = hero ? hero.querySelector('.btn') : null;
  if (hero && ctaButton) {
    let targetOffset = { x: 0, y: 0 };
    let currentOffset = { x: 0, y: 0 };
    const maxOffset = 260;
    const safeRadius = 160;

    const animate = () => {
      currentOffset.x += (targetOffset.x - currentOffset.x) * 0.12;
      currentOffset.y += (targetOffset.y - currentOffset.y) * 0.12;
      if (Math.abs(currentOffset.x) < 0.05) currentOffset.x = 0;
      if (Math.abs(currentOffset.y) < 0.05) currentOffset.y = 0;
      ctaButton.style.transform = `translate(${currentOffset.x}px, ${currentOffset.y}px)`;
      requestAnimationFrame(animate);
    };
    animate();

    const updateTarget = (pointerX, pointerY) => {
      const rect = ctaButton.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const dx = pointerX - centerX;
      const dy = pointerY - centerY;
      const distance = Math.hypot(dx, dy) || 0.001;

      if (distance < safeRadius) {
        const normX = dx / distance;
        const normY = dy / distance;
        const push = (safeRadius - distance) * 1.2 + 120;
        targetOffset = {
          x: clamp(targetOffset.x - normX * push, -maxOffset, maxOffset),
          y: clamp(targetOffset.y - normY * push, -maxOffset, maxOffset),
        };
      } else {
        targetOffset.x *= 0.9;
        targetOffset.y *= 0.9;
        if (Math.abs(targetOffset.x) < 0.2) targetOffset.x = 0;
        if (Math.abs(targetOffset.y) < 0.2) targetOffset.y = 0;
      }
    };

    const handleMove = (event) => {
      updateTarget(event.clientX, event.clientY);
    };

    hero.addEventListener('pointermove', handleMove);
    hero.addEventListener('pointerleave', () => {
      targetOffset = { x: 0, y: 0 };
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
