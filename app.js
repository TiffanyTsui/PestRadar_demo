const pestMeta = {
  whitefly: {
    label: 'Whiteflies',
    color: '#317aa2',
    origin: [51.996, 4.198],
    originName: 'Naaldwijk West detection cluster',
    baseTrap: 8,
    diffusion: 1.0,
  },
  thrips: {
    label: 'Thrips',
    color: '#c06b25',
    origin: [52.006, 4.226],
    originName: 'Honselersdijk ornamentals pulse',
    baseTrap: 13,
    diffusion: 0.75,
  },
  aphids: {
    label: 'Aphids',
    color: '#2f7f4f',
    origin: [51.981, 4.248],
    originName: 'De Lier pepper cluster',
    baseTrap: 6,
    diffusion: 0.55,
  },
};

const temperatureProfiles = {
  favorable: { label: 'Favorable', temp: 24, tMin: 19, tMax: 28, rh: 78, suitability: 1, note: 'near whitefly growth optimum' },
  cool: { label: 'Cool', temp: 17, tMin: 13, tMax: 20, rh: 72, suitability: 0.42, note: 'slower development threshold zone' },
  hot: { label: 'Heat-stress', temp: 31, tMin: 25, tMax: 35, rh: 64, suitability: 0.55, note: 'activity persists but survival pressure increases' },
};

const windProfiles = {
  SW: { label: 'SW → NE', speed: 4.8, bearing: 45, code: '225°' },
  W: { label: 'W → E', speed: 5.4, bearing: 90, code: '270°' },
  NW: { label: 'NW → SE', speed: 3.8, bearing: 135, code: '315°' },
  S: { label: 'S → N', speed: 4.2, bearing: 0, code: '180°' },
};

const forecastWaves = {
  favorable: {
    temp: [-1.2, -0.6, 0.2, 0.7, 1.1, 0.8, 0.4, 0.9, 1.4, 1.0, 0.5, -0.2],
    rh: [4, 5, 2, -1, -3, 0, 3, 1, -2, -1, 2, 4],
    wind: [-0.4, -0.1, 0.2, 0.7, 0.4, -0.2, 0.1, 0.8, 0.5, 0.0, -0.3, -0.1],
    rain: [0.2, 0.0, 0.0, 0.6, 1.4, 0.3, 0.0, 0.0, 0.8, 2.1, 0.4, 0.0],
    radiation: [430, 465, 510, 525, 490, 455, 475, 520, 505, 420, 460, 500],
  },
  cool: {
    temp: [-1.8, -1.4, -0.8, -0.4, 0.1, 0.3, -0.2, -0.6, 0.2, 0.5, -0.1, -0.7],
    rh: [7, 8, 5, 4, 3, 6, 9, 7, 5, 4, 6, 8],
    wind: [0.2, 0.5, 0.9, 0.6, 0.1, -0.2, 0.0, 0.4, 0.7, 0.5, 0.2, -0.1],
    rain: [1.6, 2.4, 3.8, 1.1, 0.7, 1.9, 4.2, 2.2, 1.3, 0.5, 1.0, 2.7],
    radiation: [250, 285, 310, 340, 365, 330, 280, 300, 345, 370, 335, 295],
  },
  hot: {
    temp: [-0.3, 0.2, 0.9, 1.6, 2.2, 1.8, 1.1, 0.7, 1.4, 2.4, 1.7, 0.8],
    rh: [-4, -6, -8, -9, -11, -7, -5, -6, -10, -12, -8, -5],
    wind: [-0.6, -0.4, -0.2, 0.0, 0.3, 0.6, 0.2, -0.1, 0.4, 0.7, 0.1, -0.3],
    rain: [0.0, 0.0, 0.0, 0.2, 0.0, 0.0, 0.6, 0.0, 0.0, 0.3, 0.0, 0.0],
    radiation: [560, 590, 630, 655, 680, 640, 610, 620, 665, 690, 635, 600],
  },
};

const interventionProfiles = {
  baseline: { label: 'Observed Encarsia schedule', multiplier: 0.88, releaseDay: 6, lag: false },
  'early-release': { label: 'Early Encarsia release', multiplier: 0.68, releaseDay: 3, lag: false },
  'delayed-release': { label: 'Delayed release / scouting lag', multiplier: 1.16, releaseDay: 11, lag: true },
};

const baseLocations = [
  ['Naaldwijk West', 51.996, 4.198, 'Tomato'],
  ['Honselersdijk glass belt', 52.006, 4.226, 'Ornamentals'],
  ['De Lier north', 51.981, 4.248, 'Sweet pepper'],
  ['Maasdijk logistics edge', 51.957, 4.214, 'Cucumber'],
  ['Monster dune fringe', 52.026, 4.173, 'Ornamentals'],
  ['Poeldijk south', 52.024, 4.218, 'Tomato'],
  ['Wateringen cluster', 52.027, 4.270, 'Sweet pepper'],
  ['Kwintsheul corridor', 52.013, 4.254, 'Cucumber'],
  ["'s-Gravenzande east", 51.998, 4.171, 'Tomato'],
  ['Ter Heijde inland', 52.032, 4.184, 'Ornamentals'],
  ['Heenweg nursery strip', 51.975, 4.174, 'Sweet pepper'],
  ['Vlietpolder greenhouses', 51.991, 4.279, 'Cucumber'],
];

const cropStages = {
  Tomato: ['fruit set', 'truss 5 harvest', 'leaf pruning', 'late vegetative'],
  'Sweet pepper': ['flowering', 'fruit expansion', 'harvest flush', 'canopy closure'],
  Cucumber: ['rapid vine growth', 'first harvest', 'high-wire turn', 'fruit load peak'],
  Ornamentals: ['propagation', 'bud formation', 'flower initiation', 'shipping week'],
};

const greenhouses = Array.from({ length: 48 }, (_, index) => {
  const base = baseLocations[index % baseLocations.length];
  const ring = Math.floor(index / baseLocations.length);
  const latJitter = (((index * 19) % 13) - 6) * 0.00145 + ring * 0.0011;
  const lngJitter = (((index * 23) % 15) - 7) * 0.00165 - ring * 0.0008;
  const crop = base[3];
  return {
    greenhouseId: `WL-GH-${String(index + 1).padStart(3, '0')}`,
    area: base[0],
    lat: base[1] + latJitter,
    lng: base[2] + lngJitter,
    crop,
    cropStage: cropStages[crop][index % cropStages[crop].length],
    ventilation: ['roof vents open', 'screened vents', 'limited ventilation', 'insect netted bays'][index % 4],
    connectivity: 0.72 + ((index * 7) % 22) / 100,
    scoutBaseline: 3 + ((index * 5) % 9),
  };
});

const state = {
  scenario: 'whitefly',
  crop: 'All',
  day: 10,
  horizon: 14,
  temperature: 'favorable',
  wind: 'SW',
  intervention: 'baseline',
  heat: true,
  hotspot: true,
  uncertainty: true,
  boundary: true,
  playing: false,
  playbackTimer: null,
};

const westlandBoundary = [
  [52.044, 4.148],
  [52.049, 4.278],
  [51.971, 4.302],
  [51.944, 4.186],
  [51.984, 4.126],
];

