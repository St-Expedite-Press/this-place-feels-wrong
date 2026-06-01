---
name: cloudflare-release-ops
description: Prepare, validate, release, or investigate the Cloudflare Pages and Worker operational surface for this repo. Use for runtime config checks, production API smoke tests, release dry-runs, deploy docs, D1/Resend/Fourthwall/Stripe/Turnstile environment checks, and release evidence logging.
---

# Cloudflare Release Ops

## Workflow

1. Read `DEPLOYMENT.md`, `docs/infrastructure/README.md`, and `ops/cloudflare-stability/SKILL.md`.
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

## MCP API Testing

Use `playwright-ea` to test Worker API endpoints manually alongside browser automation:

- Fire `POST /api/contact`, `POST /api/submit`, `POST /api/updates` with test payloads and assert response shape
- Test `GET /api/health`, `GET /api/storefront`, `GET /api/projects` and verify they return expected structure
- Check `POST /api/donate/session` returns a Stripe checkout URL in the expected format
- Useful for verifying Worker behavior after a deploy without running the full smoke script

Use `playwright` to:
- Verify the live site loads correctly after a Pages deploy
- Check for any post-deploy console errors
- Confirm the portal animation and hero bar render at 1280px and 390px

**Note:** `playwright-ea` fires real requests to the live Worker. Use test-mode payloads; do not send real emails or trigger real Stripe charges.

## Existing Tooling

Use the existing scripts under `scripts/` and `ops/cloudflare-stability/scripts/`. Do not duplicate shell logic in this skill.

## Guardrails

- Do not print or commit `.env`, `.dev.vars`, `.claude/settings.local.json`, or Cloudflare secrets.
- Use `npm run deploy:web` for Cloudflare Pages and `npm run deploy:worker` for the communications Worker.
- Keep D1 migrations append-only.
- If a production check fails, update `docs/operations/incident-runbook.md` only after confirming the failure mode.
