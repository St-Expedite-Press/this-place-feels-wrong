# Internal Agent Hub

Internal tooling and maintenance material for this repository.

## Structure

- `tools/` for release, auth, asset, and runtime scripts
- `skills/` for operational runbooks and scripts
- `kits/static-web/` for reusable static-site scaffolding and checks
- `docs/` for internal operating notes

## Primary Commands

From repo root:

```bash
sh internal/agent/tools/bootstrap-git-auth.sh
sh internal/agent/tools/install-hooks.sh
sh internal/agent/tools/release.sh --dry-run
sh internal/agent/tools/release.sh
```
