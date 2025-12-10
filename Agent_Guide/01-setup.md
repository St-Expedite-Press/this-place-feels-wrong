# Setup & Workflow

## Local Serve
- Run a static server from repo root:
  - `python -m http.server 8000` (preferred, zero build)
- Browse `http://localhost:8000`.

## Editors & Tools
- Use a modern editor with HTML/CSS/JS linting; no build pipeline is required.
- Prefer `rg` for search; avoid destructive commands (`git reset --hard`).

## Files to Touch
- HTML (active): `index.html`, `under-construction.html`.
- HTML (reference/archived): `assets/deprecated_pages/index_0_1.html`, `index_0_2.html`, `index.html` copy.
- CSS: `assets/css/global.css`, `typography.css`, `layout.css`, `gallery.css`.
- JS: `assets/js/theme.js`, `gallery.js`, `portal.js`.
- Assets: `assets/img/`, `assets/gif/`.

## Files to Avoid/Remove
- Do not reintroduce removed legacy routes (books/gallery etc.) unless explicitly requested.
- Keep `.env` out of version control.

## Testing
- Manual: load pages, check theme toggle, hover states, glitch behaviors, and reduced-motion behavior.
- No automated test suite; keep changes small and visually verify.
