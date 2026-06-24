/* ── 1. Source des tuiles ── */
const TILE_SOURCE = "./carto-tiles/carto.dzi";

/* ── 2. Init OpenSeadragon ── */
const viewer = OpenSeadragon({
  id:                    "viewer",
  tileSources:           TILE_SOURCE,
  prefixUrl:             "https://cdn.jsdelivr.net/npm/openseadragon@5.0/build/openseadragon/images/",

  defaultZoomLevel:      0,
  minZoomLevel:          0.7,
  maxZoomLevel:          9,
  visibilityRatio:       1,
  constrainDuringPan:    true,
  immediateRender:       false,
  placeholderFillStyle:  "#111110",
  showNavigationControl: false,
  showNavigator:         false,

  gestureSettingsMouse: {
    scrollToZoom:   true,
    clickToZoom:    false,
    dblClickToZoom: true,
    dragToPan:      true,
  },
  gestureSettingsTouch: {
    pinchToZoom: true,
    clickToZoom: false,
    dragToPan:   true,
  },

  animationTime: 0.6,
  blendTime:     0.2,
});

/* ── 3. Chargement des zones ── */
let zones = [];

fetch("./zone.json")
  .then(r => r.json())
  .then(data => {
    zones = data;
    construireSommaire();
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
    if (zone.categorie) {
  rect.classList.add(`zone-cat-${zone.categorie}`);
    }

    rect.addEventListener("mouseenter", (e) => {
      if (zoneActive) return;
      afficherTooltip(e, zone);
      afficherCoins(zone.id);
    });
    rect.addEventListener("mousemove",  (e) => {
      if (zoneActive) return;
      deplacerTooltip(e);
    });
    rect.addEventListener("mouseleave", () => {
      cacherTooltip();
      if (zoneActive !== zone.id) cacherCoins(zone.id);
    });
    rect.addEventListener("click", () => ouvrirZone(zone));

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

/* ── 5. Coins SVG ── */
function afficherCoins(id) {
  cacherCoins(id);
  const rectEl = svgOverlay.querySelector(`[data-id="${id}"]`);
  if (!rectEl) return;

  const x      = parseFloat(rectEl.getAttribute("x"));
  const y      = parseFloat(rectEl.getAttribute("y"));
  const w      = parseFloat(rectEl.getAttribute("width"));
  const h      = parseFloat(rectEl.getAttribute("height"));
  const taille = Math.min(w, h) * 0.3;

  const coinHG = document.createElementNS("http://www.w3.org/2000/svg", "image");
  coinHG.setAttribute("class", `coin-zone coin-${id}`);
  coinHG.setAttribute("href", "./coinzone.svg");
  coinHG.setAttribute("x", x);
  coinHG.setAttribute("y", y);
  coinHG.setAttribute("width",  taille);
  coinHG.setAttribute("height", taille);
  coinHG.style.pointerEvents = "none";

  const coinBD = document.createElementNS("http://www.w3.org/2000/svg", "image");
  coinBD.setAttribute("class", `coin-zone coin-${id}`);
  coinBD.setAttribute("href", "./coinzone.svg");
  coinBD.setAttribute("x", x + w - taille);
  coinBD.setAttribute("y", y + h - taille);
  coinBD.setAttribute("width",  taille);
  coinBD.setAttribute("height", taille);
  coinBD.setAttribute("transform", `rotate(180, ${x + w - taille/2}, ${y + h - taille/2})`);
  coinBD.style.pointerEvents = "none";

  svgOverlay.appendChild(coinHG);
  svgOverlay.appendChild(coinBD);
}

function cacherCoins(id) {
  svgOverlay.querySelectorAll(`.coin-${id}`).forEach(el => el.remove());
}

/* ── 6. Tooltip ── */
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

/* ── 7. Ouverture zone ── */
const panneau        = document.getElementById("panneau");
const panneauContenu = document.getElementById("panneau-contenu");
const btnFermer      = document.getElementById("panneau-fermer");
let zoneActive       = null;

function ouvrirZone(zone) {
  document.querySelectorAll(".zone").forEach(el => el.classList.remove("active"));
  const zoneEl = svgOverlay.querySelector(`[data-id="${zone.id}"]`);
  if (zoneEl) zoneEl.classList.add("active");
  cacherCoins(zone.id);
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
  // Retirer les classes de catégorie précédentes
panneau.className = panneau.className.replace(/zone-cat-\S+/g, "").trim();
// Ajouter la catégorie courante
if (zone.categorie) panneau.classList.add(`zone-cat-${zone.categorie}`);
}

function zoomVersZone(zone) {
  const item = viewer.world.getItemAt(0);
  if (!item) return;
  const imgW = item.source.width;
  const imgH = item.source.height;
  const ratio = imgH / imgW;

  const fractionVisible = 0.5;

  const zoomPourLargeur = fractionVisible / zone.width;
  const zoomPourHauteur = (window.innerHeight / window.innerWidth) / (zone.height * ratio);
  const zoomCible       = Math.min(zoomPourLargeur, zoomPourHauteur);

  const centreZoneX = zone.x + zone.width  / 2;
  const centreZoneY = (zone.y + zone.height / 2) * ratio;

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
  if (zoneActive) cacherCoins(zoneActive);
  zoneActive = null;
}

btnFermer.addEventListener("click", retourAccueil);
document.getElementById("zone-prev").addEventListener("click", () => naviguerZone(-1));
document.getElementById("zone-next").addEventListener("click", () => naviguerZone(1));

/* ── Sommaire ── */
const sommaire     = document.getElementById("sommaire");
const btnArticles  = document.getElementById("articles");
let sommaireOuvert = false;

const COL = { article: 1, recit: 2, glitch: 3 };

function construireSommaire() {
  const grille = document.getElementById("sommaire-grille");
  grille.innerHTML = "";

  const n = zones.length;
  grille.style.gridTemplateRows = `repeat(${n}, 1fr)`;

  const fontSize = `calc((100vh - 72px) / ${n} * 0.52)`;
  grille.style.fontSize = fontSize;

  zones.forEach((zone, i) => {
    const item = document.createElement("div");
    item.className = "sommaire-item";
    item.style.gridRow    = i + 1;
    item.style.gridColumn = COL[zone.categorie] || 1;

    const titre = document.createElement("span");
    titre.className = `sommaire-titre cat-${zone.categorie}`;
    titre.textContent = zone.article.titre;

    const sousTitre = document.createElement("span");
    sousTitre.className = "sommaire-sous-titre";
    sousTitre.textContent = zone.article.sous_titre;

    item.appendChild(titre);
    item.appendChild(sousTitre);
    item.addEventListener("click", () => {
      fermerSommaire();
      ouvrirZone(zone);
    });

    grille.appendChild(item);
  });
}

function ouvrirSommaire() {
  sommaire.classList.add("ouvert");
  sommaireOuvert = true;
}

function fermerSommaire() {
  sommaire.classList.remove("ouvert");
  sommaireOuvert = false;
}

btnArticles.addEventListener("click", () => {
  if (sommaireOuvert) fermerSommaire();
  else ouvrirSommaire();
});

function naviguerZone(direction) {
  if (!zones.length) return;
  const indexActuel = zones.findIndex(z => z.id === zoneActive);
  const indexSuivant = (indexActuel + direction + zones.length) % zones.length;
  ouvrirZone(zones[indexSuivant]);
}

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    retourAccueil();
    fermerSommaire();
  }
});

/* ── 8. Resize ── */
window.addEventListener("resize", () => {
  recalculerOverlay();
  if (zoneActive) {
    const zone = zones.find(z => z.id === zoneActive);
    if (zone) zoomVersZone(zone);
  }
});

/* ── 9. Loading overlay ── */
const loadingOverlay = document.getElementById('loading-overlay');

function hideLoadingOverlay() {
  loadingOverlay.classList.add('fade-out');
  setTimeout(() => loadingOverlay.remove(), 650);
}

viewer.addHandler('open', function() {
  const tiledImage = viewer.world.getItemAt(0);
  const fallback = setTimeout(hideLoadingOverlay, 6000);

  if (tiledImage && tiledImage.getFullyLoaded()) {
    clearTimeout(fallback);
    hideLoadingOverlay();
  } else if (tiledImage) {
    tiledImage.addHandler('fully-loaded-change', function onLoaded(e) {
      if (e.fullyLoaded) {
        tiledImage.removeHandler('fully-loaded-change', onLoaded);
        clearTimeout(fallback);
        hideLoadingOverlay();
      }
    });
  }
});