const map = L.map('map', {
  zoomControl: true,
  scrollWheelZoom: true,
}).setView([51.995, 4.215], 12);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 18,
  attribution: '&copy; OpenStreetMap contributors',
}).addTo(map);

const hotspotLayer = L.layerGroup().addTo(map);
const uncertaintyLayer = L.layerGroup().addTo(map);
const sensorLayer = L.layerGroup().addTo(map);
const windLayer = L.layerGroup().addTo(map);
const originLayer = L.layerGroup().addTo(map);
let heatLayer = L.heatLayer([], {
  radius: 34,
  blur: 24,
  maxZoom: 15,
  gradient: {
    0.15: '#7fc8d6',
    0.38: '#f3e59b',
    0.58: '#f1bb83',
    0.78: '#e75d2c',
    1: '#b71918',
  },
}).addTo(map);

const boundaryLayer = L.polygon(westlandBoundary, {
  color: '#276c4d',
  weight: 2,
  opacity: 0.85,
  fillColor: '#276c4d',
  fillOpacity: 0.05,
  dashArray: '6 6',
}).addTo(map);

boundaryLayer.bindTooltip('Approximate 100 km² Westland greenhouse context area', { sticky: true });

const els = {
  scenario: document.getElementById('scenario-filter'),
  crop: document.getElementById('crop-filter'),
  day: document.getElementById('day-filter'),
  dayOutput: document.getElementById('day-output'),
  temperature: document.getElementById('temperature-filter'),
  wind: document.getElementById('wind-filter'),
  intervention: document.getElementById('intervention-filter'),
  horizon: document.getElementById('week-filter'),
  horizonOutput: document.getElementById('week-output'),
  heat: document.getElementById('toggle-heat'),
  hotspot: document.getElementById('toggle-hotspot'),
  uncertainty: document.getElementById('toggle-uncertainty'),
  boundary: document.getElementById('toggle-boundary'),
  playback: document.getElementById('playback-toggle'),
  reset: document.getElementById('reset-filters'),
  table: document.getElementById('incident-table'),
  kpiIncidents: document.getElementById('kpi-incidents'),
  kpiHighRisk: document.getElementById('kpi-high-risk'),
  kpiTrap: document.getElementById('kpi-humidity'),
  kpiWind: document.getElementById('kpi-pest'),
  kpiWindNote: document.getElementById('kpi-wind-note'),
  kpiNote: document.getElementById('kpi-incidents-note'),
  activeSummary: document.getElementById('active-summary'),
  windCaption: document.getElementById('wind-caption'),
  scenarioNote: document.getElementById('scenario-note-text'),
  comparisonGrid: document.getElementById('comparison-grid'),
  comparisonSummary: document.getElementById('comparison-summary'),
  weatherSummary: document.getElementById('weather-summary'),
  weatherSelected: document.getElementById('weather-selected'),
  weatherForecast: document.getElementById('weather-forecast'),
  report: document.getElementById('generate-report'),
  reportStatus: document.getElementById('report-status'),
};

const chartCtx = document.getElementById('timeline-chart');
const timelineChart = new Chart(chartCtx, {
  type: 'line',
  data: {
    labels: [],
    datasets: [
      {
        label: 'Mean trap index',
        data: [],
        borderColor: '#b71918',
        backgroundColor: 'rgba(183, 25, 24, 0.12)',
        pointRadius: 3,
        borderWidth: 2,
        tension: 0.35,
        fill: true,
      },
      {
        label: 'Hotspot area index',
        data: [],
        borderColor: '#276c4d',
        backgroundColor: 'rgba(39, 108, 77, 0.12)',
        pointRadius: 3,
        borderWidth: 2,
        tension: 0.35,
      },
    ],
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: '#657060', usePointStyle: true, boxWidth: 8 },
      },
      tooltip: {
        callbacks: {
          title: (items) => `Day ${items[0].label}`,
          label: (item) => `${item.dataset.label}: ${Math.round(item.raw)}`,
        },
      },
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#657060' } },
      y: {
        min: 0,
        max: 100,
        ticks: { color: '#657060' },
        grid: { color: 'rgba(101, 112, 96, 0.18)' },
      },
    },
  },
});

