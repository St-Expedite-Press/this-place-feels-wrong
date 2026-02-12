# Email Worker Setup (Cloudflare + Resend)

This document describes how the production pipeline for `stexpedite.press` is intended to be configured, based on the current repository implementation:

- Frontend: `site/contact.html` and `site/submit.html` post JSON to `/api/*` with a `mailto:` fallback.
- Backend: Cloudflare Worker in `workers/communications/` sends email via the Resend API, and can optionally store update signups in D1.

Important: this repo does **not** contain your Cloudflare zone settings or Resend dashboard state. Where relevant, this document includes **“verify in Cloudflare/Resend”** checkpoints so the setup is reproducible.

## 1. System Overview

Final architecture:

User → `https://stexpedite.press/contact.html`  
→ `POST /api/contact` (JSON)  
→ Cloudflare (proxied DNS; Worker Route on `/api/*`)  
→ Worker: `stexpedite-communications` (`workers/communications/src/index.ts`)  
→ Resend API (`https://api.resend.com/emails`)  
→ delivered to `TO_EMAIL` (currently `editor@stexpedite.press`) in your mail provider (e.g., Zoho Mail)

Key facts:

- GitHub Pages serves the static site (HTML/CSS/JS).
- Cloudflare must **proxy** (orange cloud) the site hostname for Worker Routes to apply.
- `/api/*` is routed to the Worker; all other paths continue to origin (GitHub Pages).
- The Worker sends **two emails** per successful request:
  - One to the editor inbox (`TO_EMAIL`) with `reply_to` set to the submitter’s email.
  - One receipt back to the submitter with a reference ID (`CONTACT-...` or `SUBMIT-...`).
- Updates/newsletter signup is separate: it opens Substack (`ecoamericana.substack.com`) and does **not** use this Worker (`site/index.html` and the Updates section in `site/contact.html`).
- If you enable the optional first-party capture endpoint (`POST /api/updates`), the frontend will also post the email to the Worker for storage in D1 (best-effort; Substack still opens).

## 2. Cloudflare DNS Configuration

Cloudflare must be your authoritative DNS provider for `stexpedite.press` (nameservers delegated to Cloudflare).

Recorded production values (verify in Cloudflare → **Overview** / **DNS**):

- Nameservers:
  - `nicolas.ns.cloudflare.com`
  - `sara.ns.cloudflare.com`
- GitHub Pages origin records:
  - Apex `A` records for `stexpedite.press` → `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153` (**Proxied** / orange cloud)
  - `www` `CNAME` → `csandbatch.github.io` (**Proxied** / orange cloud)
- Mail/auth records:
  - `MX` + `TXT` remain **DNS only** (gray cloud)
  - Resend DKIM/SPF records are added as **DNS only** (gray cloud)

Verify in Cloudflare → **DNS**:

- **Apex** record for `stexpedite.press` should point at GitHub Pages IPs (`185.199.108.153`–`185.199.111.153`), and should be **Proxied** (orange cloud) if you want Worker Routes to function.
- Optional `www`:
  - Often `CNAME` `www` → your GitHub Pages hostname (for example, `csandbatch.github.io`), and **Proxied**.
- Email-related DNS records must be **DNS only** (gray cloud), not proxied:
  - `MX` records for your mail provider (Zoho, etc.)
  - `TXT` records for SPF/DKIM/DMARC
  - Any Resend verification DKIM/SPF records

Why email records must not be proxied:

- Cloudflare proxying is for HTTP(S) traffic. Mail delivery uses SMTP and relies on direct DNS answers for `MX` and authentication (`TXT`) records.

## 2.1 Cloudflare SSL/TLS Mode

Verify in Cloudflare → **SSL/TLS** → **Overview**:

- SSL/TLS encryption mode: `Full (strict)`


## 3. Worker Deployment

The Worker code lives in:

`workers/communications/`

Deploy (from that directory):

```bash
wrangler login
wrangler deploy
```

Worker name (per `workers/communications/wrangler.toml`):

- `stexpedite-communications`

Verify in Cloudflare:

- Cloudflare → **Workers & Pages** → you should see `stexpedite-communications`.

Workers.dev URL:

- Cloudflare will assign a `*.workers.dev` URL for direct access during debugging. The exact hostname is account-specific; copy it from the Worker overview in Cloudflare.

## 4. Environment Variables and Secrets

Committed config (see `workers/communications/wrangler.toml`):

```toml
[vars]
FROM_EMAIL = "St. Expedite Press <no-reply@stexpedite.press>"
TO_EMAIL = "editor@stexpedite.press"
```

Secret (must not be committed to git):

```bash
wrangler secret put RESEND_API_KEY
```

How it’s used:

- The Worker reads `RESEND_API_KEY`, `FROM_EMAIL`, and `TO_EMAIL` and calls the Resend API at `https://api.resend.com/emails` (see `workers/communications/src/index.ts`).

Why secrets must not live in source control:

- Anyone with the API key can send mail through your Resend account, potentially causing spam, account suspension, and cost exposure.

## 4.1 Optional: Updates List Storage (D1)

If you want a first-party “updates list” you control, the Worker supports:

