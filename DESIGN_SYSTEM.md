# Pest Radar — Design System

This document describes the shared design system for the Pest Radar website
(PestRadar.org). Any new page added to this space should reuse these tokens,
components and patterns so the site stays coherent. Nothing here is decorative
for its own sake: the rules exist to keep the **map the product** and to keep
every claim **honest**.

---

## 1. Design principles

These four principles govern every page. They are also surfaced to users on the
About page.

1. **Map first.** The map is the product. Sidebars, rails and prose explain or
   support it — they never compete with it for space. On the dashboard the map
   column is dominant and the context rail is a slim, sticky explainer.
2. **Honest by default.** Observed data and simulated/modelled data are always
   visually and textually distinct. Uncertainty is shown, not hidden. Labels
   like "illustrative, not measured" appear next to anything inferred.
3. **Slim methodology (site-wide rule).** Method notes are short, plain-language
   and source-linked. Never write a wall of methodology. One or two sentences
   per mechanism, with the source named inline.
4. **One design system.** Every page shares the same palette, type scale and
   components. New pages import `styles.css` and reuse the tokens below.

A standing data rule: **trade data is never shown as its own visible layer.** It
is used only under the hood — to estimate likely introduction pathways and, on
the global map, to size dots as a proxy for likely problem size.

### Standing rules checklist (the single source of truth)

Every page and every addition must satisfy all of these. Other docs reference this
list rather than restating it.

- **Map first** — the map is the product; text supports it.
- **Arrows first, then nodes** — when an arrival is animated, the introduction
  path (comet trail / arrow) plays FIRST; the destination node (dot) stays
  hidden and only pops in once the trail has arrived. Never let a node appear at
  the same moment its arrow starts travelling. (See §6 for the mechanism.)
- **Honest by default** — observed vs. simulated always visually + textually
  distinct; mark synthetic data clearly; never present a model as measured fact.
- **No visible trade layer** — under the hood only (dot-sizing is the sole exception).
- **Slim methodology** — short, plain-language, source-linked notes; no walls.
- **Simple labels.**
- **Cite real source URLs** (EPPO taxon pages, photo credits).
- **Full EN / NL / ES** on every visible string (see §7).
- **One design system** — shared palette, type, components; import `styles.css`.
- **Dark theme is default** (toggle persisted in localStorage `pr-theme`).
- **Mobile-safe** — no horizontal overflow down to 390 px (regression-prone; re-check).
- **Pest naming convention** — Latin name + EPPO code + EPPO URL; common name in
  EN/NL/ES (e.g. *Phthorimaea absoluta* → tomato leaf miner / tomatenmineermot /
  cogollero del tomate); a photo from the EPPO Global Database with caption + credit.

### Data-resolution honesty (national vs. regional)

A fifth, load-bearing principle governs how the three map tools relate to each
other. **We only forecast at the resolution our data supports — and we say so.**

| Tier | Data we have | What we show | What we must NOT claim |
|---|---|---|---|
| **National / coarse** (Emerging pests) | EPPO & national first-reports: a pest found in a country/region, updated occasionally, no greenhouse detail | A **point map of detections** + a structured pest profile | No diffusion, no risk surface, no cones — the data is too sparse to model spread |
| **Regional / live** (Westland forecast) | Greenhouse-cluster scale: weekly trap counts, local weather, connectivity | A real **forecast**: KDE hotspots, risk, short-range diffusion, uncertainty cones | (prototype; data is synthetic but structured like the operational model) |
| **Global / historical** (Global spread case) | Verified EPPO first-reports over 20+ years | A year-by-year **invasion replay**, dots sized by problem-size proxy | Dots are illustrative of problem size, not measured severity |

The Emerging-pests page states this distinction in plain language and links to
the Westland forecast as the contrasting high-resolution tier. Never let a
coarse national signal be styled as if it were a live regional forecast.

---

## 1b. Information architecture — the grower journey

The site is structured around **how a grower or grower cooperative actually uses
it**, not around our internal data sources. A grower moves through three
questions, each answered by one tool:

1. **"What's coming?"** → **Emerging pests** (national watchlist). Scan new
   quarantine threats reported in your country or nearby, before they reach your
   region. Coarse, national-level signals.
2. **"What's happening near me?"** → **Westland forecast** (regional prototype).
   Once a pest is in your area, turn trap counts + local weather into hotspots,
   risk and short-range spread for your greenhouse cluster. This is the future
   product.
