# State of Play (Repo + Deployment)

This doc is a maintenance-oriented snapshot of what is live and what still needs follow-up.

## 1) Current architecture (what is in the repo)

### Deployable static site
- Location: `site/`
- Deployment: GitHub Actions publishes only `site/` (copied into a Pages artifact). See `.github/workflows/deploy-pages.yml`.
- Public URLs remain flat at the domain root (e.g. `/contact.html`, `/assets/...`) even though the repo is organized under `site/`.

Navigation notes:
- "Lab" and "Services" are currently routed to `site/under-construction.html` from nav (pages still exist in `site/`).
- The Gallery route remains `site/gallery.html`, but user-facing nav and metadata label it as "Merch".

### Forms + email
- Contact form: `site/contact.html` -> `POST /api/contact` (JSON) with `mailto:` fallback.
- Submission form: `site/submit.html` -> `POST /api/submit` (JSON) with `mailto:` fallback.
- Updates UI: `site/index.html` and the Updates section in `site/contact.html`:
  - opens Substack (newsletter)
  - also attempts first-party capture via `POST /api/updates`

Index-specific UI notes:
- Desktop: "Get updates" lives in the hero bar (left side).
- Mobile: the index page only surfaces portal links for Books + Mission; the updates form remains embedded in the portal stack.
- Background and still imagery use PNG as primary, with WebP retained only as optional fallback.

### Worker
- Location: `workers/communications/`
- Worker name: `stexpedite-communications` (see `workers/communications/wrangler.toml`)
- Contract file: `workers/communications/openapi.yaml`
- Endpoints (implemented in `workers/communications/src/index.ts`):
  - `POST /api/contact` -> sends editor email + user receipt via Resend
  - `POST /api/submit` -> sends editor email + user receipt via Resend
  - `POST /api/updates` -> stores email into D1 when binding `DB` exists

### SEO
- `site/robots.txt` points at `https://stexpedite.press/sitemap.xml`.
- `site/robots.txt` disallows:
  - `/under-construction.html`
  - `/interior-content-template.html`
- `site/sitemap.xml` lists canonical pages and includes `<lastmod>` values.

### Ontology
- Machine-readable: `docs/ontology/project-ontology.json`
- Human companion: `docs/ontology/project-ontology.md`

## 2) What GitHub Pages deploy publishes (and what it does not)

GitHub Pages deploy publishes:
- Everything under `site/`

GitHub Pages deploy does not publish:
- `docs/`
- `workers/`
- `.env`

So changing docs or worker code does not change the public site unless you also change `site/`.

## 3) External production integration status (Cloudflare + Resend + Zoho)

This integration is active in production.

Cloudflare zone:
- Authoritative nameservers:
  - `nicolas.ns.cloudflare.com`
  - `sara.ns.cloudflare.com`
- Worker route active: `stexpedite.press/api/*` -> `stexpedite-communications`
- Worker direct URL available for testing:
  - `https://stexpedite-communications.stexpedite-communications.workers.dev`

Email path:
- Outbound sending: Resend API (`RESEND_API_KEY`, `FROM_EMAIL`, `TO_EMAIL`)
- Inbound mailbox: Zoho (`editor@stexpedite.press`)

DNS auth records (Cloudflare DNS-only):
- MX: `mx.zoho.com`, `mx2.zoho.com`, `mx3.zoho.com`
- DKIM selectors: `zmail._domainkey`, `resend._domainkey`
- SPF:
  - `v=spf1 include:zohomail.com include:dc-8e814c8572._spfm.stexpedite.press include:amazonses.com include:_spf.zoho.com ~all`
- DMARC:
  - `v=DMARC1; p=quarantine;`

## 4) Updates list collection (first-party)

Current behavior:
- Frontend opens Substack for newsletter signup.
- Frontend additionally calls `POST /api/updates` best-effort.

Storage behavior:
- If D1 binding `DB` is configured and migrated, updates are stored.
- If D1 is not configured, `/api/updates` returns `Updates list not configured`.

Migration path:
1. Create a Cloudflare D1 database (example name: `stexpedite-updates`).
2. Bind it to the Worker as `DB`.
3. Apply migration: `workers/communications/migrations/0001_updates_signups.sql`.
4. Deploy the Worker.

## 5) Ongoing checks

Worker + email:
- Confirm route coverage for every served hostname (`apex`, and `www` if used before redirect).
- Keep Worker secrets/vars current: `RESEND_API_KEY`, `FROM_EMAIL`, `TO_EMAIL`.
- Monitor Resend domain verification and delivery health.
- Keep CORS origins aligned with production hostnames.

Updates list:
- Decide retention and unsubscribe policy (`unsubscribed_at` exists, but no unsubscribe UI yet).

Search indexing:
- Keep Search Console verification healthy.
- Keep sitemap submitted at `https://stexpedite.press/sitemap.xml`.
