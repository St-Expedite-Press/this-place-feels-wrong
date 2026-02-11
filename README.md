# St. Expedite Press Portal

_St. Expedite Press Website_ (`this-place-feels-wrong`)

Static neon portal for St. Expedite Press: a cursor-responsive portal, a circular “portal” frame, and interior pages (Books / Store / Services / Mission / Lab / Contact / Submission).

## Current State
- **Entry point:** `index.html`  
  Neon title, animated circular portal frame, cursor halo, and grid navigation. Motion respects `prefers-reduced-motion`.
- **Books:** `books.html`  
  Books catalog with modal details.
- **Store:** `gallery.html`  
  Store/gallery surface with modal details.
- **Services:** `services.html`  
  Capabilities + offerings.
- **Mission:** `mission.html`  
  Mission + positioning.
- **Lab:** `lab.html`  
  Experimental / lab surface.
- **Contact:** `contact.html`
- **Submission:** `submit.html`
- **Under-construction stub:** `under-construction.html`

## Repository Layout
- **Root**
  - `index.html` — portal surface.
  - `books.html`, `gallery.html`, `services.html`, `mission.html`, `lab.html`, `contact.html`, `submit.html` — interior pages.
  - `CHANGELOG.md` — historical notes for portal iterations.
  - `DEPLOYMENT.md` — deployment notes.
  - `sitemap.xml`, `robots.txt` — indexing helpers.
- **assets/css/**
  - `base.css` — shared palette tokens + background.
  - `effects.css` — grain layer + cursor glow visuals.
  - `a11y.css` — skip link + consistent `:focus-visible` styling.
  - `content-shell.css` — shared non-portal page shell (header + nav + cards).
  - `hero-bar.css` — social icon bar at top.
  - `footer.css` — shared footer styling.
- **assets/js/**
  - `index-effects.js` — cursor glow + portal warp (index only).
  - `cursor-glow.js` — shared cursor glow behavior (interior pages).
  - `modal-utils.js` — shared modal helpers (Books/Store).
- **assets/img/**
  - `void_engine_twinkle_green.webp` — background texture (with PNG fallback in CSS).
  - `crow_glitch_text.webp` — animated portal media (preferred).
  - `crow_glitch_text_still.webp` — static portal media (used when `prefers-reduced-motion: reduce`).
- **assets/gif/**
  - `crow_glitch_text.gif` — optimized animated GIF fallback for the portal media (used if animated WebP isn’t supported).
- **assets/deprecated_pages/**
  - Prototype/legacy portal layouts (not intended for deploy).

## Behavior & Design Notes
- **Palette:** neon green on deep slate/black, layered gradients, and glow shadows.
- **Motion (index):** entry flash, breathing title, portal frame drift/glitch, portal-media “breathe”, cursor halo, and cursor-driven portal warp.
- **Reduced motion:** `prefers-reduced-motion: reduce` disables primary animations and shows a static portal image.

## Local Development
This is a static site; there is no build step.

- From the repo root, start a simple HTTP server (Python example):
  ```bash
  python -m http.server 8000
  ```
  Then visit `http://localhost:8000/` in your browser.

## Deployment
See `DEPLOYMENT.md` for GitHub Pages (CI/CD) and email form setup.

## Versioning & History
- Historical changes and version notes live in `CHANGELOG.md`.
- Track future changes by updating `CHANGELOG.md` and using Git tags/releases as needed.
