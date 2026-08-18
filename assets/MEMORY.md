# Press Assets Memory

## 2026-07-16 — Assets — Fixed stale `apps/web` references; regenerated manifests

**Changed:** An earlier `apps/web` → `apps/stex` app rename had left `assets/AGENTS.md`, `assets/README.md`, `assets/source/README.md`, `assets/source/gif/README.md`, and `assets/source/img/README.md` referencing the dead path. Fixed all five, and regenerated `assets/manifest.json`/`.txt` via `npm run assets:sync` (they were stale for the same reason — the generator script itself already correctly hardcodes `apps/stex/...`, only the checked-in output hadn't been regenerated since the rename). This was Phase 0 of a larger effort to standardize shared brand-asset delivery to `apps/chat` and (eventually) `apps/rice`, which today only `apps/stex` receives via `sync-assets.sh`.
**Checks:** `npm run assets:check` and `npm run check:docs` pass; `grep -rn "apps/web" assets/` returns nothing.
**Follow-ups:** Extending `sync-assets.sh` beyond `apps/stex` is blocked on `apps/rice` and `apps/chat` sharing Astro's `public/` convention (chat did, as of this same session; RICE migration is a separate, larger follow-up).

## 2026-06-25 — Assets — Local agent scaffold

**Changed:** Added local assets guide and memory.
**Checks:** npm run check and git diff --check passed for the scaffold.
**Follow-ups:** Keep future entries focused on canonical source, sync, manifests, and provenance.
**Tooling notes:** Asset workflow remains source-first with npm sync/check wrappers.
