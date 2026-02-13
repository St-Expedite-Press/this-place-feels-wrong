# Deployment (GitHub Pages + Cloudflare Worker)

This repo deploys a static site via GitHub Pages, with Cloudflare in front. `/api/*` requests are routed to a Cloudflare Worker for communications.

## 1) GitHub Pages (CI/CD)

- Workflow: `.github/workflows/deploy-pages.yml`
- Source: GitHub Actions
- Published content: `site/` only

Deploy steps:
1. Push to `main`.
2. GitHub Actions validates HTML and publishes `site/` as the Pages artifact.

Custom domain:
- Domain file: `site/CNAME` (currently `stexpedite.press`)
- GitHub setting: Settings -> Pages -> Custom domain

## 2) Cloudflare (DNS + Proxy + Worker Route)

Cloudflare is authoritative DNS for `stexpedite.press`.

Recorded production nameservers:
- `nicolas.ns.cloudflare.com`
- `sara.ns.cloudflare.com`

Worker route (active):
- `stexpedite.press/api/*` -> `stexpedite-communications`

Worker direct endpoint (testing):
- `https://stexpedite-communications.stexpedite-communications.workers.dev`

Important:
- HTTP hostnames must be proxied (orange cloud) for Worker Routes to apply.
- Mail/auth records (MX, SPF, DKIM, DMARC) remain DNS-only (gray cloud).

## 3) Worker (Contact + Submit + Updates)

Worker code: `workers/communications/`

Implemented endpoints:
- `POST /api/contact` (Resend email)
- `POST /api/submit` (Resend email)
- `POST /api/updates` (D1 capture when bound)

OpenAPI contract:
- `workers/communications/openapi.yaml`

Deploy the Worker:

```bash
cd workers/communications
wrangler login
wrangler deploy
```

Configure secrets and vars:
- Secret: `RESEND_API_KEY`
- Vars: `FROM_EMAIL`, `TO_EMAIL` (see `workers/communications/wrangler.toml`)

## 4) Optional D1 for updates storage

To store a first-party updates list:
1. Create D1 database.
2. Bind as `DB`.
3. Run migration `workers/communications/migrations/0001_updates_signups.sql`.

Without `DB`, `/api/updates` returns `Updates list not configured`.

## 5) Reference docs

- Infrastructure details: `docs/infrastructure/email-worker-setup.md`
- Current operational snapshot: `docs/state-of-play.md`
- Ontology (machine): `docs/ontology/project-ontology.json`
- Ontology (human): `docs/ontology/project-ontology.md`
