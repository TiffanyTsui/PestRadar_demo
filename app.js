// ============================================================
// Pest Radar — Global Spread Case (GNORAB)
// Static, no backend, no storage APIs.
// ============================================================
// Leaflet is loaded as a classic <script> before this module, exposing window.L.
const L = window.L;

import { initI18n, onLangChange, t } from "./i18n.js";

const MIN_YEAR = 2008; // first EPPO first-report year (2004-2007 had no reports)
const MAX_YEAR = 2026;

// Default focus: Europe + Mediterranean. Users can zoom out to the whole world.
const EURO_VIEW = { center: [42.5, 12], zoom: 4 };
const MIN_ZOOM = 2;
const MAX_ZOOM = 9;

// ---- Theme toggle (no persistence — sandbox blocks storage) ----
(function () {
  const toggles = [...document.querySelectorAll("[data-theme-toggle]")];
  const r = document.documentElement;
  // Dark is the default experience for the map; users can switch to light.
  let d = "dark";
  r.setAttribute("data-theme", d);
  const sun = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>';
  const moon = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
  function render() {
    toggles.forEach((t) => {
      t.innerHTML = d === "dark" ? sun : moon;
      t.setAttribute("aria-label", "Switch to " + (d === "dark" ? "light" : "dark") + " mode");
    });
  }
  render();
  toggles.forEach((t) => t.addEventListener("click", () => {
    d = d === "dark" ? "light" : "dark";
    r.setAttribute("data-theme", d);
    render();
  }));
})();

// ---- Mobile sidebar ----
(function () {
  const sb = document.getElementById("sidebar");
  const bd = document.querySelector("[data-backdrop]");
  const btn = document.querySelector("[data-menu]");
  function open() { sb.classList.add("open"); bd.hidden = false; bd.classList.add("show"); btn.setAttribute("aria-expanded", "true"); }
  function close() { sb.classList.remove("open"); bd.classList.remove("show"); bd.hidden = true; btn.setAttribute("aria-expanded", "false"); }
  btn.addEventListener("click", () => sb.classList.contains("open") ? close() : open());
  bd.addEventListener("click", close);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
})();

const EVENT_LABELS = {
  first_report: "First Report",
  local_spread: "Local Spread",
  new_data: "New Data",
  status_update: "Status Update",
  eradication: "Eradication",
  regulatory: "Regulatory",
  management: "Management",
};
const STATUS_COLORS = [
  { match: "widespread", color: "var(--c-widespread)", label: "Present, widespread" },
  { match: "restricted", color: "var(--c-restricted)", label: "Present, restricted distribution" },
  { match: "few", color: "var(--c-few)", label: "Present, few occurrences" },
  { match: "no details", color: "var(--c-nodetails)", label: "Present, no details" },
  { match: "absent", color: "var(--c-absent)", label: "Absent (various)" },
];

function statusColor(status) {
  const s = (status || "").toLowerCase();
  for (const sc of STATUS_COLORS) if (s.includes(sc.match)) return sc.color;
  return "var(--c-nodetails)";
}

const NARRATIVE = [
  { step: "Origin", title: "Native to South America", yr: "Pre-2006",
    body: "Phthorimaea absoluta is native to South America, where it has long been a major pest of tomato. From this range it was poised to expand once introduced elsewhere." },
  { step: "01", title: "First EPPO-region report in Spain", yr: "2006–2008",
    body: "EPPO reporting documents the pest's arrival in the EPPO region in Spain in the late 2000s, the entry point for its subsequent spread across the Mediterranean." },
  { step: "02", title: "Rapid Mediterranean & European spread", yr: "2009–2012",
    body: "Reports cluster heavily in 2009–2011 as the pest is recorded across Mediterranean and continental Europe — Italy, France, Greece, the Balkans and beyond — often as first national records." },
  { step: "03", title: "Africa & Asia expansion", yr: "2013–2020",
    body: "EPPO entries record continued movement into North and sub-Saharan Africa and across Asia, reflecting a broadening invaded range well beyond Europe." },
  { step: "04", title: "Recent updates: Thailand, Ukraine, Russia", yr: "2024–2026",
    body: "The most recent reporting includes status and new-data entries referencing countries such as Thailand, Ukraine and Russia, alongside management and biological-control items." },
];

