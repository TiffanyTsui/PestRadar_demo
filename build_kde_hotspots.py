#!/usr/bin/env python3
"""
Extend the PestRadar global Phthorimaea absoluta demo with the same two
analyses used in the Westland prototype:

  1. Kernel Density Estimation (KDE) surface  -- continuous detection-intensity
     surface built from geolocated EPPO detections, accumulated by year, using
     a great-circle Gaussian kernel (the global analogue of the Westland
     leaflet.heat kernel-density layer).

  2. Emerging Hot Spot classification         -- each hotspot location is
     classified into the Westland legend classes (New / Intensifying /
     Persistent / Diminishing / Historical) from its year-over-year intensity
     trajectory, following the logic of ArcGIS-style Emerging Hot Spot Analysis
     (a Mann-Kendall trend test on a per-bin statistically-significant time
     series).

Both layers are written into data.json so the front-end can render them with
no recomputation.
"""
import json, math
from collections import defaultdict

SRC = "data.json"
d = json.load(open(SRC))

MIN_YEAR, MAX_YEAR = d["meta"]["first_report_year"], d["meta"]["latest_report_year"]
YEARS = list(range(MIN_YEAR, MAX_YEAR + 1))

# ----------------------------------------------------------------------------
# 1. Build the per-year geolocated detection set.
#    "Detections" = EPPO report events that are first_report / local_spread /
#    new_data / status_update and carry coordinates. These are the verified
#    observations that drive the kernel-density surface.
# ----------------------------------------------------------------------------
DETECTION_TYPES = {"first_report", "local_spread", "new_data", "status_update"}
detections = []
for e in d["events"]:
    if e.get("lat") is None or e.get("lon") is None:
        continue
    if e.get("event_type") not in DETECTION_TYPES:
        continue
    detections.append({
        "country": e.get("country", ""),
        "lat": float(e["lat"]),
        "lon": float(e["lon"]),
        "year": int(e["year"]),
        "type": e["event_type"],
        # First reports weigh more — they mark genuinely new territory.
        "weight": 1.6 if e["event_type"] == "first_report" else 1.0,
    })

print(f"Geolocated detections feeding KDE: {len(detections)}")

# ----------------------------------------------------------------------------
# Great-circle distance (km) helper.
# ----------------------------------------------------------------------------
R_KM = 6371.0
def haversine(lat1, lon1, lat2, lon2):
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dp = math.radians(lat2 - lat1)
    dl = math.radians(lon2 - lon1)
    a = math.sin(dp/2)**2 + math.cos(p1)*math.cos(p2)*math.sin(dl/2)**2
    return 2 * R_KM * math.asin(min(1.0, math.sqrt(a)))

# ----------------------------------------------------------------------------
# 2. KERNEL DENSITY SURFACE
#    Evaluate a Gaussian kernel density on a global lon/lat grid for each year.
#    Bandwidth (h) is a great-circle radius in km, matching how the Westland
#    map blurs trap points into a smooth pressure surface, just rescaled to a
#    global extent.
# ----------------------------------------------------------------------------
# Grid resolution: 2.5 deg keeps the JSON compact (~2.6k cells over land-ish
# latitudes) while still reading as a smooth surface once drawn.
LON_STEP = 2.5
LAT_STEP = 2.5
LON_MIN, LON_MAX = -170, 190
LAT_MIN, LAT_MAX = -56, 78          # drop deep polar rows that never matter
BANDWIDTH_KM = 900.0                # kernel radius; ~continental smoothing
CUTOFF_KM = 2.4 * BANDWIDTH_KM      # ignore points past this (speed + locality)

grid_lons = [round(LON_MIN + i * LON_STEP, 2)
             for i in range(int((LON_MAX - LON_MIN) / LON_STEP) + 1)]
grid_lats = [round(LAT_MIN + j * LAT_STEP, 2)
             for j in range(int((LAT_MAX - LAT_MIN) / LAT_STEP) + 1)]