function degToRad(deg) {
  return (deg * Math.PI) / 180;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function forecastForDay(day = state.day) {
  const profile = temperatureProfiles[state.temperature];
  const wind = windProfiles[state.wind];
  const index = clamp(day - 3, 0, 11);
  const wave = forecastWaves[state.temperature];
  const meanTemp = Number((profile.temp + wave.temp[index]).toFixed(1));
  const minTemp = Math.round(profile.tMin + wave.temp[index] * 0.65);
  const maxTemp = Math.round(profile.tMax + wave.temp[index] * 0.9);
  const rh = Math.round(clamp(profile.rh + wave.rh[index], 45, 92));
  const windSpeed = Number(clamp(wind.speed + wave.wind[index], 1.8, 8.2).toFixed(1));
  const precipitation = Number(wave.rain[index].toFixed(1));
  const radiation = wave.radiation[index];
  const tempSuitability = clamp(1 - Math.abs(meanTemp - 24) / 13, 0.12, 1);
  const humiditySuitability = rh >= 50 && rh <= 80 ? 1 : clamp(1 - Math.abs(rh - 72) / 38, 0.35, 0.96);
  const rainPenalty = precipitation > 4 ? 0.76 : precipitation > 1 ? 0.9 : 1;
  const windPenalty = windSpeed > 6 ? 0.86 : 1;
  const baselineWeight = state.scenario === 'whitefly' ? 1 : state.scenario === 'thrips' ? 0.9 : 0.78;
  const suitability = clamp(tempSuitability * humiditySuitability * rainPenalty * windPenalty * baselineWeight, 0.1, 1);
  const label = suitability >= 0.78 ? 'favorable whitefly window' : suitability >= 0.5 ? 'mixed pressure window' : 'suppressed development window';
  return {
    day,
    meanTemp,
    minTemp,
    maxTemp,
    rh,
    windSpeed,
    windLabel: wind.label,
    windDirection: wind.code,
    precipitation,
    radiation,
    suitability,
    label,
  };
}

function forecastSeries() {
  return Array.from({ length: 12 }, (_, index) => forecastForDay(index + 3));
}

function windVector() {
  const bearing = windProfiles[state.wind].bearing;
  const rad = degToRad(bearing);
  return { lat: Math.cos(rad), lng: Math.sin(rad) };
}

function distanceKm(aLat, aLng, bLat, bLng) {
  const latKm = (aLat - bLat) * 111;
  const lngKm = (aLng - bLng) * 111 * Math.cos(degToRad((aLat + bLat) / 2));
  return Math.sqrt(latKm * latKm + lngKm * lngKm);
}

function projectDownwind(lat, lng, originLat, originLng) {
  const vector = windVector();
  const dLatKm = (lat - originLat) * 111;
  const dLngKm = (lng - originLng) * 111 * Math.cos(degToRad(originLat));
  return dLatKm * vector.lat + dLngKm * vector.lng;
}

function scenarioCenter(day = state.day) {
  const scenario = pestMeta[state.scenario];
  const wind = windVector();
  const speed = forecastForDay(day).windSpeed;
  const shiftKm = day * speed * 0.075 * scenario.diffusion;
  return [
    scenario.origin[0] + (wind.lat * shiftKm) / 111,
    scenario.origin[1] + (wind.lng * shiftKm) / (111 * Math.cos(degToRad(scenario.origin[0]))),
  ];
}

function offsetFromOrigin(forwardKm, lateralKm, origin = pestMeta[state.scenario].origin) {
  const wind = windVector();
  const perpendicular = { lat: -wind.lng, lng: wind.lat };
  return [
    origin[0] + (wind.lat * forwardKm + perpendicular.lat * lateralKm) / 111,
    origin[1] + (wind.lng * forwardKm + perpendicular.lng * lateralKm) / (111 * Math.cos(degToRad(origin[0]))),
  ];
}

function uncertaintyCones(day = state.day) {
  const scenario = pestMeta[state.scenario];
  const weather = forecastForDay(day);
  const intervention = interventionProfiles[state.intervention];
  const origin = scenario.origin;
  const releaseEffect = day >= intervention.releaseDay ? intervention.multiplier : intervention.lag ? 1.12 : 1;
  const baseLength = (0.65 + day * weather.windSpeed * 0.082 + day * weather.suitability * 0.16) * scenario.diffusion * releaseEffect;
  const baseWidth = (0.34 + baseLength * 0.34 + weather.windSpeed * 0.045) * (0.85 + weather.suitability * 0.35);
  return [
    { key: 'worst-case', label: 'Worst-case envelope', length: baseLength * 1.38, width: baseWidth * 1.22, color: '#a13544', opacity: 0.14, dashArray: '2 0' },
    { key: 'expected', label: 'Expected envelope', length: baseLength, width: baseWidth * 0.78, color: '#d19900', opacity: 0.18, dashArray: '6 4' },
    { key: 'optimistic', label: 'Optimistic envelope', length: baseLength * 0.68, width: baseWidth * 0.48, color: '#20808d', opacity: 0.2, dashArray: '3 5' },
  ].map((cone) => {
    const nearWidth = cone.width * 0.18;
    const midLength = cone.length * 0.56;
    const midWidth = cone.width * 0.72;
    const tip = offsetFromOrigin(cone.length, 0, origin);
    const polygon = [
      offsetFromOrigin(0.08, -nearWidth, origin),
      offsetFromOrigin(midLength, -midWidth, origin),
      offsetFromOrigin(cone.length * 0.9, -cone.width, origin),
      tip,
      offsetFromOrigin(cone.length * 0.9, cone.width, origin),
      offsetFromOrigin(midLength, midWidth, origin),
      offsetFromOrigin(0.08, nearWidth, origin),
    ];
    return { ...cone, polygon, weather };
  });
}

function interventionFactor(site, day = state.day, interventionKey = state.intervention) {
  const intervention = interventionProfiles[interventionKey];
  if (day < intervention.releaseDay) return intervention.lag ? 1.08 : 1;
  const localEffect = site.connectivity > 0.84 ? 0.95 : 1.02;
  return intervention.multiplier * localEffect;
}

function intensityAt(lat, lng, day = state.day, site = { connectivity: 0.82 }, interventionKey = state.intervention) {
  const scenario = pestMeta[state.scenario];
  const weather = forecastForDay(day);
  const center = scenarioCenter(day);
  const originDistance = distanceKm(lat, lng, scenario.origin[0], scenario.origin[1]);
  const centerDistance = distanceKm(lat, lng, center[0], center[1]);
  const downwind = Math.max(0, projectDownwind(lat, lng, scenario.origin[0], scenario.origin[1]));
  const spreadSigma = 0.75 + day * 0.1 * scenario.diffusion + weather.windSpeed * 0.045;
  const sourcePulse = Math.exp(-(originDistance * originDistance) / (2 * 0.72 * 0.72)) * 0.55;
  const diffusionPulse = Math.exp(-(centerDistance * centerDistance) / (2 * spreadSigma * spreadSigma));
  const windBoost = 1 + Math.min(downwind / 6, 0.38);
  const growth = Math.min(1.35, 0.3 + day / 10) * weather.suitability;
  const managed = interventionFactor(site, day, interventionKey);
  return Math.max(0, Math.min(1, (sourcePulse + diffusionPulse * windBoost * growth) * site.connectivity * managed));
}

function modeledGreenhouses(day = state.day, interventionKey = state.intervention) {
  const scenario = pestMeta[state.scenario];
  const weather = forecastForDay(day);
  const intervention = interventionProfiles[interventionKey];
  return greenhouses
    .filter((site) => state.crop === 'All' || site.crop === state.crop)
    .map((site, index) => {
      const intensity = intensityAt(site.lat, site.lng, day, site, interventionKey);
      const previous = intensityAt(site.lat, site.lng, Math.max(1, day - 3), site, interventionKey);
      const trapCount = Math.max(
        0,
        Math.round(site.scoutBaseline + scenario.baseTrap * intensity + intensity * 62 + day * weather.suitability * 1.4 + ((index * 3) % 5)),
      );
      const risk = Math.round(Math.min(98, intensity * 88 + weather.suitability * 10 + (trapCount > 45 ? 7 : 0)));
      const release = intervention.releaseDay;
      return {
        ...site,
        pest: scenario.label,
        intensity,
        previous,
        trapCount,
        risk,
        temp: weather.meanTemp,
        tMin: weather.minTemp,
        tMax: weather.maxTemp,
        rh: weather.rh,
        windSpeed: weather.windSpeed,
        windDirection: weather.windDirection,
        precipitation: weather.precipitation,
        radiation: weather.radiation,
        suitability: weather.suitability,
        biocontrol:
          day >= release
            ? `${intervention.label}`
            : `release planned day ${release}`,
        biocontrolLag: interventionKey === 'delayed-release' && day < release,
      };
    });
}

function hotspotClass(current, previous) {
  if (current > 0.72 && previous > 0.62) return { name: 'Persistent hot spot', color: '#7f1615', opacity: 0.58 };
  if (current > 0.58 && previous < 0.28) return { name: 'New hot spot', color: '#b71918', opacity: 0.62 };
  if (current > 0.5 && current - previous > 0.12) return { name: 'Intensifying hot spot', color: '#e75d2c', opacity: 0.56 };
  if (previous > 0.48 && previous - current > 0.08) return { name: 'Diminishing hot spot', color: '#f1bb83', opacity: 0.48 };
  if (previous > 0.45 && current < 0.36) return { name: 'Historical hot spot', color: '#cdb49e', opacity: 0.4 };
  if (current > 0.38) return { name: 'Sporadic hot spot', color: '#f3e59b', opacity: 0.35 };
  return { name: 'No pattern detected', color: '#7fc8d6', opacity: 0.12 };
}

function gridCells(day = state.day, interventionKey = state.intervention) {
  const cells = [];
  const minLat = 51.948;
  const maxLat = 52.042;
  const minLng = 4.145;
  const maxLng = 4.295;
  const rows = 9;
  const cols = 13;
  const stepLat = (maxLat - minLat) / rows;
  const stepLng = (maxLng - minLng) / cols;
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const south = minLat + row * stepLat;
      const north = south + stepLat;
      const west = minLng + col * stepLng;
      const east = west + stepLng;
      const lat = (south + north) / 2;
      const lng = (west + east) / 2;
      const pseudoSite = { connectivity: 0.78 + ((row + col) % 5) * 0.04 };
      const current = intensityAt(lat, lng, day, pseudoSite, interventionKey);
      const previous = intensityAt(lat, lng, Math.max(1, day - 3), pseudoSite, interventionKey);
      const klass = hotspotClass(current, previous);
      if (klass.name !== 'No pattern detected' || current > 0.24) {
        cells.push({ bounds: [[south, west], [north, east]], lat, lng, current, previous, klass });
      }
    }
  }
  return cells;
}

