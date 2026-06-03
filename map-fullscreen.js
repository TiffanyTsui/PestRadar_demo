/* ===========================================================================
   map-fullscreen.js  —  shared fullscreen-map control
   Used by global-spread.html and westland.html.

   What it does
   ------------
   • Injects a "fullscreen" toggle button into the map (into .map-nav if present,
     otherwise a floating button over #map).
   • On enter: adds `map-fs-on` to <body> (CSS promotes #map to a full-viewport
     fixed layer), calls Leaflet invalidateSize() so tiles fill the screen, and
     shows a floating control bar with an Exit button and — when the page has a
     timeline — a Play/Pause button that mirrors the existing [data-play] control.
   • On exit: removes the class and re-fits the map. Esc also exits.

   Recording helpers (used by the offline recorder; harmless in normal use):
   • window.__mapFullscreen.enter()      -> fullscreen with the control bar
   • window.__mapFullscreen.enterClean() -> fullscreen, ALL overlays hidden
                                            (no bar, no year badge) for a clean
                                            map-only capture
   • window.__mapFullscreen.exit()
   =========================================================================== */
(function () {
  "use strict";

  var ICON_FS =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M16 3h3a2 2 0 0 1 2 2v3"/>' +
    '<path d="M8 21H5a2 2 0 0 1-2-2v-3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/></svg>';
  var ICON_EXIT =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M8 3v3a2 2 0 0 1-2 2H3"/><path d="M21 8h-3a2 2 0 0 1-2-2V3"/>' +
    '<path d="M3 16h3a2 2 0 0 1 2 2v3"/><path d="M16 21v-3a2 2 0 0 1 2-2h3"/></svg>';
  var ICON_PLAY =
    '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>';
  var ICON_PAUSE =
    '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6 5h4v14H6zM14 5h4v14h-4z"/></svg>';

  function relayoutMap() {
    // Let the layout settle, then tell Leaflet its container changed size.
    var m = window.__leafletMap;
    var run = function () { try { if (m && m.invalidateSize) m.invalidateSize(true); } catch (e) {} };
    requestAnimationFrame(function () { run(); setTimeout(run, 60); setTimeout(run, 260); });
    // Some pages redraw overlays on a window resize; nudge them too.
    try { window.dispatchEvent(new Event("resize")); } catch (e) {}
  }

  function pageHasTimeline() {
    return !!document.querySelector("[data-play]");
  }

  // Reflect the page play button's state (play vs pause icon) onto our mirror.
  function syncPlayMirror(mirror, sourceBtn) {
    if (!mirror || !sourceBtn) return;
    var isPlaying = /M6 5h4v14H6/.test(sourceBtn.innerHTML); // pause icon = currently playing
    mirror.innerHTML = isPlaying ? ICON_PAUSE : ICON_PLAY;
    // Icon-only button; mirror the source's own aria-label so it stays localised.
    var srcLabel = sourceBtn.getAttribute("aria-label");
    mirror.setAttribute("aria-label", srcLabel || (isPlaying ? "Pause animation" : "Play animation"));
  }

  function build() {
    var mapEl = document.getElementById("map");
    if (!mapEl) return;

    // ---- 1) Toggle button -------------------------------------------------
    var toggle = document.createElement("button");
    toggle.type = "button";
    toggle.setAttribute("data-map-fs", "");
    toggle.className = "map-nav-btn";
    toggle.innerHTML = ICON_FS;
    toggle.setAttribute("aria-label", "View map fullscreen");
    toggle.setAttribute("title", "Fullscreen map");

    var nav = document.querySelector(".map-nav");
    if (nav) {
      nav.appendChild(toggle);
    } else {
      // No nav group (e.g. westland): float the toggle over the map.
      var wrap = mapEl.parentElement;
      if (wrap && getComputedStyle(wrap).position === "static") {
        wrap.style.position = "relative";
      }
      toggle.style.position = "absolute";
      toggle.style.right = "12px";
      toggle.style.top = "12px";
      toggle.style.zIndex = "600";
      (wrap || mapEl).appendChild(toggle);
    }

    // ---- 2) Floating control bar (exit + optional play) -------------------
    var bar = document.createElement("div");
    bar.className = "map-fs-bar";
    bar.setAttribute("role", "group");
    bar.setAttribute("aria-label", "Fullscreen map controls");

    var playMirror = null;
    var sourceBtn = document.querySelector("[data-play]");
    if (sourceBtn) {
      playMirror = document.createElement("button");
      playMirror.type = "button";
      playMirror.setAttribute("data-map-fs-play", "");
      playMirror.innerHTML = ICON_PLAY;
      playMirror.setAttribute("aria-label", "Play animation");
      playMirror.addEventListener("click", function () {
        sourceBtn.click();            // delegate to the real timeline control
        // icon will re-sync via the observer below
      });
      bar.appendChild(playMirror);

      // Keep the mirror's icon in sync with the real button.
      try {
        var obs = new MutationObserver(function () { syncPlayMirror(playMirror, sourceBtn); });
        obs.observe(sourceBtn, { childList: true, subtree: true, attributes: true });
      } catch (e) {}
      syncPlayMirror(playMirror, sourceBtn);
    }

    var exit = document.createElement("button");
    exit.type = "button";
    exit.setAttribute("data-map-fs-exit", "");
    exit.innerHTML = ICON_EXIT;
    exit.setAttribute("aria-label", "Exit fullscreen");
    exit.setAttribute("title", "Exit fullscreen");
    bar.appendChild(exit);

    document.body.appendChild(bar);

    // ---- 3) Enter / exit --------------------------------------------------
    function enter(clean) {
      document.body.classList.add("map-fs-on");
      document.body.classList.toggle("map-fs-clean", !!clean);
      toggle.setAttribute("aria-pressed", "true");
      if (playMirror && sourceBtn) syncPlayMirror(playMirror, sourceBtn);
      relayoutMap();
    }
    function exitFs() {
      document.body.classList.remove("map-fs-on", "map-fs-clean");
      toggle.setAttribute("aria-pressed", "false");
      relayoutMap();
    }
    function isOn() { return document.body.classList.contains("map-fs-on"); }

    toggle.addEventListener("click", function () { isOn() ? exitFs() : enter(false); });
    exit.addEventListener("click", exitFs);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && isOn()) exitFs();
    });

    // ---- 4) Public API for the recorder ----------------------------------
    window.__mapFullscreen = {
      enter: function () { enter(false); },
      enterClean: function () { enter(true); },
      exit: exitFs,
      isOn: isOn
    };
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", build);
  } else {
    build();
  }
})();
