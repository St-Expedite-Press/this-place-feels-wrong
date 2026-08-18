# Design — Visitor accounts, moderated presets, and the portable knowledge graph

**Status:** Deployed to production 2026-07-27 (backend all 8 phases + chat/admin UI, 71 backend tests). Migrations `0023–0027` applied to prod D1, Worker + all three Pages apps redeployed, `OPENROUTER_API_KEY` set as a Worker secret. Four official presets live (Press Guide, Night Translator, Archivist, + seed). Four scoping decisions locked 2026-07-27 (see §11). **Not yet exercised end-to-end** — a real preset run needs a Turnstile-backed browser session and a graph build needs an owner magic-link login, neither curl-verifiable from the server; the paths are unit-tested and all prerequisites are now in place.
**Date:** 2026-07-27
**Author:** Claude (with owner)
**Supersedes/extends:** the 2026-07-22 audit's "KB grounding" item ([`../../audit/2026-07-22-backend-auth-chat-audit.md`](../../audit/2026-07-22-backend-auth-chat-audit.md)); builds on the owner-auth, admin, and chat-persistence work shipped 2026-07-22 → 2026-07-27 (see root [`MEMORY.md`](../../MEMORY.md)).

---

## 1. What this is, in one paragraph

Give **authenticated visitors** the ability to run the public chat under a **preset** — a bundle of {persona / system prompt, one model from an owner-curated allow-list, a behavioral framework, optional images}. The press ships official presets; visitors can author their own from an interoperable template using the same interface, but a visitor-authored preset is private to its creator until the **owner approves it** for public listing. Separately, chat grounding is driven by a **knowledge graph** that is not merely a database table but a **portable packet**: a self-contained file whose shape is a row-for-row mirror of its D1 representation, so it can be exported, moved, version-controlled, or loaded elsewhere, with D1 being just one interoperable copy rather than the sole home.

Two threads, one design because they share a spine (portable packets + the "select-by-id, resolve server-side" trust model): **(A) personalization via presets**, **(B) portability of both presets and the graph**.

## 2. Non-negotiable constraints this must respect

These are load-bearing, established and audited earlier this session — not preferences:

1. **The browser never transmits a raw system prompt at request time.** Today the client sends a `surface` *enum*; the Worker looks up the server-owned prompt. Presets keep this exact shape: the client sends a **preset ID**, the Worker resolves the already-stored-and-approved config. A visitor's own draft preset resolves only for that visitor's own session. This is what lets accounts + moderation make the feature safe rather than opening a client-controlled-prompt hole. (`AGENTS.md`: "the browser never supplies a system prompt, only picks which server-owned one to use.")
2. **The public Hermes profile stays tool-free, memory-off, and isolated** from the owner profile (`ops/hermes/README.md`, `agents/evals/public-boundary.json`). Everything here lives in the **Worker/D1/admin layer**. Presets choosing a "model" means choosing among **Worker-side upstream configurations**, never granting Hermes tools or reaching the owner profile.
3. **Model choice is an owner-curated allow-list, never free-text.** A preset references a `model_id` that must exist in `preset_models`. Visitors pick from what the owner has enabled; they cannot name an arbitrary upstream model or endpoint.
4. **Anything a visitor can trigger that costs money is rate-limited per identity**, not just per IP.

## 3. Roles / identities (three now, was two)

| Identity | Auth | Can do |
|---|---|---|
| **Owner** (exists) | magic-link, `stex_owner_session` | everything in `apps/admin`, incl. the new preset-moderation queue and model allow-list |
| **Visitor** (new) | magic-link, `stex_visitor_session` | log in, run approved/own presets, author drafts, export/import their own presets + graph packets |
| **Anonymous** (exists) | none | the existing surface-toggle chat, unchanged; cannot author presets |

Visitor auth reuses the **exact mechanism** already built and live for owner auth (hash-only D1 token/session tables, magic-link via Resend, HttpOnly cookie) — it is a second, lower-privilege identity class, not a new auth system. This is the single biggest reason the build is tractable.

## 4. Data model (all additive D1 migrations)

