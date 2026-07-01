@AGENTS.md

# Claude Code Notes

See **[AGENTS.md](AGENTS.md)** for the full agent doctrine: architecture, session/closeout loops, subagent policy, design system, commands, git discipline, deployment, and secrets.

## Claude-Specific Workflow

- Read `AGENTS.md`, then `ONTOLOGY.md` (the navigation map: surfaces, page/API routes, ownership, and validation), before selecting files. Prefer the files and commands they name; if you work outside that map, verify the path is real and update `ONTOLOGY.md` when the surface should persist.
- Use Claude project memory for stable facts only; put task-specific or local preferences in `CLAUDE.local.md`.
- Keep `.claude/` local-only and untracked.
- Skills are in `skills/`; runbooks are in `ops/`; tools are in `scripts/`; reusable kits are in `kits/`.
- End repo tasks with tool-call logging, validation results, and a short tooling/skills improvement scrum.

## Local Files

- `CLAUDE.local.md` — private per-worktree notes, must remain untracked.
- `.claude/settings.local.json` — local secrets or machine configuration, must remain untracked.
