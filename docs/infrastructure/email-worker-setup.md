# Email Worker Setup (Cloudflare + Resend)

This document describes how the production communications pipeline for `stexpedite.press` is intended to be configured, based on the current repository implementation:

- Frontend: `site/contact.html` and `site/submit.html` POST JSON to `/api/*` with a `mailto:` fallback.
- Backend: Cloudflare Worker in `workers/communications/` sends email via the Resend API.
- Optional: the Worker can store "updates list" signups in Cloudflare D1.

Important: this repo does not contain your Cloudflare zone state or Resend dashboard state. Where relevant, this doc includes "verify in Cloudflare/Resend" checkpoints so the setup is reproducible.

## 1) System overview

Final architecture (contact form):

User -> `https://stexpedite.press/contact.html`  
-> `POST /api/contact` (JSON)  
-> Cloudflare (proxied DNS; Worker Route on `/api/*`)  
-> Worker: `stexpedite-communications` (`workers/communications/src/index.ts`)  
-> Resend API (`https://api.resend.com/emails`)  
-> delivered to `TO_EMAIL` (currently `editor@stexpedite.press`) in your mail provider (e.g., Zoho Mail)

Key facts:
- GitHub Pages serves the static site (HTML/CSS/JS).
- Cloudflare must proxy (orange cloud) the site hostname for Worker Routes to apply.
- `/api/*` is routed to the Worker; all other paths continue to origin (GitHub Pages).
- The Worker sends two emails per successful request to `/api/contact` or `/api/submit`:
  - One to the editor inbox (`TO_EMAIL`) with `reply_to` set to the submitter's email.
  - One receipt back to the submitter with a reference ID (`CONTACT-...` or `SUBMIT-...`).
- Newsletter updates signup uses Substack (`ecoamericana.substack.com`).
- The frontend also attempts a best-effort first-party capture call:
  - `POST /api/updates` (stores the email in D1 if configured; Substack still opens).

## 2) Cloudflare DNS configuration

Cloudflare must be your authoritative DNS provider for `stexpedite.press` (nameservers delegated to Cloudflare).

Recorded production values (verify in Cloudflare -> Overview / DNS):
- Nameservers:
  - `nicolas.ns.cloudflare.com`
  - `sara.ns.cloudflare.com`
- GitHub Pages origin records:
  - Apex `A` records for `stexpedite.press` -> `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153` (Proxied / orange cloud)
  - `www` `CNAME` -> `csandbatch.github.io` (Proxied / orange cloud)
- Mail/auth records:
  - `MX` + `TXT` remain DNS only (gray cloud)
  - Resend DKIM/SPF records are added as DNS only (gray cloud)

Why email records must not be proxied:
- Cloudflare proxying is for HTTP(S) traffic. Mail delivery uses SMTP and relies on direct DNS answers for `MX` and authentication (`TXT`) records.

## 2.1) Cloudflare SSL/TLS mode

Verify in Cloudflare -> SSL/TLS -> Overview:
- SSL/TLS encryption mode: `Full (strict)`

## 3) Worker deployment

Worker code:
- `workers/communications/`

Deploy (from that directory):

```bash
wrangler login
wrangler deploy
```

Worker name (per `workers/communications/wrangler.toml`):
- `stexpedite-communications`

Verify in Cloudflare:
- Workers & Pages -> you should see `stexpedite-communications`.

## 4) Environment variables and secrets

Committed vars (see `workers/communications/wrangler.toml`):

```toml
[vars]
FROM_EMAIL = "St. Expedite Press <no-reply@stexpedite.press>"
TO_EMAIL = "editor@stexpedite.press"
```

Secret (must not be committed to git):

```bash
wrangler secret put RESEND_API_KEY
```

How it's used:
- The Worker reads `RESEND_API_KEY`, `FROM_EMAIL`, and `TO_EMAIL` and calls the Resend API at `https://api.resend.com/emails`.

Why secrets must not live in source control:
- Anyone with the API key can send mail through your Resend account, risking spam, account suspension, and cost exposure.

## 4.1) Optional: updates list storage (D1)

