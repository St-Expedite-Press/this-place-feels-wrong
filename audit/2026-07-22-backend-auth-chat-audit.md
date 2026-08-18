# St. Expedite Press — Backend / Auth / Chat Architecture Audit

**Date:** 2026-07-22
**Auditor:** Claude (orchestrator + 3 parallel subagents: backend, chat/agent framework, frontend + prior-audit history)
**Method:** Full read of `apps/backend/src/index.ts` (1804 lines), all D1 migrations, `openapi.yaml`, `wrangler.toml`, `.env.example`; full read of `agents/` (README, AGENTS, MEMORY, both Hermes profiles' `SOUL.md`/`policy.json`, all four `public-guide` skills, `agents/knowledge/sources.json`, `agents/evals/`), `ops/hermes/README.md`, `packages/chat-client/`; full read of `audit/site-audit-2026-05-30.md`, `branding/README.md`, `apps/stex`/`apps/rice` signup-adjacent source and JS.
**Trigger:** Owner requested a deep project audit plus three specific features — email signup, an authentication layer, and conversation persistence/knowledge-base grounding for the public chat.

---

## Executive summary

The codebase is structurally healthy — real payment/donation/submission flows work, `openapi.yaml` matches actual routes with no drift, and per-directory `AGENTS.md`/`MEMORY.md` documentation discipline is unusually strong for a project this size. The backend is a single 1804-line Worker file (`apps/backend/src/index.ts`); modularization is already roadmapped as "Next" in `PHASE-PLAN.md` but not started, and all three requested features add meaningfully to that file.

None of the three requested features start from zero, but each has a real gap:

1. **Email signup** — the backend route and D1 schema are solid and already live (RICE has full working UI). The main site (stex) does not, because its signup form was **deliberately removed on 2026-07-15** in favor of chat as "the site's single intake surface." Building a new standalone form would partially reverse that decision — flagged to the owner, who chose to fold signup into chat instead (see Decision, below).
2. **Auth** — does not exist anywhere in the backend. The one route branded "(protected)" in the docs (`POST /api/updates/import`) was in fact a plain `===` shared-secret comparison with a timing side-channel, no expiry, no rotation, no identity concept (**fixed 2026-07-22**, see `MEMORY.md`). More significant: three D1 tables (`updates_signups`, `contact_submissions`, `donations`) are write-only — there is no owner-facing UI to read any of them. This, not visitor accounts, looks like the real motivating need.
3. **Chat persistence + KB grounding** — confirmed fully stateless: the browser holds the whole conversation in memory (lost on refresh), and the Worker never reads/writes chat content to D1, it's a pure SSE passthrough. "Knowledge" today is a hardcoded system-prompt string plus static skill markdown — no retrieval. The public Hermes profile has `memory`/`tools`/`skills-search` disabled as an explicit **release gate** (`agents/evals/public-boundary.json`), not an oversight — any persistence/grounding design must live entirely in the Worker/D1 layer and never as a capability grant on Hermes itself.

## Decision made

**Q:** Standalone signup form on stex, or fold email capture into the chat flow?
**A (owner, 2026-07-22):** Embed in chat — consistent with the 2026-07-15 "single intake surface" decision, and a natural fit once conversations persist (item 3). No standalone stex signup form will be built.

## Current state in detail

### Backend (`apps/backend/src/index.ts`)

Full D1 schema as of migration `0020`:

| Table | Purpose |
|---|---|
| `updates_signups` | Newsletter list, Substack-export-shaped (~37 enrichment columns) |
| `works` (view: `oncoming_projects`, filtered `kind='book'`) | Unified book/RICE catalog |
| `api_rate_limits` | Fixed-window rate limiter, keyed `METHOD:path:ip:bucketStart` |
| `contact_submissions` | Contact + manuscript-submission metadata (never file contents) |
| `donations` | Stripe donation log, idempotent on `stripe_session_id` |

No users/sessions/tokens/passwords table exists. Route-by-route auth status:

| Route | Auth |
|---|---|
| GET `/api/health`, `/storefront`, `/projects`, `/works` | none (public reads) |
| POST `/api/chat` | Turnstile + D1 rate limit + origin allow-list; **no state persisted** |
| POST `/api/submit`, `/contact`, `/donate/session`, `/updates`, `/updates/unsubscribe` | Turnstile + honeypot |
| POST `/api/stripe/webhook` | Stripe HMAC signature |
| POST `/api/updates/import` | Shared-secret header — **now timing-safe (2026-07-22)**, still no expiry/rotation/identity |

### Chat / Osiris agent framework

```
browser (in-memory array, no localStorage, lost on refresh)
  → POST /api/chat (Worker: rate limit, Turnstile, origin→surface policy,
    prepends hardcoded CHAT_SYSTEM_PROMPTS[surface], no D1 read/write)
  → SSE passthrough, unbuffered, to HERMES_API_URL
  → Cloudflare Tunnel → 127.0.0.1:8643 → "stexpedite-public" Hermes profile
    (separate process/profile from the private "stexpedite" owner profile;
     every tool disabled except vision; memory disabled; SOUL.md + 4 static
     knowledge skills loaded, no dynamic retrieval)
```

Isolation rule (`ops/hermes/README.md`, `agents/evals/public-boundary.json`): the public bridge must never reuse the owner profile, and `memory`/`tools`/`skills-search` are release-gated off on `stexpedite-public`. Any persistence or grounding must be implemented Worker/D1-side, injected into the message list before the Hermes call — never as a Hermes-native capability.

### Frontend

RICE (`apps/rice/`) has working `data-updates-form` signup UI wired to `/api/updates` with good UX (dedup messaging, noscript fallback) — the pattern any future in-chat signup prompt should borrow tone/copy from. stex has only dead code (`updates-signup.js`, unreferenced) and one incidental live path (an email gate inside the `work.astro` "Anglossic Compass" quiz). The 2026-05-30 site audit's praise of the old stex signup form is now stale (form removed 2026-07-15); several other items from that audit (nav-pill wrap at 390px, donate meta description, footer Submit link, gallery loading-ghost text, donate/thanks noindex) were not confirmed fixed and should get a follow-up verification pass — separate from this audit.

## Recommended sequencing

1. ~~Harden `/api/updates/import`'s shared-secret comparison~~ — **done, 2026-07-22**.
2. Owner auth + a read view for `updates_signups` / `contact_submissions` / `donations` — likely resolves the "auth" ask and the visibility gap in one build. *(next up)*
3. Chat persistence (D1-backed conversations, signed anonymous-ID cookie) — includes the in-chat email-capture moment, reusing `/api/updates` under the hood.
4. KB grounding via in-Worker D1 FTS5 over `works` + site copy, injected into the existing per-surface system prompt.
5. Backend modularization (`apps/backend/src/index.ts` → multiple files), threaded through 2–4 rather than done separately after.

## Architecture options considered (not yet decided)

**Auth (item 2):** (a) magic-link owner auth reusing the existing Resend integration + a new `owner_sessions` D1 table + signed HttpOnly cookie — in-repo, extensible to an admin UI; (b) Cloudflare Access in front of admin routes — zero application code, but couples auth to Cloudflare dashboard config rather than the repo. No visitor-facing accounts are justified by anything currently in the codebase.

**Persistence (item 3):** D1 `chat_conversations`/`chat_messages` tables keyed by a signed cookie (recommended — fits existing stack, no new binding) vs. a Durable Object per conversation (more capability than needed at current traffic) vs. KV with TTL (simplest but no transactional guarantees, worse fit for enforcing turn/length limits). Note: CORS currently hardcodes `access-control-allow-credentials: false` (`index.ts:117`) — will need to flip, plus cookie domain scoping across `stexpedite.press` / `rice.stexpedite.press` / `chat.stexpedite.press`. Visitor transcripts are the first PII-adjacent data this backend stores outside explicit-consent submissions — needs a retention/deletion policy from day one.

**KB grounding (item 4):** D1 FTS5 over existing `works` data + site copy (recommended first pass — no new binding, keeps Hermes tool-free) vs. Cloudflare Vectorize + embeddings (better recall, but a new binding, an embedding pipeline, and another upstream credential to isolate) vs. expanding `agents/knowledge/sources.json` into a real fetch-and-cache step (keeps the existing allowlist as actual enforcement, least precise of the three).
