@agent/AGENT.md

# Claude Code Notes

See **[AGENTS.md](AGENTS.md)** for the full agent delegation model, skill routing, and subagent policy for this repository.

`agent/AGENT.md` is the shared project source of truth for all agents. All agent instructions, ontology, command matrix, CSS design rules, and subagent policy live there.

## Claude-Specific Workflow

- Open `docs/ontology/project-ontology.json` first — it is the navigation and constraint map. Use it for task classification, owning paths, command discovery, and agent/tooling contract checks.
- Treat the ontology as a boundary, not just a reference: prefer files and commands it names. If you work outside that map, verify the path is real and update the ontology when that surface should persist.
- Use Claude project memory for stable facts only; put task-specific or local preferences in `CLAUDE.local.md`.
- Keep `.claude/` local-only and untracked.
- Skills are in `agent/skills/`; runbooks are in `agent/ops/`; tools are in `agent/tools/`.
- For broad work, follow the task routing loop in `agent/AGENT.md` §3, then use subagents per `AGENTS.md`.

## Local Files

- `CLAUDE.local.md` — private per-worktree notes, must remain untracked.
- `.claude/settings.local.json` — local secrets or machine configuration, must remain untracked.
