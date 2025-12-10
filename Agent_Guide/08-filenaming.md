# File Naming Conventions

## HTML
- Live portal: `index.html`.
- Archived/reference portal variants: `assets/deprecated_pages/index_0_1.html`, `index_0_2.html`, and an older `index.html` copy. Do not add new portal variants without incrementing the suffix and placing them in `assets/deprecated_pages/`.

## CSS
- Global tokens: `assets/css/global.css`.
- Type scale: `assets/css/typography.css`.
- Layout/animations: `assets/css/layout.css`.
- Gallery styling (if reused): `assets/css/gallery.css`.
- Do not create page-specific CSS files unless explicitly scoped; prefer extending existing files with clear section comments.

## JS
- Theme toggle: `assets/js/theme.js`.
- Gallery modal (legacy/optional reuse): `assets/js/gallery.js`.
- Portal interactions: `portal.js` at repo root. If adding new JS, place in `assets/js/` with a concise, descriptive name (e.g., `nav.js`, `forms.js`), avoid numbering.

## Media
- Animations: `assets/gif/` for compiled gifs; `assets/img/crow_frames/` for frame sequences.
- Legacy sigils/backgrounds: `assets/img/deprecated_images/` (keep there; do not rename).
- New images: use kebab-case descriptive names; include variant if multiple sizes (e.g., `crow-closeup-800w.png`).

## Guides
- Agent guides: `Agent_Guide/NN-topic.md` where `NN` is a zero-padded sequence; keep titles concise (`01-setup.md`, `02-aesthetic.md`, etc.).

## General Rules
- Use lowercase and kebab-case; avoid spaces and camelCase in filenames.
- Keep one role per file; avoid duplicate names across directories.
- If introducing a new variant or archive, place it under `assets/deprecated_pages/` with an incremented suffix, and document it in `README.md`.
