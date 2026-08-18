# St. Expedite Press — Phase Plan

**Last updated:** 2026-07-27

## Current program — Osiris consolidation 🚧 IN PROGRESS

| Task | Status |
|---|---|
| Explicit app roots: St. Expedite, RICE, chat, backend | ✅ Foundation complete |
| Shared chat transport and versioned request/content schemas | ✅ Foundation complete |
| Public-guide and owner-worker agent policies/evals | ✅ Foundation complete |
| Backend route modularization and grounded public context | ⬜ Next — see sub-plan below; supersedes this row's original scope |
| Separate-OS-user public Hermes hardening | ⬜ Post-launch hardening; isolated profile/listener verified |

### Sub-plan — Owner auth, chat persistence & KB grounding (from 2026-07-22 audit)

Full findings: [`audit/2026-07-22-backend-auth-chat-audit.md`](audit/2026-07-22-backend-auth-chat-audit.md).

| Task | Status |
|---|---|
| Harden `/api/updates/import` shared-secret comparison (timing-safe) | ✅ Done 2026-07-22 |
| Owner auth + read view for `updates_signups`/`contact_submissions`/`donations` | ✅ Done — built 2026-07-22, deployed live 2026-07-27 (`admin.stexpedite.press`, `deploy-admin.yml`) |
| Chat conversation persistence + in-chat email-capture moment | ✅ Done 2026-07-22 — D1-backed, keyed by a client-generated `conversationId` (not a cookie — simpler, avoids new CORS/session complexity for chat specifically); inline signup form calls `/api/updates` directly |
| Chat knowledge-base grounding (in-Worker D1 FTS5 over `works` + site copy) | ⬜ Planned |
| Backend modularization (`apps/backend/src/index.ts` → multiple files) | ⬜ Planned — threaded through the above rather than done as a separate pass |
| Preview chat deployment and canary | ✅ Pages, custom DNS, CORS, and edge smoke checks passed |
| Commit/push and sequential production release | ✅ Commit `1ce33e5`; all four deployment workflows passed |
| Canonical consolidated source checkout on EC2 | ✅ Active at `/home/ec2-user/src/this-place-feels-wrong`; prior base commit remains in Git history, but its uncommitted overlay was not retained by the attempted archive move |

Public and owner agents remain separate identities under one framework. The
browser always calls the backend; it never calls Hermes or selects a profile.
The public free-model route remains prototype-only even though the production
transport is live; budget controls, grounded context, and OS-user isolation are
still required hardening work.

---

## Phase 1 — Audit ✅ COMPLETE

| Task | Status |
|------|--------|
| Live page audit (stexpedite.press) | ✅ Done — full audit 2026-05-30 → `audit/site-audit-2026-05-30.md` |
| Content inventory | ✅ Done — all 11 pages catalogued in audit report |
| Brand identity review | ✅ Done — design system analysis in audit report |

**Top 3 fixes before Phase 2:**
1. Add buy link to *Lift Wind / Love Heat* (critical — revenue leak)
2. Replace `lift-wind-cover.jpg` with working webp cover image
3. Fix intro text duplication on `/about` and `/donate/thanks`

---

## Phase 2 — Design System ⬜ PENDING

| Task | Status |
|------|--------|
| Design variants (min 3) | ⬜ |
| Sandbatch critique | ⬜ |
| Design system locked | ⬜ |

---

## Phase 3 — Build ⬜ PENDING

| Task | Status |
|------|--------|
| Scaffold + routing | ⬜ |
| Content migration | ⬜ |
| Events / catalog integration | ⬜ |

---

## Phase 4 — Launch ⬜ PENDING

| Task | Status |
|------|--------|
| QA pass | ⬜ |
| DNS verification | ⬜ |
| Launch | ⬜ |
