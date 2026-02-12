# Project Ontology (Human Summary)

This is a narrative companion to `docs/ontology/project-ontology.json`.

## Major subsystems

### Static site (`site/`)
- Pages: `site/*.html`
- Assets: `site/assets/**`
- SEO: `site/robots.txt`, `site/sitemap.xml`

Even though the repo stores pages under `site/`, they are published at the domain root (e.g. `/contact.html`, `/assets/...`).

### Deployment (GitHub Pages)
- Workflow: `.github/workflows/deploy-pages.yml`
- Publish model: copy `site/` -> `dist/` -> upload as Pages artifact.

### Communications Worker (Cloudflare)
- Code: `workers/communications/src/index.ts`
- Worker name: `stexpedite-communications`
- Expected route: `stexpedite.press/api/*`

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
  - Does not send email

## User flows

### Contact message
1. User submits `site/contact.html`
2. Frontend posts JSON -> `/api/contact`
3. Worker sends email(s) via Resend
4. Frontend shows a friendly confirmation + reference ID
5. If `/api/contact` fails, frontend opens a `mailto:` fallback addressed to `editor@stexpedite.press`

### Submission inquiry
Same pattern as Contact, but endpoint is `/api/submit`.

### Updates signup
1. User enters email in the Updates UI (index or contact)
2. Frontend opens Substack subscribe URL (newsletter list lives in Substack)
3. Frontend additionally posts email to `/api/updates` best-effort (first-party list lives in D1 if configured)

## External dependencies (by design)
- Google Fonts: `fonts.googleapis.com`, `fonts.gstatic.com`
- Social links: `x.com`, `t.me`, `github.com`
- Newsletter: `ecoamericana.substack.com`
- Email provider API: `api.resend.com`

## Operational gotchas
- Worker Routes only work if Cloudflare DNS for the served hostname is proxied (orange cloud).
- If you serve on `www.stexpedite.press`, you may need:
  - a route for `www.stexpedite.press/api/*`
  - a CORS allowlist update in the Worker
- `/api/updates` requires a D1 binding named `DB` plus the migration applied; otherwise it returns `Updates list not configured`.

