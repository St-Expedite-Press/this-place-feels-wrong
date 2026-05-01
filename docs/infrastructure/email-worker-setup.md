# Communications Infrastructure

Reference for the production communications stack behind `stexpedite.press`.

## Topology

- public site source: `apps/web/src/`
- public build artifact: `apps/web/dist/`
- Worker/API implementation: `apps/communications-worker/`
- runtime edge: Cloudflare
- email delivery: Resend
- donation checkout: Stripe
- data store: D1 (`stexpedite-updates`)
- storefront data: Fourthwall

## Worker Source Of Truth

- implementation: `apps/communications-worker/src/index.ts`
- contract: `apps/communications-worker/openapi.yaml`
- config: `apps/communications-worker/wrangler.toml`
- migrations: `apps/communications-worker/migrations/`

## Expected Runtime

- route `stexpedite.press/api/*` attached to `stexpedite-communications`
- route `www.stexpedite.press/api/*` attached to `stexpedite-communications`
- secret `RESEND_API_KEY` configured for contact and submit flows
- secrets `FROM_EMAIL` and `TO_EMAIL` configured for email routing
- secret `STRIPE_SECRET_KEY` configured for donations
- D1 binding `DB` attached when updates/projects/rate-limit/logging features are required
- optional secrets:
  - `FOURTH_WALL_API_KEY` or `FW_STOREFRONT_TOKEN`
  - `TURNSTILE_SECRET`
  - `UPDATES_IMPORT_TOKEN`

## Verification

```bash
npm run test:worker
npm run runtime:config
```

Runtime smoke:

```bash
npm run runtime:audit
npm run smoke:api:full
```
