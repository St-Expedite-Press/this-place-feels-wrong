# Internal Tooling

Operational scripts for repo maintenance.

## Scripts

- `bootstrap-git-auth.sh`
- `bootstrap-python-venv.sh`
- `install-hooks.sh`
- `check-runtime-config.sh`
- `check-site-seo.sh`
- `sync-assets.sh`
- `check-assets-sync.sh`
- `release.sh`

## Current Path Assumptions

- canonical media sources: `assets/source/`
- authored web assets: `apps/web/public/assets/`
- generated web output: `apps/web/dist/`
- worker project: `apps/communications-worker/`
- release evidence: `docs/operations/release-ops-log.md`

## Common Usage

Preferred npm aliases from repo root:

```bash
npm run assets:sync
npm run assets:check
npm run check:seo
npm run runtime:config
npm run release:dry-run
npm run release
```

Direct shell usage:

```bash
sh internal/agent/tools/check-runtime-config.sh
sh internal/agent/tools/check-site-seo.sh
sh internal/agent/tools/sync-assets.sh
sh internal/agent/tools/check-assets-sync.sh
sh internal/agent/tools/release.sh --dry-run
sh internal/agent/tools/release.sh
```
