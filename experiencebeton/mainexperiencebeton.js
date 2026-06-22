/* ── 1. Source des tuiles ── */
const TILE_SOURCE = "./carto-tiles/carto.dzi";

/* ── 2. Init OpenSeadragon ── */
const viewer = OpenSeadragon({
  id:                    "viewer",
  tileSources:           TILE_SOURCE,
  prefixUrl:             "https://cdn.jsdelivr.net/npm/openseadragon@5.0/build/openseadragon/images/",

  defaultZoomLevel:      0,
  minZoomLevel:          0,
  maxZoomLevel:          20,
  visibilityRatio:       1,
  constrainDuringPan:    true,

  immediateRender:       false,
  placeholderFillStyle:  "#111110",
  showNavigationControl: false,
  showNavigator:         false,

  gestureSettingsMouse: {
    scrollToZoom:   false,
    clickToZoom:    false,
    dblClickToZoom: false,
    dragToPan:      false,
  },
  gestureSettingsTouch: {
    pinchToZoom: false,
    clickToZoom: false,
    dragToPan:   false,
  },

  animationTime: 0.8,
  blendTime:     0.2,
});

/* ── 3. Chargement des zones ── */
let zones = [];

fetch("./zone.json")
  .then(r => r.json())
  .then(data => {
    zones = data;
    if (viewer.world.getItemCount() > 0) {
      construireOverlay();
    } else {
      viewer.addHandler("open", construireOverlay);
    }
  })
  .catch(err => console.error("Erreur zone.json :", err));

/* ── 4. Overlay SVG ── */
const svgOverlay    = document.getElementById("zones-overlay");
const tooltip       = document.getElementById("tooltip");
const tooltipLabel  = document.getElementById("tooltip-label");
const tooltipResume = document.getElementById("tooltip-resume");

function construireOverlay() {
  svgOverlay.innerHTML = "";

  zones.forEach(zone => {
    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("class", "zone");
    rect.dataset.id = zone.id;
    positionnerZone(rect, zone);

    rect.addEventListener("mouseenter", (e) => afficherTooltip(e, zone));
    rect.addEventListener("mousemove",  (e) => deplacerTooltip(e));
    rect.addEventListener("mouseleave", () => cacherTooltip());
    rect.addEventListener("click",      () => ouvrirZone(zone));

    svgOverlay.appendChild(rect);
  });

  viewer.addHandler("animation",        recalculerOverlay);
  viewer.addHandler("animation-finish", recalculerOverlay);
  viewer.addHandler("resize",           recalculerOverlay);
}

function positionnerZone(rectEl, zone) {
  const item = viewer.world.getItemAt(0);
  if (!item) return;
  const imgW = item.source.width;
  const imgH = item.source.height;

  const tl = viewer.viewport.imageToViewerElementCoordinates(
    new OpenSeadragon.Point(zone.x * imgW, zone.y * imgH)
  );
  const br = viewer.viewport.imageToViewerElementCoordinates(
    new OpenSeadragon.Point((zone.x + zone.width) * imgW, (zone.y + zone.height) * imgH)
  );

  rectEl.setAttribute("x",      tl.x);
  rectEl.setAttribute("y",      tl.y);
  rectEl.setAttribute("width",  br.x - tl.x);
  rectEl.setAttribute("height", br.y - tl.y);
}

function recalculerOverlay() {
  if (!viewer.world.getItemCount()) return;
  svgOverlay.querySelectorAll(".zone").forEach(rectEl => {
    const zone = zones.find(z => z.id === rectEl.dataset.id);
    if (zone) positionnerZone(rectEl, zone);
  });
}

/* ── 5. Tooltip ── */
function afficherTooltip(e, zone) {
  tooltipLabel.textContent  = zone.label;
  tooltipResume.textContent = zone.resume;
  tooltip.classList.add("visible");
  deplacerTooltip(e);
}

