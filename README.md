# St. Expedite Press — Neon Portal (Repo Overview)

This repository contains a single neon-wired portal experience on slate-dark backdrops. All former Books/Gallery surfaces are retired; the portal is the live surface and uses an under-construction stub for outbound links.

## Current State (2025-12-10)
- Live page: `index.html` (neon crest/title, grid nav, cursor halo, entry flash, crest reveal on first interaction).
- Stub: `under-construction.html` (neon slate, return-to-portal CTA).
- Archived portal variants: `assets/deprecated_pages/index_0_1.html`, `index_0_2.html`, and an older `index.html` copy (reference only; do not deploy).
- Version: `1.0.2` (see `VERSION` and `CHANGELOG.md`).
- No standalone 404 page is deployed; all outbound portal links currently route to the under-construction stub.

## Repository Layout (high-level)
- Root: `index.html`, `under-construction.html`, `portal.js`, `VERSION`, `CHANGELOG.md`, `README.md`, `.gitignore`, `.env` (local).
- Assets:
  - CSS: `assets/css/global.css` (palette/tokens/textures), `typography.css` (type scales), `layout.css` (structure/glitch/logo composition), `gallery.css` (plate/modal styling if reused).
  - JS: `assets/js/theme.js` (day/night toggle + persistence), `assets/js/gallery.js` (legacy modal logic), `portal.js` (cursor glow + portal warp).
  - Media: `assets/gif/crow_glitch_text.gif`; `assets/img/crow_frames/` (frame sequence); `assets/img/deprecated_images/` (legacy sigils).
  - Deprecated pages: `assets/deprecated_pages/` (portal variants for reference).
- Agent guides: `Agent_Guide/01-10` covering setup, aesthetic, portal behavior, theme, assets, accessibility, deploy, file naming, commands, and structure.
- Ontology: `ontology/stxp.ttl` (OWL/Turtle), `ontology/stxp.dot` (Graphviz), and `ontology/stxp.png` (rendered graph) describing pages, assets, themes, and guides.

## Behavior Highlights
- Palette: neon green (#39ff14 family) on deep slate/black with subtle radial backgrounds and glow stacks.
- Motion: crest/title breathing, grid link glow, cursor halo, entry flash; all respect `prefers-reduced-motion`.
- Theme: `sep-theme` in `localStorage`; default night bias; toggle flips `theme-day` / `theme-night` on `<body>`.
- Routing: grid and footer links point to `under-construction.html`, which links back to `index.html`.

## Working with This Repo
- Serve statically (no build step):
  ```
  python -m http.server 8000
  ```
  Then browse `http://localhost:8000`.
- Venv (Windows, already created as `.venv`):
  - Create (if needed): `python -m venv .venv`
  - Pip version: `pip 25.3` (inside venv); Python: `3.13`; graphviz (Python) `0.21`.
  - Install deps: `.venv\Scripts\python -m pip install --upgrade pip graphviz`
  - Render ontology (uses Python graphviz + dot):  
    ```
    @'
    from graphviz import Source
    src = Source.from_file('ontology/stxp.dot')
    src.render('ontology/stxp', format='png', cleanup=True)
    '@ | .\.venv\Scripts\python -
    ```
- Use ripgrep for search:
  - `rg "big-word" index.html`
  - `rg "prefers-reduced-motion" assets/css`
- Inspect structure (PowerShell):
  - `Get-ChildItem -Recurse | Select-Object FullName`

## Guardrails
- Do not change the palette (neon green + slate dark), fonts (Cormorant/Cinzel), or defined glow stacks without approval.
- Preserve grid layout symmetry, crest reveal trigger, and the `sep-theme` key/class names.
- Keep new/archived pages named per `Agent_Guide/08-filenaming.md`; place new portal variants in `assets/deprecated_pages/` with incremented suffixes.
- Respect `prefers-reduced-motion`: disable/soften flash/rotation/glitch when set.

## Options for Future Work
- Reactivate Books/Gallery: reuse tokens and motion discipline from `global.css` / `layout.css`, keep copy sparse, avoid new colors/shadows, and document in `Agent_Guide/`.
- Swap media: replace portal gif or frames while keeping sizing/filters; optimize assets (<200 KB when possible).
- Extend ontology: add new classes/instances if you add routes or assets; update `stxp.ttl` and `stxp.dot`.
- Deploy: any static host; ensure `index.html`, `under-construction.html`, `assets/`, and `ontology/` are uploaded.

## Repo Hygiene
- `.gitignore` covers env files, OS/editor junk, caches, common build outputs.
- `.env` stays local/untracked.
- Versioning: bump `VERSION` and add entries to `CHANGELOG.md` for meaningful changes (features, routing shifts, asset swaps).
