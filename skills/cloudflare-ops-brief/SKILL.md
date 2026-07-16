---
name: cloudflare-ops-brief
description: Produce a single human-readable status brief across Worker/Pages/D1 health, GitHub Dependabot alerts, and recent deploy history. Use when asked "how's everything running" or before/after a deploy, as a lighter-weight companion to the deeper cloudflare-release-ops and cloudflare-stability runbooks.
---

# Cloudflare Ops Brief

A synthesis skill, not a new runbook — it runs the existing tooling and
compresses the output into one digest. Do not re-implement checks that
`skills/cloudflare-release-ops/SKILL.md` and
`ops/cloudflare-stability/SKILL.md` already own; call into them.

## Workflow

1. Run the read-only checks already defined in
   `ops/cloudflare-stability/scripts/runtime-audit.sh` (wrangler auth,
   secret presence, D1 presence/schema, health endpoint) and
   `scripts/smoke-api.sh` (health/storefront/projects/donate/updates
   probes).
2. Pull GitHub Actions run status for the four independent deploy
   workflows (`deploy-stex.yml`, `deploy-rice.yml`, `deploy-chat.yml`,
   `deploy-backend.yml`) for the last few runs on `main`.
3. Pull the repo's current Dependabot alert count (`gh api` or the
   Security tab) — don't fix them here, just report the count and
   severity.
4. Compress all of the above into one short brief: what's healthy, what
   needs attention, and — if something looks broken — point at
   `ops/cloudflare-stability/references/incident-response.md` rather than
   improvising a fix.

## Guardrails

- Read-only. Any remediation (redeploy, secret rotation, migration) is a
  separate, explicitly-authorized action, same as any other production
  write in root `AGENTS.md`.
- Don't print secret values while checking presence — presence and name
  only, per root `AGENTS.md`'s secrets policy.
