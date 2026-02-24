# Agent Hub

All agent-facing material is consolidated under this directory.

## Structure

- `AGENTS.md` - repo-wide agent operating protocol.
- `SEO_AGENT.md` - SEO-oriented agent guidance.
- `TOOLING_DISCUSSION.md` - repo tooling assessment history.
- `tools/` - operational scripts (release flow, auth/bootstrap, runtime/SEO checks).
- `skills/` - reusable operational skills and references.
- `AGENT/` - project-agnostic static web toolkit (scaffold/build/check/deploy wrappers).

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
sh agent/AGENT/scripts/scaffold-static.sh /tmp/my-site "My Site"
sh agent/AGENT/scripts/check-all.sh /tmp/my-site
```
