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
sh tools/bootstrap-git-auth.sh
sh tools/bootstrap-python-venv.sh
sh tools/install-hooks.sh
sh tools/check-runtime-config.sh
sh tools/check-site-seo.sh
sh tools/release.sh --dry-run
sh tools/release.sh
```
