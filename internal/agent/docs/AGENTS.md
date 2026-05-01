# Internal Agent Protocols

Operational guidance for internal maintenance work in this repository. Root `AGENTS.md` is canonical for current agent workflow rules; this file keeps internal runbook-specific reminders.

## Repo Invariants

- Public web source lives in `apps/web/src/`.
- Authored web assets live in `apps/web/public/assets/`.
- Generated site output lives in `apps/web/dist/`.
- Worker/API code lives in `apps/communications-worker/`.
- Worker API contract lives in `apps/communications-worker/openapi.yaml`.
- Internal maintenance tooling lives in `internal/agent/`.
- Repo-scoped Codex skills live in `.agents/skills/`.
- Archived material lives in `archive/`.

## Change Rules

- Do not edit `apps/web/dist/` by hand; regenerate it from source.
- Keep public URLs and `/api/*` contracts stable unless a change explicitly calls for a breaking migration.
- Do not commit secrets.
- If page, asset, route, command, or agent topology changes, update the relevant source-of-truth docs:
  - `README.md`
  - `DEPLOYMENT.md`
  - `docs/state-of-play.md`
  - `docs/ontology/project-ontology.json`
  - `AGENTS.md`
  - `CLAUDE.md`
  - `apps/web/src/README.pages.md`
  - `apps/communications-worker/README.md`
  - `apps/communications-worker/openapi.yaml`

## High-Signal Entry Points

- web build: `npm run build`
- full validation: `npm run check`
- web source: `apps/web/src/`
- worker implementation: `apps/communications-worker/src/index.ts`
- worker contract: `apps/communications-worker/openapi.yaml`
- release tooling: `internal/agent/tools/`
- repo skills: `.agents/skills/`
