# Deployment (GitHub Pages + Cloudflare Worker)

This repo deploys a static site via GitHub Pages, with Cloudflare in front. `/api/*` requests are routed to a Cloudflare Worker for email sending and (optionally) updates list capture.

## 1) GitHub Pages (CI/CD)

- Workflow: `.github/workflows/deploy-pages.yml`
- Source: GitHub Actions
- Published content: `site/` only

Deploy steps:
1. Push to `main`.
2. GitHub Actions runs HTML validation, then publishes `site/` as the Pages artifact.

### Custom domain

- Domain file: `site/CNAME` (currently `stexpedite.press`)
- GitHub: Settings -> Pages -> Custom domain

## 2) Cloudflare (DNS + Proxy)

Cloudflare should be authoritative DNS for `stexpedite.press`.

Important:
- The site hostname(s) must be proxied (orange cloud) for Worker Routes to apply.
- Mail/auth DNS records (MX, SPF, DKIM, DMARC, Resend verification) must remain DNS only (gray cloud).

## 3) Worker (Contact + Submissions + Updates Capture)

Worker code: `workers/communications/`

Endpoints:
- `POST /api/contact` (Resend email)
- `POST /api/submit` (Resend email)
- `POST /api/updates` (optional D1 capture; no email)

### Deploy the Worker

From `workers/communications/`:

```bash
wrangler login
wrangler deploy
```

### Attach the Worker route

Cloudflare -> Workers & Pages -> `stexpedite-communications` -> Triggers -> Routes:

- `stexpedite.press/api/*` -> `stexpedite-communications`

If you serve the site on `www.stexpedite.press` without redirecting to apex first, you likely also need:
- `www.stexpedite.press/api/*`

### Configure Resend (required for `/api/contact` and `/api/submit`)

Cloudflare Worker settings:
- Secret: `RESEND_API_KEY` (store as a Worker secret; never commit)
- Vars: `FROM_EMAIL`, `TO_EMAIL` (see `workers/communications/wrangler.toml`)

Resend:
- Verify the domain so you can send from `no-reply@stexpedite.press` (or whatever `FROM_EMAIL` uses).

### Configure D1 (optional, for `/api/updates`)

If you want to store a first-party updates list:
1. Create a D1 database in Cloudflare.
2. Bind it to the Worker as `DB`.
3. Apply migration: `workers/communications/migrations/0001_updates_signups.sql`.

## 4) Failure modes (expected)

- If Worker routing is missing or the Worker errors, the frontend falls back to opening the visitor's email client via `mailto:` on Contact/Submit.
- Updates signup still opens Substack; D1 capture is best-effort.

## 5) Reference docs

- Email pipeline: `docs/infrastructure/email-worker-setup.md`
- Current checklist: `docs/state-of-play.md`
- Ontology: `docs/ontology/project-ontology.json`

