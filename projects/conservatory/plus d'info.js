let angle = 0;
let direction = 1;

function rotate() {
  const icon = document.getElementById("plusicon");
  const info = document.getElementById("infosection");

  angle += 90 * direction;
  icon.style.transform = `rotate(${angle}deg)`;
  direction *= -1;

  info.classList.toggle("visible");
}

const customCursor = document.getElementById('custom-cursor');

// On récupère les divs .previousproject et .nextproject
const previousProject = document.querySelector('.previousproject');
const nextProject = document.querySelector('.nextproject');

// Vérifie si ces divs sont dans un <a> (donc cliquables)
const previousLink = previousProject?.closest('a')?.href || null;
const nextLink = nextProject?.closest('a')?.href || null;

const leftCursorImage = "../../general/flechegauche.svg";
const rightCursorImage = "../../general/flechedroite.svg";

document.addEventListener('mousemove', (e) => {
  const x = e.clientX;
  const y = e.clientY;
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;
  const zoneWidth = screenWidth / 10;
  const marginHeight = 150;

  const inTopOrBottomMargin = y < marginHeight || y > screenHeight - marginHeight;

  if (inTopOrBottomMargin) {
    customCursor.style.display = 'none';
    document.body.style.cursor = 'default';
    if (previousProject) previousProject.style.display = 'block';
    if (nextProject) nextProject.style.display = 'block';
    return;
  }

  if (x < zoneWidth && previousLink) {
    customCursor.style.display = 'block';
    customCursor.style.left = e.pageX + 'px';
    customCursor.style.top = e.pageY + 'px';
    customCursor.style.backgroundImage = `url("${leftCursorImage}")`;
    document.body.style.cursor = 'none';
    if (previousProject) previousProject.style.display = 'none';
    if (nextProject) nextProject.style.display = 'block';
  } else if (x > screenWidth - zoneWidth && nextLink) {
    customCursor.style.display = 'block';
    customCursor.style.left = e.pageX + 'px';
    customCursor.style.top = e.pageY + 'px';
    customCursor.style.backgroundImage = `url("${rightCursorImage}")`;
    document.body.style.cursor = 'none';
    if (nextProject) nextProject.style.display = 'none';
    if (previousProject) previousProject.style.display = 'block';
  } else {
    customCursor.style.display = 'none';
    document.body.style.cursor = 'default';
    if (previousProject) previousProject.style.display = 'block';
    if (nextProject) nextProject.style.display = 'block';
  }
});

document.addEventListener('click', (e) => {
  const x = e.clientX;
  const y = e.clientY;
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;
  const zoneWidth = screenWidth / 10;
  const marginHeight = 150;

  if (y < marginHeight || y > screenHeight - marginHeight) return;

  if (x < zoneWidth && previousLink) {
    window.location.href = previousLink;
  } else if (x > screenWidth - zoneWidth && nextLink) {
    window.location.href = nextLink;
  }
});