function markerClass(site) {
  if (site.risk >= 78) return 'critical';
  if (site.risk >= 58) return 'hot';
  if (site.risk >= 34) return 'watch';
  return '';
}

function renderHotspotGrid() {
  hotspotLayer.clearLayers();
  gridCells().forEach((cell) => {
    const rect = L.rectangle(cell.bounds, {
      color: cell.klass.color,
      weight: 0.5,
      opacity: 0.45,
      fillColor: cell.klass.color,
      fillOpacity: cell.klass.opacity,
    });
    rect.bindTooltip(`${cell.klass.name} · intensity ${Math.round(cell.current * 100)}`, { sticky: true });
    rect.addTo(hotspotLayer);
  });
  if (state.hotspot && !map.hasLayer(hotspotLayer)) hotspotLayer.addTo(map);
  if (!state.hotspot && map.hasLayer(hotspotLayer)) map.removeLayer(hotspotLayer);
}

function renderUncertaintyCones() {
  uncertaintyLayer.clearLayers();
  uncertaintyCones().forEach((cone) => {
    const polygon = L.polygon(cone.polygon, {
      color: cone.color,
      weight: 2,
      opacity: 0.78,
      fillColor: cone.color,
      fillOpacity: cone.opacity,
      dashArray: cone.dashArray,
      interactive: true,
    });
    polygon.bindTooltip(
      `${cone.label} · day ${state.day} · ${Math.round(cone.length * 10) / 10} km downwind · ${Math.round(cone.weather.suitability * 100)}% suitability`,
      { sticky: true },
    );
    polygon.addTo(uncertaintyLayer);
  });
  if (state.uncertainty && !map.hasLayer(uncertaintyLayer)) uncertaintyLayer.addTo(map);
  if (!state.uncertainty && map.hasLayer(uncertaintyLayer)) map.removeLayer(uncertaintyLayer);
}

function renderWind() {
  windLayer.clearLayers();
  const center = scenarioCenter(state.day);
  const weather = forecastForDay();
  const arrow = L.marker(center, {
    icon: L.divIcon({
      html: `<div class="wind-arrow" style="transform: rotate(${windProfiles[state.wind].bearing}deg)">↑</div>`,
      className: '',
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    }),
    title: `Wind ${weather.windLabel}`,
  });
  arrow.bindTooltip(`Wind ${weather.windLabel}, ${weather.windSpeed} m/s`, { sticky: true });
  arrow.addTo(windLayer);
}

function renderOrigin() {
  originLayer.clearLayers();
  const scenario = pestMeta[state.scenario];
  const origin = L.marker(scenario.origin, {
    icon: L.divIcon({
      html: '<div class="origin-marker" aria-hidden="true"></div>',
      className: '',
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    }),
    title: scenario.originName,
  });
  origin.bindTooltip(`First detection: ${scenario.originName}`, { sticky: true });
  origin.addTo(originLayer);
}

function renderMap(records) {
  sensorLayer.clearLayers();
  records.forEach((site) => {
    const marker = L.marker([site.lat, site.lng], {
      icon: L.divIcon({
        html: `<span class="sensor-marker ${markerClass(site)}" aria-hidden="true"></span>`,
        className: '',
        iconSize: [22, 22],
        iconAnchor: [11, 11],
      }),
      title: `${site.greenhouseId} ${site.pest} risk`,
    });
    marker.bindPopup(`
      <p class="popup-title">${site.greenhouseId} · ${site.pest}</p>
      <dl class="popup-grid">
        <dt>Crop</dt><dd>${site.crop}, ${site.cropStage}</dd>
        <dt>Trap count</dt><dd>${site.trapCount} / yellow card / week</dd>
        <dt>Risk</dt><dd>${site.risk}/100</dd>
        <dt>Biocontrol</dt><dd>${site.biocontrol}</dd>
        <dt>Weather</dt><dd>${site.temp} °C mean, RH ${site.rh}%, wind ${site.windDirection}, rain ${site.precipitation} mm</dd>
        <dt>Ventilation</dt><dd>${site.ventilation}</dd>
      </dl>
    `);
    marker.addTo(sensorLayer);
  });

  const heatPoints = records.map((site) => [site.lat, site.lng, Math.max(0.08, site.intensity)]);
  heatLayer.setLatLngs(heatPoints);
  renderHotspotGrid();
  renderWind();
  renderOrigin();
  if (state.heat && !map.hasLayer(heatLayer)) heatLayer.addTo(map);
  if (!state.heat && map.hasLayer(heatLayer)) map.removeLayer(heatLayer);
  if (state.boundary && !map.hasLayer(boundaryLayer)) boundaryLayer.addTo(map);
  if (!state.boundary && map.hasLayer(boundaryLayer)) map.removeLayer(boundaryLayer);
  renderUncertaintyCones();
}

function renderKpis(records) {
  const weather = forecastForDay();
  const atRisk = records.filter((site) => site.risk >= 42).length;
  const intensifying = gridCells().filter((cell) => cell.klass.name.includes('Intensifying') || cell.klass.name.includes('New')).length;
  const meanTrap = records.length
    ? Math.round(records.reduce((sum, site) => sum + site.trapCount, 0) / records.length)
    : 0;
  els.kpiIncidents.textContent = atRisk;
  els.kpiHighRisk.textContent = intensifying;
  els.kpiTrap.textContent = meanTrap;
  els.kpiWind.textContent = `${weather.windSpeed} m/s`;
  els.kpiWindNote.textContent = `${weather.windLabel} forecast vector`;
  els.kpiNote.textContent = `${pestMeta[state.scenario].label}, day ${state.day}, ${weather.meanTemp} °C`;
  els.activeSummary.textContent = `${records.length} greenhouse records · ${state.horizon}-day horizon`;
  els.windCaption.textContent = `Forecast wind ${weather.windLabel} · ${weather.windSpeed} m/s · direction ${weather.windDirection}`;
  els.scenarioNote.textContent = `${pestMeta[state.scenario].label} pressure starts at ${pestMeta[state.scenario].originName}, then diffuses with ${weather.windLabel} wind during a ${weather.label}; day ${state.day} forecast is ${weather.meanTemp} °C, RH ${weather.rh}%, ${weather.precipitation} mm rain, suitability ${Math.round(weather.suitability * 100)}%.`;
}

