# Changelog

## 1.0.3 — Performance + Shared Shell
- Refactored portal + interior pages to use shared CSS (`assets/css/base.css`, `assets/css/effects.css`, `assets/css/a11y.css`, `assets/css/content-shell.css`).
- Moved cursor glow into shared JS (`assets/js/cursor-glow.js`) and consolidated index-only effects (`assets/js/index-effects.js`).
- Optimized portal media: replaced the original 10.9MB GIF with an animated WebP (preferred), a smaller GIF fallback, and a static reduced-motion image.

## 1.0.2 — Venv + Ontology Visualization
- Added local venv setup and installed graphviz (0.21) for ontology rendering.
- Generated `ontology/stxp.png` from `stxp.dot`.
- Updated README and agent guides with venv/command/structure changes.

## 1.0.1 — Docs & Naming Pass
- Added `under-construction.html` stub and pointed portal links to it with a return-to-portal CTA.
- Added file-naming conventions guide for agents and referenced it in docs.
- Updated README to reflect current version and guide structure.
- No functional changes to portal behavior.

## 1.0.0 — Neon Portal Baseline
- Established single neon portal as the live surface; retired Books/Gallery pages.
- Documented live page (`index.html`) and archived portal variants (`assets/deprecated_pages/`).
- Consolidated CSS/JS into the current palette, motion, and theme system.
- Added Agent guides (setup, aesthetic, portal behavior, theme, assets, accessibility, deploy).
- Added repo-wide `.gitignore` and version manifest (`VERSION`).
