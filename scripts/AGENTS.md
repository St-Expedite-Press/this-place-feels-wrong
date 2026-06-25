# Scripts Agent Guide

This directory owns root operational scripts and validation helpers.

- Read `../AGENTS.md`, `../ONTOLOGY.md`, and `MEMORY.md` before edits.
- Preserve Windows routing through npm/make wrappers such as `scripts/run-bash.mjs`.
- Keep package scripts, Makefile targets, script docs, and ontology synchronized when commands change.
- Prefer deterministic checks and clear failure messages.

Closeout:

- Run `npm run check:tooling-integrity` after script path or command changes.
- Append a short entry to this directory's `MEMORY.md` and to `../MEMORY.md`.