function renderWeather() {
  const selected = forecastForDay();
  const series = forecastSeries();
  els.weatherSummary.textContent = `Day ${state.day} · ${selected.label} · ${Math.round(selected.suitability * 100)}% suitability`;
  els.weatherSelected.innerHTML = `
    <h3>Day ${selected.day}: ${selected.label}</h3>
    <p>Fictional forecast based on KNMI-style variables. The suitability score feeds the trap-count growth, hotspot intensity, and downwind diffusion speed for the selected day.</p>
    <div class="weather-metrics">
      <span><strong>${selected.meanTemp} °C</strong>Mean temperature</span>
      <span><strong>${selected.rh}%</strong>Relative humidity</span>
      <span><strong>${selected.windLabel}</strong>${selected.windSpeed} m/s wind</span>
      <span><strong>${selected.precipitation} mm</strong>Rain signal</span>
      <span><strong>${selected.radiation}</strong>W/m² radiation</span>
      <span><strong>${Math.round(selected.suitability * 100)}%</strong>Pest suitability</span>
    </div>
  `;
  els.weatherForecast.innerHTML = series
    .map((day) => `
      <button
        type="button"
        class="weather-day ${day.day === state.day ? 'is-active' : ''}"
        data-forecast-day="${day.day}"
        data-testid="button-weather-day-${day.day}"
        aria-label="Show pest diffusion forecast for day ${day.day}"
      >
        <span>Day ${day.day}</span>
        <strong>${day.meanTemp} °C</strong>
        <span>RH ${day.rh}% · ${day.windSpeed} m/s</span>
        <span>${day.precipitation} mm rain</span>
        <span class="suitability-bar" aria-hidden="true"><i style="width: ${Math.round(day.suitability * 100)}%"></i></span>
        <span>${Math.round(day.suitability * 100)}% suitable</span>
      </button>
    `)
    .join('');
}

function renderChart() {
  const days = Array.from({ length: state.horizon - 2 }, (_, index) => index + 3);
  const trapIndex = days.map((day) => {
    const records = modeledGreenhouses(day);
    const meanTrap = records.reduce((sum, site) => sum + site.trapCount, 0) / records.length;
    return Math.min(100, meanTrap * 1.45);
  });
  const hotspotArea = days.map((day) => {
    const count = gridCells(day).filter((cell) => cell.klass.name !== 'No pattern detected').length;
    return Math.min(100, count * 2.1);
  });
  timelineChart.data.labels = days.map(String);
  timelineChart.data.datasets[0].data = trapIndex;
  timelineChart.data.datasets[1].data = hotspotArea;
  timelineChart.update();
}

function summarizeIntervention(interventionKey) {
  const records = modeledGreenhouses(state.horizon, interventionKey);
  const meanTrap = records.length
    ? Math.round(records.reduce((sum, site) => sum + site.trapCount, 0) / records.length)
    : 0;
  const atRisk = records.filter((site) => site.risk >= 42).length;
  const hotspotCells = gridCells(state.horizon, interventionKey).filter((cell) =>
    ['New hot spot', 'Intensifying hot spot', 'Persistent hot spot'].includes(cell.klass.name),
  ).length;
  return {
    key: interventionKey,
    label: interventionProfiles[interventionKey].label,
    releaseDay: interventionProfiles[interventionKey].releaseDay,
    meanTrap,
    atRisk,
    hotspotCells,
    score: meanTrap * 1.2 + atRisk * 2 + hotspotCells * 1.5,
  };
}

function renderComparison() {
  const summaries = ['early-release', 'baseline', 'delayed-release'].map(summarizeIntervention);
  const best = [...summaries].sort((a, b) => a.score - b.score)[0];
  const worst = [...summaries].sort((a, b) => b.score - a.score)[0];
  els.comparisonSummary.textContent = `${best.label} gives the lowest ${state.horizon}-day pressure; ${worst.label.toLowerCase()} leaves the broadest hotspot footprint.`;
  els.comparisonGrid.innerHTML = summaries
    .map((item) => {
      const isBest = item.key === best.key;
      const story =
        item.key === 'early-release'
          ? 'Starts releases close to first detection, matching the preventive logic of weekly introductions from first sighting.'
          : item.key === 'baseline'
            ? 'Represents a plausible observed schedule: response after confirmation, with moderate containment.'
            : 'Allows an early population pulse before release, making the downwind hotspot harder to contain.';
      return `
        <article class="strategy-card ${isBest ? 'is-best' : ''}">
          <span class="strategy-badge">${isBest ? 'Best containment' : `Release day ${item.releaseDay}`}</span>
          <h3>${item.label}</h3>
          <p>${story}</p>
          <div class="strategy-metrics">
            <span><strong>${item.meanTrap}</strong>Trap mean</span>
            <span><strong>${item.atRisk}</strong>At-risk GH</span>
            <span><strong>${item.hotspotCells}</strong>Hot cells</span>
          </div>
        </article>
      `;
    })
    .join('');
}

function riskClass(risk) {
  if (risk >= 74) return 'high';
  if (risk >= 55) return 'medium';
  return 'low';
}

function hexToRgb(hex) {
  const normalized = hex.replace('#', '');
  return [
    parseInt(normalized.slice(0, 2), 16),
    parseInt(normalized.slice(2, 4), 16),
    parseInt(normalized.slice(4, 6), 16),
  ];
}

function setPdfColor(doc, method, hex) {
  const [r, g, b] = hexToRgb(hex);
  doc[method](r, g, b);
}

function pdfSafe(text) {
  return String(text)
    .replaceAll('→', '->')
    .replaceAll('–', '-')
    .replaceAll('°', ' deg')
    .replaceAll('²', '2');
}

function reportSummary(records) {
  const weather = forecastForDay();
  const atRisk = records.filter((site) => site.risk >= 42);
  const highRisk = records.filter((site) => site.risk >= 74);
  const intensifying = gridCells().filter((cell) => cell.klass.name.includes('Intensifying') || cell.klass.name.includes('New')).length;
  const meanTrap = records.length
    ? Math.round(records.reduce((sum, site) => sum + site.trapCount, 0) / records.length)
    : 0;
  return { weather, atRisk, highRisk, intensifying, meanTrap };
}

function reportNarrative(summary) {
  const scenario = pestMeta[state.scenario];
  const intervention = interventionProfiles[state.intervention];
  const action =
    state.intervention === 'early-release'
      ? 'Maintain weekly release rhythm and target verification scouting in the expected and worst-case cone overlap.'
      : state.intervention === 'delayed-release'
        ? 'Escalate immediately: bring forward biological control releases and prioritize downwind greenhouse inspections.'
        : 'Confirm trap-card trend and prepare targeted releases for sites entering the expected cone over the next 72 hours.';
  return [
    `${scenario.label} pressure originates from ${scenario.originName} and is projected downwind along the ${summary.weather.windLabel} vector by day ${state.day}.`,
    `The expected cone reflects ${summary.weather.meanTemp} degC, ${summary.weather.rh}% RH, ${summary.weather.windSpeed} m/s wind, and ${Math.round(summary.weather.suitability * 100)}% pest suitability.`,
    `${summary.atRisk.length} greenhouses are above the watch threshold, with ${summary.highRisk.length} high-risk sites and ${summary.intensifying} new or intensifying hotspot cells.`,
    `${intervention.label}: ${action}`,
  ];
}

function drawRadarLogo(doc, x, y, size) {
  setPdfColor(doc, 'setDrawColor', '#276c4d');
  setPdfColor(doc, 'setFillColor', '#276c4d');
  doc.setLineWidth(0.8);
  doc.circle(x + size / 2, y + size / 2, size / 2, 'S');
  doc.line(x + size / 2, y + size / 2, x + size * 0.82, y + size * 0.26);
  doc.circle(x + size / 2, y + size / 2, size * 0.11, 'F');
  doc.circle(x + size * 0.74, y + size * 0.32, size * 0.08, 'F');
}

