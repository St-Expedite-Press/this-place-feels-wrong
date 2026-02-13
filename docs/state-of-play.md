# State of Play (Repo + Deployment)

This doc is a maintenance-oriented checklist: what exists, what is live, and what to verify next.

## 1) Current architecture (what is in the repo)

### Deployable static site
- Location: `site/`
- Deployment: GitHub Actions publishes only `site/` (copied into a Pages artifact). See `.github/workflows/deploy-pages.yml`.
- Public URLs remain flat at the domain root (e.g. `/contact.html`, `/assets/...`) even though the repo is organized under `site/`.

Navigation notes:
- "Lab" and "Services" are currently routed to `site/under-construction.html` from nav (pages still exist in `site/`).

### Forms + email
- Contact form: `site/contact.html` -> `POST /api/contact` (JSON) with `mailto:` fallback.
- Submission form: `site/submit.html` -> `POST /api/submit` (JSON) with `mailto:` fallback.
- Updates UI: `site/index.html` and the Updates section in `site/contact.html`:
  - opens Substack (newsletter)
  - also attempts best-effort first-party capture via `POST /api/updates`

Index-specific UI notes:
- Desktop: "Get updates" lives in the hero bar (left side).
- Mobile: the index page only surfaces portal links for Books + Mission; the updates form remains embedded in the portal stack.

### Worker
- Location: `workers/communications/`
- Worker name: `stexpedite-communications` (see `workers/communications/wrangler.toml`)
- Endpoints (implemented in `workers/communications/src/index.ts`):
  - `POST /api/contact` -> sends editor email + user receipt via Resend
  - `POST /api/submit` -> sends editor email + user receipt via Resend
  - `POST /api/updates` -> stores an email into D1 (no email sent; requires D1 binding)

### SEO
- `site/robots.txt` points at `https://stexpedite.press/sitemap.xml`.
- `site/robots.txt` currently disallows:
  - `/under-construction.html`
  - `/interior-content-template.html`
- `site/sitemap.xml` lists canonical pages and includes `<lastmod>` values.

### Ontology
- Machine-readable: `docs/ontology/project-ontology.json`
- Use this first to avoid scanning the repo when working with agents.

## 2) What GitHub Pages deploy publishes (and what it does not)

GitHub Pages deploy publishes:
- Everything under `site/`

GitHub Pages deploy does not publish:
- `docs/`
- `workers/`
- `.env`

So: changing docs or worker code does not change the public site unless you also change `site/`.

## 3) External configuration that must exist (Cloudflare + Resend)

These are required for the Worker-based email pipeline to work in production.

### Cloudflare zone
- `stexpedite.press` must be in Cloudflare, and the site hostnames must be proxied (orange cloud) for Worker Routes to apply.

### Worker route
- Expected route: `stexpedite.press/api/*` -> Worker `stexpedite-communications`
- If you serve the site on `www.stexpedite.press` without redirecting to apex first, you likely also need:
  - `www.stexpedite.press/api/*`

### Resend
- Domain must be verified to send from the `FROM_EMAIL` address (default: `no-reply@stexpedite.press`).
- Worker secrets/vars must be set in Cloudflare:
  - Secret: `RESEND_API_KEY`
  - Vars: `FROM_EMAIL`, `TO_EMAIL`

## 4) Updates list collection (first-party)

Current behavior:
- Frontend opens Substack for newsletter signup.
- Frontend additionally calls `POST /api/updates` best-effort.

To actually store a list you control:
1. Create a Cloudflare D1 database (example name: `stexpedite-updates`).
2. Bind it to the Worker as `DB`.
3. Apply migration: `workers/communications/migrations/0001_updates_signups.sql`.
4. Deploy the Worker.

If D1 is not configured, `/api/updates` returns `Updates list not configured` and nothing is stored.

## 5) What to verify next (checklist)

Worker + email:
- Confirm Worker routes are attached for every served hostname.
- Confirm Worker has `RESEND_API_KEY`, `FROM_EMAIL`, `TO_EMAIL`.
- Confirm Resend domain status is Verified.
- Confirm CORS origin matches production hostname(s) (and add `www` only if needed).

Updates list:
- Create + bind D1 as `DB`.
- Run the migration.
- Decide retention and unsubscribe policy (table includes `unsubscribed_at`, but there is no unsubscribe UI yet).

Google indexing:
- Verify domain in Google Search Console (TXT record in Cloudflare DNS, DNS-only).
- Submit sitemap: `https://stexpedite.press/sitemap.xml`.
