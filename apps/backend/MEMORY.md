# Backend Worker Memory

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