If you want a first-party "updates list" you control, the Worker supports:
- `POST /api/updates` (stores emails in D1; no email is sent)

To enable it:
1. Create a D1 database for the Worker in Cloudflare.
2. Bind it to the Worker with binding name `DB`.
3. Apply `workers/communications/migrations/0001_updates_signups.sql`.

To view/export the list, query D1 via Cloudflare dashboard or `wrangler d1 execute`. Do not expose a public endpoint that returns the full list.

## 5) Resend domain verification

This Worker sends from:
- `no-reply@stexpedite.press` (via `FROM_EMAIL`)

Therefore, Resend must allow sending from `stexpedite.press`.

Verify in Resend:
- Domain added: `stexpedite.press`
- Domain status: Verified
- DNS records (exact values come from Resend UI) were added to Cloudflare as DNS only, typically including DKIM (TXT) and SPF (TXT).

Note: this repo cannot confirm exact DKIM/SPF record values, because Resend generates them per account/domain.

## 6) Worker route configuration

Add a route in Cloudflare:
- Route: `stexpedite.press/api/*`
- Target: Worker `stexpedite-communications`

Critical requirement:
- Worker Routes only apply if the hostname is proxied (orange cloud).

If you serve traffic on `www.stexpedite.press` too:
- You may also need a second route: `www.stexpedite.press/api/*`.
- You may also need to allow that origin in CORS (the Worker allowlist is in `workers/communications/src/index.ts`).
- If `www` is always redirected to apex before any `/api/*` requests are made, a second route is typically unnecessary; verify your redirect behavior in Cloudflare.

## 7) Testing procedure

### Browser (real user path)

1. Visit `https://stexpedite.press/contact.html`
2. Submit the form.
3. Expected result (if Worker + Resend are configured):
   - The page shows a friendly confirmation and a reference ID like `CONTACT-...`
   - No email client opens
   - The editor inbox receives the submission
   - The submitter receives a receipt email with the reference ID

Failure mode (expected fallback):
- If `/api/contact` fails (no route, Worker error, CORS mismatch, etc.), the frontend opens a `mailto:` compose window addressed to `editor@stexpedite.press`.

### PowerShell API test (direct)

Contact endpoint:

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

Updates capture endpoint (requires D1 binding `DB`):

```powershell
Invoke-RestMethod -Method POST `
  -Uri "https://stexpedite.press/api/updates" `
  -ContentType "application/json" `
  -Body '{"email":"test@example.com","source":"powershell","website":""}'
```

Expected response:
- `{ "ok": true }`

If D1 is not configured, expect:
- `{ "ok": false, "error": "Updates list not configured" }`

## 8) Security considerations (current state)

Current state (as implemented in `workers/communications/src/index.ts` and frontend pages):
- No rate limiting yet.
- No Turnstile/CAPTCHA yet.
- Honeypot present:
  - `site/contact.html` uses hidden field `website`.
  - `site/submit.html` uses hidden field `website` (`submit-website`).
  - If the honeypot is filled, the Worker returns `{ ok: true }` but does not send email / store signups.
- CORS enforced in Worker:
  - Only `Origin: https://stexpedite.press` (and local dev origins) receives `access-control-allow-origin`.

TODO recommendations:
- Add rate limiting for `POST /api/*`.
- Add Cloudflare Turnstile to `site/contact.html` and `site/submit.html` and validate the token server-side.
- Enable/monitor Worker logs and set alerting on elevated error rates.
- Keep CORS origins strict; add `https://www.stexpedite.press` only if you serve the site there.

## 9) Recovery instructions

Rotate Resend API key:
1. In Resend, generate a new API key.
2. Update the Worker secret:
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
- Cloudflare -> Workers & Pages -> `stexpedite-communications` -> Triggers -> Routes
- Add: `stexpedite.press/api/*`

Re-verify domain (if sending breaks due to DNS/auth):
- In Resend, check domain verification status.
- In Cloudflare DNS, confirm DKIM/SPF/DMARC records match exactly what Resend requires and remain DNS only.

