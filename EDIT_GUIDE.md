# Pest Radar — Edit Guide (owner self-service)

A plain-language guide to **making simple changes yourself** without breaking
anything: what the site is, what assets it uses, and step-by-step edits.

The **design rules** this site follows are NOT repeated here — they live in one
place: `DESIGN_SYSTEM.md` §1 ("Standing rules checklist"). Read those before
adding content. For orientation at the start of a session, see `START_HERE.md`.

Last updated: 31 May 2026.

---

## 1. What this site is

A static, multi-page demo site (HTML + CSS + vanilla JS, no build step). It runs
by opening the files directly or serving the folder. Five pages share one design
system, one stylesheet, and one translation file.

| Page | File | Purpose | Status shown |
|------|------|---------|--------------|
| Home | `index.html` | Landing / overview, links to the three views | — |
| Global spread | `global-spread.html` | Year-by-year world spread of tomato leafminer (observed EPPO data + labelled modelling) | Live demo |
| Westland forecast | `westland.html` | Regional greenhouse-cluster forecast (hotspots, spread) | Prototype |
| Emerging pests | `emerging.html` | EPPO-style reference of greenhouse pests to watch | Watchlist |
| About | `about.html` | Project description + design principles | — |

Shared navigation = brand + 5 links, identical on every page.

---

## 2. Design rules to respect

Whenever you add or change content, keep to the standing rules. They are listed
once, in **`DESIGN_SYSTEM.md` §1 ("Standing rules checklist")** — honest
observed-vs-simulated, no visible trade layer, slim methodology, simple labels,
full EN/NL/ES, dark default, mobile-safe at 390 px, and the pest-naming
convention. Read that list before editing; this guide won't repeat it.

---

## 3. Reusable workflow (how changes get made & shipped)

This is the loop used every time the site is edited. You can follow the same one.

1. **Edit** the relevant file(s) locally (text → `i18n.js`; layout → the `.html`;
   look → `styles.css`; pest data → `emerging.js`).
2. **Validate JS** if you touched a `.js` file:
   `node --check i18n.js` (and `node --check emerging.js`). Must print nothing / OK.
3. **Preview locally**: serve the folder and open it in a browser —
   `python3 -m http.server 8099` then visit `http://localhost:8099/index.html`.
   Check the page in EN, NL and ES (use the switcher or add `?lang=nl` / `?lang=es`).
4. **Check the basics**: no broken text, images load, language switch works,
   no horizontal scrollbar on a narrow window.
5. **Save a version** (optional but recommended): `git add -A && git commit -m "..."`.
6. **Publish**: re-deploy the folder to the existing URL (replaces files in place).

Each pest profile and each translation lives in a predictable place, so most
changes are a one-line or one-block edit.

---

## 4. Asset inventory

**Code files**
- `index.html`, `global-spread.html`, `westland.html`, `emerging.html`, `about.html` — the 5 pages.
- `styles.css` — all styling for every page.
- `i18n.js` — **all UI text in EN/NL/ES** (the place to edit most wording).
- `site.js` — small shared script for the static pages (theme + language).
- `app.js` — the Global-spread map/timeline logic.
- `westland.js` — the Westland forecast logic.
- `emerging.js` — the Emerging-pests **pest registry** (pest data lives here, not in i18n.js).
- `data.json` — data for the global-spread map.
- `world.geo.json` — world map geometry.
- `DESIGN_SYSTEM.md` — visual/technical system of record (rules, tokens, components, i18n).
- `START_HERE.md` — session-start brief (orientation, deploy ref, gotchas, history).
- `EDIT_GUIDE.md` — this guide.
- `README.md` — project notes.
- Helper scripts (`build_*.py`, `add_trade_size.py`) — used to regenerate data; not needed for text/image edits.

