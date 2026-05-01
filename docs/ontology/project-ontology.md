# Project Ontology

Primary machine-readable map:

- `docs/ontology/project-ontology.json`

## High-Signal Structure

- Web source: `apps/web/src/`
- Web authored assets: `apps/web/public/assets/`
- Web output: `apps/web/dist/`
- Web build command: `npm run build`
- Brand package: `branding/`
- Worker implementation: `apps/communications-worker/src/index.ts`
- Worker contract: `apps/communications-worker/openapi.yaml`
- D1 migrations: `apps/communications-worker/migrations/`
- Internal tooling: `internal/agent/`
- Repo skills: `.agents/skills/`
- Agent instructions: `AGENTS.md` and `CLAUDE.md`
- Archive: `archive/`

## Notes

- Treat `apps/web/src/` and `apps/web/public/assets/` as editable web source.
- Treat `branding/` as exportable design-system documentation and token guidance, not runtime source.
- Treat `apps/web/dist/` as generated output only.
- Treat `archive/` as non-live material.
- Update the JSON ontology whenever routes, commands, apps, skills, or deploy paths change.
