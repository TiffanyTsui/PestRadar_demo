// ============================================================
// Pest Radar — Emerging & common greenhouse pests
// An EPPO-style informational reference. National-level, mostly
// static data — deliberately NOT a spread forecast (the data is
// coarse country/region first-reports). We show, per pest, a
// detection point-map + a structured profile, and contrast this
// lower-resolution tier with the Westland regional forecast.
//
// ---- HOW TO ADD A NEW PEST (no rewrite needed) -------------
// Append one object to the PESTS array below. Each pest is
// fully self-contained: its labels carry their own en/nl/es
// translations as { en, nl, es } objects (use tr() to resolve).
// Provide a photo in ./assets/ and a list of detection points.
// The page renders the index, profiles and maps automatically.
// ============================================================
import { initI18n, onLangChange, t, getLang } from "./i18n.js";

// ---- Theme: default dark, multiple toggles (same pattern as site.js) ----
(function theme() {
  const KEY = "pr-theme";
  const root = document.documentElement;
  let stored = null;
  try { stored = localStorage.getItem(KEY); } catch (_) {}
  const initial = stored === "light" || stored === "dark" ? stored : "dark";
  root.setAttribute("data-theme", initial);
  const sun =
    '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>';
  const moon =
    '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
  function apply(next) {
    root.setAttribute("data-theme", next);
    try { localStorage.setItem(KEY, next); } catch (_) {}
    document.querySelectorAll("[data-theme-toggle]").forEach((b) => {
      b.innerHTML = next === "dark" ? sun : moon;
      b.setAttribute("aria-pressed", String(next === "dark"));
      b.setAttribute("aria-label", "Switch to " + (next === "dark" ? "light" : "dark") + " mode");
    });
  }
  apply(initial);
  document.querySelectorAll("[data-theme-toggle]").forEach((b) =>
    b.addEventListener("click", () => {
      const cur = root.getAttribute("data-theme") === "dark" ? "dark" : "light";
      apply(cur === "dark" ? "light" : "dark");
    })
  );
})();

// ---- tr(): resolve a { en, nl, es } object to the active language ----
function tr(obj) {
  if (obj == null) return "";
  if (typeof obj === "string") return obj;
  const lang = getLang ? getLang() : "en";
  return obj[lang] || obj.en || "";
}

