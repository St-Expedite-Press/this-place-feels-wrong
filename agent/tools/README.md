# Tooling Scripts

Operational scripts for local checks, release flow, and git ergonomics.

## Scripts

- `bootstrap-git-auth.sh`
  - Reads `GITHUB_PAT_WRITE` and optional `GITHUB_REPO_URL` from `.env`
  - Configures repo-local git credential storage (`.git/credentials`)
- `bootstrap-python-venv.sh`
  - Creates/updates `.venv` for local Python tooling
  - Falls back to `--without-pip` + `get-pip.py` when `ensurepip` is unavailable
- `install-hooks.sh`
  - Enables tracked hooks with `core.hooksPath=.githooks`
- `check-runtime-config.sh`
  - Validates Wrangler auth, required secrets, D1 presence, and health endpoint
- `check-site-seo.sh`
  - Advisory scan for one-`h1` and canonical tags (`--strict` for failing mode)
- `sync-assets.sh`
  - Syncs canonical media from `assets/source/` into `site/assets/`
  - Regenerates `assets/manifest.txt` with checksums and file sizes
  - Generates `.webp` siblings from raster images when `cwebp` is installed
- `check-assets-sync.sh`
  - Verifies `assets/source/` and `site/assets/` are in sync
  - Verifies `assets/manifest.txt` matches current `site/assets/` content
- `release.sh`
  - Release orchestration:
    - HTML lint
    - worker tests
    - runtime config checks
    - push
    - worker deploy
    - API smoke
    - release evidence logging
  - Supports `--dry-run`, `--skip-push`, `--skip-deploy`, `--skip-smoke`, `--skip-log`

## Usage

From repo root:

```bash
sh agent/tools/bootstrap-git-auth.sh
sh agent/tools/bootstrap-python-venv.sh
sh agent/tools/install-hooks.sh
sh agent/tools/check-runtime-config.sh
sh agent/tools/check-site-seo.sh
sh agent/tools/sync-assets.sh
sh agent/tools/check-assets-sync.sh
sh agent/tools/release.sh --dry-run
sh agent/tools/release.sh
```
