# Scripts

Root-level Node helpers for development, deployment, and validation.

Current entrypoints:

- `check-a11y.mjs` - accessibility heuristics for `apps/web/dist/`
- `check-lighthouse.mjs` - optional Lighthouse report against `apps/web/dist/`
- `check-links.mjs` - local link validation for generated HTML
- `build-asset-manifest.mjs` - generate or verify JSON/text inventories for published assets
- `generate-identity-assets.py` - rebuild transparent seal, static/motion SVG-mask, portal, and social derivatives from the preserved source scan
- `deploy-web.mjs` - build and deploy `apps/web/dist/` to Cloudflare Pages
- `dev-worker.mjs` - sync Worker dev vars and start Wrangler dev
- `run-bash.mjs` - run repo shell scripts through `sh`, WSL, or Git Bash on Windows
- `sync-worker-dev-vars.mjs` - copy supported root `.env` values into Worker `.dev.vars`

Shared helpers live in `scripts/lib/`.
