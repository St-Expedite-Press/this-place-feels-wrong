# RICE Scripts Agent Guide

This directory owns Python build and validation scripts for the static asset system.

- Read `../AGENTS.md`, `../ONTOLOGY.md`, and `MEMORY.md` before edits.
- Keep scripts dependency-light and compatible with local PowerShell invocation.
- Avoid changing generated outputs directly; update scripts and rerun generators.
- Preserve deterministic catalog and derivative behavior.
- `build_responsive_images.py` owns `assets/responsive/` and its manifest.
- `build_public_site.py` owns ignored `_site/`; its allowlist is the deployment boundary.

Closeout:

- Run `python -m py_compile *.py` for script edits.
- Run relevant asset build/check scripts when generator behavior changes.
- Run `build_public_site.py` and inspect `_site/` when public-boundary logic changes.
- Append a short entry to this directory's `MEMORY.md` and to `../MEMORY.md`.
