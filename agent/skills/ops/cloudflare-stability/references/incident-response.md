# Incident Response (Cloudflare Stability)

## Immediate triage

1. Run `runtime-audit.sh`.
2. Run `smoke-api.sh`.
3. Classify severity (`P1` or `P2`).

## Containment actions

1. If secret/config issue:
   - restore `RESEND_API_KEY`
   - verify `FROM_EMAIL`/`TO_EMAIL`
   - redeploy Worker
2. If D1 issue:
   - verify `DB` binding and D1 availability
   - verify `updates_signups` schema
3. If route issue:
   - verify `stexpedite.press/api/*` attachment in Cloudflare
   - verify proxied mode for API-serving host

## Recovery actions

1. Roll back to last known-good Worker version if mitigation fails.
2. Re-run smoke checks.
3. Log evidence in `docs/operations/release-ops-log.md`.

## Post-incident

1. Record root cause and preventive action.
2. Update docs:
   - `docs/state-of-play.md`
   - `DEPLOYMENT.md`
   - `docs/infrastructure/email-worker-setup.md`
   - `docs/infrastructure/d1-database.md`