// ============================================================
// PEST REGISTRY  —  append a new object here to add a pest.
// ============================================================
const PESTS = [
  // ----------------------------------------------------------
  // 1) Chilli thrips — Scirtothrips dorsalis (EPPO A2, GNORAB code SCITDO)
  // ----------------------------------------------------------
  {
    id: "scitdo",
    latin: "Scirtothrips dorsalis",
    eppoCode: "SCITDO",
    eppoUrl: "https://gd.eppo.int/taxon/SCITDO",
    statusTag: { en: "EPPO A2 · restricted", nl: "EPPO A2 · beperkt", es: "EPPO A2 · restringida" },
    common: { en: "Chilli thrips", nl: "Chillitrips", es: "Trips chilli" },
    commonAll: {
      en: "EN: chilli thrips · NL: chillitrips · ES: trips chilli / trips amarillo del té",
      nl: "EN: chilli thrips · NL: chillitrips · ES: trips chilli",
      es: "EN: chilli thrips · NL: chillitrips · ES: trips chilli / trips amarillo del té",
    },
    photo: "./assets/scitdo_15311.jpg",
    photoCaption: {
      en: "Adult Scirtothrips dorsalis — under 1\u00a0mm.",
      nl: "Volwassen Scirtothrips dorsalis — kleiner dan 1\u00a0mm.",
      es: "Scirtothrips dorsalis adulto — menos de 1\u00a0mm.",
    },
    photoCredit: {
      en: "courtesy Dr Rachana R.R., ICAR-NBAIR, India",
      nl: "met dank aan dr. Rachana R.R., ICAR-NBAIR, India",
      es: "cortesía de la Dra. Rachana R.R., ICAR-NBAIR, India",
    },
    intro: {
      en: "A highly polyphagous, invasive thrips native to tropical Asia, now reported across all continents. EPPO categorises it as an A2 pest — present in the region but restricted and under official control.",
      nl: "Een zeer polyfage, invasieve thrips, inheems in tropisch Azië en inmiddels gemeld op alle continenten. EPPO classificeert het als een A2-plaag — aanwezig in de regio maar beperkt en onder officiële controle.",
      es: "Un trips invasor altamente polífago, nativo del Asia tropical y ahora notificado en todos los continentes. La EPPO lo clasifica como plaga A2 — presente en la región pero restringida y bajo control oficial.",
    },
    sections: [
      {
        h: { en: "Hosts & damage", nl: "Waardplanten & schade", es: "Huéspedes y daños" },
        p: {
          en: "Key hosts include Capsicum, roses, cotton, citrus and strawberries, plus greenhouse ornamentals such as Azalea, Magnolia, Viburnum, Fatsia and bonsai. Feeding silvers leaf surfaces, thickens the lamina, and leaves ring-shaped scars around young fruit, with brown frass, fruit distortion and early leaf senescence.",
          nl: "Belangrijke waardplanten zijn Capsicum, rozen, katoen, citrus en aardbeien, plus kasornamentele gewassen zoals Azalea, Magnolia, Viburnum, Fatsia en bonsai. Het zuigen verzilvert bladoppervlakken, verdikt het blad en laat ringvormige littekens rond jonge vruchten achter, met bruine uitwerpselen, vruchtmisvorming en vroege bladveroudering.",
          es: "Los huéspedes clave incluyen Capsicum, rosas, algodón, cítricos y fresas, además de ornamentales de invernadero como Azalea, Magnolia, Viburnum, Fatsia y bonsáis. La alimentación platea la superficie de la hoja, engrosa el limbo y deja cicatrices anulares alrededor del fruto joven, con excrementos pardos, deformación del fruto y senescencia foliar temprana.",
        },
      },
      {
        h: { en: "Identification", nl: "Herkenning", es: "Identificación" },
        p: {
          en: "Minute reddish-orange insects under 1 mm. Five stages: egg, two feeding larval instars, two inactive pupal instars (in soil or bark crevices), and winged adults. Females show dark antecostal ridges; unlike S. aurantii, males lack dark lateral drepanae on the ninth abdominal tergite.",
          nl: "Minuscule roodoranje insecten, kleiner dan 1 mm. Vijf stadia: ei, twee vretende larvale stadia, twee inactieve popstadia (in de bodem of schorsspleten) en gevleugelde volwassenen. Vrouwtjes hebben donkere antecostale richels; anders dan S. aurantii missen mannetjes donkere laterale drepanae op het negende abdominale tergiet.",
          es: "Insectos diminutos de color naranja rojizo, menores de 1 mm. Cinco estadios: huevo, dos estadios larvarios que se alimentan, dos estadios de pupa inactivos (en el suelo o grietas de la corteza) y adultos alados. Las hembras presentan crestas antecostales oscuras; a diferencia de S. aurantii, los machos carecen de drepanas laterales oscuras en el noveno terguito abdominal.",
        },
      },
      {
        h: { en: "Biocontrol", nl: "Biologische bestrijding", es: "Control biológico" },
        p: {
          en: "Chemical control is hard (cryptic habitats, resistance). Predatory bugs (Orius laevigatus, O. tantillus), predatory mites (Amblyseius swirskii, Neoseiulus cucumeris, Transeius montdorensis), and entomopathogenic fungi (Beauveria bassiana, Metarhizium anisopliae) are effective sustainable options.",
          nl: "Chemische bestrijding is lastig (verborgen habitats, resistentie). Roofwantsen (Orius laevigatus, O. tantillus), roofmijten (Amblyseius swirskii, Neoseiulus cucumeris, Transeius montdorensis) en entomopathogene schimmels (Beauveria bassiana, Metarhizium anisopliae) zijn effectieve, duurzame opties.",
          es: "El control químico es difícil (hábitats crípticos, resistencia). Chinches depredadores (Orius laevigatus, O. tantillus), ácaros depredadores (Amblyseius swirskii, Neoseiulus cucumeris, Transeius montdorensis) y hongos entomopatógenos (Beauveria bassiana, Metarhizium anisopliae) son opciones sostenibles eficaces.",
        },
      },
      {
        h: { en: "Monitoring", nl: "Monitoring", es: "Monitoreo" },
        p: {
          en: "Because of its size, visual search is often insufficient. The electric Berlese method or systematic yellow sticky traps are recommended. Official measures for outbreaks include trade bans, incineration of infested lots, intensive treatments and facility cleaning.",
          nl: "Vanwege de geringe grootte is visuele inspectie vaak onvoldoende. De elektrische Berlese-methode of systematische gele vangplaten worden aanbevolen. Officiële maatregelen bij uitbraken zijn handelsverboden, verbranding van besmette partijen, intensieve behandelingen en reiniging van de faciliteit.",
          es: "Debido a su tamaño, la búsqueda visual suele ser insuficiente. Se recomienda el método Berlese eléctrico o trampas adhesivas amarillas sistemáticas. Las medidas oficiales ante brotes incluyen prohibiciones comerciales, incineración de lotes infestados, tratamientos intensivos y limpieza de instalaciones.",
        },
      },
    ],
    detections: [
      { country: "Germany", region: "Bavaria", lat: 48.79, lon: 11.5, date: "Late 2025", status: "present",
        note: { en: "Introduced via Podocarpus macrophyllus bonsai from the Netherlands; detected on yellow sticky traps in a 0.13-ha, 400-plant greenhouse.",
          nl: "Geïntroduceerd via Podocarpus macrophyllus-bonsai uit Nederland; aangetroffen op gele vangplaten in een kas van 0,13 ha met 400 planten.",
          es: "Introducido mediante bonsáis de Podocarpus macrophyllus de los Países Bajos; detectado en trampas adhesivas amarillas en un invernadero de 0,13 ha y 400 plantas." } },
      { country: "Netherlands", region: "Noord-Brabant", lat: 51.56, lon: 5.1, date: "Late 2025", status: "present",
        note: { en: "Outbreak affecting 10 ornamental species in a 2-ha greenhouse.",
          nl: "Uitbraak met 10 sierteeltsoorten in een kas van 2 ha.",
          es: "Brote que afecta a 10 especies ornamentales en un invernadero de 2 ha." } },
      { country: "Netherlands", region: "Zuid-Holland", lat: 52.0, lon: 4.5, date: "Late 2025", status: "present",
        note: { en: "Detected on Zanthoxylum bonsai.", nl: "Aangetroffen op Zanthoxylum-bonsai.", es: "Detectado en bonsáis de Zanthoxylum." } },
      { country: "Belgium", region: "Oost-Vlaanderen", lat: 51.04, lon: 3.73, date: "Nov 2025", status: "present",
        note: { en: "First detection, on bay laurel (Laurus nobilis).", nl: "Eerste detectie, op laurier (Laurus nobilis).", es: "Primera detección, en laurel (Laurus nobilis)." } },
      { country: "Spain", region: "Valencia / Murcia / Andalucía / Canary Is.", lat: 38.5, lon: -0.5, date: "Ongoing", status: "control",
        note: { en: "Present in several regions, under official eradication and control.", nl: "Aanwezig in meerdere regio's, onder officiële uitroeiing en bestrijding.", es: "Presente en varias regiones, bajo erradicación y control oficial." } },
      { country: "Greece", region: "Kriti (Crete)", lat: 35.24, lon: 24.81, date: "Jun 2025", status: "eradicated",
        note: { en: "Detected on imported avocado plants; outbreak subsequently declared eradicated.", nl: "Aangetroffen op geïmporteerde avocadoplanten; uitbraak later uitgeroeid verklaard.", es: "Detectado en plantas de aguacate importadas; brote posteriormente declarado erradicado." } },
    ],
  },

  // ----------------------------------------------------------
  // 2) Tobacco thrips — Thrips parvispinus (EPPO code THRIPV)
  // ----------------------------------------------------------
  {
    id: "thripv",
    latin: "Thrips parvispinus",
    eppoCode: "THRIPV",
    eppoUrl: "https://gd.eppo.int/taxon/THRIPV",
    statusTag: { en: "Emerging · high priority", nl: "Opkomend · hoge prioriteit", es: "Emergente · alta prioridad" },
    common: { en: "Tobacco thrips", nl: "Pepertrips", es: "Trips del tabaco" },
    commonAll: {
      en: "EN: tobacco thrips · NL: pepertrips · ES: trips del tabaco / trips del pimiento",
      nl: "EN: tobacco thrips · NL: pepertrips · ES: trips del tabaco",
      es: "EN: tobacco thrips · NL: pepertrips · ES: trips del tabaco / trips del pimiento",
    },
    photo: "./assets/thripv_9971.jpg",
    photoCaption: {
      en: "Adults inside a Mandevilla flower — a cryptic habitat.",
      nl: "Volwassenen in een Mandevilla-bloem — een verborgen habitat.",
      es: "Adultos dentro de una flor de Mandevilla — un hábitat críptico.",
    },
    photoCredit: {
      en: "courtesy Alfredo Lacasa · EPPO Global Database",
      nl: "met dank aan Alfredo Lacasa · EPPO Global Database",
      es: "cortesía de Alfredo Lacasa · EPPO Global Database",
    },
    intro: {
      en: "A recently emerged invasive thrips from tropical Asia, treated as high priority across Europe and Asia. Highly polyphagous and strongly resistant to conventional insecticides, it is a severe, difficult-to-control pest of greenhouse vegetables and ornamentals.",
      nl: "Een recent opgekomen invasieve thrips uit tropisch Azië, met hoge prioriteit in Europa en Azië. Zeer polyfaag en sterk resistent tegen conventionele insecticiden; een ernstige, moeilijk te bestrijden plaag van kasgroenten en sierteelt.",
      es: "Un trips invasor de reciente aparición procedente del Asia tropical, tratado como alta prioridad en Europa y Asia. Muy polífago y fuertemente resistente a los insecticidas convencionales; una plaga grave y difícil de controlar en hortalizas y ornamentales de invernadero.",
    },
    sections: [
      {
        h: { en: "Hosts & damage", nl: "Waardplanten & schade", es: "Huéspedes y daños" },
        p: {
          en: "Key hosts include peppers (Capsicum spp.), gerbera, gardenia, mimosa and Anthurium. In the Netherlands and Canada it is a highly invasive, hard-to-control greenhouse pest. Like other thrips, it pierces and sucks sap — often in cryptic habitats such as buds and flower structures — which makes early detection difficult.",
          nl: "Belangrijke waardplanten zijn paprika (Capsicum spp.), gerbera, gardenia, mimosa en Anthurium. In Nederland en Canada is het een zeer invasieve, moeilijk te bestrijden kasplaag. Net als andere thrips prikt en zuigt het sap — vaak in verborgen habitats zoals knoppen en bloemstructuren — wat vroege detectie bemoeilijkt.",
          es: "Los huéspedes clave incluyen pimientos (Capsicum spp.), gerbera, gardenia, mimosa y Anthurium. En los Países Bajos y Canadá es una plaga de invernadero muy invasiva y difícil de controlar. Como otros trips, perfora y succiona savia — a menudo en hábitats crípticos como brotes y estructuras florales — lo que dificulta la detección temprana.",
        },
      },
      {
        h: { en: "Defense behaviour", nl: "Verdedigingsgedrag", es: "Comportamiento defensivo" },
        p: {
          en: "It has evolved aggressive defenses that hinder biological control. Second-instar larvae (L2) and adults kill the eggs of the predatory mite Amblyseius swirskii. Larvae defend themselves by swinging their abdomens and producing anal droplets to repel attackers; mites generally fail against the more mature L2 larvae.",
          nl: "Het heeft agressieve verdedigingen ontwikkeld die biologische bestrijding hinderen. Larven van het tweede stadium (L2) en volwassenen doden de eieren van de roofmijt Amblyseius swirskii. Larven verdedigen zich door met hun achterlijf te zwaaien en anale druppels te produceren om aanvallers af te weren; roofmijten falen meestal tegen de oudere L2-larven.",
          es: "Ha desarrollado defensas agresivas que dificultan el control biológico. Las larvas de segundo estadio (L2) y los adultos matan los huevos del ácaro depredador Amblyseius swirskii. Las larvas se defienden balanceando el abdomen y produciendo gotas anales para repeler a los atacantes; los ácaros suelen fracasar contra las larvas L2 más maduras.",
        },
      },
      {
        h: { en: "Biocontrol", nl: "Biologische bestrijding", es: "Control biológico" },
        p: {
          en: "Trials in the Netherlands and Canada found common predatory mites (Neoseiulus cucumeris, Amblyseius swirskii) ineffective. Field studies in India report fungal biopesticides (Beauveria bassiana, Lecanicillium fusisporum) and bacterial agents (Bacillus albus, Pseudomonas fluorescens) giving 60–80% control in pepper. Orius species work better on non-vining hosts like Anthurium.",
          nl: "Proeven in Nederland en Canada toonden aan dat gangbare roofmijten (Neoseiulus cucumeris, Amblyseius swirskii) niet effectief zijn. Veldstudies in India melden dat schimmel-biopesticiden (Beauveria bassiana, Lecanicillium fusisporum) en bacteriële middelen (Bacillus albus, Pseudomonas fluorescens) 60–80% bestrijding geven in paprika. Orius-soorten werken beter op niet-klimmende waardplanten zoals Anthurium.",
          es: "Ensayos en los Países Bajos y Canadá hallaron ineficaces los ácaros depredadores comunes (Neoseiulus cucumeris, Amblyseius swirskii). Estudios de campo en India indican que biopesticidas fúngicos (Beauveria bassiana, Lecanicillium fusisporum) y agentes bacterianos (Bacillus albus, Pseudomonas fluorescens) logran 60–80% de control en pimiento. Las especies de Orius funcionan mejor en huéspedes no trepadores como Anthurium.",
        },
      },
      {
        h: { en: "Management", nl: "Beheer", es: "Manejo" },
        p: {
          en: "Exceptionally challenging due to its cryptic nature and insecticide resistance. Monitor preventively with sticky cards; introduce high doses of Orius laevigatus early in initial foci. Because it pupates in the soil, soil predatory mites (Hypoaspis) and entomopathogenic nematodes (Steinernema feltiae) help. Use biological agents between sprays to slow resistance.",
          nl: "Uitzonderlijk lastig door de verborgen leefwijze en insecticidenresistentie. Monitor preventief met vangplaten; zet vroeg hoge doses Orius laevigatus in op de eerste haarden. Omdat het in de bodem verpopt, helpen bodemroofmijten (Hypoaspis) en entomopathogene aaltjes (Steinernema feltiae). Gebruik biologische middelen tussen bespuitingen om resistentie te vertragen.",
          es: "Excepcionalmente difícil por su naturaleza críptica y la resistencia a insecticidas. Monitorear de forma preventiva con placas adhesivas; introducir dosis altas de Orius laevigatus temprano en los focos iniciales. Como pupa en el suelo, ayudan los ácaros depredadores de suelo (Hypoaspis) y los nematodos entomopatógenos (Steinernema feltiae). Usar agentes biológicos entre tratamientos para frenar la resistencia.",
        },
      },
    ],
    detections: [
      { country: "Italy", region: "Sicilia · Vittoria (RG)", lat: 36.95, lon: 14.53, date: "Oct 2025", status: "present",
        note: { en: "First official report in Italy — detected on gerbera flowers in a greenhouse.",
          nl: "Eerste officiële melding in Italië — aangetroffen op gerberabloemen in een kas.",
          es: "Primer informe oficial en Italia — detectado en flores de gerbera en un invernadero." } },
      { country: "Italy", region: "Sicilia · Messina", lat: 38.19, lon: 15.55, date: "Nov 2025", status: "present",
        note: { en: "Confirmed on gardenia and mimosa leaf samples.",
          nl: "Bevestigd op blad­monsters van gardenia en mimosa.",
          es: "Confirmado en muestras de hoja de gardenia y mimosa." } },
      { country: "Italy", region: "Sicilia · Agrigento", lat: 37.31, lon: 13.58, date: "Nov 2025", status: "present",
        note: { en: "Found on pepper (Capsicum annuum) — a major risk for regional vegetable production.",
          nl: "Aangetroffen op paprika (Capsicum annuum) — een groot risico voor de regionale groenteteelt.",
          es: "Hallado en pimiento (Capsicum annuum) — un riesgo importante para la producción regional de hortalizas." } },
      { country: "Spain", region: "Murcia / Andalucía (Almería)", lat: 37.0, lon: -2.4, date: "Since 2017", status: "control",
        note: { en: "First found in Spain in 2017 on ornamental pot plants; now established in Almería greenhouses.",
          nl: "Voor het eerst in Spanje gevonden in 2017 op sier-potplanten; nu gevestigd in kassen in Almería.",
          es: "Detectado por primera vez en España en 2017 en plantas ornamentales en maceta; ahora establecido en invernaderos de Almería." } },
      { country: "Netherlands", region: "Greenhouse sector", lat: 52.1, lon: 4.5, date: "Established", status: "control",
        note: { en: "Recognised as a highly invasive, difficult-to-control greenhouse pest.",
          nl: "Erkend als een zeer invasieve, moeilijk te bestrijden kasplaag.",
          es: "Reconocido como una plaga de invernadero muy invasiva y difícil de controlar." } },
    ],
  },
];

