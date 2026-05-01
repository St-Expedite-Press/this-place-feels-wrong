@AGENTS.md

# Claude Code Notes

Claude should treat `AGENTS.md` as the shared project source of truth. Keep this file compact so it can be checked into git and loaded by Claude without duplicating the canonical instructions.

## Claude-Specific Workflow

- Use Claude project memory for stable facts only; put task-specific or local preferences in `CLAUDE.local.md`.
- Keep `.claude/` local-only. Do not add project subagents or settings there unless the user explicitly changes that policy.
- Use `@` imports sparingly. If a procedure is long or domain-specific, prefer the repo-scoped Codex skills in `.agents/skills/` or the runbooks in `internal/agent/`.
- For broad work, first follow the task routing loop in `AGENTS.md`, then use Claude subagents for isolated read-only research or focused review when that saves context.

## Local Files

- `CLAUDE.local.md` is for private per-worktree notes and must remain untracked.
- `.claude/settings.local.json` may contain local secrets or machine configuration and must remain untracked.