3. **"What does history teach?"** → **Global spread case** (worldwide replay).
   Understand the long-run invasion trajectory behind a threat.

The home page renders this as a numbered three-step journey plus three
resolution-labelled feature cards (Watchlist · Prototype · Live demo). Order on
the home page follows the grower's mental sequence (coming → near → history),
not the build order.

---

## 2. Color tokens

All colors are CSS custom properties on `:root` (light) and overridden under
`[data-theme="dark"]`. **Dark is the default theme.** Always reference tokens —
never hard-code hex values in component CSS.

### Core surface & text

| Token | Light | Dark | Use |
|---|---|---|---|
| `--color-bg` | `#f1efe7` | `#14160f` | page background |
| `--color-surface` | `#f8f6ef` | `#1a1d14` | cards, panels |
| `--color-surface-2` | `#fdfcf7` | `#1f2218` | raised surface |
| `--color-surface-offset` | `#eae7dc` | `#20241a` | subtle fills |
| `--color-surface-sunk` | `#e4e0d3` | `#11130c` | inset / pressed |
| `--color-divider` | `#ddd9cc` | `#2a2e21` | hairline dividers |
| `--color-border` | `#cfcabb` | `#353a2a` | borders |
| `--color-text` | `#20271d` | `#d6d8cb` | primary text |
| `--color-text-muted` | `#6c6f62` | `#898d7c` | secondary text |
| `--color-text-faint` | `#a4a596` | `#5b5f51` | tertiary / captions |
| `--color-text-inverse` | `#f8f6ef` | `#14160f` | text on primary fills |

### Brand & semantic

| Token | Light | Dark | Meaning |
|---|---|---|---|
| `--color-primary` | `#2f5d34` | `#74a86b` | moss / leaf green — brand, primary buttons, links |
| `--color-primary-hover` | `#244a29` | `#8ec083` | hover state |
| `--color-primary-soft` | `#d9e3d3` | `#2a3a26` | soft brand tint |
| `--color-accent` | `#b5772a` | `#d79a4f` | harvest amber — accents |
| `--color-risk` | `#d19900` | `#e8af34` | risk surfaces |
| `--color-trade` | `#2f5d34` | `#8ec083` | trade-derived (under the hood) |
| `--comet-hue` | — | `#8fc79c` | introduction-path trails |

### Status palette (EPPO categories)

`--c-widespread` (red `#d96a6a`), `--c-restricted` (amber `#d79a4f`),
`--c-few` (yellow `#e0c14e`), `--c-nodetails` (sage `#8aab78`),
`--c-absent` (grey `#777a6c`). These encode pest presence categories and must
stay consistent across maps.

---

## 3. Typography

Three families, loaded from Fontshare (Satoshi, Cabinet Grotesk) and Google
Fonts (IBM Plex Mono):

| Token | Family | Use |
|---|---|---|
| `--font-body` | Satoshi | body text, UI |
| `--font-display` | Cabinet Grotesk | headings (`h1`–`h3`), brand |
| `--font-mono` | IBM Plex Mono | tags, codes, badges, numbers |

Fluid type scale (all `clamp()`-based, responsive):
`--text-xs`, `--text-sm`, `--text-base`, `--text-lg`, `--text-xl`.

Headings use the display family with tight letter-spacing (`-0.01em` to
`-0.02em`) and weight 700–800. Mono is reserved for machine-ish details
(EPPO codes, badges, the "Live demo" tag).

---

## 4. Spacing, radius, layout

- **Spacing scale:** `--space-1` (0.25rem) … `--space-16` (4rem). Use tokens,
  not arbitrary px.
- **Radius:** `--radius-sm` 0.3rem, `--radius-md` 0.5rem, `--radius-lg` 0.75rem,
  `--radius-full` for pills.
- **Layout vars:** `--nav-h: 60px` (top nav height), `--sidebar-w: 300px`
  (dashboard context rail). The rail is sticky at `top: var(--nav-h)`.

---

## 5. Components

### `.site-nav` — shared top navigation
Fixed-height (`--nav-h`) header on every page: `.site-brand` (radar SVG mark +
"Pest Radar"), `.site-links` (Home / Global spread / Westland forecast /
Emerging pests / About — five links, with `aria-current="page"` on the active
link), and `.site-nav-actions[data-lang-host]` holding the language switcher and
`.theme-toggle`.

