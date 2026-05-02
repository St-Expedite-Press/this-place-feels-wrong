# Incident Runbook (Cloudflare Worker + D1)

Use this for production API outages or degradation affecting any route under `/api/*`, including health, storefront, projects, contact, submit, donations, updates, imports, and unsubscribe.

## Severity

- `P1`: all API endpoints unavailable.
- `P2`: one endpoint degraded but platform otherwise serving.

## First 15 Minutes

1. Run `npm run runtime:audit`.
2. Run `npm run smoke:api`.
3. Confirm Cloudflare route attachment for `stexpedite.press/api/*` and `www.stexpedite.press/api/*`.
4. Confirm Worker secret `RESEND_API_KEY` exists for contact/submit flows.
5. Confirm Worker secret `STRIPE_SECRET_KEY` exists for donation flow.
6. Confirm Worker secret `FOURTH_WALL_API_KEY` exists for storefront flow.
7. If Turnstile is enabled, confirm Worker secret `TURNSTILE_SECRET` exists.
8. If imports fail, confirm `UPDATES_IMPORT_TOKEN`.

## Mitigation Playbook

- Secret or var issue: restore the missing secret, verify Wrangler config, redeploy Worker.
- Abuse-control issue: tune `RATE_LIMIT_MAX` / `RATE_LIMIT_WINDOW_MS`, verify Turnstile token path and secret alignment, redeploy Worker.
- D1 issue: verify DB presence and schema, re-apply migrations if required, redeploy Worker.
- Stripe issue: verify `STRIPE_SECRET_KEY`, Checkout API status, and donation request body.
- Route issue: re-attach route in the Cloudflare dashboard and verify the API-serving host is proxied.

## Recovery Proof

1. Run `npm run smoke:api:full`.
2. Run `npm run release:log`.
3. Update `docs/state-of-play.md` if infrastructure or route topology changed.
