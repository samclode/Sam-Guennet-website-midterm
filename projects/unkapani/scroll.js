(function() {
  const container = document.querySelector('.maincontainer');
  if (!container) return;

  let startY = 0;

  function isAtBottom() {
    return Math.ceil(container.scrollTop + container.clientHeight) >= container.scrollHeight;
  }

  container.addEventListener('touchstart', e => {
    startY = e.touches[0].clientY;
  }, { passive: true });

  container.addEventListener('touchmove', e => {
    const currentY = e.touches[0].clientY;
    const deltaY = startY - currentY;
    startY = currentY;

    if (deltaY > 0 && isAtBottom()) {
      // On coupe immédiatement le scroll interne
      container.style.overflowY = 'hidden';
      // On scroll la page immédiatement
      window.scrollBy(0, deltaY);
      // On remet le scroll interne au prochain frame (sans délai visible)
      requestAnimationFrame(() => {
        container.style.overflowY = 'auto';
      });
      e.preventDefault();
    }
  }, { passive: false });

  container.addEventListener('touchend', () => {
    container.style.overflowY = 'auto';
  });
})();