```
visitor_accounts     (id, email, created_at, status)              -- status: active|suspended
visitor_login_tokens (token_hash PK, expires_at, used_at)         -- mirror of owner_login_tokens
visitor_sessions     (session_hash PK, account_id, expires_at, last_seen_at)

preset_models        (id PK, label, upstream_ref, enabled, notes) -- owner-curated allow-list; upstream_ref is Worker-side only, never sent to client
presets              (id PK, creator_account_id NULLABLE,         -- NULL creator = official/press preset
                      name, persona_prompt,                       -- persona_prompt = preset-level framing shared by all steps
                      framework_json, status, created_at, updated_at)
                     -- status: draft|pending|approved|rejected
                     -- NOTE: no single model_id — a preset is a *pipeline* of steps (below)
preset_steps         (id PK, preset_id, step_order,               -- ordered multi-model pipeline (v1 decision)
                      model_id -> preset_models, role_label,
                      instruction, input_source)                  -- input_source: 'user' | 'previous'
preset_assets        (id PK, preset_id, kind, ref)                -- images (avatar/etc); ref = size-capped data-URI in D1 (v1)
preset_moderation    (id PK, preset_id, owner_action, note, acted_at)

kb_entities          (id PK, type, name, description, source_ref) -- row-for-row mirror of the packet's `entities[]`
kb_relations         (id PK, source_entity_id, target_entity_id, type, description)
                     -- row-for-row mirror of the packet's `relations[]`
```

**Visibility rule for `presets`:** `status='approved'` → listed to everyone; any status → visible only to its `creator_account_id`. Official presets are seeded rows with `creator_account_id = NULL, status='approved'`.

### 4a. Pipeline execution semantics (multi-model, v1 decision)

A preset is an **ordered sequence of `preset_steps`**, executed server-side in the Worker:

- Each step calls its own allow-listed model with: the preset-level `persona_prompt`, the step's `instruction`, and its input (`input_source='user'` = the visitor's message + graph grounding; `input_source='previous'` = the prior step's full output).
- **Only the final step streams to the browser.** Intermediate steps run to completion server-side, buffered, and are *not* shown (they're scaffolding — draft/critique/rewrite passes). This keeps the existing SSE-passthrough contract intact for the visible turn.
- **Cost + latency accounting is per-step and per-visitor-identity** — a 3-step preset is 3 upstream calls; the rate limiter and cost caps (§8) must count steps, not requests. This is the main reason multi-model raises risk in phases 2/6.
- **Failure policy:** if a non-final step errors, the pipeline aborts and the visitor gets the standard "couldn't answer just now" message — no partial/leaked intermediate output.
- Anonymous/surface chat is unaffected: it's a zero-step implicit preset (the existing single Hermes call).

## 5. Portable packet shapes

Two packet types, same philosophy as the chat transcript download already shipped: **the file is authoritative, D1 is a disposable mirror.**

**Preset packet** (`GET /api/presets/:id/export`, `POST /api/presets/import`):
```json
{ "version": "1.0", "kind": "preset",
  "preset": { "name", "persona_prompt", "framework", "assets": [...],
              "steps": [ { "step_order", "model_ref", "role_label", "instruction", "input_source" } ] } }
```
Each step's `model_ref` on export is a **stable public label**, not the internal `upstream_ref`; on import the Worker maps each back to an allow-listed `preset_models` row, or rejects/degrades the step if that model isn't enabled here. This is what makes a preset (pipeline and all) movable *between* St. Expedite and any other system that speaks the same shape without leaking your upstream wiring.

**Graph packet** (`GET /api/admin/graph/export`, `POST /api/admin/graph/import`):
```json
{ "version": "1.0", "kind": "knowledge-graph", "generatedAt": "...",
  "entities": [{ "id","type","name","description","source_ref" }],
  "relations": [{ "id","source_entity_id","target_entity_id","type","description" }] }
```
Export is `SELECT → JSON`; import is `JSON → upsert`. No D1-specific types, no autoincrement leakage — loadable into Postgres/SQLite/flat-file unchanged.

## 6. How grounding actually works (the RAG path)

1. **Build (owner-triggered, in `apps/admin`):** an extraction pass over the corpus (v1 scope: the `works` table — books + RICE entries, already structured) produces `kb_entities`/`kb_relations`. Uses the **OpenRouter delegate pattern `AGENTS.md` already documents** for bounded read-only LLM calls — not automatic, not per-request.
2. **Retrieve (per chat turn, in the Worker):** lightweight lookup — match the visitor's latest message against `kb_entities` (D1 FTS or name match), pull the connected relations.
3. **Inject:** append matched entities/relations into the resolved preset's system prompt — the **same injection point** as today's static `CHAT_SYSTEM_PROMPTS`, now with dynamic content. Hermes still gets zero tools and never touches the graph; the Worker is the only reader.

## 7. Moderation flow

1. Visitor authors a preset → `status='draft'`, usable **only by them** immediately.
2. Visitor "submits for listing" → `status='pending'`, appears in the admin review queue.
3. Owner approves (`approved`, now public) or rejects (`rejected`, back to creator-only with a note) — logged in `preset_moderation`.
4. A suspended visitor's approved presets are hidden pending re-review (kill-switch for a persona that later goes bad).

## 8. Abuse controls (public-facing money surface)

- Per-visitor-identity rate limiting (extend the existing D1 `checkRateLimit` keying from IP to identity for authenticated calls).
- Draft presets never execute for anyone but their creator, so an un-reviewed persona can't reach the public under the press's name.
- Model allow-list caps the blast radius of cost abuse — no visitor can select the most expensive model unless the owner enabled it for visitor use.
- Image assets: size/type caps identical to the existing chat-image guard; stored, never executed.

## 9. Phased build

| Phase | Deliverable | Risk |
|---|---|---|
| **0** | Migrations for all tables above; `preset_models` seeded; **no behavior change yet** | low — additive schema only |
| **1** | Visitor auth (`/api/visitor/*`), mirroring owner auth; visitor login UI in `apps/chat` | low — proven mechanism |
| **2** | Preset resolution in `/api/chat` (send preset ID → resolve server-side); **multi-step pipeline execution** with only the final step streamed; official presets only, owner-authored | high — touches the live chat path AND adds multi-call orchestration; guard with the existing "no client prompt" + "no buffering" tests |
| **3** | Visitor preset authoring (incl. pipeline builder) + the interoperable template + export/import packets | med-high |
| **4** | Admin moderation queue + `preset_models` management UI in `apps/admin` | low-med |
| **5** | Knowledge-graph build (owner-triggered extraction) + `kb_*` tables + graph packet export/import | med — LLM extraction cost/quality |
| **6** | Graph-grounded injection into resolved presets in `/api/chat` | med — quality tuning |
| **7** | Per-identity rate limiting, suspension kill-switch, model-cost caps | med — must land before phase 3 is publicly exposed |

**Deploy gating:** phases 2/3/6 change the live public chat — each needs the same real-D1 smoke test + the public-boundary evals green before it ships.

## 11. Locked decisions (2026-07-27)

| Question | Decision | Consequence |
|---|---|---|
| Model stack: single vs. pipeline | **Multi-model pipeline in v1** | `preset_steps` table; server-side buffered intermediate steps; per-step cost/rate accounting; higher risk in phases 2/6 |
| Preset image storage | **Size-capped data-URI in D1** | No R2 binding in v1; hard size cap reusing the chat-image guard; revisit if large/multiple images are needed |
| Graph extraction corpus | **`works` table only (v1)** | Cheapest, cleanest first graph; site/RICE page-copy flattening deferred to v2 |
| Start Phase 0 now vs. hold | **Hold for owner review** | No code written yet; this doc is the review artifact |

## 10. What this does *not* do

- Does not give anonymous visitors preset authoring or model choice (that was explicitly ruled out — it's an abuse surface without identity).
- Does not give Hermes tools, memory, or owner-profile access.
- Does not let a preset name an arbitrary model or endpoint.
- Does not make D1 the authoritative home of anything — every new artifact (preset, graph) is exportable as a portable packet, and that packet is the thing a user can rely on.
