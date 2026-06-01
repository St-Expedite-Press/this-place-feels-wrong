@AGENTS.md

# Claude Code Notes

See **[AGENTS.md](AGENTS.md)** for the full agent doctrine: project shape, route ontology, task routing loop, command matrix, CSS rules, safety rules, subagent policy, and known gaps.

## Claude-Specific Workflow

- Open `docs/ontology/project-ontology.json` first — it is the navigation and constraint map. Use it for task classification, owning paths, command discovery, and agent/tooling contract checks.
- Use `docs/ontology/ontology.md` as the human-readable companion and update it whenever the JSON ontology changes.
- Treat the ontology as a boundary, not just a reference: prefer files and commands it names. If you work outside that map, verify the path is real and update the ontology when that surface should persist.
- Use Claude project memory for stable facts only; put task-specific or local preferences in `CLAUDE.local.md`.
- Keep `.claude/` local-only and untracked.
- Skills are in `agent/skills/`; runbooks are in `agent/ops/`; tools are in `agent/tools/`.
- End repo tasks with tool-call logging, validation results, and a short tooling/skills improvement scrum.

## Local Files

- `CLAUDE.local.md` — private per-worktree notes, must remain untracked.
- `.claude/settings.local.json` — local secrets or machine configuration, must remain untracked.
