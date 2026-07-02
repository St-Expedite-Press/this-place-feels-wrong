# Communications Worker Memory

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