function drawReportHeader(doc, pageLabel) {
  drawRadarLogo(doc, 12, 10, 12);
  setPdfColor(doc, 'setTextColor', '#203023');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text('Pest Radar - Regional Early Warning Dashboard', 28, 16);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  setPdfColor(doc, 'setTextColor', '#657060');
  doc.text(pdfSafe(`Situation report · ${pageLabel} · Day ${state.day} · ${new Date().toLocaleDateString('en-GB')}`), 28, 21);
  setPdfColor(doc, 'setDrawColor', '#cdd4c4');
  doc.line(12, 26, 198, 26);
}

function drawFooter(doc, pageNumber) {
  setPdfColor(doc, 'setDrawColor', '#cdd4c4');
  doc.line(12, 286, 198, 286);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  setPdfColor(doc, 'setTextColor', '#657060');
  doc.text('Synthetic scenario data for interface demonstration only. Not operational pest advice.', 12, 291);
  doc.text(`Page ${pageNumber} of 2`, 184, 291);
}

function drawSectionTitle(doc, title, x, y) {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  setPdfColor(doc, 'setTextColor', '#276c4d');
  doc.text(pdfSafe(title.toUpperCase()), x, y);
}

function drawKpiBox(doc, x, y, w, label, value, note) {
  setPdfColor(doc, 'setDrawColor', '#cdd4c4');
  setPdfColor(doc, 'setFillColor', '#fbfaf5');
  doc.roundedRect(x, y, w, 24, 3, 3, 'FD');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  setPdfColor(doc, 'setTextColor', '#657060');
  doc.text(pdfSafe(label), x + 4, y + 6);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  setPdfColor(doc, 'setTextColor', '#203023');
  doc.text(pdfSafe(value), x + 4, y + 15);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  setPdfColor(doc, 'setTextColor', '#657060');
  doc.text(pdfSafe(note), x + 4, y + 21);
}

function reportProjection(bounds) {
  const minLat = 51.944;
  const maxLat = 52.049;
  const minLng = 4.126;
  const maxLng = 4.302;
  const [x, y, w, h] = bounds;
  return ([lat, lng]) => [
    x + ((lng - minLng) / (maxLng - minLng)) * w,
    y + ((maxLat - lat) / (maxLat - minLat)) * h,
  ];
}

function drawPdfPolygon(doc, points, style = 'S') {
  if (!points.length) return;
  const [start, ...rest] = points;
  const deltas = [];
  let previous = start;
  rest.forEach((point) => {
    deltas.push([point[0] - previous[0], point[1] - previous[1]]);
    previous = point;
  });
  doc.lines(deltas, start[0], start[1], [1, 1], style, true);
}

function drawMapSnapshot(doc, records, x, y, w, h) {
  const project = reportProjection([x, y, w, h]);
  setPdfColor(doc, 'setFillColor', '#e6eadf');
  setPdfColor(doc, 'setDrawColor', '#cdd4c4');
  doc.roundedRect(x, y, w, h, 3, 3, 'FD');

  gridCells().forEach((cell) => {
    const nw = project([cell.bounds[1][0], cell.bounds[0][1]]);
    const se = project([cell.bounds[0][0], cell.bounds[1][1]]);
    setPdfColor(doc, 'setFillColor', cell.klass.color);
    setPdfColor(doc, 'setDrawColor', cell.klass.color);
    doc.setGState(new doc.GState({ opacity: Math.min(0.45, cell.klass.opacity) }));
    doc.rect(nw[0], nw[1], se[0] - nw[0], se[1] - nw[1], 'F');
    doc.setGState(new doc.GState({ opacity: 1 }));
  });

  uncertaintyCones().forEach((cone) => {
    const points = cone.polygon.map(project);
    setPdfColor(doc, 'setFillColor', cone.color);
    setPdfColor(doc, 'setDrawColor', cone.color);
    doc.setLineWidth(cone.key === 'expected' ? 0.8 : 0.6);
    doc.setGState(new doc.GState({ opacity: cone.key === 'worst-case' ? 0.28 : cone.key === 'expected' ? 0.36 : 0.42 }));
    drawPdfPolygon(doc, points, 'FD');
    doc.setGState(new doc.GState({ opacity: 1 }));
  });

  setPdfColor(doc, 'setDrawColor', '#276c4d');
  doc.setLineWidth(0.7);
  doc.setLineDashPattern([2, 2], 0);
  drawPdfPolygon(doc, westlandBoundary.map(project), 'S');
  doc.setLineDashPattern([], 0);

  records.forEach((site) => {
    const [px, py] = project([site.lat, site.lng]);
    const color = site.risk >= 74 ? '#b71918' : site.risk >= 55 ? '#e75d2c' : site.risk >= 34 ? '#f1bb83' : '#317aa2';
    setPdfColor(doc, 'setFillColor', color);
    doc.circle(px, py, site.risk >= 74 ? 1.6 : 1.25, 'F');
  });

  const origin = project(pestMeta[state.scenario].origin);
  setPdfColor(doc, 'setFillColor', '#7f1615');
  doc.circle(origin[0], origin[1], 2.5, 'F');
  doc.setFontSize(6.8);
  setPdfColor(doc, 'setTextColor', '#203023');
  doc.text('first detection', origin[0] + 3, origin[1] + 1.5);

  const center = project(scenarioCenter());
  setPdfColor(doc, 'setDrawColor', '#276c4d');
  doc.setLineWidth(0.8);
  doc.line(origin[0], origin[1], center[0], center[1]);
  setPdfColor(doc, 'setFillColor', '#276c4d');
  doc.circle(center[0], center[1], 1.8, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  setPdfColor(doc, 'setTextColor', '#657060');
  doc.text('Static schematic map: hotspot footprint + uncertainty envelopes', x + 4, y + h - 4);
}

function drawLegend(doc, x, y) {
  const items = [
    ['New/intensifying', '#e75d2c'],
    ['Persistent', '#7f1615'],
    ['Optimistic cone', '#20808d'],
    ['Expected cone', '#d19900'],
    ['Worst-case cone', '#a13544'],
  ];
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  items.forEach((item, index) => {
    const lx = x + index * 34;
    setPdfColor(doc, 'setFillColor', item[1]);
    doc.rect(lx, y - 3.5, 4, 3, 'F');
    setPdfColor(doc, 'setTextColor', '#657060');
    doc.text(pdfSafe(item[0]), lx + 5.5, y - 1);
  });
}

function drawWeatherStrip(doc, x, y, w) {
  const series = forecastSeries();
  const gap = 1.3;
  const cellW = (w - gap * 11) / 12;
  series.forEach((day, index) => {
    const cx = x + index * (cellW + gap);
    const active = day.day === state.day;
    setPdfColor(doc, 'setFillColor', active ? '#d8e7dc' : '#fbfaf5');
    setPdfColor(doc, 'setDrawColor', active ? '#276c4d' : '#cdd4c4');
    doc.roundedRect(cx, y, cellW, 20, 2, 2, 'FD');
    doc.setFont('helvetica', active ? 'bold' : 'normal');
    doc.setFontSize(6.4);
    setPdfColor(doc, 'setTextColor', '#203023');
    doc.text(`D${day.day}`, cx + 2, y + 5);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.2);
    doc.text(`${day.meanTemp}`, cx + 2, y + 10.5);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.8);
    setPdfColor(doc, 'setTextColor', '#657060');
    doc.text(`${Math.round(day.suitability * 100)}%`, cx + 2, y + 15);
    setPdfColor(doc, 'setFillColor', day.suitability >= 0.78 ? '#b71918' : day.suitability >= 0.5 ? '#d19900' : '#20808d');
    doc.rect(cx + 2, y + 17, Math.max(2, (cellW - 4) * day.suitability), 1.4, 'F');
  });
}

