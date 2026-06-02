// ============================================================
// Pest Radar — shared site module for NON-dashboard pages
// (home / westland / about). The dashboard page loads app.js
// instead, which already wires theme + i18n. This module gives
// the static pages the same theme toggle + language switcher
// behaviour, with NO Leaflet / map dependency.
// ============================================================
import { initI18n } from "./i18n.js";

// ---- Theme: default to "dark", persist, support multiple toggles ----
(function theme() {
  const KEY = "pr-theme";
  const root = document.documentElement;
  let stored = null;
  try {
    stored = localStorage.getItem(KEY);
  } catch (_) {}
  const initial = stored === "light" || stored === "dark" ? stored : "dark";
  root.setAttribute("data-theme", initial);

  const sun =
    '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>';
  const moon =
    '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';

  function apply(next) {
    root.setAttribute("data-theme", next);
    try {
      localStorage.setItem(KEY, next);
    } catch (_) {}
    document.querySelectorAll("[data-theme-toggle]").forEach((btn) => {
      btn.innerHTML = next === "dark" ? sun : moon;
      btn.setAttribute("aria-pressed", String(next === "dark"));
      btn.setAttribute(
        "aria-label",
        "Switch to " + (next === "dark" ? "light" : "dark") + " mode"
      );
    });
  }
  apply(initial);

  document.querySelectorAll("[data-theme-toggle]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const cur = root.getAttribute("data-theme") === "dark" ? "dark" : "light";
      apply(cur === "dark" ? "light" : "dark");
    });
  });
})();

// ---- i18n: mounts the language switcher + applies translations ----
initI18n();