function deplacerTooltip(e) {
  const offset = 16;
  let x = e.clientX + offset;
  let y = e.clientY + offset;
  if (x + 240 > window.innerWidth)  x = e.clientX - 240 - offset;
  if (y + 80  > window.innerHeight) y = e.clientY - 80  - offset;
  tooltip.style.left = x + "px";
  tooltip.style.top  = y + "px";
}

function cacherTooltip() {
  tooltip.classList.remove("visible");
}

/* ── 6. Ouverture zone ── */
const panneau        = document.getElementById("panneau");
const panneauContenu = document.getElementById("panneau-contenu");
const btnFermer      = document.getElementById("panneau-fermer");
let zoneActive       = null;

function ouvrirZone(zone) {
  document.querySelectorAll(".zone").forEach(el => el.classList.remove("active"));
  const zoneEl = svgOverlay.querySelector(`[data-id="${zone.id}"]`);
  if (zoneEl) zoneEl.classList.add("active");
  zoneActive = zone.id;

  panneau.classList.add("ouvert");

fetch(zone.article.fichier)
    .then(r => r.text())
    .then(html => {
      panneauContenu.innerHTML = `
        <p class="art-titre">${zone.article.titre}</p>
        <p class="art-sous-titre">${zone.article.sous_titre}</p>
        ${html}
      `;
    });
  setTimeout(() => zoomVersZone(zone), 350);
}

function zoomVersZone(zone) {
  const item = viewer.world.getItemAt(0);
  if (!item) return;
  const imgW = item.source.width;
  const imgH = item.source.height;
  const ratio = imgH / imgW;

  // Le panneau prend 50% de l'écran
  // La zone visible pour la carte = 50% de l'écran à gauche
  const fractionVisible = 0.5;

  // Zoom pour que la zone tienne dans les 50% visibles
  // En coordonnées viewport OSD, l'image entière fait une largeur de 1
    const zoomPourLargeur = fractionVisible / zone.width;
    const zoomPourHauteur = (window.innerHeight / window.innerWidth) / (zone.height * ratio);
    const zoomCible       = Math.min(zoomPourLargeur, zoomPourHauteur);

  // Centre de la zone en coordonnées viewport
  const centreZoneX = zone.x + zone.width  / 2;
  const centreZoneY = (zone.y + zone.height / 2) * ratio;

  // OSD centre sur le point donné au milieu de l'écran ENTIER
  // On veut que la zone soit centrée dans la moitié gauche
  // Donc on décale le point de centrage vers la droite de 25% de la largeur viewport
  // (car le centre de la moitié gauche est à 25% de la largeur totale)
  // En coordonnées viewport : 0.25 / zoomCible
  const decalage = 0.25 / zoomCible;
  const centreAjuste = new OpenSeadragon.Point(
    centreZoneX + decalage,
    centreZoneY
  );

  viewer.viewport.zoomTo(zoomCible, null, false);
  viewer.viewport.panTo(centreAjuste, false);
}

function retourAccueil() {
  viewer.viewport.goHome(false);
  panneau.classList.remove("ouvert");
  document.querySelectorAll(".zone").forEach(el => el.classList.remove("active"));
  zoneActive = null;
}

btnFermer.addEventListener("click", retourAccueil);
document.getElementById("zone-prev").addEventListener("click", () => naviguerZone(-1));
document.getElementById("zone-next").addEventListener("click", () => naviguerZone(1));

function naviguerZone(direction) {
  if (!zones.length) return;
  const indexActuel = zones.findIndex(z => z.id === zoneActive);
  const indexSuivant = (indexActuel + direction + zones.length) % zones.length;
  ouvrirZone(zones[indexSuivant]);
}

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") retourAccueil();
});

/* ── 7. Resize ── */
window.addEventListener("resize", () => {
  recalculerOverlay();
  if (zoneActive) {
    const zone = zones.find(z => z.id === zoneActive);
    if (zone) zoomVersZone(zone);
  }
});