# D1 Database Reference

Canonical reference for the Cloudflare D1 database used by the communications Worker.

## Current Contract

- database name: `stexpedite-updates`
- binding: `DB`
- config location: `apps/backend/wrangler.toml`
- migration directory: `apps/backend/migrations/`

The Worker uses D1 for:

- `POST /api/updates`
- `POST /api/updates/import`
- `POST /api/updates/unsubscribe`
- `GET /api/projects`
- best-effort contact/submission logging
- shared API rate-limit state

## Verification

```bash
cd apps/backend
npx -y wrangler whoami
npx -y wrangler d1 list
npx -y wrangler d1 execute stexpedite-updates --remote --command "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;"
```

Repo helper:

```bash
npm run runtime:audit
```

## Change Procedure

1. Add a migration under `apps/backend/migrations/`.
2. Update `apps/backend/openapi.yaml` if route shapes change.
3. Apply the migration remotely with Wrangler.
4. Deploy the Worker.
5. Run runtime audit and smoke checks.
