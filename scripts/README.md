# Scripts

Root-level Node helpers for development, deployment, and validation.

Current entrypoints:

- `check-a11y.mjs` - accessibility heuristics for `apps/stex/dist/`
- `check-lighthouse.mjs` - optional Lighthouse report against `apps/stex/dist/`
- `check-links.mjs` - local link validation for generated HTML
- `build-asset-manifest.mjs` - generate or verify JSON/text inventories for published assets
- `generate-identity-assets.py` - rebuild transparent seal, static/motion SVG-mask, portal, and social derivatives from the preserved source scan
- `deploy-web.mjs` - build and deploy `apps/stex/dist/` to Cloudflare Pages
- `dev-backend.mjs` - sync backend dev vars and start Wrangler dev
- `run-bash.mjs` - run repo shell scripts through `sh`, WSL, or Git Bash on Windows
- `sync-backend-dev-vars.mjs` - copy allowlisted root `.env` values into backend `.dev.vars`

Shared helpers live in `scripts/lib/`.
