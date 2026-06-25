# Operations Agent Guide

This directory owns operational runbooks, stability references, and operations scripts.

- Read `../AGENTS.md`, `../ONTOLOGY.md`, and `MEMORY.md` before edits.
- Prefer npm or make wrappers over direct shell-script invocation on Windows.
- Do not mutate Cloudflare, secrets, production D1, or deployments without explicit authorization.
- Keep runbooks, scripts, and ontology aligned when operational commands change.

Closeout:

- Run the narrowest relevant runtime or tooling check; use dry-run modes where available.
- Append a short entry to this directory's `MEMORY.md` and to `../MEMORY.md`.