- `POST /api/updates` (stores emails in D1; no email is sent)

To enable it:

1. Create a D1 database for the Worker in Cloudflare.
2. Bind it to the Worker with binding name `DB`.
3. Apply `workers/communications/migrations/0001_updates_signups.sql`.

To view/export the list, query D1 via Cloudflare dashboard or `wrangler d1 execute`. Do not expose a public endpoint that returns the full list.

## 5. Resend Domain Verification

This Worker sends “from”:

- `no-reply@stexpedite.press` (via `FROM_EMAIL`)

Therefore, Resend must allow sending from `stexpedite.press`.

Verify in Resend:

- Domain added: `stexpedite.press`
- Domain status: **Verified**
- DNS records (exact values come from Resend UI) were added to Cloudflare as **DNS only**, typically including:
  - DKIM (`TXT` records, often under something like `resend._domainkey`)
  - SPF (`TXT`)
  - (Optional / provider-specific) additional verification records

Note: This repo cannot confirm the exact DKIM/SPF hostnames/values because Resend generates them per account/domain.

## 6. Worker Route Configuration

Add a route in Cloudflare:

- Route: `stexpedite.press/api/*`
- Target: Worker `stexpedite-communications`

What it does:

- Requests to:
  - `POST https://stexpedite.press/api/contact`
  - `POST https://stexpedite.press/api/submit`
  are handled by the Worker instead of GitHub Pages.

Critical requirement:

- Worker Routes only apply if the hostname is **proxied** (orange cloud).

If you serve traffic on `www.stexpedite.press` too:

- You may also need a second route: `www.stexpedite.press/api/*`.
- You may also need to allow that origin in CORS (the Worker currently only allows `https://stexpedite.press` and localhost origins in `workers/communications/src/index.ts`).
 - If `www` is always redirected to the apex (`stexpedite.press`) before any `/api/*` requests are made, a second route is typically unnecessary; verify your redirect behavior in Cloudflare.

## 7. Testing Procedure

### Browser (real user path)

1. Visit `https://stexpedite.press/contact.html`
2. Submit the form.
3. Expected result (if Worker + Resend are configured):
   - The page shows `Sent. Reference: CONTACT-...`
   - No email client opens
   - The editor inbox receives the submission
   - The submitter receives a receipt email with the reference ID

Failure mode (expected fallback):

- If `/api/contact` fails (no route, Worker error, CORS mismatch, etc.), the frontend will open a `mailto:` compose window to `editor@stexpedite.press` (`site/contact.html` implements this fallback).

### PowerShell API test (direct)

This hits the Worker route directly (bypasses the frontend UI):

```powershell
Invoke-RestMethod -Method POST `
  -Uri "https://stexpedite.press/api/contact" `
  -ContentType "application/json" `
  -Body '{"reason":"Test","email":"test@example.com","message":"Hello from PowerShell","website":""}'
```

Expected JSON response shape:

```json
{ "ok": true, "id": "CONTACT-..." }
```

Notes:

- The Worker expects JSON and checks for at least a valid-looking `email` and a non-empty `message`.
- The `website` field is a honeypot; it should be empty.
- Extra fields are ignored by the Worker (for example, a `name` field won’t break delivery).

Alternate minimal payload (also valid):

```powershell
Invoke-RestMethod -Method POST `
  -Uri "https://stexpedite.press/api/contact" `
  -ContentType "application/json" `
  -Body '{"name":"Test","email":"test@example.com","message":"Hello"}'
```

## 8. Security Considerations (Current State)

Current state (as implemented in `workers/communications/src/index.ts` and frontend pages):

- No rate limiting yet.
- No Turnstile/CAPTCHA yet.
- Honeypot present:
  - `site/contact.html` uses hidden field `website`.
  - `site/submit.html` uses hidden field `website` (`submit-website`).
  - If the honeypot is filled, the Worker returns `{ ok: true }` but sends no email.
- CORS enforced in Worker:
  - Only `Origin: https://stexpedite.press` (and local dev origins) receives `access-control-allow-origin`.

TODO recommendations:

- Add rate limiting for `POST /api/*` (Cloudflare WAF rules, Worker middleware, or Durable Objects rate limiter).
- Add Cloudflare Turnstile to `site/contact.html` and `site/submit.html` and validate the token server-side.
- Enable/monitor Worker logs and set alerting on elevated error rates.
- Keep CORS origins strict; explicitly add `https://www.stexpedite.press` only if you serve the site there.

## 9. Recovery Instructions

Rotate Resend API key:

1. In Resend, generate a new API key.
2. In the Worker environment, update the secret:
   ```bash
   wrangler secret put RESEND_API_KEY
   ```
3. Re-test `POST /api/contact`.

Re-deploy Worker (code changes):

```bash
cd workers/communications
wrangler deploy
```

Re-attach route (if it was removed):

- Cloudflare → Workers & Pages → `stexpedite-communications` → **Triggers** → **Routes**
- Add: `stexpedite.press/api/*`

Re-verify domain (if sending breaks due to DNS/auth):

- In Resend, check domain verification status.
- In Cloudflare DNS, confirm DKIM/SPF/DMARC records match exactly what Resend requires and remain **DNS only**.
