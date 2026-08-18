# St. Expedite Press — monorepo

Proprietary monorepo for five St. Expedite products plus their shared contracts
and Osiris agent control plane.

| App | Path | Production | Stack |
|---|---|---|---|
| St. Expedite | `apps/stex/` | [stexpedite.press](https://stexpedite.press) | Astro → Cloudflare Pages |
| RICE | `apps/rice/` | [rice.stexpedite.press](https://rice.stexpedite.press) | Static + Python build → Cloudflare Pages |
| Chat | `apps/chat/` | preview pending | Static OpenUI-style client → Cloudflare Pages |
| Admin | `apps/admin/` | [admin.stexpedite.press](https://admin.stexpedite.press) | Single-owner dashboard, Astro → Cloudflare Pages |
| Backend | `apps/backend/` | `stexpedite.press/api/*` | Cloudflare Worker + D1 |

RICE calls the Worker's works, updates, and public-chat routes. The public chat
surface is shared by both sites and reaches only the isolated, read-only Hermes
profile through the Worker; the owner/deployment profile is never public.

## Command surface

One command surface drives all five products from the repo root:

```bash
# dev
npm run dev:web        # Astro dev server (:4321)
npm run dev:rice       # RICE static server (:4173)
npm run dev:chat       # full-page public chat client
npm run dev:admin      # owner admin dashboard
npm run dev:worker     # Wrangler dev (Worker)

# build
npm run build:web      # or: npm run build
npm run build:rice
npm run build:chat
npm run build:admin
npm run build:all

# deploy (Cloudflare Pages, one token)
npm run deploy:web
npm run deploy:rice
npm run deploy:chat    # explicit preview/release action
npm run deploy:admin
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

**Web (`apps/stex`):** `/` · `/books` · `/about` · `/work` · `/gallery` (Store) · `/donate` (+ `/donate/thanks`); `/services`,`/lab`,`/submit`,`/contact`,`/connect` redirect (`/connect` → `https://chat.stexpedite.press`).
**RICE (`apps/rice`):** `/` (Seed) · `/splash` · `/project` · essays/fiction/poetry/archive + sample pages.
**Chat (`apps/chat`):** the site's single intake surface — general chat / press knowledge-base toggle, a manuscript Submit work dialog, and an inline updates-signup form; conversation persists across a page refresh via a client-generated `conversationId`; calls `/api/chat`, `/api/chat/history`, `/api/submit`, and `/api/updates`.
**Admin (`apps/admin`):** single-owner dashboard, magic-link auth, read-only view of newsletter signups, contact/submission log, and donations; live at admin.stexpedite.press.
**Worker API:** `GET /api/health` · `GET /api/storefront` · `GET /api/projects` · `GET /api/works` · `POST /api/chat` · `GET /api/chat/history` · `POST /api/contact` · `POST /api/submit` · `POST /api/donate/session` · `POST /api/stripe/webhook` · `POST /api/updates` · `POST /api/updates/import` · `POST /api/updates/unsubscribe` · `POST /api/admin/login` · `GET /api/admin/verify` · `GET /api/admin/me` · `POST /api/admin/logout` · `GET /api/admin/{signups,submissions,donations}` · `POST /api/visitor/{login,logout}` · `GET /api/visitor/{verify,me}` · `GET /api/presets` · `GET /api/preset-models` · `POST /api/presets/{create,import}` · `GET|POST /api/presets/{id}/{export,submit}` · `GET|POST /api/admin/{presets/*,models,models/*/toggle,visitors/*/status,graph/*}`.

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

- St. Expedite and RICE retain their existing Pages projects; chat and admin are each independently released Pages products.
- The Worker serves `stexpedite.press/api/*`; Resend (email), Stripe (donations), D1 (data + rate limits), Fourthwall (storefront), Turnstile (bot protection), and an authenticated tunnel to the isolated public Hermes profile.
- Never edit `apps/stex/dist/`, `apps/rice/_site/`, or `apps/chat/dist/` by hand; regenerate with the build commands. D1 migrations are append-only.

This repository is not licensed for public redistribution or reuse.
