# Press Docs Agent Guide

This directory owns repository documentation, ontology companions, infrastructure notes, and operational docs.

- Read `../AGENTS.md`, `../ONTOLOGY.md`, and `MEMORY.md` before edits.
- Keep `ontology/ontology.md` and `ontology/project-ontology.json` synchronized when navigation or contracts change.
- Do not place secrets, `.env` values, or private tokens in docs.
- Preserve public route and API route lists when they are source-of-truth coupled to code.

Closeout:

- Run `npm run check:tooling-integrity` after ontology, command, route, skill, or runbook changes.
- Append a short entry to this directory's `MEMORY.md` and to `../MEMORY.md`.
