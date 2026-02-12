# St. Expedite Press Portal

_St. Expedite Press Website_ (`this-place-feels-wrong`)

Static neon portal + interior pages, deployed on GitHub Pages (static) with Cloudflare in front. `/api/*` is handled by a Cloudflare Worker to send email (Resend) and optionally capture a first-party “updates list” (D1).

## Contents

- [What’s Live](#whats-live)
- [How It Works](#how-it-works)
- [Repository Layout](#repository-layout)
- [Local Development](#local-development)
- [Deployment](#deployment)
- [Forms + Email](#forms--email)
- [Updates List](#updates-list)
- [SEO](#seo)
- [Docs + Ontology](#docs--ontology)
- [Contributing](#contributing)

## What’s Live

All public site files live under `site/`, but they are served from the domain root (e.g. `/contact.html`, `/assets/...`) because GitHub Pages publishes the contents of `site/` as the site artifact.

- Entry point: `site/index.html` (published at `/`)
- Pages:
  - `site/books.html` (Books)
  - `site/gallery.html` (Store)
  - `site/services.html` (Services)
  - `site/mission.html` (Mission)
  - `site/lab.html` (Lab)
  - `site/contact.html` (Contact)
  - `site/submit.html` (Submission)
  - `site/under-construction.html` (holding page)
- Assets: `site/assets/` (CSS/JS/images)

## How It Works

### Static site (GitHub Pages)

- HTML/CSS/JS only. No build step.
- GitHub Actions copies `site/` → `dist/` and deploys that artifact to Pages.

### Edge + APIs (Cloudflare)

- Cloudflare proxies the site hostname(s).
- Requests to `/api/*` are routed to a Worker (so GitHub Pages never needs to run server code).

## Repository Layout

- `site/` — deployable static site (this is what GitHub Pages publishes)
  - `site/assets/css/` — shared theme + layout
  - `site/assets/js/` — small JS modules
  - `site/assets/img/`, `site/assets/gif/` — media
  - `site/CNAME`, `site/.nojekyll`, `site/robots.txt`, `site/sitemap.xml` — Pages + indexing helpers
- `workers/` — Cloudflare Worker(s)
  - `workers/communications/` — `stexpedite-communications` (`/api/*` endpoints)
- `docs/` — internal documentation
- `.github/workflows/deploy-pages.yml` — GitHub Pages deploy workflow
- `.env` — local-only configuration (gitignored; do not commit secrets)

## Local Development

Serve the static site:

```bash
cd site
python -m http.server 8000
```

Then visit `http://localhost:8000/`.

Optional: develop the Worker locally (requires Wrangler; see `workers/communications/README.md`):

```bash
cd workers/communications
wrangler dev
```

## Deployment

### GitHub Pages

Deployment is automated on push to `main` via `.github/workflows/deploy-pages.yml`.

Operational rule: only files under `site/` end up on the public site.

### Cloudflare (Worker + Routes)

The communications Worker is designed to be routed on Cloudflare:

- Route: `stexpedite.press/api/*` → Worker `stexpedite-communications`

Worker routes only apply if Cloudflare DNS for the served hostname is proxied (orange cloud).

See `DEPLOYMENT.md` and `docs/infrastructure/email-worker-setup.md` for a reproducible setup checklist.

## Forms + Email

There are two “email-ish” flows:

1) Contact/submission forms (server-side send via Worker + Resend)
- `site/contact.html` → `POST /api/contact`
- `site/submit.html` → `POST /api/submit`

If the Worker route is missing or fails, both pages fall back to opening a `mailto:` compose window addressed to `editor@stexpedite.press`.

2) Newsletter/updates signup (Substack)
- The “Get updates” UI opens a Substack subscribe URL (`ecoamericana.substack.com`).

## Updates List

If you want a first-party list you control, the Worker supports:

- `POST /api/updates` — stores an email into D1 (no email is sent)

This is wired as best-effort capture from:

- `site/index.html`
- the Updates section in `site/contact.html`

To actually store the list, you must configure Cloudflare D1 and bind it to the Worker as `DB`, then run the migration in `workers/communications/migrations/0001_updates_signups.sql`.

## SEO

- Robots: `site/robots.txt`
- Sitemap: `site/sitemap.xml`

Note: `site/robots.txt` currently disallows indexing of:

- `/under-construction.html`
- `/interior-content-template.html`

## Docs + Ontology

This repo keeps an intentionally “token-efficient” ontology for agents and future maintenance:

- Machine-readable map: `docs/ontology/project-ontology.json`
- Human summary: `docs/ontology/project-ontology.md`
- Current checklist: `docs/state-of-play.md`
- Agent protocols: `AGENTS.md`

## Contributing

Practical rules that keep deploy stable:

- Public site changes belong under `site/`.
- Worker/API changes belong under `workers/communications/`.
- Do not commit secrets (especially API keys). `.env` is ignored for a reason.
- If you add/rename pages, assets, or endpoints, update:
  - `docs/ontology/project-ontology.json`
  - `docs/state-of-play.md`