const CAVEATS = [
  "EPPO Reporting Service pages are uneven in depth: some entries are first records, others are status updates, regulatory notices, or pest-management items rather than new geographic detections.",
  "Country attribution is inferred from report titles and text where possible; ~20 entries reference no single country (e.g. methodology or biocontrol articles) and are not plotted on the map.",
  "Map points use approximate national centroids for demonstration only — they indicate the reporting country, not a precise outbreak location.",
  "Distribution figures reflect the EPPO Global Database snapshot embedded with this demo and may differ from the live EPPO record.",
];

let DATA = null;

// ---- Map state ----
let map = null;            // Leaflet map
let svgOverlay = null;     // SVG root inside Leaflet overlayPane
let gComet = null, gDots = null, defsEl = null;
let themeObserver = null;
let currentYear = MAX_YEAR;
let playing = false;
let playTimer = null;
let ARRIVALS = [];        // diffusion arrivals (computed offline)
let activeComets = [];    // {country, startYear} currently animating
let lastRenderedYear = null;

async function init() {
  initI18n(); // resolve language, mount switcher, translate static chrome
  DATA = await fetch("./data.json").then((r) => r.json());

  stamp();
  buildSidebar();
  buildNarrative();
  buildCaveats();
  buildFeed();
  buildKpis();
  buildMethodNote();
  setupMap();
  wireControls();
  renderYear(MAX_YEAR);

  // Re-render the JS-built copy (rail tiles, status note, method note) when the
  // language changes. Data-derived text (report titles, country names) stays
  // in its source language by design.
  onLangChange(() => {
    buildSidebar();
    buildMethodNote();
  });
}

function stamp() {
  const now = new Date();
  const opts = { day: "2-digit", month: "short", year: "numeric" };
  const s = now.toLocaleDateString("en-GB", opts);
  document.getElementById("updated-stamp").textContent = "EPPO snapshot · " + DATA.meta.distribution_last_updated;
  document.getElementById("dist-updated").textContent = "Distribution updated " + DATA.meta.distribution_last_updated;
  document.getElementById("footer-stamp").textContent = "Rendered " + s;
}

// ---- KPIs ----
// A record is "present" only when its status begins with "Present"
// (excludes "Absent, pest no longer present" etc.)
function isPresent(r) { return r.status.toLowerCase().startsWith("present"); }

function buildKpis() {
  const m = DATA.meta;
  document.getElementById("kpi-reports").textContent = m.report_count;
  document.getElementById("kpi-countries").textContent = m.current_present_country_count;
  const present = DATA.current_distribution.filter(isPresent);
  const conts = new Set(present.map((r) => r.continent));
  document.getElementById("kpi-continents").textContent = conts.size;
  document.getElementById("kpi-mapped").textContent = m.mapped_event_count;
}

