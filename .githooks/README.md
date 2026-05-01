# Git Hooks

Tracked git hooks live here so they stay versioned with the repository.

Current hook:
- `pre-push` for repo guardrails before code is pushed

Enable the tracked hooks with:

```bash
sh internal/agent/tools/install-hooks.sh
```

Current `pre-push` behavior:
- runs `npm run check` from the repo root
- validates the generated `apps/web/dist/` output and worker test suite before push
