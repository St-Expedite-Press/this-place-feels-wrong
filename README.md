# St. Expedite Press — monorepo

Proprietary monorepo for four St. Expedite products plus their shared contracts
and Osiris agent control plane.

| App | Path | Production | Stack |
|---|---|---|---|
| St. Expedite | `apps/stex/` | [stexpedite.press](https://stexpedite.press) | Astro → Cloudflare Pages |
| RICE | `apps/rice/` | [rice.stexpedite.press](https://rice.stexpedite.press) | Static + Python build → Cloudflare Pages |
| Chat | `apps/chat/` | preview pending | Static OpenUI-style client → Cloudflare Pages |
| Backend | `apps/backend/` | `stexpedite.press/api/*` | Cloudflare Worker + D1 |

RICE calls the Worker's works, updates, and public-chat routes. The public chat
surface is shared by both sites and reaches only the isolated, read-only Hermes
profile through the Worker; the owner/deployment profile is never public.

## Command surface

One command surface drives all four products from the repo root:

```bash
# dev
npm run dev:web        # Astro dev server (:4321)
npm run dev:rice       # RICE static server (:4173)
npm run dev:chat       # full-page public chat client
npm run dev:worker     # Wrangler dev (Worker)

# build
npm run build:web      # or: npm run build
npm run build:rice
npm run build:chat
npm run build:all

# deploy (Cloudflare Pages, one token)
npm run deploy:web
npm run deploy:rice
npm run deploy:chat    # explicit preview/release action
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

**Web (`apps/stex`):** `/` · `/books` · `/about` · `/work` · `/gallery` (Store) · `/connect` · `/donate` (+ `/donate/thanks`); `/services`,`/lab`,`/submit`,`/contact` redirect.
**RICE (`apps/rice`):** `/` (Seed) · `/splash` · `/project` · essays/fiction/poetry/archive + sample pages.
**Chat (`apps/chat`):** full-page conversation workspace with Press/RICE context selection; calls only `/api/chat`.
**Worker API:** `GET /api/health` · `GET /api/storefront` · `GET /api/projects` · `GET /api/works` · `POST /api/chat` · `POST /api/contact` · `POST /api/submit` · `POST /api/donate/session` · `POST /api/stripe/webhook` · `POST /api/updates` · `POST /api/updates/import` · `POST /api/updates/unsubscribe`.

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

Operational architecture: [public Hermes boundary](ops/hermes/README.md) ·
[Osiris agent framework](agents/README.md) ·
[repository retirement gate](ops/repository-retirement.md).

## Deployment model

- St. Expedite and RICE retain their existing Pages projects; chat is an independently released Pages product.
- The Worker serves `stexpedite.press/api/*`; Resend (email), Stripe (donations), D1 (data + rate limits), Fourthwall (storefront), Turnstile (bot protection), and an authenticated tunnel to the isolated public Hermes profile.
- Never edit `apps/stex/dist/`, `apps/rice/_site/`, or `apps/chat/dist/` by hand; regenerate with the build commands. D1 migrations are append-only.

This repository is not licensed for public redistribution or reuse.