// ---- status colours (shared) ----
const STATUS_COLOR = {
  present: "var(--c-restricted)",
  control: "var(--c-few)",
  eradicated: "var(--color-text-faint)",
};
const STATUS_ORDER = ["present", "control", "eradicated"];

const maps = {}; // id -> { map, layer }

function statusLabel(s) { return t("em.status_" + s); }

function resolveColorVar(cssVar) {
  const name = cssVar.replace("var(", "").replace(")", "").trim();
  const v = getComputedStyle(document.documentElement).getPropertyValue(name);
  return (v && v.trim()) || "#d79a4f";
}

// ---- Build the EPPO-style pest index (jump links) ----
function buildIndex() {
  const host = document.getElementById("pest-index");
  if (!host) return;
  host.innerHTML = "";
  PESTS.forEach((p) => {
    const a = document.createElement("a");
    a.className = "pest-index-item";
    a.href = "#pest-" + p.id;
    a.innerHTML =
      `<span class="pi-latin">${p.latin}</span>` +
      `<span class="pi-common">${tr(p.common)}</span>` +
      `<span class="pi-code">${p.eppoCode}</span>`;
    host.appendChild(a);
  });
}

// ---- Build all pest profiles ----
function buildProfiles() {
  const host = document.getElementById("pest-registry");
  if (!host) return;
  host.innerHTML = "";
  PESTS.forEach((p) => host.appendChild(renderProfile(p)));
}

