// JS pour gérer le cercle noir sur les images liens
const cursorCircle = document.getElementById('cursor-circle');

// Sélectionne toutes les images qui sont dans des liens (<a><img>...</a>)
const linkedImages = document.querySelectorAll('a img');

linkedImages.forEach(img => {
  img.addEventListener('mouseenter', () => {
    cursorCircle.style.display = 'block'; // Affiche le cercle au survol
  });
  img.addEventListener('mouseleave', () => {
    cursorCircle.style.display = 'none';  // Cache le cercle en sortie
  });
});

window.addEventListener('mousemove', (e) => {
  // Met à jour la position du cercle à la position de la souris
  cursorCircle.style.left = e.clientX + 'px';
  cursorCircle.style.top = e.clientY + 'px';
});
