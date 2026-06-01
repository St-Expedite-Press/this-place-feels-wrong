---
name: worker-contract-review
description: Review and reconcile the Cloudflare communications Worker API contract, implementation, tests, D1 migrations, and docs. Use when touching apps/communications-worker, OpenAPI, API routes, form flows, donations, updates signup/import/unsubscribe, or Worker runtime documentation.
---

# Worker Contract Review

## Workflow

1. Read `apps/communications-worker/README.md`, `apps/communications-worker/src/index.ts`, `apps/communications-worker/openapi.yaml`, and `apps/communications-worker/test/index.test.ts`.
2. Compare implemented routes with documented routes:
   ```bash
   rg -n 'url.pathname === "/api/' apps/communications-worker/src/index.ts
   Select-String -Path apps/communications-worker/openapi.yaml -Pattern '^  /api/'
   ```
3. Check D1 assumptions in `apps/communications-worker/migrations/` before changing persistence behavior.
4. Update OpenAPI and docs whenever an existing route, request body, response body, status code, or runtime dependency changes.
5. Run:
   ```bash
   npm run test:worker
   ```

## Guardrails

- Preserve existing `/api/*` behavior unless the user explicitly requests a behavior change.
- Do not edit existing migration files.
- Keep Turnstile, rate limiting, D1, Resend, Fourthwall, and Stripe failure modes documented where they affect operators.
- Contact and submit flows may log to D1 after email delivery; logging failure should not be treated as form failure unless implementation changes.
