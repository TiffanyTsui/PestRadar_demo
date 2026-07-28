# Pest Radar — START HERE (session brief)

> **Read this first every Pest Radar session.** It orients you and points to the
> right doc. It deliberately does NOT repeat the design rules or edit steps — those
> live in one place each (below). Update §6 "Change history" at the end of a session.

Space: **Pest Radar** — pest early-warning system, focus on Westland horticulture.
Owner: Tiffany Tsui, CEO Springtide Strategy (flagship: open-source SOLARA).
Last updated: 31 May 2026.

---

## 0. The three docs (each fact lives in ONE place)

| Doc | What it is | Go here for |
|-----|------------|-------------|
| **START_HERE.md** (this) | Session brief | Orientation, what's live, deploy ref, gotchas, history |
| **DESIGN_SYSTEM.md** | System of record | Design rules, color/type tokens, components, i18n contract, page inventory, the map pattern |
| **EDIT_GUIDE.md** | Owner how-to | Step-by-step: hide a page, change text/images, add a pest, publish |

If a question is "what are the rules / how is it built?" → DESIGN_SYSTEM.md.
If it's "how do I change X myself?" → EDIT_GUIDE.md. Don't duplicate them here.

---

## 1. First moves

1. Skim this brief, then **DESIGN_SYSTEM.md** for the rules before changing anything.
2. The project is the folder **`/home/user/workspace/pestradar_global/`** (git).
   If missing, restore from the shared zip `pest_radar_global_demo` before editing.
3. Confirm state: `cd pestradar_global && git log --oneline | head && ls assets/`.
4. **Don't confuse two things:** `pestradar.org` root = a separate standalone
   Westland prototype. *This* project = the multi-page site (Home / Global spread /
   Westland / Emerging / About).

---

## 2. What's live right now

Static multi-page site, no build step (HTML + CSS + vanilla JS, Leaflet 1.9.4 CDN).
Five pages share `styles.css` + `i18n.js`. Full EN/NL/ES, dark default.
Pages and component details: see **DESIGN_SYSTEM.md §8 (page inventory)**.

**Pests currently in the site:**

| Latin | EPPO | EN / NL / ES common | Where |
|-------|------|----------------------|-------|
| *Phthorimaea absoluta* (syn. *Tuta absoluta*) | GNORAB | tomato leaf miner / tomatenmineermot / cogollero del tomate | Global spread (case study) |
| *Scirtothrips dorsalis* | SCITDO | chilli thrips / chillitrips / trips chilli | Emerging #1 |
| *Thrips parvispinus* | THRIPV | tobacco thrips / pepertrips / trips del tabaco | Emerging #2 (Italy 2025 Sicily + Spain/NL context) |

EPPO note: THRIPV is "tobacco thrips" in EPPO, **not** "Taiwan thrips".

**Images** (`assets/`, all from EPPO Global Database — keep this credit list with any swap):
- `gnorab_14373.jpg` — leafminer damage on fruit — © Wietse den Hartog, NVWA · EPPO
- `scitdo_15311.jpg` — adult chilli thrips — courtesy Dr Rachana R.R., ICAR-NBAIR, India
- `thripv_9971.jpg` — tobacco thrips in flower — courtesy Alfredo Lacasa · EPPO

---

## 3. The ship loop (summary — full steps in EDIT_GUIDE.md §3)

Edit → `node --check` any JS touched → QA headless (EN/NL/ES, maps draw, 390 px no
overflow, 0 console errors) → `git commit` → **deploy = UPDATE existing site** →
refresh shared zip + data.json under the **same asset names**.

---

## 4. Technical gotchas (these WILL bite)

- **i18n.js editing**: the `edit` tool does NOT decode `\u` escapes, and the file
  mixes literal accented chars with `\u` escapes. Safest: a small Python script
  writing UTF-8, anchored on the exact existing line. Some lines store the em-dash
  as a literal `—` (not `\u2014`). Always `node --check` after; each key must
  appear **exactly 3×** (en/nl/es).
- **Pest content is NOT in i18n.js** — it's inline `{en,nl,es}` in the `PESTS`
  registry in `emerging.js`, resolved by a local `tr()` helper. Only page chrome
  uses `t()`/i18n.js. (Add-a-pest steps: EDIT_GUIDE.md §E.)
- **Inline-edit `<script data-pplx-inline-edit>`** is injected by the platform at
  deploy — keep it OUT of source.
- **QA REPL**: js_repl persists `const` between calls — wrap in `{ }` or
  `reset:true`. `require('process')` for `process`. Guard the final
  `process.kill(-srv.pid)` in try/catch (throws ESRCH if server already exited).
  Dot selectors: global-spread `.leaflet-overlay-pane svg circle`; westland
  `.leaflet-overlay-pane svg path` + `canvas.leaflet-heatmap-layer`; emerging =
  Leaflet circleMarkers per pest.

---

## 5. Deploy / share reference

- **Live URL**: https://www.perplexity.ai/computer/a/pestradar-global-spread-case-ssZpLYWSRiGbgwsX4scntQ
- **Deploy asset_id**: `b2c6692d-8592-4621-9b83-0b17e2c727b5`
- **Deploy args** (UPDATE existing — `bash` + `api_credentials=["pplx-tool:deploy_website"]`, JSON via heredoc):
  `{"project_path":"/home/user/workspace/pestradar_global","site_name":"PestRadar — Global spread case","entry_point":"index.html","should_validate":false}`
- **Shared asset names** (reuse to version, never rename):
  `pestradar_global` · `pest_radar_global_demo` (zip) · `pest_radar_global_data` (json).
- Repackage: `cd /home/user/workspace && rm -f pest_radar_global_demo.zip && cd pestradar_global && zip -qr ../pest_radar_global_demo.zip . -x ".git/*" && cd .. && cp pestradar_global/data.json pest_radar_global_data.json`

---

## 6. Change history (append newest on top)

- **2026-05-31** — Global map animation order: destination nodes now stay
  hidden until their travel trail (arrow) arrives, then pop in on landing
  (`renderDots()` sets an inline `animation-delay` ≈55% of `cometDuration()` on
  fresh dots that have an origin). Codified this as a standing rule ("Arrows
  first, then nodes") in DESIGN_SYSTEM.md §1 + §6 so future map pages follow it.
- **2026-05-31** — Consolidated docs to remove redundancy: renamed
  `DESIGN_LOG.md → START_HERE.md`, `MAINTENANCE.md → EDIT_GUIDE.md`,
  `design.md → DESIGN_SYSTEM.md`; design rules now live only in DESIGN_SYSTEM.md;
  fixed stale README. Earlier same day: added the session log + edit guide;
  simplified Home/About copy with `[edit]` markers (EN/NL/ES); refactored Emerging
  into the data-driven `PESTS` registry and added *Thrips parvispinus* (THRIPV)
  with EPPO photo, common names and detection map; added EPPO photo + common names
  to Global-spread pest rail; fixed mobile nav overflow on all 5 pages.