function renderProfile(p) {
  const article = document.createElement("article");
  article.className = "pest-profile";
  article.id = "pest-" + p.id;

  const sectionsHtml = p.sections
    .map(
      (s) =>
        `<div class="pp-section"><h4>${tr(s.h)}</h4><p>${tr(s.p)}</p></div>`
    )
    .join("");

  article.innerHTML =
    `<header class="pp-head">
      <div>
        <p class="eyebrow">${tr(p.statusTag)}</p>
        <h3 class="pp-name">${p.latin}</h3>
        <p class="pp-common">${tr(p.common)}</p>
        <p class="pp-common-alt">${tr(p.commonAll)}</p>
      </div>
      <span class="code-chip">EPPO · ${p.eppoCode}</span>
    </header>

    <div class="pp-body-row">
      <figure class="pp-figure">
        <img src="${p.photo}" alt="${p.latin} — ${tr(p.common)}" loading="lazy" />
        <figcaption>
          <span>${tr(p.photoCaption)}</span><br />
          <span class="pp-fig-credit">© EPPO Global Database · ${tr(p.photoCredit)}</span>
        </figcaption>
      </figure>
      <p class="pp-intro">${tr(p.intro)}</p>
    </div>

    <div class="pp-map-row">
      <div class="pp-rail">
        <h4>${t("em.map_h")}</h4>
        <p class="rail-explain">${t("em.map_explain")}</p>
        <div class="rail-list" data-role="legend"></div>
        <ul class="em-det-list" data-role="detlist"></ul>
      </div>
      <div class="pp-map-wrap">
        <div class="em-map" data-role="map" id="em-map-${p.id}" role="application" aria-label="Map of European ${tr(p.common)} detections"></div>
        <p class="map-caption"><span>${t("em.map_note")}</span></p>
      </div>
    </div>

    <div class="pp-grid">${sectionsHtml}</div>

    <p class="pp-source">
      <span>${t("em.source_label")}</span>
      <a href="${p.eppoUrl}" target="_blank" rel="noopener noreferrer">EPPO Global Database — ${p.latin}</a>
      <span>${t("em.source_rs")}</span>
    </p>`;

  // fill legend + detection list (post-insert so handlers can use elements)
  const legend = article.querySelector('[data-role="legend"]');
  legend.innerHTML = STATUS_ORDER.map(
    (s) =>
      `<span class="rl-dot-row"><i class="rl-dot" style="background:${STATUS_COLOR[s]}"></i>${statusLabel(s)}</span>`
  ).join("");

  const detlist = article.querySelector('[data-role="detlist"]');
  detlist.innerHTML = p.detections
    .map(
      (d) =>
        `<li class="em-det"><span class="em-det-dot" style="background:${STATUS_COLOR[d.status] || "var(--c-restricted)"}"></span>` +
        `<div><p class="em-det-head"><strong>${d.country}</strong> · ${d.region}</p>` +
        `<p class="em-det-meta">${d.date} · ${statusLabel(d.status)}</p>` +
        `<p class="em-det-note">${tr(d.note)}</p></div></li>`
    )
    .join("");

  return article;
}

