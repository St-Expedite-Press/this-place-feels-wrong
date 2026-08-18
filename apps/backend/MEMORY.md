# Backend Worker Memory

## 2026-07-27 — Presets, visitor auth, knowledge graph (8-phase feature)

**Changed:** Migrations `0023–0026`. Visitor magic-link auth (`/api/visitor/*`). Server-resolved multi-model preset pipelines on `/api/chat` (presetId → OpenRouter steps, final streams). Graph grounding injected Worker-side. Preset authoring + portable packets. Admin moderation + model allow-list + visitor suspend. Owner-triggered graph extraction + graph packets. Step-weighted per-identity preset budget (reuses `api_rate_limits`). Full detail in root `MEMORY.md`.
**Checks:** `npm run test:backend` — 71/71. Migrations executed against real SQLite. Not deployed.
**Follow-ups:** `wrangler secret put OPENROUTER_API_KEY` + apply `0023–0026` + redeploy before this works in prod. `openapi.yaml` bumped to 1.12.0.
**Tooling notes:** OpenRouter is the preset/graph upstream (owner key), distinct from the Hermes bridge; the public Hermes profile is unchanged (tool-free, memory-off).

## 2026-07-27 — Deploy — Shipped 2026-07-22's auth/persistence work to production

**Changed:** `wrangler d1 migrations apply --remote` (0021, 0022) then `wrangler deploy --keep-vars`. Full detail in root `MEMORY.md`.
**Checks:** `GET /api/health` → `ownerAuthConfigured: true`; live `/api/admin/login`, `/api/admin/me`, `/api/chat/history` smoke tests against real D1.
**Follow-ups:** Cron trigger (`0 9 * * *`, retention purge) is now live — first real run not yet observed, worth checking Cloudflare's cron trigger logs in ~a day.
**Tooling notes:** none.

## 2026-07-22 — Chat — Conversation persistence + retention purge

**Changed:** Migration `0022_chat_conversations.sql` (`chat_conversations`, `chat_messages`). `POST /api/chat` accepts optional `conversationId`; persists the user turn before the Hermes call and the assistant turn after the SSE stream completes (via a `TransformStream` that passes bytes through unmodified — the existing no-buffering test is the regression guard for that). New `GET /api/chat/history`. New `scheduled()` export + `wrangler.toml` `[triggers]` cron purges rows older than 30 days. Full detail in root `MEMORY.md`.
**Checks:** `npm run test:backend` — 50/50 pass.
**Follow-ups:** `[triggers]` only takes effect on next deploy. No live D1/Hermes verification yet.
**Tooling notes:** `handleChat` and `export default`'s `fetch` both gained an optional `ctx: ExecutionContext` parameter (hand-rolled minimal type, matching this file's existing convention of not depending on `@cloudflare/workers-types`) — optional specifically so the 46 pre-existing tests calling `worker.fetch(req, env)` with two args keep working unchanged.

## 2026-07-22 — Auth — Owner magic-link sessions + `/api/admin/*`

**Changed:** New migration `0021_owner_sessions.sql` (`owner_login_tokens`, `owner_sessions`, both hash-only). New `Env` vars `OWNER_EMAIL`/`ADMIN_APP_URL`. New routes: `POST /api/admin/login`, `GET /api/admin/verify`, `GET /api/admin/me`, `POST /api/admin/logout`, `GET /api/admin/{signups,submissions,donations}` — full detail in root `MEMORY.md`. `withCors`'s `access-control-allow-credentials` is now `true` (was hardcoded `false`) and `https://admin.stexpedite.press` joined the origin allow-list — needed so the new `apps/admin` app's cross-origin `fetch(..., {credentials:"include"})` calls actually carry the session cookie.
**Checks:** `npm run test:backend` — 46/46 pass.
**Follow-ups:** `POST /api/admin/login` and `/logout` ride the existing D1 `checkRateLimit` (all POST routes do). The GET routes (`verify`/`me`/`signups`/`submissions`/`donations`) don't — same as every other existing GET route in this file (`checkRateLimit` only runs on the POST branch) — acceptable since they're session-gated, not open, but worth knowing if `/api/admin/verify` token-guessing ever becomes a concern (256-bit random tokens make that impractical today).
**Tooling notes:** none.

## 2026-07-22 — Security — Timing-safe comparison for `/api/updates/import` auth

**Changed:** `requireImportAuth()` used `===` on the raw `x-import-token` header vs `UPDATES_IMPORT_TOKEN`, which leaks a timing signal via early exit on mismatch. Added `timingSafeEqual()` (SHA-256 digest both sides to a fixed 32 bytes, then a non-short-circuiting XOR compare) and made `requireImportAuth` async; updated its single call site to `await` it. No behavior change, no schema change.
**Checks:** `npm run test:backend` — 40/40 pass (existing import-auth accept/reject/CORS-preflight tests cover this path already).
**Follow-ups:** This route still has no expiry/rotation — just a static shared secret, now compared safely rather than unsafely. If an owner-auth system gets built (see root `MEMORY.md` 2026-07-22 entry), this route is a natural candidate to migrate onto it instead of a standalone token.
**Tooling notes:** none.

