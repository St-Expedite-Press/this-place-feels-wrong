# St. Expedite Press

Proprietary repository for the St. Expedite Press public site and communications API.

## Layout

- `apps/web/`
  - Astro static site for Cloudflare Pages
  - source: `apps/web/src/`
  - authored assets: `apps/web/public/assets/`
  - generated output: `apps/web/dist/`
- `apps/communications-worker/`
  - Cloudflare Worker for `/api/*`
  - implementation, OpenAPI contract, D1 migrations, tests, and Wrangler config
- `assets/source/`
  - canonical copies of every shipped image/GIF variant, mirrored into `apps/web/public/assets/`
- `assets/manifest.json` and `assets/manifest.txt`
  - generated ownership, checksum, and byte inventories for the complete published asset tree
- Homepage identity animation is generated as `assets/source/img/identity/expedite-seal-motion.svg` by `npm run identity:build`.
- `branding/`
  - exportable brand package, UX assessment, design tokens, and web-element guidelines
- `docs/`
  - infrastructure, operations, ontology, and repo state documentation
- `AGENTS.md` and `CLAUDE.md`
  - canonical agent doctrine and Claude Code entrypoint
- `scripts/`, `ops/`, `skills/`, and `kits/`
  - maintenance tooling, operational runbooks, repo-scoped skills, release helpers, and reusable scaffolding kits
- `archive/`
  - non-live historical material

## Commands

From repo root:

```bash
npm run build
npm run dev:web
npm run dev:worker
npm run check
npm run deploy:web
npm run deploy:worker
```

Pages deploy auth:

```bash
CLOUDFLARE_API_TOKEN=...
CLOUDFLARE_ACCOUNT_ID=...
```

Supporting checks and operations:

```bash
npm run assets:sync
npm run assets:check
npm run identity:build
npm run check:seo
npm run runtime:config
npm run runtime:audit
npm run smoke:api
npm run release:dry-run
make check-all
make assets-check
```

## Public Routes

Static site routes:

- `/`
- `/books`
- `/about`
- `/contact`
- `/donate`
- `/donate/thanks`
- `/submit`
- `/gallery`
- `/lab`
- `/services`

Worker routes:

- `GET /api/health`
- `GET /api/storefront`
- `GET /api/projects`
- `POST /api/contact`
- `POST /api/submit`
- `POST /api/donate/session`
- `POST /api/stripe/webhook`
- `POST /api/updates`
- `POST /api/updates/import`
- `POST /api/updates/unsubscribe`

## Deployment Model

- Cloudflare Pages publishes `apps/web/dist/`.
- `npm run deploy:web` and the GitHub Pages workflow use `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID`.
- Cloudflare routes `stexpedite.press/api/*` and `www.stexpedite.press/api/*` to `apps/communications-worker/`.
- Resend handles contact and submission email.
- Stripe Checkout handles donations.
- D1 stores updates, contact logs, project/catalog data, and API rate-limit state.
- Fourthwall provides storefront data.
- Turnstile can protect POST routes when configured.

## Agent Workflow

- `AGENTS.md` is the canonical shared agent instruction file.
- `CLAUDE.md` imports `AGENTS.md` for Claude Code.
- `.claude/` and `CLAUDE.local.md` are local-only and ignored.
- Repo-scoped Codex skills live under `skills/`.
- Operational runbooks live under `ops/`.
- Shell and Node tooling live under `scripts/`.
- Reusable scaffolding kits live under `kits/`.

## Notes

- Do not edit `apps/web/dist/` by hand; regenerate it with `npm run build`.
- Legacy Cloudflare global API key/email auth is not part of the supported Pages deploy path.
- D1 migrations are append-only numbered SQL files.
- `archive/anglossic_quiz/` is preserved as historical product material.
- The former checked-in static output snapshot was removed from `archive/site-legacy/`; recover it from git history if needed.
- This repository is not licensed for public redistribution or reuse.

## Agent framework

- `AGENTS.md` is the canonical shared agent instruction file.
- `CLAUDE.md` imports `AGENTS.md` for Claude Code.
- `ONTOLOGY.md` is the project-level navigation contract: surfaces, page/API routes, ownership, and validation.
- `MEMORY.md` records durable changes, checks, follow-ups, and tooling notes.
- Local `AGENTS.md` and `MEMORY.md` files in major working directories define subtree ownership and memory logging.
- Repo-scoped skills live under `skills/`; runbooks under `ops/`; shell and Node tooling under `scripts/`; reusable kits under `kits/`.

Every file-changing task should update root `MEMORY.md`, update local memory when present, and assess whether skills, tooling, runbooks, or ontology need to change.
