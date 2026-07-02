# St. Expedite Press — Ontology

The project navigation contract. Read after `AGENTS.md` and before selecting files to edit. Keep this file aligned with `AGENTS.md` whenever routes, ownership, commands, or workflow rules change.

## Summary

| Field | Value |
|---|---|
| Live sites | `https://stexpedite.press` (web) · `https://rice.stexpedite.press` (RICE) |
| Stack | Astro · static+Python (RICE) · Cloudflare Pages · Cloudflare Worker · D1 · Resend · Stripe · Fourthwall · Turnstile |
| Repository | `St-Expedite-Press/this-place-feels-wrong` (monorepo) |
| Agent doctrine | `AGENTS.md` · phase tracking `PHASE-PLAN.md` · change log `MEMORY.md` |
| Documentation hub | `docs/README.md` (indexes every doc; enforced by `npm run check:docs`) |

## Maintained surfaces

| Surface | Source of truth | Local docs |
|---|---|---|
| Web app (stexpedite.press) | `apps/web/` | `AGENTS.md`, `MEMORY.md`, `README.md` |
| RICE app (rice.stexpedite.press) | `apps/rice/` (static site + Python build; `_site` artifact) | `AGENTS.md`, `MEMORY.md`, `README.md`, `ONTOLOGY.md`, `docs/` |
| Communications Worker | `apps/communications-worker/` | `AGENTS.md`, `MEMORY.md`, `README.md` |
| Canonical media | `assets/source/` → `apps/web/public/assets/`; manifests `assets/manifest.*` | `AGENTS.md`, `MEMORY.md`, `README.md` |
| Branding | `branding/` (tokens + exports); prose docs in `docs/branding/` | `AGENTS.md`, `MEMORY.md`, `README.md` |
| Docs | `docs/` (single documentation hub — see `docs/README.md`) | `AGENTS.md`, `MEMORY.md`, `README.md` |
| Tooling | `scripts/`, `ops/`, `skills/`, `kits/` | each has `AGENTS.md`/`MEMORY.md` |

RICE is a self-contained app: its routes, build, and asset pipeline are
documented in `apps/rice/ONTOLOGY.md` and `apps/rice/docs/`. It deploys to its
own Cloudflare Pages project (`rice-magazine`) via `.github/workflows/deploy-rice.yml`.

## Page routes

Every interior page uses `Base.astro` (brand mode set per page) and loads `tokens.css` + `interior-base.css` first. The home page uses `BasePortal.astro`.

| Route | Source | Brand mode | Page CSS/JS |
|---|---|---|---|
| `/` | `pages/index.astro` | ritual | `portal.css`, `index-effects.js` |
| `/books` | `pages/books.astro` | editorial | `books.css`, `books-page.js` |
| `/about` | `pages/about.astro` | editorial | `mission.css` |
| `/gallery` (Store) | `pages/gallery.astro` | editorial | `gallery.css`, `gallery-page.js` |
| `/work` | `pages/work.astro` | editorial | `services.css`, `lab.css`, `lab-anglossic-*.js`, `dialog.js` |
| `/connect` | `pages/connect.astro` | utility | `forms.css`, `connect-page.js` (routes to `/api/submit` or `/api/contact`) |
| `/donate` + `/donate/thanks` | `pages/donate*.astro` | utility | `forms.css`, `donate-portal.css`, `donate-page.js` |
| `/404` | `pages/404.astro` | editorial | shared |

Redirects (in `astro.config.mjs`): `/services` + `/lab` → `/work`; `/submit` + `/contact` → `/connect`.

Shared JS: `site-shell.js` (all pages), `form-utils.js` + `api-client.js` (forms). Nav and per-page metadata live in `apps/web/src/data/site.json`. Worker API routes are tabled in `AGENTS.md`; the contract is `apps/communications-worker/openapi.yaml`.

## Update loops

- Log each file-changing task in root `MEMORY.md`; add a local `MEMORY.md` entry when the subtree has one.
- Keep `AGENTS.md` and this file aligned when navigation, ownership, commands, routes, or workflow rules change. When Worker routes change, update `openapi.yaml` and the API table in `AGENTS.md` together.
- Note whether a skill, script, or runbook helped or got in the way; update it when the improvement is clear.

## Validation

Use the narrowest relevant checks (see `AGENTS.md` → Commands):

```
npm run build
npm run lint:html
npm run check:links
npm run check:a11y
npm run test:worker      # worker changes
npm run assets:check     # media changes
npm run check            # full gate
```

Do not deploy, push, mutate secrets, or alter Cloudflare resources unless explicitly authorized.