// ---- Sidebar: distribution stats, status, continents ----
function buildSidebar() {
  const cd = DATA.current_distribution;
  const countries = new Set(cd.map((r) => r.country));
  const present = cd.filter(isPresent);
  const presentCountries = new Set(present.map((r) => r.country));
  const absentOnlyCountries = [...countries].filter((c) => !presentCountries.has(c)).length;
  const absentRows = cd.length - present.length;

  // stat tiles
  const stats = [
    { num: presentCountries.size, lbl: t("dist.tile.present") },
    { num: absentOnlyCountries, lbl: t("dist.tile.absent") },
    { num: present.length, lbl: t("dist.tile.present_rec") },
    { num: absentRows, lbl: t("dist.tile.absent_rec") },
  ];
  document.getElementById("dist-stats").innerHTML = stats
    .map((s) => `<div class="dist-stat"><div class="num">${s.num}</div><div class="lbl">${s.lbl}</div></div>`)
    .join("");

  // status categories
  const statusCounts = {};
  cd.forEach((r) => { statusCounts[r.status] = (statusCounts[r.status] || 0) + 1; });
  const ordered = Object.entries(statusCounts).sort((a, b) => b[1] - a[1]);
  document.getElementById("status-list").innerHTML = ordered
    .map(([st, ct]) =>
      `<div class="status-row"><span class="dot" style="background:${statusColor(st)}"></span><span class="name">${st}</span><span class="ct">${ct}</span></div>`
    )
    .join("");
  document.getElementById("status-total-note").textContent =
    t("dist.total_note")
      .replace("{total}", cd.length)
      .replace("{present}", present.length)
      .replace("{absent}", absentRows);

  // continents (unique present countries)
  const contMap = {};
  present.forEach((r) => { (contMap[r.continent] ||= new Set()).add(r.country); });
  const contArr = Object.entries(contMap).map(([k, v]) => [k, v.size]).sort((a, b) => b[1] - a[1]);
  const maxC = Math.max(...contArr.map((c) => c[1]));
  document.getElementById("continent-bars").innerHTML = contArr
    .map(([name, ct]) =>
      `<div class="cbar"><div class="cbar-head"><span>${name}</span><span class="ct">${ct}</span></div>` +
      `<div class="cbar-track"><div class="cbar-fill" style="width:${(ct / maxC) * 100}%"></div></div></div>`
    )
    .join("");
}

// ---- Narrative ----
function buildNarrative() {
  document.getElementById("narrative-grid").innerHTML = NARRATIVE
    .map((n) =>
      `<article class="narr-card"><span class="step">${n.step}</span><h4>${n.title}</h4><p>${n.body}</p><span class="yr">${n.yr}</span></article>`
    )
    .join("");
}

function buildCaveats() {
  document.getElementById("caveats-list").innerHTML = CAVEATS.map((c) => `<li>${c}</li>`).join("");
}

