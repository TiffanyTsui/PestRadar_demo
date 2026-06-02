#!/usr/bin/env python3
"""Annotate each diffusion arrival with a tomato-export-volume proxy.

Bigger tomato exporters are assumed to carry a bigger Phthorimaea absoluta
problem, so we size (and intensify) the map dots by export volume.

Source: per-country `trade_export_value_2011` from the trade-network nodes
already embedded in data.json (UN Comtrade-derived tomato trade, 2011).

Export values span ~6 orders of magnitude (1 .. 1.67M), so we map them onto a
LOG scale -> trade_norm in [0,1]. Countries with no export figure get a small
non-zero floor so they still render as modest dots.
"""
import json
import math

PATH = "data.json"

with open(PATH) as f:
    d = json.load(f)

nodes = {n["country"]: n for n in d["hotspot_model"]["nodes"]}
arrivals = d["diffusion"]["arrivals"]

# Gather raw export values (None where unknown)
raw = {}
for a in arrivals:
    n = nodes.get(a["country"])
    ev = n.get("trade_export_value_2011") if n else None
    raw[a["country"]] = ev if (ev is not None) else None

known = [v for v in raw.values() if v and v > 0]
vmax = max(known)
# Floor for log: 1 unit (a thousand USD in the source). Unknown/zero exporters
# get the floor so they read as "small problem" rather than vanishing.
FLOOR = 1.0

def log_norm(v):
    if v is None or v <= 0:
        v = FLOOR
    # log10 normalisation against the max exporter
    return math.log10(v + 1) / math.log10(vmax + 1)

for a in arrivals:
    ev = raw[a["country"]]
    a["export_value"] = (ev if (ev and ev > 0) else 0)
    a["trade_norm"] = round(log_norm(ev), 4)  # 0..1 on a log scale

# Record sizing metadata so the methodology note can reference it.
meta = d["diffusion"].setdefault("meta", {})
meta["dot_size_basis"] = {
    "field": "trade_norm",
    "source_field": "trade_export_value_2011",
    "source": "UN Comtrade-derived tomato export volume (2011), embedded trade network",
    "scale": "log10 normalised to the largest exporter",
    "max_exporter": max(raw, key=lambda k: (raw[k] or 0)),
    "max_value": vmax,
    "note": "Dot size & colour intensity scale with national tomato export volume as a proxy for likely problem severity; this is illustrative, not a measured outbreak size.",
}

with open(PATH, "w") as f:
    json.dump(d, f, ensure_ascii=False, separators=(",", ":"))

# Report
ranked = sorted(((a["trade_norm"], a["export_value"], a["country"]) for a in arrivals), reverse=True)
print(f"Annotated {len(arrivals)} arrivals. max exporter = {meta['dot_size_basis']['max_exporter']} ({vmax:,.0f})")
print("trade_norm  export_value  country")
for tn, ev, c in ranked[:12]:
    print(f"  {tn:.3f}   {ev:14,.0f}  {c}")
print("  ...")
for tn, ev, c in ranked[-6:]:
    print(f"  {tn:.3f}   {ev:14,.0f}  {c}")
