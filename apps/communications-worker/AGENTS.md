# Communications Worker Agent Guide

This directory owns the Cloudflare Worker API.

- Read `../../AGENTS.md`, `../../ONTOLOGY.md`, and `MEMORY.md` before edits.
- Read `openapi.yaml` and `src/index.ts` before changing routes or payloads.
- Never edit existing D1 migrations; add a new numbered migration.
- Keep Worker source, OpenAPI, tests, docs, and ontology synchronized when API contracts change.
- Use Wrangler through npm scripts or documented wrappers.

Closeout:

- Run `npm run test` from this directory or root `npm run test:worker` for Worker changes.
- Append a short entry to this directory's `MEMORY.md` and to `../../MEMORY.md`.
- Update ontology/docs when routes, bindings, migrations, or validation commands change.
