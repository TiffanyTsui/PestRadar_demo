#!/usr/bin/env python3
"""
Build the observed-diffusion layer for the simplified PestRadar global view.

Output (written under data.json -> "diffusion"):
  meta: {note, factors, growth, color_stops, uncertainty}
  arrivals: ordered list of {country, year, lat, lon, origin, origin_lat, origin_lon,
                             origin_score, factors:{trade,proximity,wind,climate}}
            (origin == null for the seed countries with no prior-infested origin)

Travel-origin score blends, over countries already infested in a PRIOR year:
  - trade linkage (FAO 2011 tomato trade edges, normalized)
  - geographic proximity (great-circle distance, closer = higher)
  - prevailing wind alignment (does the great-circle bearing origin->target sit
    downwind of the origin's prevailing surface wind at its latitude band?)
  - climate similarity (Koppen-ish proxy from node climate_suitability +
    latitude-band similarity; similar climate = easier establishment)

These are illustrative weightings, NOT a calibrated dispersal model. The front-end
uses the chosen origin only to animate a fading "travel comet"; no trade data is
shown as a persistent layer.
"""
import json, math

WEIGHTS = {"trade": 0.40, "proximity": 0.28, "wind": 0.14, "climate": 0.18}

def haversine_km(a_lat, a_lon, b_lat, b_lon):
    R = 6371.0
    p1, p2 = math.radians(a_lat), math.radians(b_lat)
    dphi = math.radians(b_lat - a_lat)
    dl = math.radians(b_lon - a_lon)
    h = math.sin(dphi/2)**2 + math.cos(p1)*math.cos(p2)*math.sin(dl/2)**2
    return 2*R*math.asin(min(1, math.sqrt(h)))

def bearing_deg(a_lat, a_lon, b_lat, b_lon):
    """Initial great-circle bearing origin(a)->target(b), degrees from north."""
    p1, p2 = math.radians(a_lat), math.radians(b_lat)
    dl = math.radians(b_lon - a_lon)
    y = math.sin(dl)*math.cos(p2)
    x = math.cos(p1)*math.sin(p2) - math.sin(p1)*math.cos(p2)*math.cos(dl)
    return (math.degrees(math.atan2(y, x)) + 360) % 360

def prevailing_wind_to_bearing(lat):
    """
    Direction the surface wind BLOWS TOWARD (deg from north), by latitude band.
    - Trade winds (0-30 lat): blow from the east -> toward the west (~270deg),
      with an equatorward tilt.
    - Westerlies (30-60): blow from the west -> toward the east (~90deg),
      with a poleward tilt.
    - Polar easterlies (>60): blow from the east -> toward west (~250deg).
    Hemisphere sign handled via tilt.
    """
    a = abs(lat)
    hemi = 1 if lat >= 0 else -1
    if a < 30:          # trade winds -> blow westward (and toward equator)
        base = 270
        tilt = -20 * hemi   # NH trades head SW, SH trades head NW
        return (base + tilt) % 360
    elif a < 60:        # westerlies -> blow eastward (and toward pole)
        base = 90
        tilt = -20 * hemi   # NH westerlies head NE, SH head SE
        return (base + tilt) % 360
    else:               # polar easterlies -> blow westward
        base = 250
        tilt = 20 * hemi
        return (base + tilt) % 360

def angular_diff(a, b):
    d = abs((a - b + 180) % 360 - 180)
    return d

