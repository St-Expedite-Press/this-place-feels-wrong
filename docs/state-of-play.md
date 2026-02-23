# State of Play (Repo + Deployment)

Repo-verified snapshot as of **2026-02-23**.

Baseline checked:
- Branch: `main`
- HEAD: `52e242d`
- Working tree: repository under active maintenance updates

This document reflects what is present in the repository. Runtime/production status that cannot be observed from code is marked as configuration intent.

## 1) Cloudflare verification matrix

Verification timestamp:
- Date: **2026-02-23**
- Method: local command checks + source inspection (`wrangler`, `rg`, `sed`)

| Check | Evidence | Status |
|---|---|---|
| Wrangler auth context | `npx -y wrangler whoami` succeeds under `workers/communications/` | Runtime-verified |
| Worker secret presence | `npx -y wrangler secret list` includes `RESEND_API_KEY` | Runtime-verified |
| Worker vars in repo config | `workers/communications/wrangler.toml` contains `FROM_EMAIL`, `TO_EMAIL`, `RATE_LIMIT_MAX`, `RATE_LIMIT_WINDOW_MS` under `[vars]` | Repo-verified |
| Required primary route | `POST https://stexpedite.press/api/updates` succeeds after deploy | Runtime-verified |
| Optional `www` route | Not required by current repo contract | Config-intent only (conditional) |
| D1 database presence | `wrangler d1 list` shows `stexpedite-updates` | Runtime-verified |
| D1 binding status | `wrangler deploy` output shows `env.DB (stexpedite-updates)` | Runtime-verified |
| D1 schema state | `wrangler d1 execute ... sqlite_master` includes `updates_signups` | Runtime-verified |
| D1 binding semantics | Worker expects `DB`; `/api/updates` succeeds when bound and returns 500 when unbound | Runtime-verified |
| API contract parity | `/api/contact`, `/api/submit`, `/api/updates` match between `src/index.ts` and `openapi.yaml` | Repo-verified |
| Frontend endpoint wiring | `site/contact.html`, `site/submit.html`, `site/index.html` call expected `/api/*` paths | Repo-verified |
| Pages publish scope | `.github/workflows/deploy-pages.yml` runs `rsync -a --delete site/ dist/` | Repo-verified |
| Worker abuse controls | `src/index.ts` enforces per-IP POST rate limiting and optional Turnstile verification when `TURNSTILE_SECRET` is set | Repo-verified |
| Worker automated tests | `workers/communications/test/index.test.ts` validates health, success, failure, Turnstile-required, and 429 behavior | Repo-verified |
| Scheduled runtime monitor | `.github/workflows/api-health-monitor.yml` checks `/api/health` and synthetic POST-route behavior every 15 minutes | Repo-verified |

Operator verification commands:

```bash
cd workers/communications
npx -y wrangler whoami
npx -y wrangler secret list
npx -y wrangler d1 list
```

Dashboard-required checks:
- Confirm route `stexpedite.press/api/*` is attached to `stexpedite-communications`.
- If `www.stexpedite.press` is served before redirect, attach `www.stexpedite.press/api/*` as well.
- Confirm hostnames using Worker Routes are proxied (orange cloud), while mail/auth DNS records remain DNS-only.

## 2) Architecture snapshot

### Static site
- Source and publish root: `site/`
- Custom domain file: `site/CNAME` -> `stexpedite.press`
- Public URLs remain root-flat (for example `/contact.html`, `/assets/...`) even though files are stored under `site/`.

Current HTML pages in `site/`:
- `index.html`
- `books.html`
- `gallery.html`
- `mission.html`
- `contact.html`
- `submit.html`
- `services.html`
- `lab.html`
- `under-construction.html`
- `interior-content-template.html` (template/support page)

### Navigation and page intent
- User-facing nav labels `gallery.html` as **Merch** on primary pages.
- Nav items labeled **Lab** currently link to `under-construction.html` across production-facing pages.
- `lab.html` still exists as a standalone page but is not the primary linked Lab destination.
- Footer utility links are consistently `Services // Submission // Contact` across main pages.

### Forms and messaging flows
- Contact flow:
  - UI: `site/contact.html`
  - Endpoint: `POST /api/contact`
  - Fallback: `mailto:editor@stexpedite.press`
- Submission flow:
  - UI: `site/submit.html`
  - Endpoint: `POST /api/submit`
  - Fallback: `mailto:editor@stexpedite.press`
- Updates flow:
  - UI locations: `site/index.html` (hero + mobile form), `site/contact.html` (updates row)
  - Primary action: first-party capture via `POST /api/updates`
  - On successful capture, frontend prompts user to optionally continue to `https://ecoamericana.substack.com/subscribe`

