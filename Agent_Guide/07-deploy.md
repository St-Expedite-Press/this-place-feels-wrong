# Deploy

## Target
- Static hosting (any service that serves plain HTML/CSS/JS).

## Steps
1) Build: none required; ensure files are in place.
2) Verify locally:
   - `python -m http.server 8000`
   - Click through portal links; ensure theme toggle persists.
   - Check reduced-motion behavior.
3) Upload all root files and the `assets/` directory.

## Preflight Checklist
- `index.html`, `index_0_1.html`, `index_0_2.html` present.
- `assets/css/`, `assets/js/`, `assets/img/`, `assets/gif/` present.
- No absolute paths to missing assets; keep relative links correct for hosting root.
- `sep-theme` storage key untouched.

## Post-Deploy Smoke
- Load portal; confirm textures, glow, crest reveal, and cursor glow.
- Toggle theme; refresh to ensure persistence.
- Verify animations respect `prefers-reduced-motion`.
