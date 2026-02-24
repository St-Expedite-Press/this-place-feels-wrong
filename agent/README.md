# Agent Hub

All agent-facing material is consolidated under this directory.

## Structure

- `docs/` - agent documentation and policy references.
  - `docs/AGENTS.md` - repo-wide agent operating protocol.
  - `docs/SEO_AGENT.md` - SEO-oriented agent guidance.
  - `docs/TOOLING_DISCUSSION.md` - repo tooling assessment history.
- `tools/` - operational scripts (release flow, auth/bootstrap, runtime/SEO checks).
- `skills/` - reusable operational skills and references.
- `kits/static-web/` - project-agnostic static web toolkit (scaffold/build/check/deploy wrappers).

## Primary entrypoints

From repo root:

```bash
sh agent/tools/bootstrap-git-auth.sh
sh agent/tools/install-hooks.sh
sh agent/tools/release.sh --dry-run
sh agent/tools/release.sh
```

Static toolkit (project-agnostic):

```bash
sh agent/kits/static-web/scripts/scaffold-static.sh /tmp/my-site "My Site"
sh agent/kits/static-web/scripts/check-all.sh /tmp/my-site
```