## 2026-07-16 — D1 — Recovered missing `api_rate_limits` table in production

**Changed:** `d1_migrations` recorded `0008_api_rate_limits.sql` as applied, but the table did not exist in the live `stexpedite-updates` database — `checkRateLimit()` in `src/index.ts` was silently failing open (rate limiting disabled) on every request instead of erroring loudly. Added append-only `migrations/0020_recreate_api_rate_limits.sql` (`IF NOT EXISTS`-guarded, same shape as 0008) rather than editing the existing migration file.
**Checks:** Verified locally first (`wrangler d1 migrations apply --local`, confirmed table creation), then applied to remote with explicit authorization; confirmed `api_rate_limits` exists in production afterward via direct query.
**Follow-ups:** Root cause of the original table's disappearance despite the migration ledger showing it applied was not investigated.
**Tooling notes:** none.

## 2026-07-15 — Chat — Per-origin surface allow-list

**Changed:** Replaced the single-forced-surface `surfaceForOrigin` with an allow-list + default per origin (`surfacePolicyForOrigin`). `stexpedite.press`/`www` stay locked to `stex`, `rice.stexpedite.press` to `rice` — unchanged behavior — but `chat.stexpedite.press` may now choose between `openui` (default) and `stex`, making its visitor-facing surface toggle load-bearing instead of cosmetic. No `/api/*` schema change — additive, not breaking. Also updated all three `CHAT_SYSTEM_PROMPTS` to drop stale `/connect` references and point manuscript/human-contact guidance at `https://chat.stexpedite.press`'s Submit work button and `editor@stexpedite.press`.
**Checks:** 32 Worker tests pass (added: `chat.stexpedite.press` + `surface: "stex"` → 200 with the stex prompt; same origin with no `surface` → 200 with the default openui prompt; kept the existing `rice` origin mismatch-rejection test as a regression guard).
**Tooling notes:** No D1 migration needed — only routing/prompt logic changed. `/api/contact` handler is untouched but now unreachable from any UI (folded into chat's email guidance) — intentionally orphaned, not a bug.

## 2026-07-14 — Chat — Server-owned surface instructions

**Changed:** Added server-owned publication chatbot instructions for `stex`/`rice` and a general-purpose text instruction for `openui`; browser clients still cannot supply a system message, model, profile, upstream, or authorization.
**Checks:** All 31 Worker tests pass, including surface-specific instruction selection.
**Tooling notes:** One zero-tool public Hermes runtime remains sufficient because every surface shares the same capability boundary while the Worker owns semantic routing.

## 2026-07-14 — Backend — Manuscript attachment delivery

**Changed:** Added bounded multipart parsing, file extension/MIME allowlists, Resend editor attachments, submitter receipts, and append-only attachment metadata migration `0019`; manuscript contents never enter D1.
**Checks:** 30 Worker tests pass, including attachment isolation, unsupported-file rejection, and non-fatal receipt failure.
**Follow-ups:** Apply migration `0019` before deploying and run a live Turnstile upload canary.
**Tooling notes:** A 10 MiB file cap leaves margin under Resend's post-Base64 email limit and Worker memory limits.

## 2026-07-14 — Backend — Explicit product and surface contract

**Changed:** Moved the Worker from `apps/communications-worker` to `apps/backend`, added validated `stex`, `rice`, and `openui` client surfaces, and retained compatibility for legacy clients without a surface field.
**Checks:** All 27 Worker tests passed, including origin/surface acceptance and mismatch rejection.
**Follow-ups:** Split transport, policy, grounding, persistence, and owner-control services before adding richer data-model behavior.
**Tooling notes:** Public requests still reach only the isolated public Hermes identity through the Worker.

## 2026-07-13 â€” Worker â€” Constrained public Hermes chat bridge

**Changed:** Added `POST /api/chat` with a 32 KiB body cap, bounded alternating user/assistant text history, shared D1 rate limiting, optional Turnstile verification, server-only Hermes authentication, sanitized upstream failures, and pass-through SSE streaming. Documented `HERMES_API_URL` and `HERMES_API_KEY`; no D1 migration was required.
**Checks:** Worker tests and `git diff --check` run at closeout.
**Follow-ups:** Configure the route only against a separately isolated, non-privileged public Hermes profile; build the shared browser chat UI separately.
**Tooling notes:** Existing Worker CORS, Turnstile, rate-limit, and Vitest patterns were directly reusable.

---

## 2026-06-25 — Worker — Local agent scaffold

**Changed:** Added local Worker guide and memory.
**Checks:** npm run check and git diff --check passed for the scaffold.
**Follow-ups:** Record future route, migration, binding, and test-contract changes here.
**Tooling notes:** Worker work now has a local place to log OpenAPI and D1 workflow lessons.

---

## 2026-06-30 — Worker — Permit RICE update signups

**Changed:** Added `https://st-expedite-press.github.io` to the credential-free browser CORS allowlist and added a preflight test; documented RICE as a first-party `/api/updates` consumer.
**Checks:** 21 Worker tests and the full press check passed.
**Follow-ups:** Deploy the Worker before relying on the RICE form in production.
**Tooling notes:** No route, payload, D1 schema, secret, or migration changed.
