# RICE Assets Agent Guide

This directory owns asset inventories and metadata for the static RICE site.

- Read `../AGENTS.md`, `../ONTOLOGY.md`, and `MEMORY.md` before edits.
- Do not store secrets or private credentials in asset metadata.
- Keep `catalog.json` and `site-assets.json` consistent with the generator scripts.
- Keep `responsive.json` and `responsive/` generator-owned; do not hand-edit responsive outputs.
- Treat catalogs, masters, prompts, and the asset browser as internal. Verify `build_public_site.py` excludes them.
- Prefer changing canonical source records or scripts over hand-editing generated measurements.

Closeout:

- Run the responsive builder, `python ../scripts/check_assets.py`, and the public-site builder after public image changes.
- Append a short entry to this directory's `MEMORY.md` and to `../MEMORY.md`.
