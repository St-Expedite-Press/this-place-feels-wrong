# State of Play (Repo + Deployment)

Repo-verified snapshot as of **2026-02-21**.

Baseline checked:
- Branch: `main`
- HEAD: `b8dbb7a`
- Working tree: clean

This document reflects what is present in the repository. Runtime/production status that cannot be observed from code is marked as configuration intent.

## 1) Cloudflare verification matrix

Verification timestamp:
- Date: **2026-02-21**
- Method: local command checks + source inspection (`wrangler`, `rg`, `sed`)

| Check | Evidence | Status |
|---|---|---|
| Wrangler auth context | `npx -y wrangler whoami` succeeds under `workers/communications/` | Runtime-verified |
| Worker secret presence | `npx -y wrangler secret list` includes `RESEND_API_KEY` | Runtime-verified |
| Worker vars in repo config | `workers/communications/wrangler.toml` contains `FROM_EMAIL`, `TO_EMAIL` under `[vars]` | Repo-verified |
| Required primary route | `POST https://stexpedite.press/api/updates` succeeds after deploy | Runtime-verified |
| Optional `www` route | Not required by current repo contract | Config-intent only (conditional) |
| D1 database presence | `wrangler d1 list` shows `stexpedite-updates` | Runtime-verified |
| D1 binding status | `wrangler deploy` output shows `env.DB (stexpedite-updates)` | Runtime-verified |
| D1 schema state | `wrangler d1 execute ... sqlite_master` includes `updates_signups` | Runtime-verified |
| D1 binding semantics | Worker expects `DB`; `/api/updates` succeeds when bound and returns 500 when unbound | Runtime-verified |
| API contract parity | `/api/contact`, `/api/submit`, `/api/updates` match between `src/index.ts` and `openapi.yaml` | Repo-verified |
| Frontend endpoint wiring | `site/contact.html`, `site/submit.html`, `site/index.html` call expected `/api/*` paths | Repo-verified |
| Pages publish scope | `.github/workflows/deploy-pages.yml` runs `rsync -a --delete site/ dist/` | Repo-verified |

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
- Runtime vars in `wrangler.toml`: `FROM_EMAIL`, `TO_EMAIL`
- Required secret at runtime: `RESEND_API_KEY`
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
  - Returns `500` with `Updates list not configured` when `DB` is missing

Cross-cutting behavior:
- CORS allowlist includes:
  - `https://stexpedite.press`
  - `http://localhost:8787`
  - `http://127.0.0.1:8787`
- Honeypot fields accepted: `website`, `company`, `hp`
- OPTIONS preflight is supported.

Contract and schema files:
- OpenAPI contract: `workers/communications/openapi.yaml` (`openapi: 3.1.0`, `info.version: 1.1.0`)
- D1 migration: `workers/communications/migrations/0001_updates_signups.sql`

## 4) Deploy pipeline snapshot

GitHub Pages workflow:
- File: `.github/workflows/deploy-pages.yml`
- Trigger: push to `main` (and manual dispatch)
- Validation step: `npx -y htmlhint "site/**/*.html"`
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
- Successful `POST https://stexpedite.press/api/updates` response (`200`, `{ "ok": true }`)

Config-intent still requiring dashboard confirmation:
- Route attachment visibility in Cloudflare dashboard
- DNS orange/gray cloud settings across all records

## 7) Maintenance priorities

- Keep `docs/ontology/project-ontology.json` and this file in sync whenever page routing, forms, endpoints, or deployment behavior changes.
- Decide whether to keep Lab intentionally routed to `under-construction.html` or restore nav links to `lab.html`.
- Keep D1 migration state and `DB` binding consistent across Worker environments.
- Treat `docs/infrastructure/d1-database.md` as the canonical D1 schema/binding runbook and keep it updated.
- Refresh sitemap `<lastmod>` dates when shipping substantive content updates.

## 8) Roadmap to stable

Definition of stable for this project:
- Public site deploy is deterministic and recoverable.
- `/api/contact`, `/api/submit`, and `/api/updates` are consistently available in production.
- Core edge dependencies (Cloudflare route, Worker secret, D1 binding/schema) are verifiable by runbook.
- Operational docs remain current after each infra/content change.

### Phase 1: Lock runtime contract (now)
- Confirm dashboard route attachment for `stexpedite.press/api/*` to `stexpedite-communications`.
- Decide and document `www` policy:
  - either enforce redirect-only behavior, or
  - add/maintain `www.stexpedite.press/api/*` route coverage.
- Re-run production smoke checks for all three endpoints and archive outcomes in release notes/ops log.

### Phase 2: Improve resiliency and observability
- Add a lightweight health/status check path for API runtime validation (Worker-level).
- Add Worker error monitoring workflow (tail or dashboard alerting) with explicit owner/response steps.
- Define and document incident runbook:
  - secret rotation
  - rollback to last known-good Worker version
  - temporary fallback behavior for form submissions.

### Phase 3: Reduce abuse and operational risk
- Add request-rate protections for `POST /api/*` (Cloudflare rules and/or Worker-side constraints).
- Add Turnstile verification for user-facing forms (`contact`, `submit`, updates capture entry points).
- Set explicit retention/cleanup policy for `updates_signups` data and operationalize it.

### Phase 4: Documentation and release discipline
- Add a mandatory post-deploy checklist item in release flow:
  - run API smoke checks
  - verify route + secret + D1 state
  - update `docs/state-of-play.md` verification date/head when infra changed.
- Keep these docs synchronized as a single contract:
  - `DEPLOYMENT.md`
  - `docs/infrastructure/email-worker-setup.md`
  - `docs/infrastructure/d1-database.md`
  - `docs/state-of-play.md`

## 9) Information needed to get there

The following decisions/data are still required to complete the roadmap with no ambiguity:

### Routing and domain policy
- Is `www.stexpedite.press` expected to serve users directly, or always redirect to apex?
    Redirect, really
- If `www` is served, should `/api/*` be callable on `www` or apex-only?
    I dont believe it is served. 

### Operational ownership
- Who owns production incident response for:
  - Cloudflare Worker/API issues
  - DNS/route drift
  - email deliverability regressions?
- What response-time target is expected for production API outages?

    Use your whole judgment in that situation and subject to opposition feedback. 



### Monitoring and alert thresholds
- Which channels should receive alerts (email, Telegram, etc.)?
- What error-rate/latency thresholds should trigger alerts?
- Which endpoint failures are page-worthy vs ticket-worthy?

Again, use your judgment. 

### Security controls
- Preferred anti-abuse approach for forms:
  - Cloudflare managed rules only,
  - Turnstile only,
  - or layered controls.
- Any legal/compliance requirements for storing contact/update submissions?


Don't worry about this stuff. 



### Data governance for D1
- Required retention period for `updates_signups`.
- Unsubscribe and deletion workflow requirements (currently only `unsubscribed_at` field exists).
- Whether data export/reporting requirements exist (format, cadence, owner).

Yea do all this for me. 


### Release process integration
- Where release evidence should live (repo changelog, issue tracker, ops log).
- Whether deploy approval gates are needed before Worker deploys.
