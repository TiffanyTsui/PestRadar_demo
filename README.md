# Pest Radar — multi-page site

An early-warning system for plant pests, focused on Westland horticulture. A
static, multi-page site (HTML + CSS + vanilla JS, **no build step**; maps via
Leaflet 1.9.4). Full EN/NL/ES, dark theme by default.

## Pages
- `index.html` — Home (overview + grower journey)
- `global-spread.html` — Global spread case: year-by-year worldwide invasion of
  the tomato leafminer (*Phthorimaea absoluta* / syn. *Tuta absoluta*, GNORAB)
- `westland.html` — Westland regional forecast (prototype)
- `emerging.html` — Emerging-pests reference (EPPO-style; data-driven registry)
- `about.html` — Project + design principles

## Documentation (read in this order)
1. **`START_HERE.md`** — session-start brief: orientation, what's live, deploy
   reference, technical gotchas, change history.
2. **`DESIGN_SYSTEM.md`** — the system of record: design rules, color/type tokens,
   components, the map pattern, i18n contract, page inventory.
3. **`EDIT_GUIDE.md`** — owner self-service: step-by-step to hide a page, change
   text/images, add a pest, and publish.

## Run locally
```bash
cd pestradar_global
python3 -m http.server 8099
# open http://localhost:8099/index.html  (add ?lang=nl or ?lang=es to test languages)
```
A static file server is required (ES modules + `fetch` of `data.json` /
`world.geo.json` do not work via `file://`).

## Data sources
Observed detections come from the EPPO Global Database (e.g.
https://gd.eppo.int/taxon/GNORAB). Modelled/simulated content is always labelled
illustrative. Not an official EPPO product.
