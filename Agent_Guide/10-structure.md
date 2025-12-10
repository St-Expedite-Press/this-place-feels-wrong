# Directory Structure (2025-12-10)

Annotated snapshot of the repo layout; update this file when structure changes.

```
/                  # Repo root
├─ CHANGELOG.md    # Release notes (current 1.0.1)
├─ LICENSE
├─ README.md       # Project overview, behavior highlights, guardrails
├─ VERSION         # Current version string
├─ .gitignore      # Ignore rules (env, caches, editor junk)
├─ .env            # Local env (ignored in VCS)
├─ index.html      # Live neon portal
├─ under-construction.html  # Stub target for portal links with return CTA
├─ portal.js       # Cursor glow + portal warp interactions
├─ Agent_Guide/    # Agent instructions (setup, aesthetic, portal, theme, assets, a11y, deploy, filenaming, commands, structure)
│  ├─ 01-setup.md
│  ├─ 02-aesthetic.md
│  ├─ 03-portal.md
│  ├─ 04-theme.md
│  ├─ 05-assets.md
│  ├─ 06-accessibility.md
│  ├─ 07-deploy.md
│  ├─ 08-filenaming.md
│  ├─ 09-commands.md
│  └─ 10-structure.md   # This file
├─ assets/
│  ├─ css/
│  │  ├─ global.css     # Palette/tokens, textures
│  │  ├─ typography.css # Type scales
│  │  ├─ layout.css     # Structure, glitch/logo composition, buttons
│  │  └─ gallery.css    # Plate/modal styling (legacy reuse)
│  ├─ js/
│  │  ├─ theme.js       # Theme toggle + persistence
│  │  └─ gallery.js     # Gallery modal logic (legacy reuse)
│  ├─ gif/
│  │  └─ crow_glitch_text.gif
│  ├─ img/
│  │  ├─ crow_frames/   # PNG frames for glitch animation
│  │  └─ deprecated_images/ # Legacy sigils/backgrounds
│  └─ deprecated_pages/ # Archived portal variants
│     ├─ index.html
│     ├─ index_0_1.html
│     └─ index_0_2.html
├─ ontology/
│  ├─ stxp.ttl          # OWL/Turtle ontology of portal + assets
│  └─ stxp.dot          # Graphviz visualization of ontology
```

Notes:
- Only `index.html` and `under-construction.html` are live surfaces.
- Deprecated portal variants stay in `assets/deprecated_pages/` for reference only.
- Media additions must follow `Agent_Guide/08-filenaming.md`.
