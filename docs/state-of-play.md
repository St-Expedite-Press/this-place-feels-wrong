# State of Play (Repo + Deployment)

As of `HEAD` on `main`, this repo is a static site deployed via GitHub Pages + a Cloudflare Worker that handles `/api/*` requests.

This doc is a maintenance-oriented checklist: what exists, what’s live, and what needs doing.

## 1) What’s in the repo (current architecture)

**Deployable static site**
- Location: `site/`
- Deployment: GitHub Actions publishes only `site/` (copied into a Pages artifact). See `.github/workflows/deploy-pages.yml`.
- Public URLs remain “flat” at the domain root (e.g. `/contact.html`, `/assets/...`) even though the repo is “deep.”

**Email + forms**
- Contact form: `site/contact.html` → `POST /api/contact` (JSON) with `mailto:` fallback.
- Submission form: `site/submit.html` → `POST /api/submit` (JSON) with `mailto:` fallback.
- Updates UI: `site/index.html` and `site/contact.html` “Updates” section open Substack, and also attempt best-effort first‑party capture via `POST /api/updates`.

**Worker**
- Location: `workers/communications/`
- Worker name: `stexpedite-communications` (see `workers/communications/wrangler.toml`)
- Endpoints (implemented in `workers/communications/src/index.ts`):
  - `POST /api/contact` → sends editor email + receipt via Resend
  - `POST /api/submit` → sends editor email + receipt via Resend
  - `POST /api/updates` → stores an email into D1 (no email sent)

**SEO**
- `site/robots.txt` points at `https://stexpedite.press/sitemap.xml`.
- `site/robots.txt` currently disallows:
  - `/under-construction.html`
  - `/interior-content-template.html`
- `site/sitemap.xml` lists the canonical pages and includes `<lastmod>` values.

**Ontology**
- Machine-readable: `docs/ontology/project-ontology.json`
- Use this first to avoid scanning the repo when working with agents.

## 2) What is deployed by GitHub Pages (and what is not)

GitHub Pages deploy publishes:
- Everything under `site/`

GitHub Pages deploy does **not** publish:
- `docs/`
- `workers/`
- `.env`

So: adding docs, scripts, or worker code will not affect your public site unless you also change `site/`.

## 3) External configuration that must exist (Cloudflare + Resend)

These are required for the Worker-based email pipeline to work in production.

**Cloudflare zone**
- `stexpedite.press` must be in Cloudflare, and the site hostnames must be **proxied** (orange cloud) for Worker Routes to apply.

**Worker route**
- Route expected: `stexpedite.press/api/*` → Worker `stexpedite-communications`.
- If you serve the site on `www.stexpedite.press` without redirecting to apex first, you likely also need: `www.stexpedite.press/api/*`.

**Resend**
- The domain must be verified in Resend to send from `no-reply@stexpedite.press`.
- Worker secrets/vars must be set in Cloudflare:
  - Secret: `RESEND_API_KEY`
  - Vars: `FROM_EMAIL`, `TO_EMAIL`

## 4) “Updates list” collection (first-party)

Current behavior:
- Frontend still opens Substack for newsletter signup.
- Frontend additionally calls `POST /api/updates` best-effort.

To actually store a list you control:
1. Create a Cloudflare D1 database (e.g. `stexpedite-updates`).
2. Bind it to the Worker as `DB`.
3. Apply migration: `workers/communications/migrations/0001_updates_signups.sql`.
4. Deploy the Worker.

If D1 is not configured, `/api/updates` returns `Updates list not configured` and nothing is stored.

## 5) Things to do / verify next (checklist)

**Worker + email**
- Confirm Worker routes are attached for every served hostname.
- Confirm Worker has `RESEND_API_KEY`, `FROM_EMAIL`, `TO_EMAIL`.
- Confirm Resend domain status is Verified.
- Confirm CORS origin matches production hostname(s).

**Updates list**
- Create + bind D1 as `DB`.
- Run migration in `workers/communications/migrations/0001_updates_signups.sql`.
- Decide retention + unsubscribe policy (currently table has `unsubscribed_at`, but there is no public unsubscribe UI yet).

**Google indexing**
- Verify domain in Google Search Console (TXT record in Cloudflare DNS, DNS-only).
- Submit sitemap: `https://stexpedite.press/sitemap.xml`.

**Tracking / analytics**
- Decide on GTM/Zaraz/GA4, and whether you need consent controls.