function drawNarrative(doc, bullets, x, y, w) {
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.2);
  setPdfColor(doc, 'setTextColor', '#203023');
  let cursor = y;
  bullets.forEach((bullet) => {
    const lines = doc.splitTextToSize(pdfSafe(bullet), w - 6);
    setPdfColor(doc, 'setFillColor', '#276c4d');
    doc.circle(x + 1.5, cursor - 1.5, 1, 'F');
    setPdfColor(doc, 'setTextColor', '#203023');
    doc.text(lines, x + 5, cursor);
    cursor += lines.length * 3.7 + 3;
  });
}

function drawAtRiskTable(doc, records, x, y, w) {
  const rows = [...records].sort((a, b) => b.risk - a.risk).slice(0, 14);
  const cols = [24, 38, 24, 22, 72];
  const headers = ['GH ID', 'Crop stage', 'Trap', 'Risk', 'Biocontrol / weather'];
  setPdfColor(doc, 'setFillColor', '#276c4d');
  doc.rect(x, y, w, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.8);
  setPdfColor(doc, 'setTextColor', '#ffffff');
  let cx = x + 2;
  headers.forEach((header, index) => {
    doc.text(header, cx, y + 4.8);
    cx += cols[index];
  });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.4);
  rows.forEach((site, rowIndex) => {
    const rowY = y + 7 + rowIndex * 8;
    setPdfColor(doc, 'setFillColor', rowIndex % 2 === 0 ? '#fbfaf5' : '#f4f1e7');
    doc.rect(x, rowY, w, 8, 'F');
    setPdfColor(doc, 'setTextColor', '#203023');
    const values = [
      site.greenhouseId,
      `${site.crop} / ${site.cropStage}`,
      String(site.trapCount),
      String(site.risk),
      `${site.biocontrol}; ${site.temp} degC, RH ${site.rh}%, ${site.windSpeed} m/s`,
    ];
    cx = x + 2;
    values.forEach((value, index) => {
      const text = doc.splitTextToSize(pdfSafe(value), cols[index] - 3)[0];
      doc.text(text, cx, rowY + 5);
      cx += cols[index];
    });
  });
  if (!rows.length) {
    setPdfColor(doc, 'setTextColor', '#657060');
    doc.text('No at-risk greenhouse records for the current filter.', x + 2, y + 18);
  }
}

function drawSourceLinks(doc, x, y, w) {
  const sources = [
    ['NASA/JPL Westland greenhouse context', 'https://www.jpl.nasa.gov/images/pia21986-westland-the-netherlands/'],
    ['Koppert greenhouse thrips and whitefly guidance', 'https://www.koppert.com/news-information/news/effective-strategies-to-control-thrips-and-whitefly-in-greenhouses/'],
    ['Greenhouse whitefly phenology model', 'https://pmc.ncbi.nlm.nih.gov/articles/PMC7569604/'],
    ['UMass Encarsia guidance', 'https://www.umass.edu/agriculture-food-environment/greenhouse-floriculture/fact-sheets/whiteflies-on-greenhouse-crops'],
    ['KNMI station variable documentation', 'https://english.knmidata.nl/open-data/actuele10mindataknmistations'],
  ];
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5.7);
  let cursor = y;
  sources.forEach((source, index) => {
    const line = `${index + 1}. ${source[0]} - ${source[1]}`;
    const wrapped = doc.splitTextToSize(pdfSafe(line), w);
    wrapped.forEach((part) => {
      setPdfColor(doc, 'setTextColor', '#006494');
      doc.textWithLink(part, x, cursor, { url: source[1] });
      cursor += 3;
    });
    cursor += 0.8;
  });
}

function generateSituationReport() {
  if (!window.jspdf?.jsPDF) {
    els.reportStatus.textContent = 'PDF engine is still loading. Please try again in a moment.';
    return;
  }
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  doc.setProperties({
    title: `Pest Radar Situation Report Day ${state.day}`,
    author: 'Perplexity Computer',
    subject: 'Regional greenhouse pest early warning situation report',
  });

  const records = modeledGreenhouses();
  const summary = reportSummary(records);
  const narrative = reportNarrative(summary);
  const scenario = pestMeta[state.scenario];
  const intervention = interventionProfiles[state.intervention];

  drawReportHeader(doc, 'Overview');
  drawSectionTitle(doc, 'Scenario settings', 12, 34);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  setPdfColor(doc, 'setTextColor', '#203023');
  doc.text(pdfSafe(`${scenario.label} · ${intervention.label} · ${summary.weather.windLabel} · ${temperatureProfiles[state.temperature].label} profile`), 12, 40);

  drawKpiBox(doc, 12, 47, 44, 'At-risk greenhouses', String(summary.atRisk.length), `${summary.highRisk.length} high-risk`);
  drawKpiBox(doc, 61, 47, 44, 'Intensifying cells', String(summary.intensifying), 'Hotspot class rising');
  drawKpiBox(doc, 110, 47, 44, 'Mean trap count', String(summary.meanTrap), 'Yellow cards / week');
  drawKpiBox(doc, 159, 47, 39, 'Forecast wind', `${summary.weather.windSpeed} m/s`, pdfSafe(summary.weather.windLabel));

  drawSectionTitle(doc, 'Hotspot footprint and uncertainty cones', 12, 78);
  drawMapSnapshot(doc, records, 12, 83, 186, 84);
  drawLegend(doc, 13, 175);

  drawSectionTitle(doc, 'Day-annotated forecast strip', 12, 188);
  drawWeatherStrip(doc, 12, 193, 186);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  setPdfColor(doc, 'setTextColor', '#657060');
  doc.text(pdfSafe(`Selected day ${state.day}: ${summary.weather.label}; ${summary.weather.meanTemp} degC, RH ${summary.weather.rh}%, ${summary.weather.precipitation} mm rain, ${Math.round(summary.weather.suitability * 100)}% suitability.`), 12, 220);

  drawSectionTitle(doc, 'Spread trajectory and recommended action', 12, 233);
  drawNarrative(doc, narrative, 12, 240, 186);
  drawFooter(doc, 1);

  doc.addPage();
  drawReportHeader(doc, 'At-risk greenhouse list');
  drawSectionTitle(doc, 'Priority greenhouse records', 12, 36);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  setPdfColor(doc, 'setTextColor', '#657060');
  doc.text('Sorted by risk score for the selected day and current crop filter.', 12, 42);
  drawAtRiskTable(doc, summary.atRisk, 12, 49, 186);

  drawSectionTitle(doc, 'Operational interpretation', 12, 178);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.2);
  setPdfColor(doc, 'setTextColor', '#203023');
  const interpretation = [
    'Optimistic cone: containment performs well and diffusion remains close to the current hotspot footprint.',
    'Expected cone: greenhouse-to-greenhouse scouting should focus on the centerline and adjacent clusters.',
    'Worst-case cone: warm, suitable weather and delayed response allow a broader downwind surveillance zone.',
    'Use this report as a briefing artifact for growers, scouts, and regional coordination teams.',
  ];
  let cursor = 185;
  interpretation.forEach((line) => {
    const wrapped = doc.splitTextToSize(pdfSafe(line), 178);
    doc.text(wrapped, 16, cursor);
    cursor += wrapped.length * 4.2 + 2.5;
  });

  drawSectionTitle(doc, 'Prototype sources embedded in dashboard', 12, 226);
  drawSourceLinks(doc, 12, 232, 184);
  drawFooter(doc, 2);

  const filename = `pest-radar-situation-report-day-${state.day}-${state.intervention}.pdf`;
  doc.save(filename);
  els.reportStatus.textContent = `Generated ${filename}`;
}

