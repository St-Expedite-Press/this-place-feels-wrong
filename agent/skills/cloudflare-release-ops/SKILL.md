---
name: cloudflare-release-ops
description: Prepare, validate, release, or investigate the Cloudflare Pages and Worker operational surface for this repo. Use for runtime config checks, production API smoke tests, release dry-runs, deploy docs, D1/Resend/Fourthwall/Stripe/Turnstile environment checks, and release evidence logging.
---

# Cloudflare Release Ops

## Workflow

1. Read `DEPLOYMENT.md`, `docs/infrastructure/README.md`, and `agent/ops/cloudflare-stability/SKILL.md`.
2. For pre-release checks:
   ```bash
   npm run assets:check
   npm run check
   npm run runtime:config
   npm run release:dry-run
   ```
3. For runtime investigation:
   ```bash
   npm run runtime:audit
   npm run smoke:api
   npm run smoke:api:full
   ```
4. For release evidence:
   ```bash
   npm run release:log
   ```

## Existing Tooling

Use the existing scripts under `agent/tools/` and `agent/ops/cloudflare-stability/scripts/`. Do not duplicate shell logic in this skill.

## Guardrails

- Do not print or commit `.env`, `.dev.vars`, `.claude/settings.local.json`, or Cloudflare secrets.
- Use `npm run deploy:web` for Cloudflare Pages and `npm run deploy:worker` for the communications Worker.
- Keep D1 migrations append-only.
- If a production check fails, update `docs/operations/incident-runbook.md` only after confirming the failure mode.
