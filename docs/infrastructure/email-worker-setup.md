# Communications Infrastructure

Reference for the production communications stack behind `stexpedite.press`.

## Topology

- public site source: `apps/web/src/`
- public build artifact: `dist/site/`
- Worker/API implementation: `apps/communications-worker/`
- runtime edge: Cloudflare
- email delivery: Resend
- data store: D1 (`stexpedite-updates`)

## Worker Source Of Truth

- implementation: `apps/communications-worker/src/index.ts`
- contract: `apps/communications-worker/openapi.yaml`
- config: `apps/communications-worker/wrangler.toml`
- migrations: `apps/communications-worker/migrations/`

## Expected Runtime

- route `stexpedite.press/api/*` attached to `stexpedite-communications`
- secret `RESEND_API_KEY` configured
- D1 binding `DB` attached when updates/projects features are required
- optional secrets:
  - `FOURTH_WALL_API_KEY` or `FW_STOREFRONT_TOKEN`
  - `TURNSTILE_SECRET`
  - `UPDATES_IMPORT_TOKEN`

## Verification

```bash
cd apps/communications-worker
npx -y wrangler whoami
npx -y wrangler secret list
npx -y wrangler d1 list
npm run test
```

Runtime smoke:

```bash
bash internal/agent/skills/ops/cloudflare-stability/scripts/runtime-audit.sh
bash internal/agent/skills/ops/cloudflare-stability/scripts/smoke-api.sh --full
```
