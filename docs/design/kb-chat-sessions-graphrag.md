# Design — Knowledge-base chat on a new Hermes profile: pluggable KB, sessions, GraphRAG

**Status:** Proposed (not started) — owner asked for this as project #2 of three (2026-07-27). Actionable build plan added §11, grounded in verified Hermes profile mechanics.
**Builds on:** the presets/portable-graph work ([`visitor-presets-and-portable-graph.md`](visitor-presets-and-portable-graph.md)), visitor auth, chat persistence, and the isolated-Hermes boundary ([`../../ops/hermes/README.md`](../../ops/hermes/README.md)).

---

## 1. What it is

A **fuller chat product**, distinct from the lightweight "Ask the press" site widget (#1, already live on `stexpedite-public`). It runs on **its own new Hermes profile**, and adds three things the current chat doesn't have:

1. **Pluggable external knowledge base** — one KB abstraction with **three interchangeable backends**: (a) load a **portable graph packet**, (b) **upload documents** that get chunked/embedded/indexed here, (c) **connect a live external source** queried at chat time.
2. **Session management** — named, saved, resumable conversations tied to a **visitor account** (not the anonymous cookie-keyed persistence #1/current chat use).
3. **GraphRAG** — graph retrieval + injection; this is the "graph" backend of the pluggable KB, generalized from the single works-graph we already built.

Where the three products sit:

| Surface | Profile | Purpose |
|---|---|---|
| Site widget (#1) | `stexpedite-public` | lightweight "ask the press" — live |
| Public chat + presets | `stexpedite-public` | preset pipelines, moderated custom assistants — live |
| **KB chat (#2, new)** | **`stexpedite-studio` (new)** | KB-grounded, session-managed research chat |

## 2. Non-negotiable constraints (same posture as everything prior)

1. **Client never transmits a system prompt.** The browser sends a **KB id + session id + (optional) preset id**; the Worker resolves everything server-side. Same trust model as surfaces and presets.
2. **All KB retrieval happens in the Worker**, injected into the prompt — **never as a Hermes tool**. The new `stexpedite-studio` profile stays tool-free and memory-off, isolated from the owner profile, exactly like `stexpedite-public` (separate process/port/keys/ingress per `ops/hermes/README.md`).
3. **External-connector credentials are Worker secrets**, never in D1, never sent to the client, never handed to Hermes.
4. **Per-identity, step/query-weighted budgets** extend to KB retrieval + embedding calls (cost control).

## 3. New Hermes profile

A third isolated profile `stexpedite-studio` on the EC2 host, its own port + `HERMES_STUDIO_API_URL` / `HERMES_STUDIO_API_KEY` Worker bindings, its own `cloudflared` route. Provisioned by an `ops/hermes/setup-studio-profile.sh` mirroring the public one. New `/api/chat` surface `studio`, allow-listed only for the KB-chat origin. The profile is the default upstream; a session may still pin a preset pipeline (OpenRouter) instead — the two compose.

## 4. Pluggable KB — data model + retrieval interface

```
knowledge_bases (id, owner_account_id NULLABLE,  -- NULL = official/press KB
                 name, kind CHECK(kind IN ('graph','documents','connector')),
                 config_json, status, created_at)
-- graph backend: reuse kb_entities/kb_relations, now scoped by kb_id (migration adds the column)
kb_entities  (+ kb_id)      kb_relations (+ kb_id)
-- documents backend:
kb_documents (id, kb_id, title, source_ref, created_at)
kb_chunks    (id, kb_id, document_id, ordinal, content, embedding)  -- embedding = vector
-- connector backend: config_json holds {endpoint, query_template, auth_secret_name}; the
--   named secret is resolved from Worker env at call time, never stored inline.
```

**One retrieval entry point**, `retrieveKbContext(env, kbId, query)`, dispatches by `kind`:
- **graph** → entity/relation match (the GraphRAG path we built, now per-KB).
- **documents** → embed the query, cosine-rank `kb_chunks`, return top snippets.
- **connector** → HTTP the external source with `query_template`, using the named secret; normalize the response to snippets.

All three return the same shape (ranked snippets + provenance), injected into the resolved prompt identically. Adding a fourth backend later is one new `kind` + one dispatch branch.

## 5. Session management

```
chat_sessions (id, owner_account_id, title, kb_id NULLABLE, preset_id NULLABLE,
               created_at, updated_at)
-- messages: add session_id to chat_messages (nullable; anonymous conversations keep using conversation_id)
```
Visitor-gated routes: `GET /api/sessions` (list own), `POST /api/sessions` (create, optionally bound to a KB + preset), `GET /api/sessions/:id` (resume — returns transcript + bindings), `PATCH /api/sessions/:id` (rename/rebind), `DELETE /api/sessions/:id`. The KB-chat client sends `sessionId`; the Worker persists each turn to that owned session and rehydrates on resume. Anonymous persistence (#1/current) is unchanged.

## 6. GraphRAG

The **graph** KB backend *is* GraphRAG: entity match → connected relations → injected context, with the whole graph exportable/importable as a portable packet (already built; now per-KB). No separate subsystem — it's one of the three pluggable backends, so a session can switch between a graph KB, a document KB, or a live connector without changing the chat contract.

## 7. Embeddings decision (for the documents backend)

Default v1: **OpenRouter embeddings + vectors stored in D1 + cosine ranked in the Worker.** Rationale: no new Cloudflare binding, reuses the OpenRouter key already set, fine for the corpus sizes in play. Documented upgrade path: **Cloudflare Vectorize** (a new binding) if a KB grows past what D1-side cosine handles well. Chunking: fixed-size with overlap, capped per document; ingestion is owner/visitor-triggered, not per-chat.

## 8. Phased build

| Phase | Deliverable | Risk |
|---|---|---|
| **0** | Migrations: `knowledge_bases`, `kb_documents`, `kb_chunks`, `chat_sessions`; add `kb_id` to `kb_entities`/`kb_relations`, `session_id` to `chat_messages`. Additive only. | low |
| **1** | New `stexpedite-studio` Hermes profile + `ops/hermes/setup-studio-profile.sh` + cloudflared route + Worker bindings + `studio` surface | med (infra/isolation) |
| **2** | KB abstraction + **graph backend** (generalize existing GraphRAG to per-KB) + `retrieveKbContext` dispatch | med |
| **3** | Session management (routes + client) — named, resumable, account-owned | med |
| **4** | **Documents backend** — upload → chunk → embed (OpenRouter) → D1 vectors → cosine retrieval | med-high |
| **5** | **Connector backend** — external-source config + secret-resolved query at chat time | med (credential isolation) |
| **6** | KB-chat UI (new surface/app or a mode of the chat app): KB picker, session list/resume, document upload | med |
| **7** | Budgets extended to embeddings + retrieval; owner KB admin (create/list/moderate KBs, like presets) | med |

## 9. Open decisions (defaulted; flag to change)

- **KB-chat home:** a **new mode inside the existing `apps/chat`** (KB picker + session sidebar) vs. a **separate app** (`apps/studio`). Default: a mode in `apps/chat` to reuse transport/auth; split out later only if it diverges.
- **Who can create KBs:** owner-only at first (official KBs), visitor-created KBs behind the same moderation pattern as presets. Default: **owner-only in v1**, visitor KBs in v2.
- **Embeddings:** OpenRouter + D1 cosine (default) vs. Vectorize (deferred).
- **Connector allow-list:** like the model allow-list — the owner registers permitted external endpoints; visitors can't point the chat at an arbitrary URL. Default: **owner-registered connectors only.**

## 11. Actionable build plan (grounded in verified Hermes mechanics)

Verified against Hermes's own docs (`~/.hermes/hermes-agent/docs/design/profile-builder.md`,
`docs/security/network-egress-isolation.md`, `docs/session-lifecycle.md`) and this repo's
`ops/hermes/setup-public-profile.sh`.

**What a profile actually is:** a full `~/.hermes/profiles/<name>/` directory (its own
`config.yaml` = model/provider + toolsets + memory flags, `.env` = secrets, `SOUL.md` = identity,
`skills/`, and running state). Provisioned by `hermes profile create` + `hermes -p <name> config set …`
+ `hermes -p <name> tools disable/enable --platform api_server …` + `gateway install/restart`. Each
profile runs as its own gateway process on its own `API_SERVER_PORT`, bound to `127.0.0.1`, reached
only through an authenticated Cloudflare Tunnel. This is a full sibling agent, isolated by construction.

**Two reconciliations that shaped the plan:**
- *Sessions:* the Worker/D1 (`chat_sessions`) is authoritative. Hermes `memory_enabled:false` +
  stateless `api_server` means Hermes keeps no durable session; it just answers the history the Worker
  sends. No conflict — we own sessions.
- *Isolation:* the studio profile stays **tool-free** (retrieval is Worker-side), so the prompt-injection
  exfiltration threat the egress doc addresses has no tool to exploit. Docker egress isolation is an
  optional later hardening, not a prerequisite for this build.

### Phase 0 — D1 schema (additive; no behavior change)
- Migration `0028_kb_and_sessions.sql`: `knowledge_bases`, `kb_documents`, `kb_chunks`, `chat_sessions`;
  `ALTER`-add `kb_id` to `kb_entities`/`kb_relations`, `session_id` to `chat_messages` (SQLite: recreate
  via new columns, nullable — existing anonymous rows keep `conversation_id`).
- **Acceptance:** migration runs against real SQLite (FKs on); `npm run test:backend` still green.

### Phase 1 — `stexpedite-studio` Hermes profile (mirror the public one)
- New `agents/studio-guide/SOUL.md` (identity for the KB-research agent) + `policy.json`.
- New `ops/hermes/setup-studio-profile.sh`, cloned from `setup-public-profile.sh`, changing only:
  `profile=stexpedite-studio`, `API_SERVER_PORT=8644`, SOUL source = `agents/studio-guide/SOUL.md`,
  same `tools disable … / tools enable vision`, `memory_enabled false`, fresh `API_SERVER_KEY`.
- New `ops/hermes/README` section documenting the studio boundary (127.0.0.1:8644, tunnel-only, port
  not opened in the EC2 SG).
- New cloudflared route → `http://127.0.0.1:8644` (a second tunnel ingress or a path on the existing tunnel).
- **Acceptance:** `hermes -p stexpedite-studio tools list --platform api_server` shows only `vision`;
  `curl 127.0.0.1:8644/health` ok; gateway survives logout; `ss -ltn | grep :8644` is localhost-only.

### Phase 2 — Worker: studio surface + KB abstraction + graph backend
- `wrangler.toml`/secrets: `HERMES_STUDIO_API_URL`, `HERMES_STUDIO_API_KEY`; new `studio` surface in
  `surfacePolicyForOrigin` allow-listed for the KB-chat origin.
- `retrieveKbContext(env, kbId, query)` dispatch by `knowledge_bases.kind`; implement the **graph**
  backend first (generalize existing `retrieveGraphContext` to per-`kb_id`). Inject into the studio
  system prompt exactly like current grounding (Worker-side, never a Hermes tool).
- **Acceptance:** unit tests — studio surface routes to the studio upstream; graph-backed KB injects
  matched entities; unknown/kindless KB is a clean no-op.

### Phase 3 — Sessions (named, account-owned, resumable)
- Routes (visitor-gated): `GET/POST /api/sessions`, `GET/PATCH/DELETE /api/sessions/:id`; persist each
  studio turn to the owned session; rehydrate on resume; a session binds a `kb_id` (+ optional `preset_id`).
- **Acceptance:** create → send turns → resume returns transcript+bindings; non-owner gets 404;
  delete removes messages.

### Phase 4 — Documents backend (upload → chunk → embed → retrieve)
- `POST /api/kb/:id/documents` (owner/visitor-gated): store doc, chunk (fixed size + overlap, capped),
  embed each chunk via **OpenRouter embeddings**, store vectors in `kb_chunks`. Retrieval = embed query,
  cosine-rank in the Worker, return top snippets.
- **Acceptance:** upload a doc → query retrieves the relevant chunk; embedding failure degrades cleanly.

### Phase 5 — Connector backend (live external source, owner-registered only)
- `knowledge_bases.config_json` for `kind='connector'` = `{endpoint, query_template, auth_secret_name}`;
  the named secret resolves from Worker env at call time (never stored inline, never sent to client/Hermes).
  Owner registers permitted endpoints (a connector allow-list, mirroring the model allow-list).
- **Acceptance:** a registered connector returns normalized snippets; an unregistered endpoint is refused.

### Phase 6 — KB-chat UI (a mode inside `apps/chat`)
- KB picker + session sidebar (list/resume/rename/delete) + document upload, all visitor-gated; the
  client sends `{sessionId, kbId, presetId?}` — never a prompt. Reuses the existing transport/auth.
- **Acceptance:** `node --check`, `build:chat`; manual/scripted flow against the studio surface.

### Phase 7 — Budgets + owner KB admin
- Extend `reservePresetBudget` to weight embedding + retrieval calls per identity. Owner admin panel:
  create/list/moderate KBs and register connectors (same pattern as presets/models).
- **Acceptance:** over-budget returns 429; owner can create a KB, upload docs, and register a connector.

### Deploy gating (unchanged discipline)
Each phase that touches the live chat path ships only after: real-D1 smoke test, `stexpedite-studio`
isolation verified (`tools list` = vision-only, localhost-only listener), and the public-boundary evals
green. Migrations applied to prod D1, secrets set, Worker + Pages redeployed — as a deliberate step.

## 10. What this does *not* do

- Does not give the `stexpedite-studio` Hermes profile tools, memory, or owner-profile access — retrieval is Worker-side.
- Does not let the client send a system prompt, name a model, or name an external endpoint — all resolved server-side from allow-listed config.
- Does not replace #1 (the site widget) or the existing preset chat — it's an additional, heavier surface.
