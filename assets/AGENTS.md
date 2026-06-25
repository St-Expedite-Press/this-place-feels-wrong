# Press Assets Agent Guide

This directory owns canonical media sources and generated asset manifests.

- Read `../AGENTS.md`, `../ONTOLOGY.md`, and `MEMORY.md` before edits.
- Canonical media belongs in `source/`.
- Do not hand-edit generated manifest content unless the generator contract changes.
- After source media changes, run `npm run assets:sync` and `npm run assets:check` from the repo root.
- CSS, JS, and fonts are authored under `apps/web/public/assets/`, not here.

Closeout:

- Append a short entry to this directory's `MEMORY.md` and to `../MEMORY.md`.
- Update ontology/docs when asset ownership, manifest behavior, or sync commands change.
