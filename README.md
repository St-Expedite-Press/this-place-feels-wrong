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
  - canonical media sources synced into `apps/web/public/assets/`
- `branding/`
  - exportable brand package, UX assessment, design tokens, and web-element guidelines
- `docs/`
  - infrastructure, operations, ontology, and repo state documentation
- `agent/`
  - canonical agent instructions (`agent/AGENT.md`), maintenance tooling, release scripts, operational skills, and reusable kits
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

Supporting checks and operations:

```bash
npm run assets:sync
npm run assets:check
npm run check:seo
npm run check:tooling-integrity
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
- `POST /api/updates`
- `POST /api/updates/import`
- `POST /api/updates/unsubscribe`

## Deployment Model

- Cloudflare Pages publishes `apps/web/dist/`.
- Cloudflare routes `stexpedite.press/api/*` and `www.stexpedite.press/api/*` to `apps/communications-worker/`.
- Resend handles contact and submission email.
- Stripe Checkout handles donations.
- D1 stores updates, contact logs, project/catalog data, and API rate-limit state.
- Fourthwall provides storefront data.
- Turnstile can protect POST routes when configured.

## Agent Workflow

- `agent/AGENT.md` is the canonical shared agent instruction file.
- `CLAUDE.md` imports `agent/AGENT.md` for Claude Code.
- `.claude/` and `CLAUDE.local.md` are local-only and ignored.
- Repo-scoped Codex skills live under `agent/skills/`.

## Notes

- Do not edit `apps/web/dist/` by hand; regenerate it with `npm run build`.
- D1 migrations are append-only numbered SQL files.
- `archive/anglossic_quiz/` is preserved as historical product material.
- The former checked-in static output snapshot was removed from `archive/site-legacy/`; recover it from git history if needed.
- This repository is not licensed for public redistribution or reuse.
