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

- authored web assets: `apps/web/src/assets/`
- generated web output: `dist/site/`
- worker project: `apps/communications-worker/`

## Common Usage

```bash
sh internal/agent/tools/check-runtime-config.sh
sh internal/agent/tools/check-site-seo.sh
sh internal/agent/tools/sync-assets.sh
sh internal/agent/tools/check-assets-sync.sh
sh internal/agent/tools/release.sh --dry-run
sh internal/agent/tools/release.sh
```