def main():
    d = json.load(open("data.json"))
    geo = [e for e in d["events"]
           if e.get("lat") is not None and e.get("lon") is not None and e.get("country")]

    # first report (year + coords) per country
    fr = {}
    for e in geo:
        c, y = e["country"], e.get("year")
        if y is None:
            continue
        if c not in fr or y < fr[c]["year"]:
            fr[c] = {"year": y, "lat": float(e["lat"]), "lon": float(e["lon"])}

    # normalise "Russia" / "Russian Federation" duplicate -> keep earliest as Russia
    if "Russia" in fr and "Russian Federation" in fr:
        if fr["Russian Federation"]["year"] < fr["Russia"]["year"]:
            fr["Russia"] = fr["Russian Federation"]
        del fr["Russian Federation"]

    # trade edges -> dict keyed by (source, target) and (target, source) symmetric weight
    hm = d.get("hotspot_model", {})
    trade = {}
    tmax = 1.0
    for e in hm.get("trade_edges_observed", []):
        v = float(e.get("value", 0) or 0)
        tmax = max(tmax, v)
        trade[(e["source"], e["target"])] = v
        # treat trade as bidirectional exposure (a partner relationship)
        trade[(e["target"], e["source"])] = max(trade.get((e["target"], e["source"]), 0), v)

    # climate suitability per country from nodes (fallback 0.5)
    clim = {}
    latband = {}
    for n in hm.get("nodes", []):
        clim[n["country"]] = float(n.get("climate_suitability", 0.5) or 0.5)
        latband[n["country"]] = float(n.get("lat", 0) or 0)

    countries = sorted(fr.items(), key=lambda kv: (kv[1]["year"], kv[0]))
    arrivals = []

    for c, info in countries:
        y = info["year"]
        # candidate origins = countries infested STRICTLY before this year
        cands = [(oc, oi) for oc, oi in fr.items()
                 if oc != c and oi["year"] < y]
        if not cands:
            # seed (no prior origin) — earliest detections
            arrivals.append({
                "country": c, "year": y,
                "lat": round(info["lat"], 2), "lon": round(info["lon"], 2),
                "origin": None,
            })
            continue

        # precompute distances for proximity normalisation
        dists = []
        for oc, oi in cands:
            dists.append(haversine_km(oi["lat"], oi["lon"], info["lat"], info["lon"]))
        dmax = max(dists) or 1.0
        dmin = min(dists) or 1.0

        best = None
        for (oc, oi), dist in zip(cands, dists):
            # trade
            tv = trade.get((oc, c), 0.0)
            f_trade = tv / tmax
            # proximity (closer = higher); log-scaled so far jumps still rank
            f_prox = 1.0 - (math.log1p(dist) - math.log1p(dmin)) / (math.log1p(dmax) - math.log1p(dmin) + 1e-9)
            f_prox = max(0.0, min(1.0, f_prox))
            # wind alignment: does origin->target bearing point downwind of origin?
            brg = bearing_deg(oi["lat"], oi["lon"], info["lat"], info["lon"])
            wind = prevailing_wind_to_bearing(oi["lat"])
            f_wind = 1.0 - angular_diff(brg, wind) / 180.0  # 1 = perfectly downwind
            # climate similarity: similar suitability + similar latitude band
            cs_o = clim.get(oc, 0.5); cs_t = clim.get(c, 0.5)
            f_clim_suit = 1.0 - abs(cs_o - cs_t)
            lat_o = oi["lat"]; lat_t = info["lat"]
            f_clim_lat = 1.0 - min(1.0, abs(lat_o - lat_t) / 60.0)
            f_clim = 0.5 * f_clim_suit + 0.5 * f_clim_lat

            score = (WEIGHTS["trade"] * f_trade +
                     WEIGHTS["proximity"] * f_prox +
                     WEIGHTS["wind"] * f_wind +
                     WEIGHTS["climate"] * f_clim)
            cand = {
                "origin": oc, "origin_lat": round(oi["lat"], 2), "origin_lon": round(oi["lon"], 2),
                "origin_score": round(score, 4),
                "factors": {"trade": round(f_trade, 3), "proximity": round(f_prox, 3),
                            "wind": round(f_wind, 3), "climate": round(f_clim, 3)},
                "dist_km": round(dist, 0),
            }
            if best is None or score > best["origin_score"]:
                best = cand

        arrivals.append({
            "country": c, "year": y,
            "lat": round(info["lat"], 2), "lon": round(info["lon"], 2),
            **best,
        })

    diffusion = {
        "meta": {
            "note": ("Observed first-report diffusion. Dot size grows as a simulated "
                     "logistic build-up with years since first report; colour ramps "
                     "green-amber-red with that simulated local intensity. The growing "
                     "outer halo encodes uncertainty (the simulated, non-measured portion). "
                     "Travel arrows are illustrative likely-introduction paths inferred from "
                     "tomato-trade linkage, geographic proximity, prevailing wind and climate "
                     "similarity; they are not observed movement and no trade layer is shown."),
            "factor_weights": WEIGHTS,
            "growth": {"model": "logistic", "max_radius_px": 16, "min_radius_px": 4,
                       "k": 0.42, "midpoint_years": 6},
            "color_stops": ["#2f7d46", "#d39a17", "#c2402f"],
            "uncertainty": {"halo_max_px": 18, "halo_opacity_floor": 0.06,
                            "note": "halo translucency grows with simulated (unobserved) age"},
        },
        "arrivals": arrivals,
    }
    d["diffusion"] = diffusion
    json.dump(d, open("data.json", "w"), ensure_ascii=False)

    # summary
    n_origin = sum(1 for a in arrivals if a.get("origin"))
    print(f"countries: {len(arrivals)}  with-origin: {n_origin}  seeds: {len(arrivals)-n_origin}")
    print("year range:", arrivals[0]["year"], "->", arrivals[-1]["year"])
    print("\nsample arrivals:")
    for a in arrivals[:6] + arrivals[-4:]:
        o = a.get("origin") or "(seed)"
        f = a.get("factors")
        print(f"  {a['year']} {a['country']:<22} <- {o:<18}", f if f else "")

if __name__ == "__main__":
    main()