def kde_surface(points):
    """Return list of {lat,lon,v} cells with density>threshold for given pts."""
    cells = []
    if not points:
        return cells, 0.0
    twoh2 = 2.0 * BANDWIDTH_KM * BANDWIDTH_KM
    raw = []
    mx = 0.0
    for la in grid_lats:
        for lo in grid_lons:
            acc = 0.0
            for p in points:
                # cheap longitude/latitude pre-filter before haversine
                if abs(p["lat"] - la) > 24 and abs(((p["lon"]-lo+180) % 360)-180) > 36:
                    continue
                dist = haversine(la, lo, p["lat"], p["lon"])
                if dist > CUTOFF_KM:
                    continue
                acc += p["weight"] * math.exp(-(dist*dist) / twoh2)
            if acc > 0:
                raw.append((la, lo, acc))
                if acc > mx:
                    mx = acc
    if mx <= 0:
        return cells, 0.0
    # Normalise 0..1 against this year's own max, keep meaningful cells only.
    for la, lo, acc in raw:
        v = acc / mx
        if v >= 0.06:
            cells.append({"lat": la, "lon": lo, "v": round(v, 3)})
    return cells, round(mx, 4)

kde_by_year = {}
kde_peak_by_year = {}
for y in YEARS:
    pts = [p for p in detections if p["year"] <= y]      # cumulative surface
    cells, peak = kde_surface(pts)
    kde_by_year[str(y)] = cells
    kde_peak_by_year[str(y)] = peak
    print(f"  KDE {y}: {len(pts):3d} pts -> {len(cells):4d} cells, peak={peak}")

# Global peak for stable cross-year colour scaling on the front-end.
global_peak = max(kde_peak_by_year.values()) if kde_peak_by_year else 1.0

# ----------------------------------------------------------------------------
# 3. EMERGING HOT SPOT CLASSIFICATION  (Westland legend classes)
#    For every modeled-hotspot location we build a per-year intensity series
#    (we use the model risk score, which already blends trade + climate + wind
#    + regional pressure). We then run a Mann-Kendall trend test on the series
#    and combine the trend with how recently/frequently the location was a
#    statistically "hot" bin to assign one of:
#       new_hot       - hot only in the most recent year(s), no long history
#       intensifying  - significant increasing trend, hot now
#       persistent    - hot across most of the record, no significant trend
#       diminishing   - significant decreasing trend
#       historical    - was hot in the past, not hot now
# ----------------------------------------------------------------------------
hm = d["hotspot_model"]
hotspots_by_year = hm["hotspots_by_year"]

# ----------------------------------------------------------------------------
# Build a per-country, per-year INTENSITY series. This is the global analogue
# of the Westland per-cell trap-pressure time series. Intensity blends two
# transparent signals:
#   * observed EPPO detection pressure  (the verified invasion record)
#   * modeled trade-linked risk         (PestRadar risk score, where available)
# Observed detections dominate so that countries EPPO actually reported are
# always treated as genuinely hot, while the model adds resolution for at-risk
# countries not yet (or only recently) invaded.
# ----------------------------------------------------------------------------
ALL_DETECTION_TYPES = {"first_report", "local_spread", "new_data", "status_update"}

# Country centroids: prefer the distribution table (covers every present
# country), fall back to modeled-hotspot coords.
coords = {}
for r in d["current_distribution"]:
    if r.get("lat") is not None and r.get("country"):
        coords.setdefault(r["country"], (r["lat"], r["lon"], r.get("continent", "")))
for y in YEARS:
    for h in hotspots_by_year.get(str(y), []):
        coords.setdefault(h["country"], (h["lat"], h["lon"], h.get("continent", "")))

# Observed detection events per country per year.
obs_years = defaultdict(set)
obs_intensity = defaultdict(lambda: defaultdict(float))   # country->year->score
for e in d["events"]:
    c = e.get("country", "")
    if not c or e.get("lat") is None:
        continue
    if e.get("event_type") not in ALL_DETECTION_TYPES:
        continue
    yr = int(e["year"])
    obs_years[c].add(yr)
    obs_intensity[c][yr] += 70.0 if e["event_type"] == "first_report" else 45.0

