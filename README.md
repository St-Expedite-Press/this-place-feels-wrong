# St. Expedite Press — monorepo

Proprietary monorepo for the St. Expedite Press web presence: two websites and
the shared communications API.

| App | Path | Production | Stack |
|---|---|---|---|
| Web | `apps/web/` | [stexpedite.press](https://stexpedite.press) | Astro → Cloudflare Pages |
| RICE | `apps/rice/` | [rice.stexpedite.press](https://rice.stexpedite.press) | Static + Python build → Cloudflare Pages |
| Worker | `apps/communications-worker/` | `stexpedite.press/api/*` | Cloudflare Worker + D1 |

RICE calls the Worker's `POST /api/updates`; otherwise the two sites are
independent apps that share only this repo's tooling and docs.

## Command surface

One surface drives both sites and the worker, from the repo root:

```bash
# dev
npm run dev:web        # Astro dev server (:4321)
npm run dev:rice       # RICE static server (:4173)
npm run dev:worker     # Wrangler dev (Worker)

# build
npm run build:web      # or: npm run build
npm run build:rice
npm run build:all

# deploy (Cloudflare Pages, one token)
npm run deploy:web
npm run deploy:rice
npm run deploy:all
npm run deploy:worker

# checks
npm run check          # web gate: build + html + links + a11y + worker tests + audit
npm run check:rice     # RICE asset integrity
npm run check:docs     # documentation coverage (no orphaned docs)
```

Deploy auth: `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID`. CI deploys each
app independently via path-filtered workflows in `.github/workflows/`.

## Routes

**Web (`apps/web`):** `/` · `/books` · `/about` · `/work` · `/gallery` (Store) · `/connect` · `/donate` (+ `/donate/thanks`); `/services`,`/lab`,`/submit`,`/contact` redirect.
**RICE (`apps/rice`):** `/` (Seed) · `/splash` · `/project` · essays/fiction/poetry/archive + sample pages.
**Worker API:** `GET /api/health` · `GET /api/storefront` · `GET /api/projects` · `POST /api/contact` · `POST /api/submit` · `POST /api/donate/session` · `POST /api/stripe/webhook` · `POST /api/updates` · `POST /api/updates/import` · `POST /api/updates/unsubscribe`.

Full route/ownership map: [`ONTOLOGY.md`](ONTOLOGY.md).

## Documentation

**All documentation is indexed in one hub: [`docs/README.md`](docs/README.md).**
It links every reference doc (framework, per-app, deployment/ops, brand, press)
and declares the per-directory conventions below. Coverage is enforced by
`npm run check:docs`.

Framework entrypoints: [`AGENTS.md`](AGENTS.md) (agent doctrine) ·
[`ONTOLOGY.md`](ONTOLOGY.md) (navigation map) · [`CLAUDE.md`](CLAUDE.md)
(Claude Code) · [`MEMORY.md`](MEMORY.md) (change log).

**Per-directory convention** — operational docs live beside the code they
govern and are indexed by rule, not one-by-one:
`**/AGENTS.md` (scope + rules), `**/MEMORY.md` (change log),
`**/README.md` (orientation), `**/SKILL.md` (skills under `skills/`, `ops/`).
Historical/audit/scaffolding trees: `archive/`, `audit/`, `kits/`.

## Deployment model

- Both sites are **Cloudflare Pages** projects (`stexpedite-press`, `rice-magazine`), deployed via `wrangler` (locally through `deploy:*`, in CI through path-filtered workflows).
- The Worker serves `stexpedite.press/api/*`; Resend (email), Stripe (donations), D1 (data + rate limits), Fourthwall (storefront), Turnstile (bot protection).
- Never edit `apps/web/dist/` or `apps/rice/_site/` by hand; regenerate with the build commands. D1 migrations are append-only.

This repository is not licensed for public redistribution or reuse.
