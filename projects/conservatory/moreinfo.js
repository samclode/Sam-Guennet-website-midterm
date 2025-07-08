// --- plus-info.js ---
function rotate(iconId, infoId) {
  const icon = document.getElementById(iconId);
  const info = document.getElementById(infoId);
  if (!icon || !info) return;

  // Toggle de l'affichage
  const isOpen = info.classList.toggle('visible');

  // Rotation de l'icône
  icon.style.transform = isOpen ? 'rotate(90deg)' : 'rotate(0deg)';
}

// Expose la fonction au scope global pour l’onclick inline
window.rotate = rotate;
