# Backend Worker Memory

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
