# St. Expedite Press — Phase Plan

**Last updated:** 2026-07-14

## Current program — Osiris consolidation 🚧 IN PROGRESS

| Task | Status |
|---|---|
| Explicit app roots: St. Expedite, RICE, chat, backend | ✅ Foundation complete |
| Shared chat transport and versioned request/content schemas | ✅ Foundation complete |
| Public-guide and owner-worker agent policies/evals | ✅ Foundation complete |
| Backend route modularization and grounded public context | ⬜ Next |
| Separate-OS-user public Hermes hardening | ⬜ Post-launch hardening; isolated profile/listener verified |
| Preview chat deployment and canary | ✅ Pages, custom DNS, CORS, and edge smoke checks passed |
| Commit/push and sequential production release | ✅ Commit `1ce33e5`; all four deployment workflows passed |

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
