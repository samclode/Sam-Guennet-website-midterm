// gravity.js
window.addEventListener('load', () => {
  // On attend 1 seconde avant de démarrer la chute
  setTimeout(() => {
    document.querySelectorAll('.image').forEach(img => {
      // Lecture de la position de départ
      let rect    = img.getBoundingClientRect();
      let posY    = rect.top;
      let velocity = 0;           // vitesse initiale
      const g     = 0.0015;       // accélération (px / ms²)
      const floor = window.innerHeight - img.offsetHeight;
      
      // On force position absolute et enlève toute transition
      img.style.position = 'absolute';
      img.style.transition = '';

      let lastTime = null;
      function step(timestamp) {
        if (!lastTime) lastTime = timestamp;
        let dt = timestamp - lastTime; // en ms
        lastTime = timestamp;

        // mise à jour de la vitesse et de la position
        velocity += g * dt;
        posY     += velocity * dt;

        // si on touche le sol...
        if (posY >= floor) {
          posY = floor;
          img.style.top = posY + 'px';
          return; // on arrête l'animation
        }

        // applique la nouvelle position
        img.style.top = posY + 'px';
        requestAnimationFrame(step);
      }

      requestAnimationFrame(step);
    });
  }, 1000);
});