# Once invaded, a country stays under pressure; carry a decaying baseline so
# persistent vs diminishing is driven by recency of fresh reporting. We take
# the MAX kernel over past reports (not a sum) so multi-report countries don't
# blow past the 0-100 intensity scale, then add a small persistence floor for
# any year at/after the first detection.
def carried_intensity(country, year):
    if not obs_intensity[country]:
        return 0.0
    first_yr = min(obs_intensity[country])
    if year < first_yr:
        return 0.0
    peak = 0.0
    for yr, val in obs_intensity[country].items():
        if yr <= year:
            decayed = min(100.0, val) - 7.0 * (year - yr)   # decay since report
            peak = max(peak, max(0.0, decayed))
    return min(100.0, max(peak, 30.0))        # invaded => >=30 baseline, cap 100

# Model risk per country per year (supplements observed where present).
model_risk = defaultdict(dict)
for y in YEARS:
    for h in hotspots_by_year.get(str(y), []):
        model_risk[h["country"]][y] = float(h.get("risk", 0.0))

# Final intensity series: max(observed-carried, model risk), capped 0-100.
# Skip countries that never produced an EPPO reporting event AND never appear
# in the modeled hotspot series (e.g. the native South American range, which
# the EPPO Reporting Service does not track as new detections).
series = defaultdict(dict)
for c in (set(obs_intensity) | set(model_risk)):
    if c not in coords:
        continue
    has_signal = False
    for y in YEARS:
        iv = min(100.0, max(carried_intensity(c, y), model_risk[c].get(y, 0.0)))
        if iv > 0:
            series[c][y] = round(iv, 1)
            has_signal = True
    if not has_signal:
        series.pop(c, None)

HOT_THRESHOLD = 45.0   # intensity cut for a "statistically hot" bin

def mann_kendall(vals):
    """Return (S, trend) ; trend in {'increasing','decreasing','none'}."""
    n = len(vals)
    if n < 4:
        return 0, "none"
    s = 0
    for i in range(n - 1):
        for j in range(i + 1, n):
            s += (vals[j] > vals[i]) - (vals[j] < vals[i])
    # variance (no ties correction needed for our purpose)
    var = n * (n - 1) * (2 * n + 5) / 18.0
    if var <= 0:
        return s, "none"
    if s > 0:
        z = (s - 1) / math.sqrt(var)
    elif s < 0:
        z = (s + 1) / math.sqrt(var)
    else:
        z = 0.0
    # ~90% two-sided significance
    if z > 1.28:
        return s, "increasing"
    if z < -1.28:
        return s, "decreasing"
    return s, "none"

def classify(country):
    yrs_present = sorted(series[country].keys())
    if not yrs_present:
        return None
    full = [series[country].get(y, 0.0) for y in YEARS]
    # restrict the trend test to the active window (first appearance onward)
    start = yrs_present[0]
    window = [series[country].get(y, 0.0) for y in YEARS if y >= start]
    _, trend = mann_kendall(window)

    recent_years = YEARS[-3:]
    hot_recent = any(series[country].get(y, 0.0) >= HOT_THRESHOLD
                     or y in obs_years.get(country, set()) for y in recent_years)
    hot_bins = [y for y in YEARS
                if series[country].get(y, 0.0) >= HOT_THRESHOLD
                or y in obs_years.get(country, set())]
    n_hot = len(hot_bins)
    # A location that was NEVER statistically hot is not a hot spot at all —
    # drop it (this removes the native South American range and never-detected
    # low-risk model countries that would otherwise pollute the classes).
    if n_hot == 0:
        return None
    span = (max(hot_bins) - min(hot_bins) + 1) if hot_bins else 0
    first_hot = min(hot_bins) if hot_bins else None
    last_hot = max(hot_bins) if hot_bins else None

    # Decision logic (ESRI Emerging-Hot-Spot inspired, simplified)
    if not hot_recent:
        cls = "historical"
    else:
        new_window = first_hot is not None and first_hot >= MAX_YEAR - 2
        if new_window and n_hot <= 3:
            cls = "new_hot"
        elif trend == "increasing":
            cls = "intensifying"
        elif trend == "decreasing":
            cls = "diminishing"
        elif n_hot >= max(4, int(0.5 * span)):
            cls = "persistent"
        else:
            cls = "intensifying"
    return {
        "country": country,
        "lat": coords[country][0],
        "lon": coords[country][1],
        "continent": coords[country][2],
        "class": cls,
        "trend": trend,
        "first_hot_year": first_hot,
        "last_hot_year": last_hot,
        "hot_year_count": n_hot,
        "latest_risk": round(series[country].get(MAX_YEAR, 0.0), 1),
        "peak_risk": round(max(full), 1),
    }

