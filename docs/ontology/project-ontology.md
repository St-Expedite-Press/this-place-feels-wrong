# Project Ontology (Human Summary)

Narrative companion to `docs/ontology/project-ontology.json`.

## Token-saving sections

These sections reduce unnecessary repo scanning:

- `intents`: maps common edit tasks to minimal file sets.
- `files`: per-file anchor snippets for quick in-file jumps.
- `workers.communications.routes.*.request/response/errors`: API contract summary without reopening worker code.
- `workers.communications.openapi`: path to the machine-readable OpenAPI contract.
- `site.asset_bundles` and `site.duplication_clusters`: shared CSS/JS and duplicated nav/footer groups.
- `invariants` + `maintenance`: repo rules and "if X changes, also update Y" reminders.
- `smoke_tests`: copy/paste validation commands.

## Major subsystems

### Static site (`site/`)
- Pages: `site/*.html`
- Assets: `site/assets/**`
- SEO: `site/robots.txt`, `site/sitemap.xml`

Even though pages are stored under `site/`, they are published at domain root URLs (for example `/contact.html`, `/assets/...`).

### Deployment (GitHub Pages)
- Workflow: `.github/workflows/deploy-pages.yml`
- Publish model: copy `site/` -> `dist/` -> upload Pages artifact.

### Communications Worker (Cloudflare)
- Code: `workers/communications/src/index.ts`
- OpenAPI: `workers/communications/openapi.yaml`
- Worker name: `stexpedite-communications`
- Active production route: `stexpedite.press/api/*`
- Worker direct URL: `https://stexpedite-communications.stexpedite-communications.workers.dev`

Endpoints:
- `POST /api/contact`
  - Called by: `site/contact.html`
  - Sends 2 emails via Resend:
    - editor inbox (`TO_EMAIL`) with `reply_to` set to submitter
    - receipt to submitter with reference ID `CONTACT-...`
- `POST /api/submit`
  - Called by: `site/submit.html`
  - Sends 2 emails via Resend (reference ID `SUBMIT-...`)
- `POST /api/updates`
  - Called by: `site/index.html` and the Updates section in `site/contact.html`
  - Stores email into Cloudflare D1 if bound as `DB`
  - Returns `Updates list not configured` when `DB` is absent

## User flows

### Contact message
1. User submits `site/contact.html`.
2. Frontend posts JSON to `/api/contact`.
3. Worker sends emails via Resend.
4. Frontend shows confirmation + reference ID.
5. If `/api/contact` fails, frontend opens `mailto:editor@stexpedite.press`.

### Submission inquiry
Same pattern as Contact, but endpoint is `/api/submit`.

### Updates signup
1. User enters email in updates UI (index or contact).
2. Frontend opens Substack subscribe URL.
3. Frontend also posts to `/api/updates` best-effort.

## External dependencies
- Cloudflare (DNS + edge routing)
- Resend (`api.resend.com`) for outbound email
- Zoho Mail for inbound mailbox delivery
- Substack (`ecoamericana.substack.com`) for newsletter
- Google Fonts (`fonts.googleapis.com`, `fonts.gstatic.com`)

## Operational gotchas
- Worker Routes only apply when hostnames are proxied (orange cloud).
- Mail/auth records (`MX`, `SPF`, `DKIM`, `DMARC`) must stay DNS-only.
- If serving traffic on `www.stexpedite.press` before redirect, you may also need `www.stexpedite.press/api/*` and a matching CORS origin.

## Fast usage pattern

1. Start with `intents`.
2. Use `files.<path>.anchors` for in-file jumps.
3. Use `workers.communications.routes` and `workers.communications.openapi` before opening worker code.
4. For shared UI changes, consult `site.asset_bundles` and `site.duplication_clusters`.