### Emerging-pests components (`.tier-contrast`, `.pest-profile`)
The Emerging page contrasts the two data tiers with `.tier-contrast` (two
`.tier-card`s — `.tier-national` coarse vs `.tier-regional` live — joined by a
`.tier-arrow`, each with a `.tier-tag`, `.tier-list` and `.tier-verdict`). Each
watchlist entry is a `.pest-profile`: `.pp-head` (name + status), a Leaflet
`.em-map` of detections (point markers only — no spread layer), a `.pp-grid` of
hosts / identification / biocontrol / monitoring, and a `.pp-source` EPPO link.

### Westland forecast components (reused prototype)
The Westland page reuses the original working prototype's component set, restyled
to the shared tokens: `.workspace` (map-dominant 2-col grid), `.control-panel`
(scenario controls), `.map-card` + `.legend` + `.swatch`, `.weather-card`,
`.insight-card` (Chart.js trend in `.chart-wrap`), `.comparison-card`
(`.strategy-card`) and `.detail-card` (incident table). Wrapped by `.wl-hero`,
`.wl-notice` (synthetic-data note) and `.wl-footer`.

### `.feature-card` — navigation/landing cards
Used on the home and About pages in a responsive `.card-grid`
(`repeat(auto-fit, minmax(260px, 1fr))`). Contains `.fc-icon` (inline SVG,
1.8 stroke), a `.fc-tag` or `.badge-soon` status pill, an `h3` and a `p`.

### `.btn`, `.btn-primary`, `.btn-ghost`
Primary = filled brand green with inverse text; ghost = surface fill with border
that turns brand-green on hover. Grouped in `.hero-cta` (centered) or inline.

### `.badge-soon` / status pills
Mono, uppercase, full-radius. `.badge-soon` for "In progress" / "Planned";
`.fc-tag` for "Live demo" / "Open".

### `.dist-card` (dashboard)
Distribution / continent statistic cards in the main map column's
`.dist-section` — keeps stats below the map rather than crowding the rail.

### Context rail (dashboard)
`.sidebar` redesigned into a slim explainer: `.taxon-card` (the pest),
`.rail-explain` with `.rail-list` legend rows (`.rl-dot`, `.rl-size`,
`.rl-trail`) and `.rail-note`. Its job is to teach how to read the map in a
few lines — not to hold controls or data tables.

### `.map-nav` / `.map-nav-btn`
Icon-only map navigation buttons (home/recenter + world/zoom-out), replacing the
old text "Europe & Med" button. Each carries a translated `aria-label`.

### `.prose`, `.section-block`, `.page-footer`
Standard reading column (`max-width: 72ch`), titled content sections, and the
shared disclaimer footer.

---

## 6. The map pattern (dashboard pages)

The global map is **Leaflet** with a custom **SVG overlay** drawn in geographic
coordinates and reprojected on every `zoom`/`move`:

- Country first-reports are **dots** (`renderDots`). Radius =
  `(SIZE.minR + SIZE.tradeR * trade_norm + SIZE.ageR * age01) * zoomScale`.
  `trade_norm` is a log10-normalised tomato-export volume (UN-Comtrade-derived,
  embedded in `data.json`), used as a **proxy for likely problem size** —
  bigger, warmer dots = larger exporters. This is the one sanctioned use of
  trade data; it is never drawn as a standalone layer.
- Introduction paths are faint **comet trails** between origin and arrival.
- **Animation order — arrows first, then nodes.** A freshly-arrived node must
  not appear until its travel trail has (mostly) reached the destination. The
  pattern: `renderDots()` tags new dots with `.is-fresh` and, *only when the
  arrival has an origin trail*, sets an inline `animation-delay` of ~55% of the
  comet's travel time (`cometDuration()`). Because `.diff-dot.is-fresh` uses
  `animation: dot-pop ... both`, the delay holds the dot at its 0% keyframe
  (`opacity:0; scale(0.1)`) — invisible — until the trail lands, then it pops
  in. First-report nodes with **no** origin (e.g. early Mediterranean focus)
  have no arrow, so they pop immediately. The comet trail itself reaches the
  destination (`stroke-dashoffset: 0`) at 58% of its duration and the head lands
  at ~62%; keep the dot delay just under that so the node lands on the arrow.
  Reuse `cometDuration()` for both so they stay in sync at any playback speed.
  Respect `prefers-reduced-motion` (no pop / no head; trail simply fades).