// ---- Build a Leaflet map per pest ----
function buildMaps() {
  if (typeof L === "undefined") return;
  PESTS.forEach((p) => {
    const el = document.getElementById("em-map-" + p.id);
    if (!el) return;
    const map = L.map(el, {
      center: [44, 7],
      zoom: 4,
      minZoom: 3,
      maxZoom: 7,
      scrollWheelZoom: false,
      worldCopyJump: true,
    });
    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
      maxZoom: 19,
    }).addTo(map);
    const layer = L.layerGroup().addTo(map);
    maps[p.id] = { map, layer };
    renderMarkers(p);
    // fit to detections
    const pts = p.detections.map((d) => [d.lat, d.lon]);
    if (pts.length) {
      try { map.fitBounds(pts, { padding: [30, 30], maxZoom: 6 }); } catch (_) {}
    }
  });
}

function renderMarkers(p) {
  const m = maps[p.id];
  if (!m) return;
  m.layer.clearLayers();
  p.detections.forEach((d) => {
    const color = STATUS_COLOR[d.status] || "var(--c-restricted)";
    const marker = L.circleMarker([d.lat, d.lon], {
      radius: 9,
      color: "#fff",
      weight: 1.5,
      fillColor: resolveColorVar(color),
      fillOpacity: 0.85,
    });
    marker.bindPopup(
      `<strong>${d.country}</strong> — ${d.region}<br>` +
        `<span style="opacity:.7">${d.date} · ${statusLabel(d.status)}</span><br>` +
        `<span>${tr(d.note)}</span>`
    );
    marker.addTo(m.layer);
  });
}

function rerenderAll() {
  // re-render text-bearing pieces on language change
  buildIndex();
  buildProfiles();
  // maps already exist in DOM nodes that buildProfiles just replaced — rebuild
  Object.keys(maps).forEach((k) => { try { maps[k].map.remove(); } catch (_) {} delete maps[k]; });
  buildMaps();
}

function init() {
  initI18n();
  buildIndex();
  buildProfiles();
  buildMaps();
  onLangChange(() => rerenderAll());
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
