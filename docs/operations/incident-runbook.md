# Incident Runbook (Cloudflare Worker + D1)

Use this for production API outages/degradation affecting `/api/contact`, `/api/submit`, or `/api/updates`.

## Severity

- `P1`: all API endpoints unavailable.
- `P2`: one endpoint degraded but platform otherwise serving.

## First 15 minutes

1. Run `bash skills/ops/cloudflare-stability/scripts/runtime-audit.sh`.
2. Run `bash skills/ops/cloudflare-stability/scripts/smoke-api.sh`.
3. Confirm Cloudflare route attachment for `stexpedite.press/api/*`.
4. Confirm Worker secret `RESEND_API_KEY` exists.
5. If Turnstile is enabled, confirm Worker secret `TURNSTILE_SECRET` exists.

## Mitigation playbook

- Secret/vars issue:
  - restore secret
  - verify wrangler vars
  - redeploy Worker
- Abuse-control issue (false-positive blocks):
  - tune `RATE_LIMIT_MAX` / `RATE_LIMIT_WINDOW_MS`
  - verify Turnstile token path and secret alignment
  - redeploy Worker
- D1 issue:
  - verify DB presence and schema
  - re-apply migrations if required
  - redeploy Worker
- Route issue:
  - re-attach route in dashboard
  - verify apex host is proxied for Worker routes

## Recovery proof

1. Run `bash skills/ops/cloudflare-stability/scripts/smoke-api.sh --full`.
2. Run `bash skills/ops/cloudflare-stability/scripts/log-release-evidence.sh`.
3. Update `docs/state-of-play.md` verification date/head if infra changed.
