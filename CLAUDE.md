@agent/AGENT.md

# Claude Code Notes

`agent/AGENT.md` is the shared project source of truth. All agent instructions, ontology, command matrix, CSS design rules, and subagent policy live there.

## Claude-Specific Workflow

- Use Claude project memory for stable facts only; put task-specific or local preferences in `CLAUDE.local.md`.
- Keep `.claude/` local-only.
- Skills are in `agent/skills/`; runbooks are in `agent/ops/`; tools are in `agent/tools/`.
- For broad work, follow the task routing loop in `agent/AGENT.md` §3, then use subagents per §8.

## Local Files

- `CLAUDE.local.md` is for private per-worktree notes and must remain untracked.
- `.claude/settings.local.json` may contain local secrets or machine configuration and must remain untracked.
