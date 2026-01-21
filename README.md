# St. Expedite Press Portal

_St. Expedite Press Website_ (`this-place-feels-wrong`)


Static neon portal for St. Expedite Press: a single-page entry point with a cursor-responsive portal, a three-by-three nav grid, and an under-construction stub for everything that isn't live yet.

## Current State
- **Entry point:** `index.html`  
  Neon crest/title, animated circular portal frame, cursor halo, grid navigation, and an entry flash on load. All motion respects `prefers-reduced-motion`.
- **Under-construction stub:** `under-construction.html`  
  Slate-dark card with a single 'Return to Portal' CTA that links back to `/index.html`.
- **Archived portal variants:** `assets/deprecated_pages/*.html`  
  Earlier portal experiments (and an older `index.html`) kept for reference only; do not deploy.
- **Books prototype:** `books.html`  
  A standalone, grid-based Books catalog prototype mirroring the portal aesthetic. Not currently linked from `index.html`.

## Repository Layout
- **Root**
  - `index.html` � live portal surface.
  - `under-construction.html` � shared under-construction page for nav and footer links.
  - `books.html` � experimental/books surface (WIP).
  - `CHANGELOG.md` � historical notes for portal iterations.
  - `README.md` � this document.
  - `LICENSE` � MIT license.
  - `.gitignore`, optional local `.env`, local tooling like `.venv/` (not tracked).
- **assets/css/**
  - `global.css` � global palette tokens and base layout for the neon slate theme.
  - `typography.css` � serif/sans type scales and text utility classes.
  - `layout.css` � layout primitives, CTA styles, and logo/splash composition for non-portal pages.
  - `gallery.css` � gallery plate and modal styling used by older experiments.
- **assets/js/**
  - `theme.js` � day/night theme toggle that writes `sep-theme` to `localStorage` and flips `theme-day` / `theme-night` classes on `<body>` when wired up.
  - `gallery.js` � modal viewer for SVG gallery plates (currently unused on the live portal).
- **assets/gif/**
  - `crow_glitch_text.gif` � animated GIF used inside the circular portal frame on `index.html`.
- **assets/img/**
  - `void_engine_twinkle_green.png` � void/pavement background texture for `index.html`.
  - `crow_frames/` � frame sequence for potential alternative portal rendering.
  - `deprecated_images/` � legacy sigils and background art kept for reference.
- **assets/deprecated_pages/**
  - Prototype/legacy portal layouts. Safe to open locally; not intended for deploy.

## Behavior & Design Notes
- **Palette:** Neon green (`#39ff14` / `#2aff8a`) on deep slate/black, layered radial gradients, and multi-stop glow shadows. Stick to this palette unless you are intentionally creating a new visual mode.
- **Motion:**
  - Entry flash overlay on load.
  - Breathing title text and subtle GIF brightness shifts.
  - Glitch spikes on the portal frame.
  - Cursor halo that tracks pointer position.
  - Portal frame skew/rotation based on cursor proximity.
  - `prefers-reduced-motion: reduce` disables the primary animations.
- **Navigation:**
  - Grid links (BOOKS, GALLERY, MISSION, LICE) in `index.html` currently point to `/under-construction.html`.
  - Footer links (Services, Contact) also route to `/under-construction.html`.
  - The stub offers a single path back to `/index.html`.

## Local Development
This is a static site; there is no build step.

- From the repo root, start a simple HTTP server (Python example):
  ```bash
  python -m http.server 8000
  ```
  Then visit `http://localhost:8000/` in your browser.
- Any equivalent static server (Caddy, nginx, `npx serve`, etc.) is fine as long as `index.html`, `under-construction.html`, `books.html` (if used), and the `assets/` directory share the same document root.

## Extending the Portal
When adding or reactivating surfaces (Books, Gallery, Mission, LICE):
- Keep the neon slate palette and the type stack (Cormorant Garamond + Cinzel).
- Prefer reusing tokens and motion patterns from `assets/css/global.css` and `assets/css/layout.css` instead of introducing new colors or shadow styles.
- Use `theme.js` if you introduce a theme toggle; keep the `sep-theme` key and `theme-day` / `theme-night` classes stable for compatibility.
- Place experimental portal variants under `assets/deprecated_pages/` with incremented suffixes (e.g., `index_0_3.html`) instead of overwriting `index.html`.
- Respect `prefers-reduced-motion` for any new animations (flashes, glitch cycles, logo assembly, etc.).

## Deployment
Any static host works:
- Upload `index.html`, `under-construction.html`, `books.html` (if live), and the entire `assets/` tree.
- Configure `/` to serve `index.html`; ensure `/under-construction.html` resolves as well.
- If you add a dedicated 404 page, consider routing unknown paths either back to the portal or to a gentle under-construction surface that still offers a return-to-portal CTA.

## Versioning & History
- Historical changes and version notes live in `CHANGELOG.md` (current portal baseline is documented there as `1.0.2`).
- This branch no longer uses a separate `VERSION` manifest file; track future changes by updating `CHANGELOG.md` and using Git tags/releases as needed.
