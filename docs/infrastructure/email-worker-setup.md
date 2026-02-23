# Communications Infrastructure (Cloudflare + Resend + Zoho)

This document records communications infrastructure for `stexpedite.press`, with explicit separation between repo-configured state and dashboard/runtime checks.

Runtime verification snapshot:
- Date: **2026-02-23**
- `npx -y wrangler whoami`: authenticated
- `npx -y wrangler secret list`: includes `RESEND_API_KEY`
- `npx -y wrangler d1 list`: includes `stexpedite-updates`
- `POST https://stexpedite.press/api/updates`: `200` with `{ "ok": true }`

## 1) Repo-configured state (source-controlled)

### Topology

Browser traffic path for API calls:
- Browser -> Cloudflare edge -> Worker `stexpedite-communications` -> Resend API -> mailbox

Static site path:
- GitHub Pages serves static files from `site/`
- Worker handles `/api/*` only

### Worker code and contract

Source of truth:
- Implementation: `workers/communications/src/index.ts`
- Contract: `workers/communications/openapi.yaml`
- Config: `workers/communications/wrangler.toml`

Configured in repo:
- Worker name: `stexpedite-communications`
- Vars in `wrangler.toml`: `FROM_EMAIL`, `TO_EMAIL`, `RATE_LIMIT_MAX`, `RATE_LIMIT_WINDOW_MS`
- Optional secret-gated control: when `TURNSTILE_SECRET` is present, POST routes require valid Turnstile token verification
- Endpoints:
  - `GET /api/health`
  - `GET /api/storefront`
  - `POST /api/contact`
  - `POST /api/submit`
  - `POST /api/updates`

Updates storage semantics:
- `DB` binding is configured to D1 database `stexpedite-updates`.
- If `DB` exists, `/api/updates` writes/upserts to D1 table `updates_signups`.
- If `DB` is missing, `/api/updates` returns `{ "ok": false, "error": "Updates list not configured" }` with status `500`.

### Email layer

Resend integration:
- Worker sends HTTPS requests to `https://api.resend.com/emails`
- Auth uses `Authorization: Bearer <RESEND_API_KEY>`
- Sender identity comes from `FROM_EMAIL`
- Editor recipient comes from `TO_EMAIL`

## 2) Cloudflare dashboard required checks (not stored in git)

These checks must be confirmed in Cloudflare/Resend dashboards and are not guaranteed by repo contents alone.

### Account and auth checks

```bash
cd workers/communications
npx -y wrangler whoami
npx -y wrangler secret list
npx -y wrangler d1 list
```

Required outcomes:
- Wrangler authentication succeeds.
- Secret list contains `RESEND_API_KEY`.
- D1 list contains `stexpedite-updates`.

### Route and DNS checks

Required:
- Route `stexpedite.press/api/*` is attached to `stexpedite-communications`.

Conditional:
- If `www` serves traffic before redirect, add/verify `www.stexpedite.press/api/*`.

DNS mode checks:
- Hostnames using Worker Routes are proxied (orange cloud).
- Mail/auth records remain DNS-only (gray cloud):
  - MX: `mx.zoho.com`, `mx2.zoho.com`, `mx3.zoho.com`
  - DKIM selectors: `zmail._domainkey`, `resend._domainkey`
  - SPF + DMARC TXT records

### Optional D1 checks for updates capture

If first-party updates storage is required:
1. D1 database exists.
2. Worker has binding `DB`.
3. Migration `workers/communications/migrations/0001_updates_signups.sql` is applied.

Current expected state:
- Database name: `stexpedite-updates`
- Binding name: `DB`
- Migration `0001_updates_signups.sql` already applied remotely

## 3) Runtime smoke tests

Run after Worker deploy and route verification.

Deploy command note:
- Use `npx -y wrangler deploy --keep-vars` so dashboard-defined vars remain attached to runtime.

### Health endpoint

```bash
curl -i "https://stexpedite.press/api/health"
```

Expected:
- `200`
- body shape includes `{ "ok": true, "service": "communications-worker", "dbConfigured": true|false, "now": "..." }`

### Contact endpoint

```bash
curl -i -X POST "https://stexpedite.press/api/contact" \
  -H "content-type: application/json" \
  --data '{"reason":"Test","email":"test@example.com","message":"Hello"}'
```

Expected:
- `200`
- body shape includes `{ "ok": true, "id": "CONTACT-..." }`

### Submit endpoint

```bash
curl -i -X POST "https://stexpedite.press/api/submit" \
  -H "content-type: application/json" \
  --data '{"email":"test@example.com","note":"Hello"}'
```

Expected:
- `200`
- body shape includes `{ "ok": true, "id": "SUBMIT-..." }`

### Updates endpoint

```bash
curl -i -X POST "https://stexpedite.press/api/updates" \
  -H "content-type: application/json" \
  --data '{"email":"test@example.com","source":"smoke"}'
```

Expected:
- With D1 `DB` bound: `200` and `{ "ok": true }`
- Without D1 `DB` bound: `500` and `{ "ok": false, "error": "Updates list not configured" }`
- Under sustained per-IP burst: `429` and `{ "ok": false, "error": "Too many requests", "retryAfter": <seconds> }`

Automated equivalent checks:

```bash
bash skills/ops/cloudflare-stability/scripts/runtime-audit.sh
bash skills/ops/cloudflare-stability/scripts/smoke-api.sh --full
```

Worker test suite (repo-local contract checks):

```bash
cd workers/communications
npm install
npm run test
```

## 4) Security and operations notes

Current controls in code:
- CORS allowlist enforcement
- Honeypot suppression (`website`, `company`, `hp`)
- Worker-side rate limiting (`RATE_LIMIT_MAX` + `RATE_LIMIT_WINDOW_MS`)
- Optional Turnstile token verification (`TURNSTILE_SECRET`)
- Secrets stored outside git

Operational monitor:
- `.github/workflows/api-health-monitor.yml` runs every 15 minutes and checks:
  - `GET /api/health` success payload
  - `GET /api/storefront` success payload
  - synthetic negative probes for `POST /api/updates`, `POST /api/contact`, and `POST /api/submit`

Storefront dependency:
- `GET /api/storefront` requires Worker secret `FOURTH_WALL_API_KEY` (preferred) or `FW_STOREFRONT_TOKEN` (fallback alias) with the Fourthwall storefront token.

## 5) Filesystem reference

- `workers/communications/wrangler.toml`
- `workers/communications/src/index.ts`
- `workers/communications/openapi.yaml`
- `workers/communications/migrations/0001_updates_signups.sql`
- `docs/infrastructure/d1-database.md`
- `docs/operations/incident-runbook.md`
- `docs/operations/release-ops-log.md`
- `skills/ops/cloudflare-stability/`
- `docs/state-of-play.md`
- `DEPLOYMENT.md`
