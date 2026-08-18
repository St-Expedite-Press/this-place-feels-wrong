# Admin app memory

## [2026-07-27] — Preset moderation, model allow-list, knowledge-graph panels

**Changed:** Added three dashboard panels: a preset review queue (view detail, approve/reject → `/api/admin/presets/*`), a model allow-list (list/add/toggle → `/api/admin/models*`), and a knowledge-graph panel (rebuild from catalog, download packet, import packet → `/api/admin/graph/*`). Part of the visitor-presets feature — see root `MEMORY.md`.
**Checks:** `node --check app.js`, `npm run build:admin`. Backend contract covered by the 71-test suite. Not verified against live backend beyond that.
**Follow-ups:** Same deploy prerequisites as the backend entry (OpenRouter secret, migrations, redeploys).
**Tooling notes:** none.

## [2026-07-27] — Deployed live at admin.stexpedite.press

**Changed:** Created Cloudflare Pages project `stexpedite-admin`, deployed `dist/`, added the `admin.stexpedite.press` custom domain (Pages API + a hand-created DNS CNAME — the zone being in the same account did not auto-provision it), added `.github/workflows/deploy-admin.yml`. Full detail and verification steps in root `MEMORY.md`.
**Checks:** `admin.stexpedite.press` serves 200 for `/`, `/app.js`, `/styles.css`, `/favicon.svg`. CORS preflight from that origin to `stexpedite.press/api/admin/me` returns `access-control-allow-credentials: true` scoped to the specific origin.
**Follow-ups:** No one has completed a real end-to-end login (click the emailed link) yet. `deploy-admin.yml`'s CI deploy path is untested — only the local `wrangler` deploy has actually run.
**Tooling notes:** none.

## [2026-07-22] — New app — Owner dashboard for the three write-only D1 tables

**Changed:** Created `apps/admin/` from scratch (Astro static, mirroring `apps/chat`'s shape: `astro.config.mjs`, `src/pages/index.astro`, `public/{app.js,styles.css,favicon.svg}`, `scripts/build.mjs`). One page: a magic-link login form, and — once `/api/admin/me` reports `authenticated: true` — three read-only tables (signups, submissions, donations) fetched from the new `/api/admin/*` routes with `credentials: "include"`. Self-contained local CSS custom properties (dark/void, same idiom `apps/chat` already uses), not the `apps/stex` `tokens.css`/`data-brand-mode` system — this is a utility tool outside that design system, same precedent as chat.
**Checks:** `npm run build:admin` succeeds (Astro static build, 1 page); output HTML/asset references verified by hand (no broken paths). Not yet verified against a live backend — the auth/data contract is covered by `apps/backend/test/index.test.ts`'s new "admin auth" suite (6 tests, all passing) instead, since this app has no test runner of its own and there's no local D1/wrangler dev loop wired up yet for a live end-to-end pass.
**Follow-ups:** No Cloudflare Pages project or `deploy-admin.yml` CI workflow exists yet — both are a separate, explicitly-authorized step (see root `MEMORY.md`). `admin.stexpedite.press` DNS/custom hostname also doesn't exist yet. A live smoke test (real magic-link email, real cookie, real D1) should happen once those exist, not just the mocked backend test suite.
**Tooling notes:** `root package.json` gained `apps/admin` in `workspaces`, plus `dev:admin`/`build:admin`/`deploy:admin` scripts (the last one unused until the Pages project exists — same as how `deploy:chat`/`deploy:rice` predated their own project setup). `build:all` now includes `build:admin`.
