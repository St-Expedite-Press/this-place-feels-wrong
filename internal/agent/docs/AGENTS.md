# Internal Agent Protocols

Operational guidance for internal maintenance work in this repository.

## Repo Invariants

- Public web source lives in `apps/web/src/`
- Generated site output lives in `dist/site/`
- Worker/API code lives in `apps/communications-worker/`
- Internal maintenance tooling lives in `internal/agent/`
- Archived material lives in `archive/`

## Change Rules

- Do not edit `dist/site/` by hand; regenerate it from source.
- Keep public URLs and `/api/*` contracts stable unless a change explicitly calls for a breaking migration.
- Do not commit secrets.
- If page, asset, or route topology changes, update:
  - `README.md`
  - `DEPLOYMENT.md`
  - `docs/state-of-play.md`
  - `docs/ontology/project-ontology.json`

## High-Signal Entry Points

- web build: `scripts/build-site.mjs`
- web source: `apps/web/src/`
- worker: `apps/communications-worker/src/index.ts`
- worker contract: `apps/communications-worker/openapi.yaml`
- release tooling: `internal/agent/tools/`
