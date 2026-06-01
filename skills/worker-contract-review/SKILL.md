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
   rg -n '^  /api/' apps/communications-worker/openapi.yaml
   ```
3. Check D1 assumptions in `apps/communications-worker/migrations/` before changing persistence behavior.
4. Update OpenAPI and docs whenever an existing route, request body, response body, status code, or runtime dependency changes.
5. Run:
   ```bash
   npm run test:worker
   ```

## MCP Contract Testing

Use `playwright-ea` to fire live requests against the deployed Worker and verify contract behavior:

- `GET /api/health` — assert `{ ok: true }` with 200
- `GET /api/projects` — assert array of projects, each with expected fields
- `GET /api/storefront` — assert catalog items present
- `POST /api/contact` with `{ name, email, message }` — assert 200 and email confirmed sent
- `POST /api/updates` with `{ email }` — assert 200 signup response
- `POST /api/updates/unsubscribe` with `{ email }` — assert 200

Use `playwright-ea` alongside `playwright` to test full form-to-API flows:
1. Navigate to `/contact` with playwright
2. Fill and submit the form
3. Use `playwright-ea.assert_response` to verify the Worker received and responded correctly

**Note:** Use test-mode payloads. Do not trigger real email sends without explicit authorization.

## Current Route Inventory

| Method | Route | Auth | Notes |
|--------|-------|------|-------|
| GET | `/api/health` | none | Always returns ok |
| GET | `/api/storefront` | none | Fourthwall catalog |
| GET | `/api/projects` | none | D1-backed |
| POST | `/api/contact` | Turnstile (unconfigured) | Resend + D1 log |
| POST | `/api/submit` | Turnstile (unconfigured) | Resend + D1 log |
| POST | `/api/donate/session` | none | Stripe Checkout |
| POST | `/api/stripe/webhook` | Stripe signature | D1 log + receipt email |
| POST | `/api/updates` | none | D1 signup capture |
| POST | `/api/updates/import` | `IMPORT_AUTH_TOKEN` | Bulk enrichment |
| POST | `/api/updates/unsubscribe` | none | D1 marker |

## Guardrails

- Preserve existing `/api/*` behavior unless the user explicitly requests a behavior change.
- Do not edit existing migration files.
- Keep Turnstile, rate limiting, D1, Resend, Fourthwall, and Stripe failure modes documented where they affect operators.
- Contact and submit flows may log to D1 after email delivery; logging failure should not be treated as form failure unless implementation changes.
