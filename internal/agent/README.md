# Internal Agent Hub

Internal tooling and maintenance material for this repository.

## Structure

- `tools/` for release, auth, asset, runtime, and SEO scripts
- `skills/` for internal operational runbooks and scripts
- `kits/static-web/` for reusable static-site scaffolding and checks
- `docs/` for internal operating notes

Repo-scoped Codex skills used directly by Codex live in `.agents/skills/`.

## Primary Commands

From repo root:

```bash
npm run bootstrap:venv
sh internal/agent/tools/bootstrap-git-auth.sh
sh internal/agent/tools/install-hooks.sh
npm run assets:check
npm run runtime:config
npm run release:dry-run
npm run release
```
