# St. Expedite Press — Project Processes

Project-specific processes. Workspace-level processes (Session Lifecycle, Orchestration, Change Logging, Workspace Maintenance, Project Onboarding, Phase Transition) live in root `PROCESSES.md`.

Full task routing, command matrix, and subagent policy are in **`AGENTS.md`** §3–§8.

**Process index:**
- [Live Site Fix Cycle](#process-live-site-fix-cycle)
- [Asset Sync Workflow](#process-asset-sync-workflow)
- [Release Workflow](#process-release-workflow)
- [D1 Migration Workflow](#process-d1-migration-workflow)

---

## Process: Live Site Fix Cycle

**When:** Deployed site has identified bugs, UX issues, or infrastructure gaps.  
**Trigger:** User surfaces a bug list, audit findings, or "fix these."

**Steps:**
1. Read `AGENTS.md` and last 30 lines of `MEMORY.md`
2. Triage: visual/UX · copy · infrastructure · a11y · performance
3. Fix in priority order: infrastructure first, then UX, then copy
4. Run the narrowest test that covers each fix
5. Run `npm run check` before committing
6. Commit descriptively — what was broken, not just what changed
7. Push; confirm CF Pages deploy triggered (GitHub Actions: `validate` → `deploy`)
8. Move resolved items to `AGENTS.md` §10 Closed/Resolved

**Outstanding blockers (as of 2026-06-01):**
- Lift Wind buy URL — update `migrations/0015_buy_url_lift_wind.sql` and run once confirmed

---

## Process: Asset Sync Workflow

**When:** Adding, replacing, or removing any image or media file.

**Steps:**
1. Add/edit files in `assets/source/` only — never directly in `apps/web/public/assets/`
2. Run `npm run assets:sync` — copies processed assets to public
3. Run `npm run assets:check` — verifies no drift between source and public
4. If manifest SHA256s changed, the check will fail — re-run sync to fix

**Formats:** WebP preferred for images. SVG for icons and logos. GIF only as source format.

---

## Process: Release Workflow

**When:** Deploying a new version to production.

**Steps:**
1. Run `npm run release:dry-run` — checks all gates without pushing
2. If clean: `npm run release` — full release (calls `scripts/release.sh` through the Windows-safe npm wrapper)
3. Release script runs: assets:check → runtime:config → smoke:api → CF Pages deploy → log evidence
4. Verify the CF Pages deploy completes (GitHub Actions `validate` + `deploy` both green)
5. Run `npm run smoke:api` against production if any Worker routes changed
6. Update `AGENTS.md` §10 with any newly resolved items

---

## Process: D1 Migration Workflow

**When:** Adding or updating database schema, or running a data patch.

**Rules:**
- Never edit existing migration files — always add a new numbered file
- File naming: `apps/communications-worker/migrations/NNNN_[slug].sql`
- Test locally: `wrangler d1 execute stexpedite-press-db --local --file=migrations/NNNN_[slug].sql`
- Deploy: `wrangler d1 execute stexpedite-press-db --file=migrations/NNNN_[slug].sql`
- Document in `apps/communications-worker/README.md`

**Pending migration:** `0015_buy_url_lift_wind.sql` — update `TODO_REPLACE_WITH_AMAZON_OR_VENDOR_URL` and run against production D1 once the vendor URL is confirmed.