Index behavior:
- Desktop hero bar includes an inline updates form (`#hero-updates-form`).
- Mobile portal stack includes an inline updates form (`#index-updates-form`).
- Desktop nav surfaces `BOOKS`, `STORE` (`gallery.html`), `MISSION`, and `LAB` (`under-construction.html`).

## 3) Worker/API snapshot

Worker location:
- `workers/communications/`

Worker configuration:
- Name: `stexpedite-communications` (`workers/communications/wrangler.toml`)
- Runtime vars in `wrangler.toml`: `FROM_EMAIL`, `TO_EMAIL`, `RATE_LIMIT_MAX`, `RATE_LIMIT_WINDOW_MS`
- Required secret at runtime: `RESEND_API_KEY`
- Optional anti-abuse secret: `TURNSTILE_SECRET`
- D1 binding: `DB` (currently configured to `stexpedite-updates`)

Implemented routes in `workers/communications/src/index.ts`:
- `POST /api/contact`
  - Validates JSON + email/message
  - Sends editor email + receipt email via Resend
- `POST /api/submit`
  - Validates JSON + email
  - Sends editor email + receipt email via Resend
- `POST /api/updates`
  - Validates JSON + email
  - Writes/upserts into D1 table `updates_signups` when `DB` exists
  - Returns `alreadySignedUp: true|false` to indicate whether the email already existed
  - Returns `500` with `Updates list not configured` when `DB` is missing

Cross-cutting behavior:
- CORS allowlist includes:
  - `https://stexpedite.press`
  - `http://localhost:8787`
  - `http://127.0.0.1:8787`
- Honeypot fields accepted: `website`, `company`, `hp`
- Rate limiting applies to POST routes by IP+route key.
- Turnstile verification is enforced on POST routes when `TURNSTILE_SECRET` is configured.
- Unhandled runtime exceptions return a structured JSON `500` with CORS headers.
- OPTIONS preflight is supported.

Contract and schema files:
- OpenAPI contract: `workers/communications/openapi.yaml` (`openapi: 3.1.0`, `info.version: 1.2.0`)
- D1 migration: `workers/communications/migrations/0001_updates_signups.sql`

## 4) Deploy pipeline snapshot

GitHub Pages workflow:
- File: `.github/workflows/deploy-pages.yml`
- Trigger: push to `main` (and manual dispatch)
- Validation steps:
  - `npx -y htmlhint "site/**/*.html"`
  - `npm --prefix workers/communications run test`
- Artifact prep: `rsync -a --delete site/ dist/`
- Publish source: `dist/` artifact generated from `site/`

Implication:
- Only `site/` content is published by Pages.
- Changes in `docs/`, `workers/`, and local `.env` do not change static site output unless corresponding `site/` files change.

## 5) SEO and crawl controls

`site/robots.txt`:
- `Disallow: /under-construction.html`
- `Disallow: /interior-content-template.html`
- `Sitemap: https://stexpedite.press/sitemap.xml`

`site/sitemap.xml` includes:
- `/`
- `/contact.html`
- `/books.html`
- `/gallery.html`
- `/mission.html`
- `/lab.html`
- `/services.html`
- `/submit.html`

Note:
- Current sitemap `<lastmod>` values are `2026-02-11` and may need periodic refresh when content changes.

## 6) External integration intent (from repo docs/config)

Runtime-verified in this environment:
- Cloudflare-authenticated Wrangler session
- Secret `RESEND_API_KEY` present
- D1 database `stexpedite-updates` present and bound as `DB`
- Successful `POST https://stexpedite.press/api/updates` response (`200`, `{ "ok": true, "alreadySignedUp": false|true }`)

Config-intent still requiring dashboard confirmation:
- Route attachment visibility in Cloudflare dashboard
- DNS orange/gray cloud settings across all records

## 7) Maintenance priorities

- Keep `docs/ontology/project-ontology.json` and this file in sync whenever page routing, forms, endpoints, or deployment behavior changes.
- Keep D1 migration state and `DB` binding consistent across Worker environments.
- Treat `docs/infrastructure/d1-database.md` as the canonical D1 schema/binding runbook and keep it updated.
- Refresh sitemap `<lastmod>` dates when shipping substantive content updates.

## 8) Current hardening status

Implemented in repo:
- Global Worker error envelope for unexpected runtime failures.
- Per-IP POST route rate limiting.
- Optional Turnstile verification hook for POST routes (`TURNSTILE_SECRET`).
- Scheduled API monitor expanded from health-only to health + synthetic POST-route checks.
- Worker route test suite with automated execution via `npm run test`.

Remaining operational work (dashboard/policy):
- Configure `TURNSTILE_SECRET` and frontend token wiring when ready to enforce Turnstile in production UX.
- Add dashboard-level alert routing/escalation policy for repeated monitor failures.