- Reprojection: on map events, convert each feature's lat/lng to layer points
  with `map.latLngToLayerPoint` and rewrite the SVG. This keeps the overlay
  crisp at every zoom.
- Constants: `MIN_ZOOM 2`, `MAX_ZOOM 9`, `EURO_VIEW {center:[42.5,12], zoom:4}`,
  year range 2008–2026.

New map pages should reuse `app.js`'s structure and the slim method note built
by `buildMethodNote()`.

---

## 7. Internationalization (i18n)

The site supports **English, Dutch and Spanish**. Everything is driven by a
single lightweight module, `i18n.js`.

### What gets translated
Only **static UI chrome**: navigation, headings, buttons, legends, rail
explanations, controls, footers. **Data-derived content stays in its source
language** — EPPO report titles, country names and dates are verbatim records,
not UI copy, and must not be machine-translated.

### Markup contract
Tag any translatable element with a `data-i18n` attribute whose value is a dotted
key:

```html
<a data-i18n="nav.home">Home</a>                     <!-- sets innerHTML -->
<meta data-i18n-attr="content" data-i18n="home.lead"> <!-- sets an attribute -->
<button data-i18n-aria="map.recenter">                <!-- sets aria-label, tags stripped -->
```

- `data-i18n` sets `innerHTML` (so values may contain `<strong>`/`<em>`).
- `data-i18n-attr="x"` + `data-i18n="key"` sets attribute `x`.
- `data-i18n-aria` / `data-i18n-title` set those attributes with tags stripped.
- Placeholder interpolation: keys may contain `{name}` tokens replaced at render
  (used by the method note: `{basis}`, `{trade}`, `{prox}`, `{wind}`, `{clim}`).

### Language resolution & switching
Language is resolved in order: `?lang=` query param → `localStorage("pr-lang")`
→ `<html lang>` → `"en"`. The switcher is a globe-icon dropdown mounted into
`[data-lang-host]` (in `.site-nav-actions`). `LANGS` lists `en` / `nl` / `es`
with flag glyphs.

### Wiring a page
Every non-dashboard module shares the same **dark-default theme IIFE**
(`localStorage("pr-theme")`, sun/moon SVG, multiple `[data-theme-toggle]`) plus
`import { initI18n, ... } from "./i18n.js"`.

- **Global spread (dashboard)** loads `app.js`: `initI18n()` + `onLangChange(...)`
  to re-render dynamic strings (sidebar, method note) on language change.
- **Static pages** (home / About) load `site.js`: theme toggle + `initI18n()`.
- **Emerging pests** loads `emerging.js`: theme + Leaflet detection map + `t()`
  for dynamic strings, re-rendered `onLangChange`.
- **Westland forecast** loads `westland.js` (the ported prototype as an ES
  module): theme + the full diffusion/hotspot/cone/chart/table engine +
  `initI18n()` + `onLangChange(() => render())`. Static labels are owned by
  `data-i18n` in the HTML; the JS writes only dynamic value spans (numbers,
  greenhouse IDs, generated scenario phrases), some of which stay English by
  design where translating data-interpolated text would add no clarity.

### Adding strings
Add the key to **all three** language blocks in `i18n.js` (`STRINGS.en`,
`STRINGS.nl`, `STRINGS.es`). Note: the file stores non-ASCII characters as
literal `\uXXXX` escape sequences inside JS string literals (valid JS, decoded
at runtime) — preserve that when editing.

---

## 8. Page inventory

| Page | File | Script | Tier | Status |
|---|---|---|---|---|
| Home / landing | `index.html` | `site.js` | — | live |
| Emerging pests | `emerging.html` | `emerging.js` | national / coarse | live (watchlist) |
| Westland forecast | `westland.html` | `westland.js` | regional / live | prototype (synthetic data) |
| Global spread case | `global-spread.html` | `app.js` | global / historical | live demo |
| About | `about.html` | `site.js` | — | live |

Home-page ordering follows the grower journey (coming → near → history), which
differs from this build/inventory order.

To add a new page: copy the `.site-nav` header block (set `aria-current` on the
matching link), import `styles.css`, load `site.js` (static) or `app.js`
(map-driven), tag all static strings with `data-i18n`, and add their keys to all
three language blocks in `i18n.js`.
