// bouger.js
(function() {
  const CLICK_THRESHOLD = 5; // px

  function initDrag() {
    document.querySelectorAll('.image').forEach(img => {
      let isDragging = false,
          moved       = false,
          startX      = 0,
          startY      = 0,
          offsetX     = 0,
          offsetY     = 0,
          initialLeft = 0,
          initialTop  = 0;

      // Bloque la navigation du lien s'il y a eu drag
      function blockNextClick(link) {
        const prevent = e => {
          e.preventDefault();
          e.stopImmediatePropagation();
          link.removeEventListener('click', prevent);
        };
        link.addEventListener('click', prevent, { once: true });
      }

      // Démarrage drag/touch
      function onStart(clientX, clientY) {
        isDragging = true;
        moved      = false;
        startX     = clientX;
        startY     = clientY;

        // Récupère les left/top courants dans CSS
        const cs = window.getComputedStyle(img);
        initialLeft = parseFloat(cs.left) || 0;
        initialTop  = parseFloat(cs.top)  || 0;

        // Calcule l'offset au sein de l'image
        offsetX = clientX - img.getBoundingClientRect().left;
        offsetY = clientY - img.getBoundingClientRect().top;

        img.style.cursor             = 'grabbing';
        img.style.animationPlayState = 'paused';
      }

      // Mouvement drag/touch
      function onMove(clientX, clientY) {
        if (!isDragging) return;

        const dx = clientX - startX;
        const dy = clientY - startY;
        if (!moved && Math.hypot(dx, dy) > CLICK_THRESHOLD) {
          moved = true;
        }

        // Nouvelle position = position initiale + delta
        img.style.left = (initialLeft + dx) + 'px';
        img.style.top  = (initialTop  + dy) + 'px';
      }

      // Fin drag/touch
      function onEnd() {
        if (!isDragging) return;
        isDragging = false;
        img.style.cursor             = 'grab';
        img.style.animationPlayState = '';

        if (moved) {
          const link = img.closest('a');
          if (link) blockNextClick(link);
        }
      }

      // — Événements souris —
      img.addEventListener('mousedown', e => {
        e.preventDefault();
        onStart(e.clientX, e.clientY);
      });
      document.addEventListener('mousemove', e => onMove(e.clientX, e.clientY));
      document.addEventListener('mouseup',  onEnd);

      // — Événements tactiles —
      img.addEventListener('touchstart', e => {
        if (e.touches.length === 1) {
          const t = e.touches[0];
          onStart(t.clientX, t.clientY);
        }
      }, { passive: false });

      document.addEventListener('touchmove', e => {
        if (!isDragging || e.touches.length !== 1) return;
        const t = e.touches[0];
        onMove(t.clientX, t.clientY);
        e.preventDefault();
      }, { passive: false });

      document.addEventListener('touchend',   onEnd);
      document.addEventListener('touchcancel', onEnd);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDrag);
  } else {
    initDrag();
  }
})();






document.addEventListener('mousemove', (e) => {
  const images = document.querySelectorAll('.image');
  const mouseX = e.clientX;
  const mouseY = e.clientY;

  images.forEach((img) => {
    const rect = img.getBoundingClientRect();
    const imgCenterX = rect.left + rect.width / 2;
    const imgCenterY = rect.top + rect.height / 2;

    const dx = imgCenterX - mouseX;
    const dy = imgCenterY - mouseY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 100) {
      // Si la souris est trop proche, ne pas bouger l'image
      img.style.transform = 'translate(0px, 0px)';
      return;
    }

    const normX = dx / distance;
    const normY = dy / distance;

    const strength = Math.min(100, 700 / distance);
    const moveX = normX * strength;
    const moveY = normY * strength;

    img.style.transform = `translate(${moveX}px, ${moveY}px)`;
  });
});

document.addEventListener('mouseleave', () => {
  const images = document.querySelectorAll('.image');
  images.forEach((img) => {
    img.style.transform = 'translate(0px, 0px)';
  });
});
