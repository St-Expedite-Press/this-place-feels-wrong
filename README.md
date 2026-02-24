# St. Expedite Press Portal

_St. Expedite Press Website_ (`this-place-feels-wrong`)

Static neon portal + interior pages. The site is deployed on GitHub Pages (static), with Cloudflare in front. All `/api/*` requests are handled by a Cloudflare Worker to send email (Resend) and (optionally) capture a first-party updates list (D1).

## Contents
- [What is Live](#what-is-live)
- [Architecture](#architecture)
- [Repository Layout](#repository-layout)
- [Local Development](#local-development)
- [Tooling](#tooling)
- [Deployment](#deployment)
- [Forms and Email](#forms-and-email)
- [Updates List](#updates-list)
- [SEO](#seo)
- [Docs and Ontology](#docs-and-ontology)
- [Contributing](#contributing)

## What is Live

All public site files live under `site/`, but they are served from the domain root (e.g. `/contact.html`, `/assets/...`) because the Pages workflow publishes `site/` as the site artifact.

- Entry point: `site/index.html` (published at `/`)
- Pages:
  - `site/books.html` (Books)
- `site/gallery.html` (Store)
  - `site/services.html` (Services; currently linked to the holding page from nav)
  - `site/mission.html` (Mission)
  - `site/lab.html` (Lab; currently linked to the holding page from nav)
  - `site/contact.html` (Contact)
  - `site/submit.html` (Submission)
  - `site/under-construction.html` (holding page)
- Assets: `site/assets/` (CSS/JS/images)

## Architecture

### Static site (GitHub Pages)
- HTML/CSS/JS only; no build step.
- GitHub Actions deploys on every push to `main`.
- Deploy step copies `site/` -> `dist/` and publishes the artifact.

### Edge and APIs (Cloudflare)
- Cloudflare proxies the site hostname(s).
- `/api/*` is routed to a Worker (so GitHub Pages never runs server code).
- Worker POST routes apply per-IP rate limiting and can enforce Turnstile when configured.

## Repository Layout

- `site/` - deployable static site (this is what GitHub Pages publishes)
  - `site/assets/css/` - shared theme + layout
  - `site/assets/js/` - small JS modules
  - `site/assets/img/`, `site/assets/gif/` - media
  - `site/CNAME`, `site/.nojekyll`, `site/robots.txt`, `site/sitemap.xml` - Pages + indexing helpers
- `workers/` - Cloudflare Worker(s)
- `workers/communications/` - `stexpedite-communications` (all `/api/*` endpoints)
- `docs/` - internal documentation
- `agent/` - consolidated agent hub (protocols, tooling, skills, reusable stack)
  - `agent/tools/` - release/tooling scripts (auth bootstrap, hooks, runtime checks, release orchestration)
  - `agent/skills/` - operational skills and runbook-grade scripts
  - `agent/kits/static-web/` - project-agnostic static web stack kit
- `.githooks/` - tracked git hooks (pre-push guardrails)
- `.github/workflows/deploy-pages.yml` - GitHub Pages deploy workflow
- `.env` - local-only configuration (gitignored; never commit secrets)

## Local Development

Serve the static site:

```bash
cd site
python -m http.server 8000
```

Visit `http://localhost:8000/`.

Create/update local Python virtual environment for tooling:

```bash
sh agent/tools/bootstrap-python-venv.sh
. .venv/bin/activate
```

Optional: develop the Worker locally (Wrangler required; see `workers/communications/README.md`):

```bash
cd workers/communications
wrangler dev
```

Run Worker tests:

```bash
cd workers/communications
npm install
npm run test
```

### Git Push Auth Bootstrap

If this shell cannot push to GitHub, run:

```bash
bash agent/tools/bootstrap-git-auth.sh
```

This reads `GITHUB_PAT_WRITE` (and optionally `GITHUB_REPO_URL`) from `.env`, configures repo-local git credentials, and verifies remote access so future `git push origin main` works without re-entering credentials.

## Tooling

Unified command surfaces are available through either `make` or root npm scripts.

One-time setup:

```bash
sh agent/tools/bootstrap-git-auth.sh
sh agent/tools/install-hooks.sh
```

Core local checks:

```bash
npm run check
sh agent/tools/check-runtime-config.sh
sh agent/tools/check-site-seo.sh
```

Release orchestration:

```bash
sh agent/tools/release.sh --dry-run
sh agent/tools/release.sh
```

Optional helpers:

```bash
make bootstrap-python-venv
make check-all
make runtime-config
make release-dry-run
make release
npm run deploy:worker
```

## Deployment

### GitHub Pages
- Workflow: `.github/workflows/deploy-pages.yml`
- Trigger: push to `main`
- Published content: `site/` only

### Cloudflare Worker
- Worker: `workers/communications/` (name: `stexpedite-communications`)
- Expected route: `stexpedite.press/api/*` -> Worker `stexpedite-communications`
- Note: Worker Routes only apply if the hostname is proxied (orange cloud).

See `DEPLOYMENT.md` and `docs/infrastructure/email-worker-setup.md`.

## Forms and Email

There are two "email-ish" flows:

1) Contact/submission forms (server-side send via Worker + Resend)
- `site/contact.html` -> `POST /api/contact`
- `site/submit.html` -> `POST /api/submit`

If the Worker route is missing or fails, both pages fall back to opening a `mailto:` compose window addressed to `editor@stexpedite.press`.

2) Newsletter/updates signup
- The "Get updates" UI first posts to `/api/updates` to store the email in the first-party list.
- On success, the UI thanks the user and offers an optional continue action to Substack (`ecoamericana.substack.com`).
- Index page placement:
  - Desktop: in the hero bar (left side)
  - Mobile: embedded in the portal stack

3) Merch/storefront
- `site/gallery.html` now renders a live Fourthwall catalog by calling `GET /api/storefront`.
- Product cards link out to `shop.stexpedite.press` product pages.

4) Canon/oncoming projects catalog
- `GET /api/projects` returns a structured program list backed by D1 table `oncoming_projects`.
- This list is seeded from `workers/communications/migrations/0002_oncoming_projects.sql`.
- Book presentation metadata (cover image + popup description) is applied by `workers/communications/migrations/0003_oncoming_projects_presentation.sql`.

## Updates List

If you want a first-party list you control, the Worker supports:

- `POST /api/updates` - stores an email into D1 (no email is sent)
  - Returns `alreadySignedUp` so frontend can show when the email already exists.

This is called from:
- `site/index.html` (desktop hero bar + mobile portal stack)
- the Updates section in `site/contact.html`

To actually store the list, you must:
1. Create a Cloudflare D1 database.
2. Bind it to the Worker as `DB`.
3. Apply the migration: `workers/communications/migrations/0001_updates_signups.sql`.

## SEO

- Robots: `site/robots.txt`
- Sitemap: `site/sitemap.xml`

Note: `site/robots.txt` currently disallows indexing of:
- `/under-construction.html`
- `/interior-content-template.html`

## Docs and Ontology

Start here for maintenance and agent work:
- Current checklist: `docs/state-of-play.md`
- Email pipeline: `docs/infrastructure/email-worker-setup.md`
- Ontology (machine-readable): `docs/ontology/project-ontology.json`
- Ontology (human summary): `docs/ontology/project-ontology.md`
- Agent hub index: `agent/README.md`
- Agent protocols: `agent/docs/AGENTS.md`

## Contributing

Rules that keep deploy stable:
- Public site changes belong under `site/`.
- Worker/API changes belong under `workers/communications/`.
- Do not commit secrets (API keys, Cloudflare tokens, etc.). `.env` is ignored intentionally.
- If you add/rename pages, assets, or endpoints, update:
  - `docs/ontology/project-ontology.json`
  - `docs/state-of-play.md`