// ---- Event feed / table ----
function escapeHtml(s) {
  return (s || "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function buildFeed() {
  // populate filter options
  const types = Object.keys(EVENT_LABELS).filter((t) => DATA.summary.events_by_type[t]);
  const sel = document.getElementById("feed-filter");
  types.forEach((t) => {
    const o = document.createElement("option");
    o.value = t;
    o.textContent = `${EVENT_LABELS[t]} (${DATA.summary.events_by_type[t]})`;
    sel.appendChild(o);
  });

  const searchEl = document.getElementById("feed-search");
  searchEl.addEventListener("input", renderFeed);
  sel.addEventListener("change", renderFeed);
  renderFeed();
}

function renderFeed() {
  const q = document.getElementById("feed-search").value.trim().toLowerCase();
  const type = document.getElementById("feed-filter").value;
  const rows = DATA.events.filter((e) => {
    if (type && e.event_type !== type) return false;
    if (q) {
      const hay = `${e.report_no} ${e.title} ${e.country} ${e.event_label}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
  // newest first
  rows.sort((a, b) => (b.date || "").localeCompare(a.date || "") || b.report_no.localeCompare(a.report_no));

  const body = document.getElementById("feed-body");
  if (!rows.length) {
    body.innerHTML = `<tr class="empty-row"><td colspan="6">No reports match your filter.</td></tr>`;
  } else {
    body.innerHTML = rows
      .map((e) => {
        const country = e.country
          ? `<span>${escapeHtml(e.country)}</span>`
          : `<span class="muted-dash">— not country-specific</span>`;
        return `<tr>
          <td class="c-no">${escapeHtml(e.report_no)}</td>
          <td class="c-date">${escapeHtml(e.date || "")}</td>
          <td class="c-title">${escapeHtml(e.title)}</td>
          <td class="c-country">${country}</td>
          <td><span class="type-badge type-${e.event_type}">${EVENT_LABELS[e.event_type] || e.event_type}</span></td>
          <td class="c-src"><a href="${escapeHtml(e.source_url)}" target="_blank" rel="noopener noreferrer" aria-label="Open EPPO report ${escapeHtml(e.report_no)}">EPPO<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M14 3h7v7M21 3l-9 9M19 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h5"/></svg></a></td>
        </tr>`;
      })
      .join("");
  }
  document.getElementById("feed-count").textContent = `${rows.length} of ${DATA.events.length} reports`;
}

// ---- Map ----
function eventColor(type) {
  switch (type) {
    case "first_report": return "var(--c-widespread)";
    case "local_spread": return "var(--c-restricted)";
    case "new_data": return "var(--c-nodetails)";
    case "status_update": return "var(--color-primary)";
    case "eradication": return "var(--color-accent)";
    case "regulatory": return "var(--c-few)";
    default: return "var(--c-absent)";
  }
}

function fmtNumber(v) {
  const n = Number(v || 0);
  if (Math.abs(n) >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (Math.abs(n) >= 1_000) return (n / 1_000).toFixed(0) + "K";
  return n.toLocaleString("en-GB", { maximumFractionDigits: 0 });
}

function fmtPct(v) {
  return (Number(v || 0) * 100).toFixed(1) + "%";
}

function riskOpacity(risk) {
  return Math.max(0.22, Math.min(0.82, Number(risk || 0) / 100));
}

// CARTO tile basemaps — clean, low-chroma so the diffusion dots stay legible.
const TILE_LIGHT = "https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png";
const TILE_DARK = "https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png";
const TILE_ATTR =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>';
let tileLayer = null;
let labelLayer = null;
const LABEL_LIGHT = "https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png";
const LABEL_DARK = "https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png";

function isDark() {
  return document.documentElement.getAttribute("data-theme") === "dark";
}

function setupMap() {
  // ---- Real, zoomable slippy map (Leaflet), default focused on Europe/Med ----
  map = L.map("map", {
    center: EURO_VIEW.center,
    zoom: EURO_VIEW.zoom,
    minZoom: MIN_ZOOM,
    maxZoom: MAX_ZOOM,
    worldCopyJump: true,
    zoomControl: true,
    attributionControl: true,
    scrollWheelZoom: true,
  });
  map.attributionControl.setPrefix("");

  tileLayer = L.tileLayer(isDark() ? TILE_DARK : TILE_LIGHT, {
    attribution: TILE_ATTR, subdomains: "abcd", maxZoom: MAX_ZOOM, detectRetina: true,
  }).addTo(map);
  labelLayer = L.tileLayer(isDark() ? LABEL_DARK : LABEL_LIGHT, {
    subdomains: "abcd", maxZoom: MAX_ZOOM, detectRetina: true, pane: "shadowPane",
  }).addTo(map);

  // Expose for the shared fullscreen module (map-fullscreen.js) so it can call
  // invalidateSize() after the map is resized to fill the viewport.
  window.__leafletMap = map;

  // Map navigation icon buttons: recenter (home) on Europe/Med, and zoom out to world.
  const resetBtn = document.querySelector("[data-map-reset]");
  if (resetBtn) resetBtn.addEventListener("click", () => map.setView(EURO_VIEW.center, EURO_VIEW.zoom, { animate: true }));
  const worldBtn = document.querySelector("[data-map-world]");
  if (worldBtn) worldBtn.addEventListener("click", () => map.setView([20, 0], MIN_ZOOM, { animate: true }));

  // ---- SVG overlay inside Leaflet's overlayPane (dots + comets) ----
  const NS = "http://www.w3.org/2000/svg";
  svgOverlay = document.createElementNS(NS, "svg");
  svgOverlay.setAttribute("class", "diffusion-overlay");
  defsEl = document.createElementNS(NS, "defs");
  gComet = document.createElementNS(NS, "g");
  gComet.setAttribute("class", "comets");
  gDots = document.createElementNS(NS, "g");
  gDots.setAttribute("class", "diff-dots");
  svgOverlay.appendChild(defsEl);
  svgOverlay.appendChild(gComet);
  svgOverlay.appendChild(gDots);
  map.getPanes().overlayPane.appendChild(svgOverlay);

  ARRIVALS = ((DATA.diffusion && DATA.diffusion.arrivals) || []).map((a) => ({ ...a }));

  // Reproject + redraw whenever the view changes (zoom/pan). Comets are
  // transient, so on a view change we just refresh the static dots.
  map.on("zoomend moveend viewreset", () => { sizeOverlay(); renderYear(currentYear); });
  sizeOverlay();

  // Re-tile on theme switch.
  themeObserver = new MutationObserver(() => {
    const dark = isDark();
    if (tileLayer) tileLayer.setUrl(dark ? TILE_DARK : TILE_LIGHT);
    if (labelLayer) labelLayer.setUrl(dark ? LABEL_DARK : LABEL_LIGHT);
    renderYear(currentYear);
  });
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
}

// Resize/position the SVG overlay to cover the current map pixel bounds.
function sizeOverlay() {
  if (!map || !svgOverlay) return;
  const size = map.getSize();
  const topLeft = map.containerPointToLayerPoint([0, 0]);
  L.DomUtil.setPosition(svgOverlay, topLeft);
  svgOverlay.setAttribute("width", size.x);
  svgOverlay.setAttribute("height", size.y);
  svgOverlay.setAttribute("viewBox", `${topLeft.x} ${topLeft.y} ${size.x} ${size.y}`);
}

// Project a lon/lat to the overlay's layer-point pixel coordinates.
function project(lat, lon) {
  const p = map.latLngToLayerPoint([lat, lon]);
  return { x: p.x, y: p.y };
}

// ---- Diffusion encoding (option C, refined) ----
// size = simulated logistic build-up; SMALL so dots don't crowd / land stays visible
// colour = green -> amber -> red with that build-up
// uncertainty = a soft radial fade-out on each dot (gradient), NOT a separate halo ring
// Dot SIZE is driven mainly by national tomato-export volume (trade_norm, a
// log-scaled 0..1 proxy for likely problem severity); a smaller component grows
// with years-since-first-report so established spots still intensify over time.
const SIZE = { minR: 2.4, tradeR: 11.5, ageR: 3.0 };   // r = minR + tradeR*trade + ageR*age01
const GROWTH = { k: 0.42, mid: 6 };                    // logistic curve for the age component
const FADE = { coreFloor: 0.55, coreCeil: 0.92, edgeExtra: 0.55 }; // gradient fade params

function logistic01(age) {
  const raw = 1 / (1 + Math.exp(-GROWTH.k * (age - GROWTH.mid)));
  const base = 1 / (1 + Math.exp(-GROWTH.k * (0 - GROWTH.mid)));
  return Math.max(0, (raw - base) / (1 - base));
}

// Colour intensity tracks trade volume: small exporters stay a muted green,
// big exporters push through amber to a saturated red so they stand out.
// Years-since-first-report nudges the hue a little warmer on top of that.
function problemColor(trade, age01) {
  const t = Math.max(0, Math.min(1, trade * 0.78 + age01 * 0.22));
  const stops = [[74, 122, 79], [211, 154, 23], [194, 64, 47]]; // muted green -> amber -> red
  let c0, c1, f;
  if (t < 0.5) { c0 = stops[0]; c1 = stops[1]; f = t / 0.5; }
  else { c0 = stops[1]; c1 = stops[2]; f = (t - 0.5) / 0.5; }
  const r = Math.round(c0[0] + (c1[0] - c0[0]) * f);
  const g = Math.round(c0[1] + (c1[1] - c0[1]) * f);
  const b = Math.round(c0[2] + (c1[2] - c0[2]) * f);
  return { rgb: `rgb(${r},${g},${b})`, t };
}

// Dots scale gently with zoom so they stay readable without overwhelming the map.
function zoomScale() {
  if (!map) return 1;
  const z = map.getZoom();
  // ~0.8x when fully zoomed out (world) up to ~1.6x when zoomed into a region
  return Math.max(0.8, Math.min(1.6, 0.8 + (z - MIN_ZOOM) * 0.13));
}

function renderYear(year, animate = false) {
  currentYear = year;
  document.getElementById("year-value").textContent = year;
  document.getElementById("map-year").textContent = year;
  document.getElementById("year-slider").value = year;
  document.getElementById("year-slider").setAttribute("aria-valuenow", year);
  const present = ARRIVALS.filter((a) => a.year <= year);
  document.getElementById("mode-tag").textContent = `${present.length} countries reported`;

  let newlyArrived = [];
  if (animate && (lastRenderedYear == null || year > lastRenderedYear)) {
    newlyArrived = ARRIVALS.filter((a) => a.year === year && a.origin);
  }
  lastRenderedYear = year;

  renderDots(present, year, animate);
  if (newlyArrived.length) launchComets(newlyArrived);
}

function renderDots(present, year, animate) {
  if (!gDots) return;
  const rows = present.slice().sort((a, b) => a.year - b.year); // oldest first, fresh on top
  const sc = zoomScale();
  let html = "";
  rows.forEach((a) => {
    const p = project(a.lat, a.lon);
    const age = year - a.year;
    const age01 = logistic01(age);
    const trade = (a.trade_norm == null) ? 0 : a.trade_norm;
    // radius driven mainly by tomato-export volume, with a gentle age component
    const r = (SIZE.minR + SIZE.tradeR * trade + SIZE.ageR * age01) * sc;
    const { rgb: fill, t } = problemColor(trade, age01);
    // soft radial fade-out (uncertainty look). Bigger exporters keep a more solid core.
    const coreStop = Math.round(22 + trade * 46);              // solid core %: 22%->68%
    const coreOp = (FADE.coreFloor + (FADE.coreCeil - FADE.coreFloor) * trade).toFixed(2);
    const edgeOp = (0.05 + 0.09 * trade).toFixed(2);
    const drawR = r * (1 + FADE.edgeExtra * (1 - trade) * 0.6 + 0.18 * age01);
    const gid = `g-${a.country.replace(/\W+/g, "")}`;
    const exportTxt = a.export_value ? ` \u00b7 tomato export proxy ${(trade * 100).toFixed(0)}%` : " \u00b7 minor/unknown exporter";
    const label = `${a.country}: first EPPO report ${a.year}` + exportTxt +
      (age > 0 ? ` \u00b7 ${age} year${age === 1 ? "" : "s"} since first report` : " \u00b7 first report this year") +
      (a.origin ? ` \u00b7 likely introduced via ${a.origin}` : " \u00b7 early Mediterranean focus");
    html += `<radialGradient id="${gid}" cx="50%" cy="50%" r="50%">` +
      `<stop offset="0%" stop-color="${fill}" stop-opacity="${coreOp}"></stop>` +
      `<stop offset="${coreStop}%" stop-color="${fill}" stop-opacity="${coreOp}"></stop>` +
      `<stop offset="100%" stop-color="${fill}" stop-opacity="${edgeOp}"></stop>` +
      `</radialGradient>`;
    const isFresh = animate && age === 0;
    // Hold the destination node hidden until the travel trail has (mostly) arrived,
    // so the arrow plays FIRST and the node pops in on landing. Only freshly-arrived
    // dots that actually have an origin trail get the delay; first-report dots with
    // no origin (early Mediterranean focus) pop immediately.
    const freshDelay = (isFresh && a.origin) ? Math.round(cometDuration() * 0.55) : 0;
    const styleAttr = freshDelay ? ` style="animation-delay:${freshDelay}ms"` : "";
    html += `<circle class="diff-dot${isFresh ? " is-fresh" : ""}" cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" ` +
      `r="${drawR.toFixed(1)}" fill="url(#${gid})" data-country="${escapeHtml(a.country)}"${styleAttr} ` +
      `tabindex="0" role="button" aria-label="${escapeHtml(label)}"><title>${escapeHtml(label)}</title></circle>`;
  });
  gDots.innerHTML = html;
}

// ---- Soft, variable-width travel trails (no hard arrowhead) ----
// Each trail is a single curved path drawn with a per-path linearGradient
// (transparent at origin -> soft hue -> transparent at target) plus a soft
// glow dot at the destination. Variable width comes from a wide soft
// under-stroke layered with a thin brighter over-stroke; both fade out.
function cometHue() {
  const v = getComputedStyle(document.documentElement).getPropertyValue("--comet-hue").trim();
  return v || "#3f7d56";
}
function launchComets(rows) {
  if (!gComet || !defsEl) return;
  const NS = "http://www.w3.org/2000/svg";
  const hue = cometHue();
  const dur = cometDuration();
  rows.forEach((a, i) => {
    if (a.origin_lat == null || a.origin_lon == null) return;
    const t = project(a.lat, a.lon);
    const o = project(a.origin_lat, a.origin_lon);
    const x0 = o.x, y0 = o.y, x1 = t.x, y1 = t.y;
    const mx = (x0 + x1) / 2;
    const my = (y0 + y1) / 2 - Math.min(60, 14 + Math.hypot(x1 - x0, y1 - y0) / 9);
    const d = `M${x0.toFixed(1)},${y0.toFixed(1)} Q${mx.toFixed(1)},${my.toFixed(1)} ${x1.toFixed(1)},${y1.toFixed(1)}`;
    const base = `${a.country.replace(/\W+/g, "")}-${Date.now()}-${i}`;
    const gid = `cg-${base}`;
    const grad = document.createElementNS(NS, "linearGradient");
    grad.setAttribute("id", gid);
    grad.setAttribute("gradientUnits", "userSpaceOnUse");
    grad.setAttribute("x1", x0); grad.setAttribute("y1", y0);
    grad.setAttribute("x2", x1); grad.setAttribute("y2", y1);
    [["0%", 0], ["22%", 0.5], ["72%", 0.42], ["100%", 0]].forEach(([off, op]) => {
      const s = document.createElementNS(NS, "stop");
      s.setAttribute("offset", off); s.setAttribute("stop-color", hue); s.setAttribute("stop-opacity", op);
      grad.appendChild(s);
    });
    defsEl.appendChild(grad);

    const under = document.createElementNS(NS, "path");
    under.setAttribute("id", `u-${base}`);
    under.setAttribute("class", "comet-path comet-under");
    under.setAttribute("d", d);
    under.setAttribute("stroke", `url(#${gid})`);
    const over = document.createElementNS(NS, "path");
    over.setAttribute("id", `o-${base}`);
    over.setAttribute("class", "comet-path comet-over");
    over.setAttribute("d", d);
    over.setAttribute("stroke", `url(#${gid})`);
    const head = document.createElementNS(NS, "circle");
    head.setAttribute("id", `h-${base}`);
    head.setAttribute("class", "comet-head");
    head.setAttribute("cx", x1.toFixed(1)); head.setAttribute("cy", y1.toFixed(1));
    head.setAttribute("r", "3.4"); head.setAttribute("fill", hue);
    gComet.appendChild(under); gComet.appendChild(over); gComet.appendChild(head);

    // Measure each path's true pixel length so the draw animation looks right at any zoom.
    [under, over].forEach((pp) => {
      const len = pp.getTotalLength();
      pp.style.strokeDasharray = len;
      pp.style.strokeDashoffset = len;
      pp.style.animationDuration = dur + "ms";
    });
    head.style.animationDuration = dur + "ms";

    setTimeout(() => {
      [under, over, head].forEach((el) => el.remove());
      const g = document.getElementById(gid); if (g) g.remove();
    }, dur + 120);
  });
  requestAnimationFrame(() => {
    gComet.querySelectorAll(".comet-path:not(.run), .comet-head:not(.run)").forEach((pp) => { void pp.getBoundingClientRect(); pp.classList.add("run"); });
  });
}

// ---- Slim methodology note ----
function buildMethodNote() {
  const el = document.getElementById("method-note-body");
  if (!el) return;
  const dm = (DATA.diffusion && DATA.diffusion.meta) || {};
  const w = dm.factor_weights || { trade: 0.4, proximity: 0.28, wind: 0.14, climate: 0.18 };
  const db = dm.dot_size_basis;
  const basis = (db && db.source)
    ? `${db.source} (${db.scale || "log-scaled"})`
    : t("method.basis");
  const pct = (x) => Math.round(x * 100) + "%";
  const dots = t("method.dots").replace("{basis}", basis);
  const arrows = t("method.arrows")
    .replace("{trade}", pct(w.trade))
    .replace("{prox}", pct(w.proximity))
    .replace("{wind}", pct(w.wind))
    .replace("{clim}", pct(w.climate));
  el.innerHTML =
    `<p>${dots}</p>` +
    `<p>${arrows}</p>` +
    `<p class="method-src">Sources: <a href="https://gd.eppo.int/taxon/GNORAB/reporting" target="_blank" rel="noopener noreferrer">EPPO Reporting Service</a> &middot; <a href="https://gd.eppo.int/taxon/GNORAB/distribution" target="_blank" rel="noopener noreferrer">EPPO distribution</a> &middot; <a href="https://www.cabidigitallibrary.org/doi/full/10.1079/cabicompendium.49260" target="_blank" rel="noopener noreferrer">CABI Compendium</a>. Pathway weighting is illustrative, not a calibrated dispersal model.</p>`;
}

// ---- Animation pacing ----
// Years 2009-2013 are the rapid Mediterranean/European expansion: we DWELL
// longer on these so the viewer can follow the burst. Other years play faster.
const RAPID_START = 2009, RAPID_END = 2013;
function yearDelay(year, baseMs) {
  // base step delay scaled up during the rapid-expansion window
  const inRapid = year >= RAPID_START && year <= RAPID_END;
  return Math.round(baseMs * (inRapid ? 1.8 : 1));
}
// Comet draw should comfortably fit inside the dwell on a given step.
function cometDuration() {
  const sel = document.getElementById("speed");
  const base = sel ? +sel.value : 1600;
  const inRapid = currentYear >= RAPID_START && currentYear <= RAPID_END;
  // a touch shorter than the dwell so it lands before the next year ticks
  return Math.round(Math.min(3400, (base * (inRapid ? 1.8 : 1)) * 0.85));
}

// ---- Controls ----
function wireControls() {
  const slider = document.getElementById("year-slider");
  const playBtn = document.querySelector("[data-play]");
  const playIcon = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>';
  const pauseIcon = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6 5h4v14H6zM14 5h4v14h-4z"/></svg>';
  playBtn.innerHTML = playIcon;

  slider.addEventListener("input", () => {
    stopPlay();
    renderYear(+slider.value);
  });

  function scheduleNext() {
    if (!playing) return;
    if (currentYear >= MAX_YEAR) { stopPlay(); return; }
    const base = +document.getElementById("speed").value;
    const delay = yearDelay(currentYear + 1, base);
    playTimer = setTimeout(() => {
      if (!playing) return;
      renderYear(currentYear + 1, true);
      scheduleNext();
    }, delay);
  }
  function startPlay() {
    playing = true;
    playBtn.innerHTML = pauseIcon;
    playBtn.setAttribute("aria-label", "Pause animation");
    if (currentYear >= MAX_YEAR) renderYear(MIN_YEAR, true);
    scheduleNext();
  }
  function stopPlay() {
    playing = false;
    if (playTimer) clearTimeout(playTimer);
    playTimer = null;
    playBtn.innerHTML = playIcon;
    playBtn.setAttribute("aria-label", "Play animation");
  }
  window.__stopPlay = stopPlay;
  playBtn.addEventListener("click", () => (playing ? stopPlay() : startPlay()));
  document.getElementById("speed").addEventListener("change", () => { if (playing) { stopPlay(); startPlay(); } });
}
function stopPlay() { if (window.__stopPlay) window.__stopPlay(); }

init().catch((err) => {
  console.error(err);
  document.getElementById("main").insertAdjacentHTML(
    "afterbegin",
    `<p style="padding:2rem;color:var(--c-widespread)">Could not load demo data: ${escapeHtml(String(err))}</p>`
  );
});
