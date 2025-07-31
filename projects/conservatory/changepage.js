if (window.innerWidth < 768) { // bouger.js
(function() {
  const threshold  = 200;  // px à tirer
  const minHoldTime = 300; // ms à maintenir le tirage
  let startY = 0, pullDistance = 0, canPull = false;
  let pullStartTime = 0;

  function getActiveIndicator() {
    return Array.from(document.querySelectorAll('.pull-next-indicator'))
      .find(el => getComputedStyle(el).display !== 'none');
  }

  document.addEventListener('touchstart', e => {
    const atBottom = window.innerHeight + window.scrollY >= document.body.scrollHeight;
    if (atBottom) {
      canPull   = true;
      startY    = e.touches[0].clientY;
      pullDistance = 0;
      pullStartTime = Date.now();
    }
  });

  document.addEventListener('touchmove', e => {
    if (!canPull) return;
    const indicator = getActiveIndicator();
    if (!indicator) return;

    const currentY = e.touches[0].clientY;
    pullDistance = startY - currentY;

    if (pullDistance > 0) {
      indicator.classList.add('visible');
      const offset = Math.min(pullDistance, 150);
      indicator.style.transform = `translateY(${100 - (offset/1.5)}%)`;

      // Met uniquement à jour le <span class="icon">
      const icon = indicator.querySelector('.icon');
      if (icon) {
        icon.textContent = pullDistance > threshold ? '✓' : '↓';
      }
    }
  }, { passive: true });

  document.addEventListener('touchend', () => {
    if (!canPull) return;
    const indicator = getActiveIndicator();
    if (!indicator) return;

    const heldLongEnough = Date.now() - pullStartTime >= minHoldTime;

    if (pullDistance > threshold && heldLongEnough) {
      const icon = indicator.querySelector('.icon');
      if (icon) icon.textContent = '…';
      window.location.href = indicator.dataset.next;
    } else {
      indicator.classList.remove('visible');
      indicator.style.transform = '';
    }
  });
})();
}