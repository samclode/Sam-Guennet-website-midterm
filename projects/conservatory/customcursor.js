// --- custom-cursor.js ---

const customCursor     = document.getElementById('custom-cursor');
const previousProjects = document.querySelectorAll('.previousproject');
const nextProjects     = document.querySelectorAll('.nextproject');

// On utilise le premier lien parent trouvé (fr & en pointent vers la même cible)
const previousLink = previousProjects[0]?.closest('a')?.href || null;
const nextLink     = nextProjects[0]?.closest('a')?.href || null;

const leftCursorImage  = "../../general/flechegauche.svg";
const rightCursorImage = "../../general/flechedroite.svg";

document.addEventListener('mousemove', e => {
  const x      = e.clientX;
  const y      = e.clientY;
  const w      = window.innerWidth;
  const h      = window.innerHeight;
  const zone   = w / 10;
  const margin = 150;
  const inMargin = y < margin || y > h - margin;

  if (inMargin) {
    // zone top/bottom => tout réaffiche
    customCursor.style.display = 'none';
    document.body.style.cursor  = 'default';
    previousProjects.forEach(el => el.style.display = 'block');
    nextProjects.forEach(el     => el.style.display = 'block');
    return;
  }

  if (x < zone && previousLink) {
    // zone « précédent »
    customCursor.style.display        = 'block';
    customCursor.style.left           = `${e.pageX}px`;
    customCursor.style.top            = `${e.pageY}px`;
    customCursor.style.backgroundImage = `url("${leftCursorImage}")`;
    document.body.style.cursor        = 'none';
    previousProjects.forEach(el => el.style.display = 'none');
    nextProjects.forEach(el     => el.style.display = 'block');

  } else if (x > w - zone && nextLink) {
    // zone « suivant »
    customCursor.style.display        = 'block';
    customCursor.style.left           = `${e.pageX}px`;
    customCursor.style.top            = `${e.pageY}px`;
    customCursor.style.backgroundImage = `url("${rightCursorImage}")`;
    document.body.style.cursor        = 'none';
    nextProjects.forEach(el     => el.style.display = 'none');
    previousProjects.forEach(el => el.style.display = 'block');

  } else {
    // zone centrale
    customCursor.style.display = 'none';
    document.body.style.cursor = 'default';
    previousProjects.forEach(el => el.style.display = 'block');
    nextProjects.forEach(el     => el.style.display = 'block');
  }
});

document.addEventListener('click', e => {
  const x      = e.clientX;
  const y      = e.clientY;
  const w      = window.innerWidth;
  const h      = window.innerHeight;
  const zone   = w / 10;
  const margin = 150;

  if (y < margin || y > h - margin) return;
  if (x < zone && previousLink) {
    window.location.href = previousLink;
  } else if (x > w - zone && nextLink) {
    window.location.href = nextLink;
  }
});