**Images** (`assets/`, all from the EPPO Global Database)
| File | Shows | Used on |
|------|-------|---------|
| `gnorab_14373.jpg` | Tomato leafminer damage on fruit | Global spread (pest rail card) |
| `scitdo_15311.jpg` | Adult Chilli thrips (microscope) | Emerging pests (pest #1) |
| `thripv_9971.jpg` | Tobacco thrips in flower | Emerging pests (pest #2) |

---

## 5. Simple changes you can make yourself

> Golden rule: **change only the text between the quotation marks.** Leave the
> key names (the part before the `:`) and the punctuation/commas alone.

### A. Hide a page from the menu (e.g. remove "Home" or "About")

Each page has the same nav block. To hide a link, you remove (or comment out) its
one `<a>` line **in every page's `<nav class="site-links">` block** so it
disappears everywhere.

Find this line (example: About) inside each `.html` file:
```html
<a href="./about.html" data-i18n="nav.about">About</a>
```
To hide it, delete that single line, or comment it out like this:
```html
<!-- <a href="./about.html" data-i18n="nav.about">About</a> -->
```
The 5 files to update: `index.html`, `global-spread.html`, `westland.html`,
`emerging.html`, `about.html`.

- **Hiding "Home"**: remove the `nav.home` `<a>` line. The brand logo (top-left)
  still links back to the home page, so navigation keeps working.
- The page file itself still exists; you've only removed the menu link. You can
  add the link back any time by un-commenting it.

### B. Change wording on Home or About (or any UI text)

All visible text lives in **`i18n.js`**. Every phrase has a key that appears
**three times** — once in the `en` block, once in `nl`, once in `es`.

1. Open `i18n.js` and search for the key. The keys for the pages are prefixed:
   - Home: `home.*` and `card.*` (e.g. `home.lead`, `card.global.desc`)
   - About: `about.*` (e.g. `about.lead`, `about.what_p`)
   - Nav labels: `nav.*`
2. You'll find three matching lines. Edit the text inside the quotes on **all
   three** (English, Dutch, Spanish) so the languages stay in sync.
3. Spots already marked `[edit: ...]` are where placeholder text is waiting for
   your own wording — just replace the whole marker.
4. Save. If you only changed text inside quotes, no validation is needed, but you
   can run `node --check i18n.js` to be safe (must print nothing).

Special characters: it's fine to type accented letters (é, ñ, ü) directly.
Avoid a literal `"` inside the text — use `'` or write it as `\"`.

### C. Swap or update an image

1. Put your new image in the `assets/` folder (JPG or PNG). Keep it reasonably
   sized (roughly 1000–1200 px wide is plenty).
2. Point the page at it by changing the filename in the relevant file:
   - **Global-spread pest photo**: in `global-spread.html`, find
     `./assets/gnorab_14373.jpg` and replace with your filename.
   - **Emerging-pest photos**: in `emerging.js`, find the pest's
     `photo: "./assets/...jpg"` line and replace the filename.
3. Update the caption/credit text to match (see the `figcaption` in the HTML, or
   the `photoCaption` / `photoCredit` blocks in `emerging.js`).
4. Simplest safe option: give your new image the **same filename** as the old one
   and drop it in `assets/` — then no code change is needed at all.

### D. Edit text on a pest profile (Emerging page)

Pest content is **not** in `i18n.js` — it's self-contained in `emerging.js` so a
pest is one block you can copy. Open `emerging.js`, find the pest (search its
Latin name, e.g. `Thrips parvispinus`), and edit the text inside the quotes. Each
field has `{ en: "...", nl: "...", es: "..." }` — edit all three.

Editable fields per pest: `common` (common name), `intro`, the `sections`
(Hosts & damage, Identification, Biocontrol, Monitoring), `photoCaption`,
`photoCredit`, and each `detections` `note`.

### E. Add a NEW pest to the Emerging page (no rewrite needed)

The page is data-driven: add one entry and it renders automatically (profile card,
photo, common names, and its own detection map).

1. Drop the pest photo into `assets/` (e.g. `mypest_1234.jpg`).
2. In `emerging.js`, copy an existing pest block (everything from `{` to the
   matching `},` inside the `const PESTS = [ ... ]` list) and paste it as a new
   entry in the list.
3. Change the fields:
   - `id` — a short unique code, lowercase (e.g. `"myp"`).
   - `latin`, `eppoCode`, `eppoUrl` — from the EPPO Global Database page.
   - `statusTag` — short status label in EN/NL/ES.
   - `common` and `commonAll` — common names in EN/NL/ES.
   - `photo` — `"./assets/mypest_1234.jpg"`, plus `photoCaption` / `photoCredit`.
   - `intro` — one short paragraph (EN/NL/ES).
   - `sections` — the headed paragraphs (keep the same shape).
   - `detections` — one object per location: `country`, `region`, `lat`, `lon`,
     `date`, `status` (`"present"`, `"control"` or `"eradicated"`), and a `note`.
4. Validate: `node --check emerging.js` (must print nothing).
5. Preview, then publish.

That's the whole "add a pest without a rewrite" promise: **one block + one image.**

### F. Change which language loads first

The page picks language from, in order: a `?lang=` in the URL → the saved choice
→ the page's `<html lang="...">` → English. To change the default, set the `lang`
attribute on the opening `<html ...>` tag of each page (e.g. `lang="nl"`).

---

## 6. Publishing an update

After editing and previewing locally, the folder is re-deployed to the **same
existing URL** (files are replaced in place — the link doesn't change). If you're
doing this through the assistant, just say "deploy the update." A fresh
downloadable zip of the whole site can be produced the same way.

Current live URL:
https://www.perplexity.ai/computer/a/pestradar-global-spread-case-ssZpLYWSRiGbgwsX4scntQ

---

## 7. Quick troubleshooting

- **Text shows the key name (e.g. `home.lead`) instead of words** → that key is
  missing from `i18n.js`, or you removed one of its three language copies. Make
  sure it exists 3× (en/nl/es).
- **A page is blank or the map is missing** → you likely have a JS typo. Run
  `node --check emerging.js` (or the relevant `.js`) and fix the reported line.
  A common cause is a missing comma between blocks or a stray `"` inside text.
- **An image doesn't appear** → check the filename matches exactly (case-sensitive)
  and that the file is in `assets/`.
- **Sideways scrollbar on mobile** → something is wider than the screen; check any
  new image or wide element you added.
