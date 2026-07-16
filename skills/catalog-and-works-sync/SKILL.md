---
name: catalog-and-works-sync
description: Reconcile the unified D1 works catalog against the stex site data and RICE's static fallback manifest. Use when a book or RICE work is added, changed, or removed, or when catalog data looks stale or inconsistent between the API and a frontend.
---

# Catalog and Works Sync

## Workflow

1. Read `apps/backend/migrations/0017_unify_works.sql` and
   `0018_seed_rice_works.sql` to understand the unified `works` table shape
   (it replaced the earlier separate `oncoming_projects` migrations —
   `0002`–`0010`, `0016` are historical context, not the live schema).
2. Compare three sources for drift:
   - `GET /api/works` (and `?program=rice`) — the live D1-backed truth.
   - `apps/stex/src/data/site.json` — any book data duplicated into the
     static site build.
   - `apps/rice/assets/articles.json` — RICE's static availability
     fallback, used when the API is unreachable (per `ONTOLOGY.md`).
3. Flag: works present in D1 but missing from a frontend's static fallback,
   or vice versa; stale cover image paths (`0010_cover_image_paths.sql`,
   `0016_cover_image_lift_wind_webp.sql`); missing buy URLs
   (`0007_oncoming_projects_buy_url.sql`, `0015_buy_url_lift_wind.sql` —
   note `PHASE-PLAN.md` has previously tracked a placeholder buy-URL as a
   revenue-impacting gap, worth checking it's still resolved).
4. Propose a new, numbered, append-only migration for any schema-level fix —
   never edit an existing migration file.
5. After a data change, confirm `apps/rice/assets/articles.json` was
   regenerated (`apps/rice/scripts/build_public_site.py`) if RICE works
   changed, so the static fallback doesn't drift from D1 again.

## Guardrails

- D1 migrations are append-only (root `AGENTS.md`). Never edit
  `0001`–`0019`.
- This is a read/plan skill; applying a migration or deploying is a
  separate, explicitly-authorized step.
