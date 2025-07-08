// switchlanguage.js
(function() {
  const KEY = 'preferredLanguage';

  function switchLanguage(lang) {
    // 1. Sauvegarde
    localStorage.setItem(KEY, lang);

    // 2. Cacher TOUT ce qui a une classe lang-en ou lang-fr
    document.querySelectorAll('.lang-en, .lang-fr').forEach(el => {
      el.style.display = 'none';
    });

    // 3. Afficher uniquement LES ÉLÉMENTS de la langue choisie
    document.querySelectorAll('.lang-' + lang).forEach(el => {
      // on remet l'affichage par défaut :
      el.style.display = '';
    });

    // 4. Mettre à jour les boutons
    document.querySelectorAll('.langswitch a').forEach(link => {
      link.classList.toggle('active', link.classList.contains('lang' + lang));
    });
  }

  // exposer pour onclick inline
  window.switchLanguage = switchLanguage;

  // Au chargement, on applique la langue sauvegardée
  document.addEventListener('DOMContentLoaded', () => {
    const saved = localStorage.getItem(KEY) || 'en';
    switchLanguage(saved);
  });
})();