# D1 Database Reference

Canonical reference for the Cloudflare D1 database used by the communications Worker.

## Current Contract

- database name: `stexpedite-updates`
- binding: `DB`
- config location: `apps/communications-worker/wrangler.toml`
- migration directory: `apps/communications-worker/migrations/`

The Worker uses D1 for:

- `POST /api/updates`
- `GET /api/projects`
- shared API rate-limit state

## Verification

```bash
cd apps/communications-worker
npx -y wrangler whoami
npx -y wrangler d1 list
npx -y wrangler d1 execute stexpedite-updates --remote --command "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;"
```

## Change Procedure

1. Add a migration under `apps/communications-worker/migrations/`.
2. Apply it remotely with Wrangler.
3. Deploy the Worker.
4. Run runtime audit and smoke checks.

Operational helper:

```bash
bash internal/agent/skills/ops/cloudflare-stability/scripts/runtime-audit.sh
```