classification = []
for c in series:
    r = classify(c)
    if r:
        classification.append(r)

# Sort by class priority then latest risk for tidy rendering.
CLASS_ORDER = {"new_hot": 0, "intensifying": 1, "persistent": 2,
               "diminishing": 3, "historical": 4}
classification.sort(key=lambda r: (CLASS_ORDER[r["class"]], -r["latest_risk"]))

from collections import Counter
counts = Counter(r["class"] for r in classification)
print("\nEmerging hot spot classes:")
for k in CLASS_ORDER:
    print(f"  {k:13s}: {counts.get(k,0)}")

# ----------------------------------------------------------------------------
# 4. Trade-driven acceleration metric (for the "recent years" narrative).
#    Compare new-country detections per 3-year block to show the acceleration
#    linked to trade connectivity in recent years.
# ----------------------------------------------------------------------------
first_reports = defaultdict(int)
for e in d["events"]:
    if e.get("event_type") == "first_report":
        first_reports[int(e["year"])] += 1
# fall back: count distinct new countries appearing in cumulative distribution
new_country_year = {}
seen = set()
for p in sorted(detections, key=lambda x: x["year"]):
    if p["country"] and p["country"] not in seen:
        seen.add(p["country"])
        new_country_year[p["country"]] = p["year"]
blocks = defaultdict(int)
for c, y in new_country_year.items():
    b = (y // 3) * 3
    blocks[b] += 1
acceleration = [{"period": f"{b}-{b+2}", "new_countries": n}
                for b, n in sorted(blocks.items())]
print("\nNew-country detections per 3-year block:")
for a in acceleration:
    print(f"  {a['period']}: {a['new_countries']}")

# ----------------------------------------------------------------------------
# 5. Write enriched analysis block back into data.json
# ----------------------------------------------------------------------------
d["spatial_analysis"] = {
    "meta": {
        "method": "Kernel density estimation + Emerging Hot Spot classification",
        "kernel": "Gaussian, great-circle distance",
        "bandwidth_km": BANDWIDTH_KM,
        "grid_step_deg": LON_STEP,
        "hot_threshold": HOT_THRESHOLD,
        "trend_test": "Mann-Kendall (~90% significance)",
        "global_peak": global_peak,
        "note": ("Global analogue of the Westland kernel-density + emerging "
                 "hotspot layers. KDE is built from geolocated EPPO detections; "
                 "classification uses the trade-linked risk series with observed "
                 "EPPO years folded in."),
        "detection_count": len(detections),
        "classes": [
            {"key": "new_hot", "label": "New hot spot",
             "desc": "Hot only in the most recent years; newly invaded territory."},
            {"key": "intensifying", "label": "Intensifying",
             "desc": "Statistically increasing detection/risk intensity over time."},
            {"key": "persistent", "label": "Persistent",
             "desc": "Hot across most of the record with no significant trend."},
            {"key": "diminishing", "label": "Diminishing",
             "desc": "Statistically decreasing intensity; pressure easing."},
            {"key": "historical", "label": "Historical",
             "desc": "Was hot in the past but not in recent years."},
        ],
    },
    "kde_by_year": kde_by_year,
    "kde_peak_by_year": kde_peak_by_year,
    "classification": classification,
    "acceleration": acceleration,
    "grid": {"lons": grid_lons, "lats": grid_lats,
             "lon_step": LON_STEP, "lat_step": LAT_STEP},
}

json.dump(d, open(SRC, "w"), separators=(",", ":"))
print(f"\nWrote enriched {SRC}  ({len(json.dumps(d))/1024:.0f} KB)")
