/* ── 1. Source des tuiles ── */
const TILE_SOURCE = "https://samguennet.fr/carto-tiles/carto.dzi";

/* ── 2. Init OpenSeadragon ── */
const viewer = OpenSeadragon({
  id:                    "viewer",
  tileSources:           TILE_SOURCE,
  prefixUrl:             "https://cdnjs.cloudflare.com/ajax/libs/openseadragon/4.1.0/images/",
  defaultZoomLevel:      1,
  minZoomLevel:          0.5,
  maxZoomLevel:          20,
  visibilityRatio:       0.8,
  constrainDuringPan:    true,
  immediateRender:       false,
  placeholderFillStyle:  "#111110",
  showNavigationControl: false,
  showNavigator:         false,
  gestureSettingsMouse: {
    scrollToZoom:   true,
    clickToZoom:    false,
    dblClickToZoom: true,
  },
  gestureSettingsTouch: {
    pinchToZoom: true,
    clickToZoom: false,
  },
  animationTime: 0.5,
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

  zoomVersZone(zone);

  panneauContenu.innerHTML = `
    <h2>${zone.label}</h2>
    <h3>${zone.article.titre}</h3>
    ${zone.article.contenu}
  `;

  panneau.classList.add("ouvert");
}

function zoomVersZone(zone) {
  const item = viewer.world.getItemAt(0);
  if (!item) return;
  const imgW = item.source.width;
  const imgH = item.source.height;

  const vpRect = new OpenSeadragon.Rect(
    zone.x,
    zone.y * (imgH / imgW),
    zone.width,
    zone.height * (imgH / imgW)
  );

  const centre      = vpRect.getCenter();
  const panneauPx   = 380;
  const decalage    = (panneauPx / 2) / window.innerWidth;
  const centreAjuste = new OpenSeadragon.Point(centre.x - decalage, centre.y);
  const zoomCible   = Math.min(
    (0.6) / zone.width,
    (0.6) / (zone.height * (imgH / imgW))
  );

  viewer.viewport.zoomTo(Math.max(zoomCible, 2), null, false);
  viewer.viewport.panTo(centreAjuste, false);
}

function fermerPanneau() {
  panneau.classList.remove("ouvert");
  document.querySelectorAll(".zone").forEach(el => el.classList.remove("active"));
  zoneActive = null;
}

btnFermer.addEventListener("click", fermerPanneau);

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") fermerPanneau();
});

/* ── 7. Resize ── */
window.addEventListener("resize", () => {
  recalculerOverlay();
  if (zoneActive) {
    const zone = zones.find(z => z.id === zoneActive);
    if (zone) zoomVersZone(zone);
  }
});