function renderTable(records) {
  const rows = [...records]
    .sort((a, b) => b.risk - a.risk)
    .slice(0, 14)
    .map((site) => `
      <tr>
        <td>${site.greenhouseId}</td>
        <td>${site.crop} · ${site.cropStage}</td>
        <td>${site.trapCount}</td>
        <td><span class="biocontrol-tag ${site.biocontrolLag ? 'lag' : ''}">${site.biocontrol}</span></td>
        <td><span class="risk-pill ${riskClass(site.risk)}">${site.risk}</span></td>
        <td>${site.temp} °C, RH ${site.rh}%, wind ${site.windDirection}, ${site.windSpeed} m/s</td>
      </tr>
    `);
  els.table.innerHTML = rows.join('') || `<tr><td colspan="6">No greenhouse records match the current crop filter.</td></tr>`;
}

function render() {
  els.dayOutput.textContent = `Day ${state.day}`;
  els.horizonOutput.textContent = `${state.horizon} days`;
  const records = modeledGreenhouses();
  renderWeather();
  renderMap(records);
  renderKpis(records);
  renderChart();
  renderComparison();
  renderTable(records);
}

function stopPlayback() {
  state.playing = false;
  if (state.playbackTimer) {
    clearInterval(state.playbackTimer);
    state.playbackTimer = null;
  }
  els.playback.classList.remove('is-playing');
  els.playback.textContent = 'Play day 3 → 14';
}

function startPlayback() {
  state.playing = true;
  state.day = 3;
  state.horizon = 14;
  els.day.value = String(state.day);
  els.horizon.value = String(state.horizon);
  els.playback.classList.add('is-playing');
  els.playback.textContent = 'Pause playback';
  render();
  state.playbackTimer = setInterval(() => {
    if (state.day >= 14) {
      stopPlayback();
      return;
    }
    state.day += 1;
    els.day.value = String(state.day);
    render();
  }, 900);
}

function togglePlayback() {
  if (state.playing) {
    stopPlayback();
  } else {
    startPlayback();
  }
}

els.scenario.addEventListener('change', (event) => {
  stopPlayback();
  state.scenario = event.target.value;
  render();
});

els.crop.addEventListener('change', (event) => {
  stopPlayback();
  state.crop = event.target.value;
  render();
});

els.day.addEventListener('input', (event) => {
  stopPlayback();
  state.day = Number(event.target.value);
  if (state.horizon < state.day) {
    state.horizon = state.day;
    els.horizon.value = state.horizon;
  }
  render();
});

els.temperature.addEventListener('change', (event) => {
  stopPlayback();
  state.temperature = event.target.value;
  render();
});

els.wind.addEventListener('change', (event) => {
  stopPlayback();
  state.wind = event.target.value;
  render();
});

els.intervention.addEventListener('change', (event) => {
  stopPlayback();
  state.intervention = event.target.value;
  render();
});

els.horizon.addEventListener('input', (event) => {
  stopPlayback();
  state.horizon = Number(event.target.value);
  if (state.day > state.horizon) {
    state.day = state.horizon;
    els.day.value = state.day;
  }
  render();
});

els.heat.addEventListener('change', (event) => {
  stopPlayback();
  state.heat = event.target.checked;
  render();
});

els.hotspot.addEventListener('change', (event) => {
  stopPlayback();
  state.hotspot = event.target.checked;
  render();
});

els.uncertainty.addEventListener('change', (event) => {
  stopPlayback();
  state.uncertainty = event.target.checked;
  render();
});

els.boundary.addEventListener('change', (event) => {
  stopPlayback();
  state.boundary = event.target.checked;
  render();
});

els.playback.addEventListener('click', togglePlayback);

els.report.addEventListener('click', () => {
  stopPlayback();
  els.reportStatus.textContent = 'Generating PDF...';
  window.setTimeout(generateSituationReport, 30);
});

els.weatherForecast.addEventListener('click', (event) => {
  const button = event.target.closest('[data-forecast-day]');
  if (!button) return;
  stopPlayback();
  state.day = Number(button.dataset.forecastDay);
  state.horizon = Math.max(state.horizon, state.day);
  els.day.value = String(state.day);
  els.horizon.value = String(state.horizon);
  render();
});

document.querySelectorAll('.quick-periods button').forEach((button) => {
  button.addEventListener('click', () => {
    stopPlayback();
    state.day = Number(button.dataset.day);
    state.horizon = Math.max(state.horizon, state.day);
    els.day.value = state.day;
    els.horizon.value = state.horizon;
    render();
  });
});

els.reset.addEventListener('click', () => {
  stopPlayback();
  state.scenario = 'whitefly';
  state.crop = 'All';
  state.day = 10;
  state.horizon = 14;
  state.temperature = 'favorable';
  state.wind = 'SW';
  state.intervention = 'baseline';
  state.heat = true;
  state.hotspot = true;
  state.uncertainty = true;
  state.boundary = true;
  els.scenario.value = state.scenario;
  els.crop.value = state.crop;
  els.day.value = String(state.day);
  els.horizon.value = String(state.horizon);
  els.temperature.value = state.temperature;
  els.wind.value = state.wind;
  els.intervention.value = state.intervention;
  els.heat.checked = true;
  els.hotspot.checked = true;
  els.uncertainty.checked = true;
  els.boundary.checked = true;
  render();
});

document.querySelectorAll('.nav-button').forEach((button) => {
  button.addEventListener('click', () => {
    stopPlayback();
    const layer = button.dataset.layer;
    if (layer === 'heatmap') {
      state.hotspot = !state.hotspot;
      els.hotspot.checked = state.hotspot;
    }
    if (layer === 'uncertainty') {
      state.uncertainty = !state.uncertainty;
      els.uncertainty.checked = state.uncertainty;
    }
    if (layer === 'boundary') {
      state.boundary = !state.boundary;
      els.boundary.checked = state.boundary;
    }
    document.querySelectorAll('.nav-button').forEach((item) => item.classList.remove('is-active'));
    button.classList.add('is-active');
    render();
  });
});

const themeToggle = document.querySelector('[data-theme-toggle]');
let theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
document.documentElement.setAttribute('data-theme', theme);
themeToggle.addEventListener('click', () => {
  theme = theme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', theme);
  themeToggle.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`);
});

render();
