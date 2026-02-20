# Communications Infrastructure (Cloudflare + Resend + Zoho)

This document records the production communications setup for `stexpedite.press`.

As of 2026-02-13, the Cloudflare zone, Worker routing, Resend integration, and Zoho inbound mail path are configured and operational.

## 1) System overview

Architecture:

User browser
-> Cloudflare edge (proxied DNS)
-> Cloudflare Worker (`stexpedite-communications`)
-> Resend API (`https://api.resend.com/emails`)
-> recipient mailbox (`editor@stexpedite.press`, Zoho)

Static pages continue to be served by GitHub Pages (`site/`); only `/api/*` is handled by the Worker.

## 2) Cloudflare zone and DNS

Zone:
- `stexpedite.press`

Cloudflare authoritative nameservers:
- `nicolas.ns.cloudflare.com`
- `sara.ns.cloudflare.com`

Worker route in production:
- `stexpedite.press/api/*` -> `stexpedite-communications`

Worker direct endpoint (testing/secondary):
- `https://stexpedite-communications.stexpedite-communications.workers.dev`

Mail and auth DNS records in Cloudflare (DNS-only / gray cloud):
- MX (Zoho): `mx.zoho.com`, `mx2.zoho.com`, `mx3.zoho.com`
- DKIM selectors: `zmail._domainkey` (Zoho), `resend._domainkey` (Resend)
- SPF:
  - `v=spf1 include:zohomail.com include:dc-8e814c8572._spfm.stexpedite.press include:amazonses.com include:_spf.zoho.com ~all`
- DMARC:
  - `v=DMARC1; p=quarantine;`

Notes:
- HTTP hostnames used by Worker Routes must be proxied (orange cloud).
- MX/TXT auth records must remain DNS-only.

## 3) Worker runtime and configuration

Worker:
- Name: `stexpedite-communications`
- Entry: `workers/communications/src/index.ts`
- Config: `workers/communications/wrangler.toml`

Configured vars in `wrangler.toml`:

```toml
[vars]
FROM_EMAIL = "St. Expedite Press <no-reply@stexpedite.press>"
TO_EMAIL = "editor@stexpedite.press"
```

Configured secret in Cloudflare:
- `RESEND_API_KEY`

Secret handling:
- Secrets are stored only in Cloudflare Worker secrets.
- Never commit secrets to the repo.

## 4) Implemented API endpoints

Source of truth:
- Worker implementation: `workers/communications/src/index.ts`
- OpenAPI contract: `workers/communications/openapi.yaml`

### `POST /api/contact`

Request JSON:
- required: `email`, `message`
- optional: `reason`
- honeypot (optional): `website`, `company`, `hp`

Behavior:
- Validates input
- Sends editor email to `TO_EMAIL`
- Sends receipt email back to submitter
- Returns `{ ok: true, id: "CONTACT-..." }`

### `POST /api/submit`

Request JSON:
- required: `email`
- optional: `note`
- honeypot (optional): `website`, `company`, `hp`

Behavior:
- Validates input
- Sends editor email to `TO_EMAIL`
- Sends receipt email back to submitter
- Returns `{ ok: true, id: "SUBMIT-..." }`

### `POST /api/updates`

Request JSON:
- required: `email`
- optional: `source`
- honeypot (optional): `website`, `company`, `hp`

Behavior:
- Validates input
- Writes to D1 table `updates_signups` when binding `DB` exists
- Returns `{ ok: true }` on success
- Returns `{ ok: false, error: "Updates list not configured" }` if `DB` is not bound

## 5) Email provider layer (Resend)

Why Resend is used:
- Cloudflare Workers do not send SMTP mail directly.
- Worker sends HTTPS requests to Resend.

Auth model:
- `Authorization: Bearer <RESEND_API_KEY>`

Sender identity:
- `no-reply@stexpedite.press` (via `FROM_EMAIL`)

## 6) Deployment procedure

From `workers/communications/`:

```bash
wrangler login
wrangler deploy
wrangler secret put RESEND_API_KEY
```

Cloudflare dashboard:
- Ensure route `stexpedite.press/api/*` is attached to `stexpedite-communications`.

## 7) Validation runbook

Example production contact test (PowerShell):

```powershell
Invoke-RestMethod -Method POST `
  -Uri "https://stexpedite.press/api/contact" `
  -ContentType "application/json" `
  -Body '{"reason":"Test","email":"test@example.com","message":"Hello"}'
```

Expected success shape:

```json
{ "ok": true, "id": "CONTACT-..." }
```

Updates endpoint test:

```powershell
Invoke-RestMethod -Method POST `
  -Uri "https://stexpedite.press/api/updates" `
  -ContentType "application/json" `
  -Body '{"email":"test@example.com","source":"powershell"}'
```

Expected:
- `{ "ok": true }` when D1 binding `DB` is configured
- `{ "ok": false, "error": "Updates list not configured" }` when `DB` is not configured

## 8) Security model

Current controls:
- Secrets stored in Cloudflare secrets (not in git)
- CORS allowlist enforced in Worker
- Honeypot suppression for bot-like submissions

Recommended next hardening:
- Add rate limiting for `POST /api/*`
- Add Turnstile and verify token server-side
- Add alerting on elevated Worker error rates

## 9) Filesystem reference

Relevant repo paths:
- `workers/communications/wrangler.toml`
- `workers/communications/src/index.ts`
- `workers/communications/openapi.yaml`
- `docs/state-of-play.md`
- `docs/ontology/project-ontology.json`
