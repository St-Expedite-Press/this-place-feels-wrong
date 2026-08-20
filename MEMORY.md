# St. Expedite Press — Change Log

## [2026-08-19] — Feature — Direct Stripe orders, Lab scheduling, and a copy pass

**Changed:** Three passes shipped together. (1) **Direct orders.** Pre-orders previously captured intent only — nothing could charge for a book. Added `POST /api/orders/session` building a Stripe Checkout Session with US shipping-address collection and one flat rate; prices resolve from a server-side `ORDER_CATALOG` keyed by package id, never from the browser. The webhook now branches on `metadata.source`: `site_order` lands in a new `orders` table (migration `0030_orders`, with shipping address and a `fulfillment_status` CHECK), donations keep their own ledger. Buyer gets a receipt with a ref; the press gets a pack slip. Shirt-bearing packages require a size. (2) **Lab scheduling** at `/lab/schedule`, posting to the previously-orphaned `/api/contact`; it requests a time rather than booking one, since there is no calendar backend. (3) **Copy pass** removing AI-tells, most of them introduced by me in the wing build — a chiasmus pair, "runs rather than reads" four times across three pages, tricolon headings, and two pages printing their own kicker twice. Chat launcher is now wing-aware (`Ask the press` / `Ask the lab` / `Ask St. Expedite` on the portal).
**Bugs found and fixed:** The splash signup shipped **broken** — `/api/updates` sits behind the Turnstile check at `index.ts:2709` and the rebuilt form sent no token, so every live submission got a 403. The July commit that removed the old splash form also removed its Turnstile include. Restored on the splash (two forms, so each reads its token from inside itself — `getTurnstileToken` does a global query and would return the hidden surface's empty field) and on the order form. Separately, `.field { display: grid }` beats the `hidden` attribute, so the shirt-size selector rendered for every package; several components already carried their own `[hidden]` override for this exact reason, so a single global `[hidden] { display: none !important }` replaced the pattern.
**Checks:** 88 backend tests (5 new: price tampering, unknown package, missing/bogus shirt size, order-vs-donation webhook routing), build, lint:html, check:links, check:a11y, check:docs. Migration applied remote and `orders` confirmed present before the Worker deploy; Worker deployed before the UI that calls it.
**Follow-ups:** **`ORDER_SHIPPING_CENTS` is a placeholder at 700** — never confirmed against real postage for the heaviest package (two hardcovers plus a shirt). The companion volume's extent and both hardcover print costs are still unquoted, so the hardcover tiers rest on estimates. Fulfilment is now press-ships-everything, which means buying author copies of the KDP softcover and changes the per-copy margins in the original matrix. Neither the live signup nor the live order route could be exercised end to end from here — Turnstile withholds tokens from automated browsers, and the alternative was writing real rows to production.
**Tooling notes:** Stubbed-endpoint tests gave false confidence twice: the splash signup passed locally against a mocked `/api/updates` while 403-ing in production. Probing the live endpoint with a deliberately invalid payload — 400 versus 403 — distinguishes a validation failure from a gate failure without storing anything, and is the check that actually caught it.

## [2026-08-19] — Deploy — Press/Lab wings live on stexpedite.press

**Changed:** Deployed the wing restructure to production. Pages went out through CI on `e370aaf`; the Worker was deployed from the repo root (`npm run deploy:backend`, version `89d0afe3-44e7-4106-89d7-9647f89529f9`) carrying only the Stripe `success_url`/`cancel_url` move to `/press/donate*`. **Unblocking this required a pre-existing CI fix:** `apps/stex/package-lock.json` had been out of sync with its `package.json` since the Astro 6→7 upgrade in `a3179e2` (esbuild 0.28.2 platform packages missing), so `npm --prefix apps/stex ci` failed and the Validate workflow — which gates the Pages deploy job — had failed on *every* commit since, including `c49689a` before this work started. Nothing had deployed from CI in that window. Regenerated the lockfile with `--package-lock-only` (`e370aaf`); `package.json` untouched. Also caught before shipping that Cloudflare Pages matches `_redirects` paths exactly and treats `/books` and `/books/` as distinct — the first table only covered the no-slash form, which is the *wrong* one, since the old site normalised to trailing slashes. Both forms now listed (`20609ea`).
**Checks:** CI Validate green on `e370aaf`. Production verified after each deploy: all 10 wing pages 200; all 18 legacy redirects 301 to the right targets in both slash forms; splash serves the signup form and both doors; `/api/health`, `/api/works?program=rice`, `/api/storefront` 200; live browser render at 1440x900 and 390x844 with no page errors.
**Follow-ups:** The live signup form was **not** exercised end-to-end — submitting would write a real row to `updates_signups`, so it is verified only against a stubbed endpoint locally. Worth one real submission from the owner. Auditing `apps/stex/package-lock.json` on its own reports 3 `svgo` advisories (1 low, 2 high) that the authoritative root gate does not cover; deliberately not folded into a deploy fix. RICE, chat, and admin were not redeployed and are unaffected.
**Tooling notes:** The GitHub Actions REST API worked unauthenticated (the repo is public) for run/job status, but the job-logs endpoint returns 403 without a token — reproducing `npm ci` locally was faster than chasing the log. `check:links` cannot see `_redirects` at all: it validates links in built HTML, so a redirect table that is wrong or missing passes it silently. Curl-based assertions against the live origin were the only thing that actually caught redirect shape.

## [2026-08-19] — Feature — Split stexpedite.press into Press and Lab wings behind an email splash

**Changed:** Re-architected `apps/stex` from a flat four-door portal into a signup splash plus two wings. `/` now renders one responsive composition (seal → inline `/api/updates` signup → PRESS/LAB doors → coordinates/footer), replacing the separate `.portal-desktop`/`.portal-mobile` trees and their JS scale-fitter; `portal.css` was rewritten around it. Pages moved by `git mv` into `pages/press/` (books, store ex-`gallery`, about, donate, donate/thanks) and `pages/lab/`; `work.astro` split into `lab/practice.astro` (the commissioned practice) and `lab/instruments.astro` (the Anglossic Compass, modals and entry script intact). Added wing index pages and `wings.css` (de-boxed, hairline-ruled, tokens only). `site.json` gained `site.wings` (label/href/tagline/nav per wing) and `site.shortName`; `site.nav` is gone. `HeroBar` takes a `wing` prop and renders that wing's nav plus a crossing link to the other; the wordmark reads `ST. EXPEDITE · PRESS`/`· LAB`. The four meta-refresh stub pages (`lab`, `services`, `submit`, `contact`) were deleted in favour of real 301s in `apps/stex/public/_redirects`, which also covers every moved route. Stripe `success_url` in `apps/backend/src/index.ts` now points at `/press/donate/thanks`. Updated `llms.txt` and the 404 nav.
**Checks:** `build:stex`, `lint:html`, `check:links`, `check:a11y`, `check:docs`, `test:backend` (83) all pass. Verified in headless Chromium at 1440x900 and 390x844: splash fits the mobile viewport with no clipped footer, all eight interior pages return 200 with correct `h1`s and no page errors beyond the expected offline ones (no local Worker → catalog fetch fails; Turnstile 110200 on 127.0.0.1). Interaction-tested the two pieces that actually moved: the Compass modal opens and renders prompt 1 from `/lab/instruments`, and the splash form POSTs `{email, source:"splash"}` to `/api/updates` with correct success and invalid-email states.
**Follow-ups:** Nothing is deployed — Pages and the Worker both still serve the old structure. The Worker needs redeploying for the new Stripe return URL (the `_redirects` rule covers checkouts started before that). Inbound links and search results for `/books`, `/work`, etc. rely on the `_redirects` 301s, which only take effect on a Pages deploy.
**Tooling notes:** `check:links` was the useful gate here — it walks built HTML and fails on any internal href with no file behind it, which caught the moved routes immediately. Its blind spot is `_redirects`: it neither validates the redirect table nor knows those legacy paths are intentionally absent from `dist/`.

## [2026-08-19] — Deploy — Unified chat model live in production (incl. profile-service)

**Changed:** Deployed the unified model (branch merged to main earlier today) to prod, and fixed the CI audit gate. (1) Applied migrations `0028_assistant_profiles`+`0029_kb_and_sessions` to prod D1 (default assistant `profile-stexpedite`→`stexpedite-public` + `kb_works` seeded). (2) Deployed the Worker on the new `entry.ts` entrypoint (composition: entry→profile-entry→index). (3) Stood up `ops/hermes/profile-service.py` as a systemd `--user` service on `127.0.0.1:8765`; fixed a crash-loop (systemd PATH couldn't find `hermes`; set `HERMES_BIN=~/.local/bin/hermes` in the service env and baked it into `setup-profile-service.sh`, also de-backticked a heredoc comment). (4) Added a cloudflared ingress route `profiles.stexpedite.press → localhost:8765` to the existing `stexpedite-hermes` tunnel (id 5d8940f5…) via the CF API, **preserving** the live `llmchat.stexpedite.press→8643` route + catch-all; created the matching proxied CNAME. (5) Set Worker secrets `HERMES_PROFILE_SERVICE_URL`/`HERMES_PROFILE_SERVICE_KEY` → visitor-created assistants enabled. CI audit gate: upgraded Astro 6→7 across all apps + `npm audit fix` (0 vulns) + corrected `check:audit` to audit the authoritative root lockfile only.
**Checks:** Proved the chain end-to-end before flipping the Worker: `POST profiles.stexpedite.press/chat {profileName:stexpedite-public}` streamed a real reply (tunnel→profile-service→8643 gateway→OpenRouter). Post-deploy live: `/api/health` ok; `/api/profiles` returns the default assistant sanitized (no hermesProfileName/model leak); `/api/knowledge-bases` lists kb_works; `/api/chat` turnstile-gated (403); both tunnel routes healthy; profile-service active; `profiles/health` 401 without bearer / 200 with. 83 backend tests, check:docs, all three app builds green. Migrations verified in prod.
**Follow-ups:** No full turnstile-backed browser chat or real visitor-assistant creation exercised yet (needs a browser session) — the model layer + profile-service path are proven. **Resource watch:** each visitor assistant spawns its own Hermes gateway (ports 8700-9699) on this 2-vCPU/3.7GB box; `PROFILE_LIMIT_PER_ACCOUNT=8` caps per account but concurrent assistants pressure RAM — monitor. Default-assistant chat now takes one extra local hop (Worker→profile-service→8643) vs before.
**Tooling notes:** The token/dashboard-managed tunnel's ingress is edited via the CF API `/cfd_tunnel/{id}/configurations` (GET then PUT merged) — done non-destructively by reading current rules, inserting one before the catch-all, and verifying llmchat survived.

## [2026-08-19] — Merge — Unified the profile-native chat branch with the KB-studio work into one model

**Changed:** Discovered `origin/profile-native-chat` (36 commits, active, by C. Sandbatch) — a parallel, more Hermes-native implementation of project #2: each visitor *assistant* is a dynamically-provisioned Hermes profile via a loopback `ops/hermes/profile-service.py`, composed at `apps/backend/src/entry.ts` (`entry.ts` → `profile-entry.ts` → `index.ts`, which already routes `presetId` back to the legacy preset executor). Rather than pick one, merged both into a single working model on branch `unified-chat` (off `origin/profile-native-chat`): **assistants-as-Hermes-profiles is the runtime base; our pluggable KB/GraphRAG folds in as grounding.** Safeguarded our uncommitted Phase 0–2 work first onto branch `kb-studio-chat` (commit 4d5f994). Then: renumbered our migration `0028_kb_and_sessions.sql` → `0029` (their `0028_assistant_profiles.sql` keeps 0028 — schemas are disjoint: theirs adds `assistant_profiles` + `chat_conversations.profile_id`, ours adds `knowledge_bases`/`kb_documents`/`kb_chunks`/`chat_sessions` + `kb_entities/relations.kb_id` + `chat_messages.session_id`); upgraded `profile-entry.ts`'s simple un-scoped `retrievePublicContext` into a pluggable, kb_id-scoped `retrieveKbContext` (graph backend implemented; documents/connector Phase 4/5 stubs); wired it into `profileChat` so *any* assistant can be grounded by a chosen KB (`kbId` on the chat body) while the default assistant still grounds from the works graph (`kb_works`); added `kbId` to `entry.ts`'s standalone-chat allow-list; added `GET /api/knowledge-bases`; documented both in `openapi-profile-native.yaml` (→0.3.0). Dropped the static `stexpedite-studio` profile idea — subsumed by dynamic assistant-profiles; its artifacts stay on `kb-studio-chat`, not carried into the merge.
**Checks:** All 29 migrations apply together against real SQLite (0 FK violations; both `assistant_profiles` and `knowledge_bases` present; `profile_id`+`session_id`+`kb_id` coexist; both seeds land). `npm run test:backend` — **83/83** (81 branch + 2 new: default assistant grounds from `kb_works`; `GET /api/knowledge-bases` lists it). `npm run check:docs` PASS (149). `npm run build:chat` OK. Exercised the exact grounding SQL against the merged schema.
**Follow-ups:** `unified-chat` is a local branch, not pushed/merged to main, not deployed. The legacy preset pipeline's `retrieveGraphContext` in `index.ts` stays un-scoped (effectively kb_works since it's the only KB) — left as-is since presets are "legacy/compat, do not extend" per the branch's own docs. Decision pending (owner): make `unified-chat` the new main and set the profile-service live (needs `ops/hermes/setup-profile-service.sh`, `HERMES_PROFILE_SERVICE_URL/KEY`, migrations `0028`+`0029` to prod, redeploy). CI audit gate still red (dependency vulns, unrelated).
**Tooling notes:** The branch's `entry.ts` composition pattern (legacy + profile workers) is what made the merge tractable — our KB work slotted into `profile-entry.ts` without touching the composition or the legacy `index.ts` routes.

## [2026-07-27] — Fixes — Set OPENROUTER_API_KEY secret; repaired deploy-web.mjs project detection

**Changed:** Resolved the two follow-ups from the presets deploy. (1) `OPENROUTER_API_KEY` is now set as a Worker secret (`wrangler secret put`) and confirmed bound alongside HERMES/STRIPE/RESEND/TURNSTILE — this unblocks preset-pipeline execution and owner-triggered graph builds. (2) `scripts/deploy-web.mjs` was refusing to deploy: its `wrangler pages project list --json` verification parsed each row's `name` field, but wrangler 4.110.x keys the JSON by the display column `"Project Name"` instead, so every project name read as undefined and the "project not visible" guard always tripped. Added a `projectName(entry)` helper that accepts either `entry.name` or `entry["Project Name"]` and used it in both the match and the diagnostic list.
**Checks:** `wrangler secret list` shows `OPENROUTER_API_KEY` bound; `/api/health` still ok. Verified the deploy-script fix detects all four projects (`stexpedite-press` visible: true) via a standalone repro of the parse logic — did not re-run the full `deploy:stex` since the site is already current.
**Follow-ups:** No end-to-end run of a preset pipeline or graph build yet — a real preset chat needs a Turnstile-backed browser session and a graph build needs an owner magic-link login, neither of which is curl-verifiable from the server. All prerequisites (key, migrations, deploys) are now in place; the paths are covered by the 71-test suite. First real use will be the true confirmation.
**Tooling notes:** The wrangler `--json` shape (display-column keys vs API field names) is version-dependent — worth keeping the tolerant `projectName` accessor if wrangler is upgraded.


## [2026-07-27] — Presets + Work page — Two official presets seeded; work-page copy broadened to the real capability set

**Changed:** (1) Migration `0027_seed_official_presets.sql` adds two approved official presets and applied it to prod D1: **Night Translator** (2-step pipeline — deepseek literal pass → gemma voiced pass, showcasing multi-model chaining) and **Archivist** (single graph-grounded step). Both live on `https://stexpedite.press/api/presets`. (2) Read the `St-Expedite-Press` GitHub org (via `GITHUB_TOKEN`, REST API) to understand the actual breadth of work — agentic/multi-agent pipelines, provenance-first persona compilers, OWL/RDF ontology + knowledge-graph engineering, operations/back-office infrastructure, canon-procedure governance, full-stack builds, branding, publishing — then rewrote `apps/stex/src/pages/work.astro` and the work fields in `site.json` to reflect it, **deliberately abstracting away all partner/client/candidate/business names and places** (per owner instruction: no specific partners or countries). Reframed the four service cards (agentic systems & operations infra; ontology/graphs/provenance; websites & full-stack publishing; editing/writing/translation/research), expanded the advanced-systems tags (added knowledge graphs, agent memory & retrieval, human-in-the-loop review, append-only procedure), broadened the case study to anonymized "acquired or under active build" language, and updated the public-chat blurb to mention presets/grounding. Fixed a stale link: RICE now points at `https://rice.stexpedite.press/` (was the retired `st-expedite-press.github.io/rice-magazine`).
**Checks:** Migration validated against real SQLite (3 official presets, 4 steps resolve) then applied remote; `/api/presets` confirms both live. `site.json` edited surgically (2-line diff, not a full reserialize — reverted an accidental reformat first). `npm run build:web`, `lint:html`, `check:links` (the new RICE link resolves), `check:a11y` all pass. Deployed `apps/stex` to Cloudflare Pages; confirmed the new copy live on `stexpedite.press/work`. Grep-scanned the changed files for partner/place names — clean.
**Follow-ups:** The Archivist preset only gets useful once a knowledge-graph build has run (needs `OPENROUTER_API_KEY`, still unset — same blocker as preset execution). Night Translator likewise needs the key to actually run.
**Tooling notes:** `scripts/deploy-web.mjs` refuses to deploy — its `wrangler pages project list --json` verification returns empty on wrangler 4.110.0 even though the plain (non-JSON) list shows all three projects; deployed directly with `wrangler pages deploy apps/stex/dist --project-name=stexpedite-press` instead. Worth fixing the script's project-detection for this wrangler version.


## [2026-07-27] — Whole stack — Visitor accounts, moderated multi-model presets, portable knowledge graph

**Changed:** Built the full 8-phase plan in [`docs/design/visitor-presets-and-portable-graph.md`](docs/design/visitor-presets-and-portable-graph.md) (owner-approved "execute it"). Migrations `0023–0026`: visitor auth tables, presets/steps/models/assets/moderation, kb_entities/kb_relations, and a seed (2 allow-listed models + one official "Press Guide" preset). Backend (`apps/backend/src/index.ts`): **visitor magic-link auth** (`/api/visitor/*`, second lower-privilege identity mirroring owner auth, hash-only, `stex_visitor_session` cookie); **server-resolved multi-model preset pipelines** on `/api/chat` when a `presetId` is sent (resolve approved-or-own preset → run ordered `preset_steps`, each calling an owner-allow-listed **OpenRouter** model; intermediate steps buffered, only the final step streams — the "client sends an id, Worker resolves the config" trust model, so no client prompt is ever transmitted); **graph grounding** (lexical `kb_entities` match injected into the resolved step's system prompt, Worker-side, Hermes still tool-free); **preset authoring** (`/api/presets/create|import|{id}/submit|{id}/export`, portable packets whose `model_ref` is a public label not the internal upstream ref); **admin moderation** (`/api/admin/presets/pending|{id}/detail|{id}/moderate`, model allow-list CRUD, `/api/admin/visitors/{id}/status` suspend kill-switch that un-approves the account's public presets); **owner-triggered graph extraction** (`/api/admin/graph/build` over `works` via OpenRouter → rebuilds kb tables; `/export`/`import` portable graph packets); **step-weighted per-identity budget** (`reservePresetBudget`, a 3-step preset costs 3×, keyed on visitor account or IP). Frontend: chat app gained visitor sign-in, a preset picker (sends `presetId`), and a preset builder/import dialog; admin app gained preset-review, model allow-list, and knowledge-graph (build/download/import) panels. `packages/chat-client` `requestBody` takes an optional 5th `presetId`.
**Checks:** `npm run test:backend` — 71/71 (21 new across visitor auth, preset pipeline incl. 2-step/disabled-model/draft-visibility, grounding injection, authoring+packets, moderation+suspend, graph build/import, and the per-identity budget 429). `npm run test:chat-client` (added preset arg). `node --check` on both apps' `app.js`. `npm run build:chat` and `npm run build:admin` both succeed. All four migrations executed against a real SQLite engine (FKs on) with seed + joins verified. **Not deployed.**
**Follow-ups:** Deploy is a deliberate separate step (per the design doc's phase-gating: 2/3/6 change the live public chat and need a real-D1 smoke test + public-boundary evals green first). Before deploy: apply migrations `0023–0026` to prod D1, `wrangler secret put OPENROUTER_API_KEY`, redeploy the Worker, redeploy both Pages apps. Deferred to v2 (documented in the design doc): R2 image storage (v1 is size-capped data-URI), site/RICE page-copy in the graph corpus (v1 is `works` only), and richer per-step cost accounting. No live end-to-end run of a preset pipeline or graph build yet — only the mocked suite.
**Tooling notes:** `apps/backend/test/index.test.ts` `makeMockDb()` grew handlers for all new tables; two existing `presets`/`preset_steps` mock branches were widened to supersets so `resolvePreset` and `exportPresetPacket` (different column aliases) both read what they need. Reused the existing `api_rate_limits` table for the preset budget with a distinct 3-arg INSERT the mock now distinguishes from the count=1 form.

## [2026-07-27] — Backend + Admin — Production deploy: owner auth, admin dashboard, chat persistence

**Changed:** Owner explicitly authorized a live deploy of everything built 2026-07-22 (backend security fix, owner auth/`apps/admin`, chat persistence) after confirming Cloudflare credentials were in scope for it. Sequence, each step verified before the next: (1) `wrangler d1 migrations apply stexpedite-updates --remote` — applied `0021_owner_sessions.sql` and `0022_chat_conversations.sql` to the live `stexpedite-updates` D1 database (both were still pending remotely, confirmed via `wrangler d1 migrations list --remote` before touching anything). (2) `wrangler deploy --keep-vars` for `apps/backend` — shipped the full `index.ts` (timing-safe import auth, `/api/admin/*`, `/api/chat/history`, the `scheduled()` retention purge, the daily cron trigger). (3) Created the `stexpedite-admin` Cloudflare Pages project and deployed `apps/admin/dist` to it. (4) Added the `admin.stexpedite.press` custom domain via the Pages API — Cloudflare did **not** auto-create its DNS record even though the zone is in the same account (reported `"CNAME record not set"`); created the CNAME by hand via the DNS API, matching `chat.stexpedite.press`'s exact existing record shape (proxied, same pattern). Domain went from `pending`/522 to serving 200s within about a minute of the DNS record landing. (5) Added `.github/workflows/deploy-admin.yml`, byte-for-byte mirroring `deploy-chat.yml`'s validate-on-PR / deploy-on-manual-dispatch shape, just repointed at `apps/admin`.
**Checks:** Read-only recon before any mutation: `wrangler whoami` (confirmed the real `Editor@stexpedite.press` account, not a surprise), `wrangler d1 migrations list --remote`, `wrangler pages project list` (confirmed only the three pre-existing projects, no drift). Post-deploy: `GET /api/health` shows `ownerAuthConfigured: true`; live smoke test of `POST /api/admin/login` (real request against real D1 — this also sent a real magic-link email to `editor@stexpedite.press`, flagged to the owner), `GET /api/chat/history` with a throwaway id (returns `{messages:[]}`), `GET /api/admin/me` without a cookie (returns `authenticated:false`). Confirmed `admin.stexpedite.press` serves the real built page and its `app.js`/`styles.css`/`favicon.svg` (all 200), and that the CORS preflight from that origin to the backend now carries `access-control-allow-credentials: true` scoped to that specific origin (the fix from the 2026-07-22 entry, now verified against live traffic instead of just the mocked test suite).
**Follow-ups:** `deploy-admin.yml`'s manual-dispatch deploy path itself hasn't been exercised yet (only run locally via `wrangler` directly) — first real PR touching `apps/admin/**` will be the first live test of the `validate` job. No one has actually clicked a real magic-link email and completed a login yet — the flow is verified up through token issuance and D1 writes, not the full browser round-trip. `UPDATES_IMPORT_TOKEN` shows `importConfigured: false` in production — pre-existing, unrelated to this work, not investigated.
**Tooling notes:** `wrangler pages domain`/custom-domain management isn't exposed as a dedicated wrangler CLI subcommand in this wrangler version (4.110.0) — used the Cloudflare REST API directly (`POST .../pages/projects/{project}/domains`) instead, then had to separately create the DNS record (also via the REST API) since Pages didn't auto-provision it. Worth remembering for any future new subdomain: adding the Pages "domain" resource and creating its DNS `CNAME` are two separate steps, not one.

## [2026-07-22] — Chat — Download/upload conversation, local-only

**Changed:** Follow-up to the conversation-persistence entry below, prompted directly by the owner: "have a way for users to simply download/upload their conversation history instead of trust me to hold onto it." Added a Download button (exports the in-memory transcript to a JSON file, `Blob`-based, no network call — the data's already in the browser) and an Upload button (reads a JSON file back in, validates it, repaints the transcript) to `apps/chat`. The one real design decision — does upload re-push the restored history to D1? — was put to the owner directly: chose **local-only**. Uploading a file never sends its contents to the server; it just redraws the page and starts a fresh `conversationId` for whatever gets sent from that point on. This means the D1-backed persistence from the entry below is now honestly scoped as "resume if you refresh this tab soon," not "your durable record" — the downloaded file is the thing a visitor can actually rely on.
**Checks:** `node --check apps/chat/public/app.js`, `npm run build:chat`. Validation logic (role/content shape checks, malformed-entry filtering, invalid-surface handling, non-JSON rejection) exercised standalone in Node since this app has no in-repo test runner.
**Follow-ups:** None blocking — this is a self-contained, fully client-side addition with no backend surface at all.
**Tooling notes:** none.

## [2026-07-22] — Backend + Chat — Conversation persistence and in-chat email capture

**Changed:** Third item from the 2026-07-22 audit sub-plan. Backend (`apps/backend/src/index.ts`): new migration `0022_chat_conversations.sql` (`chat_conversations`, `chat_messages`) and a `scheduled()` Worker export (`purgeOldChatHistory`, daily cron added to `wrangler.toml` `[triggers]`) that deletes anything older than 30 days. `POST /api/chat` now optionally accepts a `conversationId` field (client-generated, 8-64 chars, `[a-zA-Z0-9-]`); when present, the current user turn is persisted before the Hermes call, and the SSE response is piped through a new `TransformStream` (`createChatPersistTransform`) that forwards every byte to the browser completely unmodified — verified by the pre-existing "streams without buffering" test still passing unchanged — while separately accumulating the assistant's delta text to persist once the stream ends, via `ctx.waitUntil` so it doesn't block the response. Images are never persisted (stored as a `"[image attached]"` placeholder; the real bytes still only ever travel live on the one turn that attached them, unchanged from before). New `GET /api/chat/history?conversationId=` route returns the ordered transcript; deliberately unauthenticated — the unguessable id (backed by `crypto.randomUUID()`'s 122 bits of entropy) is the only access control, the same trust model as an unlisted share link, chosen over a signed cookie specifically to avoid new cross-origin-credentials complexity for chat (unlike the admin app two entries below, which does need a cookie because it's gating owner-only writes/reads, not just resuming an anonymous visitor's own session).
Frontend (`apps/chat`, `packages/chat-client`): `browser.js`'s `requestBody()` gained an optional 4th `conversationId` argument (additive — omitting it changes nothing for `stex`/`rice`'s existing calls, which don't pass one). `apps/chat/public/app.js` generates a `conversationId` via `sessionStorage` (survives a refresh, not a browser restart — deliberately less durable than an account, matching the product's anonymous/ephemeral character), regenerates it on "+ New conversation" and on surface switch (both already meant "start over"), and rehydrates the transcript from `/api/chat/history` on load when a prior id is found. Also added an always-visible inline "Get updates on new releases" form to the chat rail (`data-updates-form`), posting directly to `/api/updates` — mirroring RICE's exact working pattern (honeypot field, no Turnstile token; confirmed via `apps/rice/site.js` that Turnstile isn't part of that route's existing client contract) rather than inventing a new one. This fulfills the "embed signup in chat" decision from earlier today, tying it to the persistence work as planned.
**Checks:** `npm run test:backend` — 50/50 pass (46 prior + 4 new: full persist-then-retrieve round trip through the real SSE-parsing transform, no-conversationId-means-no-persistence, malformed-id rejection on history lookup, and the scheduled retention purge only removing rows past the 30-day threshold). `npm run test:chat-client` passes (added a case asserting `requestBody`'s new 4th argument). `node --check` on both changed `.js` files. `npm run build:chat` succeeds, output inspected for the new meta tags and markup. `npm run check:docs` passes (146 docs, no new files needed — only existing per-directory docs touched).
**Follow-ups:** No live end-to-end verification yet (real Hermes stream, real D1, real cookie-free multi-tab behavior) — same caveat as the admin/auth work below, blocked on nothing being deployed yet. The cron trigger in `wrangler.toml` only takes effect on the next `wrangler deploy`, which hasn't happened. Fourth item from the audit sub-plan (KB grounding) is still unstarted.
**Tooling notes:** `apps/backend/test/index.test.ts`'s `makeMockDb()` gained `chatConversations`/`chatMessages` in-memory stores, same pattern as every other table. Reused `openapi.yaml`'s existing `ChatRequest` schema rather than introducing a new one — `conversationId` is just an added optional property (version bumped 1.10.0 → 1.11.0).

## [2026-07-22] — Backend + new app — Owner magic-link auth and `apps/admin` dashboard

**Changed:** Built the second item from the 2026-07-22 audit sub-plan (`audit/2026-07-22-backend-auth-chat-audit.md`): a single-owner auth layer and a read UI for the three previously write-only D1 tables. Backend (`apps/backend/src/index.ts`): added `owner_login_tokens`/`owner_sessions` D1 tables (migration `0021_owner_sessions.sql`, both storing only a SHA-256 hash of the raw token/session value, never the value itself); `randomToken`/`sha256Hex`/`parseCookies`/`requireOwnerSession` helpers; and six new routes — `POST /api/admin/login` (emails a 15-minute single-use magic link via the existing Resend integration, only when the submitted address matches the new `OWNER_EMAIL` var, but responds identically either way so the route can't be used to confirm the owner's address), `GET /api/admin/verify` (consumes the token, sets an `HttpOnly`/`Secure`/`SameSite=Lax` session cookie scoped to `.stexpedite.press`, redirects to `ADMIN_APP_URL`), `GET /api/admin/me`, `POST /api/admin/logout`, and `GET /api/admin/{signups,submissions,donations}` (session-gated, paginated JSON reads). CORS's `access-control-allow-credentials` flipped from a hardcoded `false` to `true` (safe — it only ever echoes one of our own allow-listed origins, never `*`) and `https://admin.stexpedite.press` was added to that allow-list. New app `apps/admin/` (Astro static, same shape as `apps/chat`): a single page with a login form and, once authenticated, three read-only tables. Self-contained local CSS tokens, not `apps/stex`'s `tokens.css`/`data-brand-mode` system — same "this is a utility tool outside that design system" precedent chat already set. `openapi.yaml` updated to `1.10.0` with the seven new paths, `ownerSession` cookie security scheme, and `HealthSuccess.ownerAuthConfigured`.
**Checks:** `npm run test:backend` — 46/46 pass (40 pre-existing + 6 new, covering: only-the-owner-email sends mail, response is identical either way, verify issues a working session cookie, unknown/reused tokens are rejected, `/api/admin/me` and the three data routes are correctly gated, logout actually invalidates the cookie). `npm run build:admin` succeeds. `npm run check:docs` passes (146 docs). YAML-validated `openapi.yaml` by parsing it and confirming all 7 admin paths + `AdminRowsSuccess` schema are present.
**Follow-ups:** No Cloudflare Pages project, `admin.stexpedite.press` DNS, or `deploy-admin.yml` CI workflow exist yet — deploying `apps/admin` is a separate, explicitly-authorized step (checked in with the owner before touching CI/deploy config, per repo discipline). `OWNER_EMAIL`/`ADMIN_APP_URL` need setting via `wrangler.toml`/`wrangler secret put` in a real environment before this is live (currently only defaulted in `wrangler.toml` `[vars]` with `editor@stexpedite.press`). Live end-to-end verification (real magic-link email, real cookie round-trip, real D1) hasn't happened — only the mocked backend test suite has exercised this path. Third and fourth items from the audit sub-plan (chat conversation persistence + in-chat email capture, KB grounding) are still unstarted; `PHASE-PLAN.md` updated accordingly.
**Tooling notes:** `apps/backend/test/index.test.ts`'s `makeMockDb()` gained `owner_login_tokens`/`owner_sessions` map-backed handlers, following the exact pattern already used for every other table — no new test infrastructure needed.

## [2026-07-22] — Backend — Timing-safe comparison for `/api/updates/import` auth

**Changed:** `requireImportAuth()` in `apps/backend/src/index.ts` compared the `x-import-token` header against `UPDATES_IMPORT_TOKEN` with a plain `===`, which short-circuits on the first mismatched character — a timing side-channel on the only privileged route in the Worker. Replaced with `timingSafeEqual()`: both strings are SHA-256 digested (fixing the comparison to a constant 32 bytes regardless of input length) and the digests are compared with a non-short-circuiting XOR loop. `requireImportAuth` is now `async`; its one call site was updated to `await` it. Behavior (which tokens are accepted/rejected) is unchanged — this is an audit-driven hardening of an existing weak point, not a new feature. Found during a broader project audit (backend/chat/frontend, prompted by a request for email signup + auth + chat persistence) that also surfaced that this shared-secret header, with no expiry or rotation, is the *only* protected route in the whole backend — everything else is either public or Turnstile-gated.
**Checks:** `npm run test:backend` — 40/40 pass, including the existing `rejects updates import without auth` / `imports updates enrichment with auth` / CORS-preflight-includes-`x-import-token` tests, which already exercised both the accept and reject paths through the real route.
**Follow-ups:** The audit's other findings (owner auth + admin view for the three write-only tables `updates_signups`/`contact_submissions`/`donations`; D1-backed chat conversation persistence with an in-chat email-capture moment, chosen over reviving a standalone signup form since that was deliberately removed 2026-07-15; in-Worker D1 FTS5 knowledge-base grounding for chat; backend modularization) are scoped but not started.
**Tooling notes:** No D1 migration needed — this is comparison-logic only, no schema change.

## [2026-07-16] — RICE — Restored the splash page's rice-field video background

**Changed:** `apps/rice/splash.html` had silently lost its looping rice-field background video during an earlier "responsive images" rewrite — the video file (`rice-field-loop.mp4`) and its documentation (`docs/ASSET_SCHEMA.md`, `assets/site-assets.json`) survived, but the `<video>` markup itself was dropped, and `site-assets.json` even had it explicitly tagged `role: "retired-splash-video"` the whole time. Restored the `<video autoplay muted loop playsinline poster>` element, kept the existing responsive `<picture>` as a genuine `prefers-reduced-motion`/no-video-support fallback (video hidden, picture shown, under reduced motion — not just relying on the browser's built-in fallback-content mechanism), and updated the asset registry (`site-assets.json`, `photo-slots.json`, `docs/PHOTO_SLOTS.md`) to match.
**Checks:** `check_assets.py` and `build_public_site.py` both pass; confirmed the video auto-copies into `_site/` via the build script's existing regex-based asset discovery. Installed a Playwright browser binary (previously absent) to actually drive the built page: confirmed real video playback (`currentTime` advancing) and confirmed the reduced-motion fallback swap computes correctly; screenshot-verified visually.
**Follow-ups:** None — this was a self-contained restoration, not part of the RICE→Astro migration below (though Phase 2 of that migration needs to carry this markup/CSS over faithfully when it ports `splash.html`).
**Tooling notes:** none.

## [2026-07-16] — Assets/Branding/Chat — Standardize shared brand-asset storage; chat migrates to Astro (Phase 0 + 1 of 3)

**Changed:** Investigating a missing favicon on `chat.stexpedite.press` (no file, no `<link>` tag at all) surfaced the real gap: `scripts/sync-assets.sh` — the sole pipeline pushing canonical `assets/source/` media outward — only ever published to `apps/stex/public/assets/`; RICE and chat were never wired in, so any shared brand asset reaching them required manual copying. Separately, an earlier `apps/web` → `apps/stex` app rename had left 14 files in `assets/` and `branding/` (generated manifests, docs, and branding token files) still referencing the dead path. Phase 0: regenerated `assets/manifest.json`/`.txt` via `npm run assets:sync` and fixed the `apps/web` → `apps/stex` reference in the other 12 files (prose in `.md`/`.html`, literal strings in `branding/export-manifest.json` and `branding/tokens/brand-tokens.{json,css}`). Phase 1: migrated `apps/chat` from a hand-rolled vanilla-JS/`build.mjs` static copy into a minimal Astro project (`astro.config.mjs`, `src/pages/index.astro`, static assets moved to Astro's `public/` convention) — a verbatim port, not a redesign — as the first step of a user-approved full framework-unification plan (target: Astro for all three of stex/rice/chat; RICE migration is Phase 2, deliberately deferred as its own follow-up given its much larger Python-driven editorial image pipeline). `build.mjs` now runs `astro build` then still copies `packages/chat-client/browser.js` into `dist/chat-client.js` exactly as before. The favicon fix itself (`assets/source/img/favicon.svg` → `apps/chat/public/favicon.svg` + `<link rel="icon">`) is preserved verbatim through the migration.
**Checks:** `assets:check` and `check:docs` both pass; confirmed zero remaining `apps/web` references via `grep -rn "apps/web" assets/ branding/`. `npm run build:chat` output is byte-identical to the pre-migration build for `app.js`/`styles.css`/`chat-client.js`; served the built `dist/` and confirmed all assets (including `favicon.svg`) return 200. `lint:html`, `check:links`, `check:a11y`, and `test:backend` (40/40) all pass. `build:rice` (part of the full `build:all`/`check` gate) fails with `python: command not found` — confirmed via `git stash` that this is pre-existing and unrelated to this change (RICE's `.venv` has `python3.9` but no bare `python` on `PATH`); left untouched as Phase 2 territory.
**Follow-ups:** Phase 2 (RICE → Astro) needs its own detailed plan once Astro conventions are proven further; must explicitly preserve RICE's `sample`/`published`-needs-a-route / `planned`/`withdrawn`-needs-`href:null` routing invariant through the templating change. Phase 3 (extend `sync-assets.sh` to loop over all three apps' `public/assets/`) is blocked on Phase 2 landing. The pre-existing `python` vs `python3` gap blocking `build:rice`/`check:rice` locally is unrelated but worth fixing separately (likely a `bootstrap-python-venv.sh` PATH issue). Also noticed (not fixed, out of scope): `branding/export-manifest.json` and `branding/tokens/*` reference some CSS filenames that no longer exist (`base.css`, `donate.css` vs actual `donate-portal.css`) and omit newer files (`chat.css`, `a11y.css`) — a deeper content-drift issue distinct from the path-prefix fix made here.
**Tooling notes:** `scripts/build-asset-manifest.mjs` itself was not stale (correctly hardcodes `apps/stex/...`) — only the checked-in `assets/manifest.json` output was stale from not having been regenerated since the rename. Astro's `public/` convention meant chat's static files (`app.js`, `styles.css`, `favicon.svg`) needed zero path changes in the HTML — same flat references worked unchanged.

## [2026-07-16] — Backend — Recovered missing `api_rate_limits` table in production

**Changed:** Found that `api_rate_limits` did not exist in the live D1 database (`stexpedite-updates`) even though `d1_migrations` recorded migration `0008_api_rate_limits.sql` as applied — `checkRateLimit()` in `apps/backend/src/index.ts` was silently failing open (`mode: "open"`, rate limiting disabled) on every `/api/chat`/`/api/updates`/`/api/donate` request rather than erroring visibly. Added append-only `apps/backend/migrations/0020_recreate_api_rate_limits.sql` (`IF NOT EXISTS`-guarded, identical shape to the original 0008 migration) rather than editing the existing file.
**Checks:** Applied and verified locally first (`wrangler d1 migrations apply --local`, confirmed table creation), then applied to remote with explicit authorization and confirmed `api_rate_limits` exists in production via direct query.
**Follow-ups:** Root cause of the original table's disappearance despite the migration ledger showing it applied was not investigated — worth a look if it recurs.
**Tooling notes:** none.

## [2026-07-16] — Public chat — 12 new Hermes skills across both profiles

**Changed:** Brainstormed and added 12 skills, scoped down to exclude anything needing a new tool grant. 8 for `stexpedite` (owner) under `skills/`: `submission-triage`, `release-notes-and-changelog`, `catalog-and-works-sync`, `rice-issue-planning`, `brand-voice-guard`, `cloudflare-ops-brief`, `donation-storefront-reconciliation`, `social-copy-drafts`. 4 for `stexpedite-public` under `agents/public-guide/skills/`: `press-voice`, `submission-guidance`, `rice-context`, `image-discussion` — pure knowledge/procedure content, no capability grant, each deferring to `SOUL.md` on conflict. `image-discussion` specifically addresses a gap surfaced by the recent vision feature: a photographed manuscript page attached to chat is a way of getting manuscript content past the "submissions never go through chat" boundary, so it instructs a redirect rather than engagement. Also fixed `agents/registry.json`'s stale `model` field for `public-guide` (still said `openrouter/free`; live profile has been on a specific pinned model for a while) and added `skills` path pointers to both profile entries.
**Checks:** New skills confirmed present and enabled (`hermes skills list --source local`) on both live profiles; confirmed the `skills` tool itself (dynamic search/install) stays disabled on the public profile's `api_server` platform — this adds static curated context, not a new model capability.
**Follow-ups:** Considered pruning ~100 irrelevant bundled skills on the owner profile (comfyui, touchdesigner-mcp, polymarket, etc.) but `hermes skills opt-out` is all-or-nothing and would remove useful ones too (github-*, ocr-and-documents) — left undone, flagged for a deliberate per-skill pass. A live probe of `press-voice` didn't clearly reflect its specific framing in one test — plausible small-free-model behavior, not confirmed as a loading failure, worth rechecking if the model tier changes.
**Tooling notes:** `hermes skills install` only accepts a registry identifier or HTTP(S) URL, not a local path; local skills are auto-discovered by directory presence under `<profile>/skills/<category>/<name>/SKILL.md`.

## [2026-07-16] — Public chat — Image attachments (text + vision on the free tier)

**Changed:** Pinned `stexpedite-public` off the unpredictable `openrouter/free` router (which once landed on a moderation-classifier model instead of a chat model) onto a specific vision-capable free model, `google/gemma-4-26b-a4b-it:free` (chosen for 2-provider redundancy — every OpenRouter free model has exactly one backing provider, so this is as redundant as free gets). Extended `/api/chat`'s `ChatMessage.content` to accept an array of text/image parts on a `user` message — but only the *last* message in a request, never earlier history, since the client resends full history each turn and an image on an older message would mean re-transmitting its bytes every subsequent turn. Images are inline base64 `data:` URIs only (no remote URLs — avoids the Worker becoming a URL-fetch proxy), capped at 4 MiB/image with a real `atob` decode to verify size, 6 MiB total body cap (up from 32 KiB). Built the attach-image UI in `apps/chat` (button, preview, transcript thumbnails) and fixed a real bug along the way: `.composer__attachment { display: flex }` was silently overriding the browser's built-in `[hidden] { display: none }` rule, so the attachment preview never actually hid after sending. At the Hermes layer, `vision` had been explicitly disabled for `stexpedite-public` in `ops/hermes/setup-public-profile.sh` since its creation — enabled it and verified live (sent a generated test image, got back an accurate description) before trusting any of the Worker-side work.
**Checks:** 40/40 backend tests (7 new for image validation, 1 fixed since raising the body cap changed what a 33 KiB payload actually trips). `npm run build:chat`, full stex lint/link/a11y gate. Live-verified image understanding via direct Hermes API call and via a real browser driving the actual attach UI.
**Follow-ups:** Commit, push, and deploy only with separate authorization for the code changes here — the Hermes/ops-side changes are already live on the EC2 host.
**Tooling notes:** Every free-tier model on OpenRouter has exactly one backing provider — there is no "more redundant" free option to chase if one gets rate-limited, that's structural to the free tier, not a bad pick.

## [2026-07-15] — Platform — Chat becomes the single intake surface

**Changed:** Removed the "Letters from the press" newsletter signup from the home splash. Retired `/connect` as a live form, converting it to a redirect stub → `https://chat.stexpedite.press` (an inline client script preserves `?about=manuscript` as a `?open=submit` deep link; static meta-refresh is the no-JS fallback). Restored `apps/chat`'s manuscript Submit work dialog and added a visitor-facing general-chat/press-knowledge-base toggle, reversing part of the 2026-07-14 text-only hardening now that this page is the canonical intake, not a sibling of `/connect`. Loosened the backend's origin/surface policy so only `chat.stexpedite.press` may choose between `openui` (default) and `stex`; `stexpedite.press` and `rice.stexpedite.press` stay locked to their single surface, unchanged. Folded the Rights/Press/Collaboration/General human-email form (`/api/contact`) into chat guidance instead of preserving it as a structured form — the AI now hands out `editor@stexpedite.press` when a guaranteed human reply is wanted; `/api/contact` itself is untouched, just no longer linked from any UI. Updated every cross-reference (RICE's submission links, `ChatWidget.astro`'s noscript fallback, `work.astro`/`books.astro`/`404.astro` CTAs, `agents/public-guide/SOUL.md`'s submission guidance) to point at the new destination.
**Checks:** `npm run test:backend` (32 tests, including new origin/surface coverage), `npm run build:all`, `node --check apps/chat/src/app.js` all pass.
**Follow-ups:** Commit, push, and deploy only with separate authorization. Re-run `ops/hermes/setup-public-profile.sh` after deploy so the updated `SOUL.md` reaches the live Hermes profile.
**Tooling notes:** Fixed a latent bug while restoring the chat surface toggle from git history — the pre-hardening `app.js` always hardcoded `requestBody('openui', ...)` regardless of the visible toggle, so switching surfaces never changed what was actually sent (harmless before since the backend also force-matched this origin to `openui` only). The fetch now sends the live `surface` variable.

## [2026-07-14] — Platform — Protected portals, general chat, and EC2 source residency

**Changed:** Recast St. Expedite `/connect` as the canonical Turnstile-protected submission/contact portal, routed RICE submissions into it, removed manuscript/email controls from standalone chat, made `openui` a general public text assistant, retained publication-specific chatbot instructions for St. Expedite/RICE, and listed chat under Work projects. Replaced the stale EC2 checkout with the consolidated monorepo at `/home/ec2-user/src/this-place-feels-wrong` and applied the exact secret-scanned local overlay.
**Checks:** The full repository gate passes on EC2: documentation and shared-client checks, all four builds, 13-route HTML lint, links, accessibility, 31 backend tests, dependency audit threshold, and the RICE asset audit. The local/EC2 diff hashes match exactly.
**Follow-ups:** Commit and deploy only with separate authorization.
**Tooling notes:** Existing Turnstile and Worker submission boundaries avoided adding an unnecessary account system. Built-in read-only reviewers clarified the product/agent boundary; OneDrive obstructed the local Astro build, while EC2 completed it. The attempted timestamped preservation move reported success, but the archive directory was later empty; the old base commit remains in Git history, while its uncommitted overlay was not retained.

## [2026-07-14] — Submissions — Constrained manuscript handoff

**Changed:** Extended `/api/submit` with a 10 MiB allowlisted multipart manuscript path, Resend attachment delivery, D1 metadata, a Connect upload form, and an Osiris submission dialog. The public guide explains and hands off the process but cannot access manuscript bytes or email tools.
**Checks:** Backend tests cover attachment delivery and executable rejection; chat and browser scripts build and parse. Full repository validation remains at closeout.
**Follow-ups:** Apply D1 migration `0019`, install the revised public-guide SOUL, deploy backend/StEx/chat sequentially, and complete a real Turnstile upload canary before enabling broad promotion.
**Tooling notes:** Official Resend and Cloudflare limits supported a conservative 10 MiB raw-file cap.

## [2026-07-14] — Release — Osiris production deployment

**Changed:** Published commit `1ce33e5` to `main`, refreshed the repository's Cloudflare Actions credentials from the local master environment, deployed St. Expedite, RICE, the backend Worker, and the standalone chat, created the `stexpedite-chat` Pages project, and attached the proxied `chat.stexpedite.press` route.
**Checks:** All four GitHub deployment workflows passed. St. Expedite, RICE, the Pages chat origin, the custom chat edge, and `/api/health` returned HTTP 200; chat-origin CORS returned 204 with the expected allow-origin; the isolated EC2 public Hermes service and localhost health endpoint are active.
**Follow-ups:** Complete a browser Turnstile conversation smoke test, add grounded public context and budget controls, and finish separate-OS-user hardening. OpenRouter's free route remains prototype-only.
**Tooling notes:** GitHub CLI was installed and used for authenticated release orchestration. The repository-referenced Cloudflare release skill was absent, so the checked-in deployment runbook and direct Cloudflare API verification were used.

## [2026-07-14] — Osiris four-product consolidation foundation

**Changed:** Reorganized the monorepo around `apps/stex`, `apps/rice`, `apps/chat`, and `apps/backend`; added shared chat contracts, content schemas, and browser transport; and introduced one Osiris agent framework with strictly separate public-guide and private owner-worker identities.
**Checks:** Backend tests (27), shared chat-client tests, Press staged production build (13 routes), RICE validation/build (68 files), standalone chat build, HTML, links, accessibility, documentation, public-boundary, and diff checks passed.
**Follow-ups:** Modularize backend services and public grounding, enforce OS-level runtime isolation, configure preview Worker/Hermes variables, and canary before any production deployment. The free OpenRouter route remains prototype-only.
**Tooling notes:** OneDrive dependency placeholders prevent the in-place Astro build; a disposable local staging copy produced a valid build. No deployment or production mutation was performed.

## [2026-07-13] — Architecture — Isolated public Hermes chat foundation

**Changed:** Added a Turnstile/rate-limited streaming `/api/chat` Worker bridge, accessible chat surfaces for both Press and RICE, and a separately supervised `stexpedite-public` EC2 profile with only an OpenRouter model credential and every API-server toolset disabled. Added reproducible ops guidance and preserved archived RICE main/PR history in a verified offline bundle.
**Checks:** 26 Worker tests, Press Astro production build (13 routes), RICE asset validation and public build (67 files), JS syntax, Hermes localhost/auth/toolset checks, live bounded chat, bundle verification, and restore checks passed.
**Follow-ups:** Production ingress remains intentionally blocked: Cloudflare account/zone/token fields are blank, `llmchat.stexpedite.press` still targets the terminated instance, the tunnel is not provisioned, and Worker Hermes variables remain unset. Make a second archive copy and complete authenticated GitHub metadata audit before separately approving deletion.
**Tooling notes:** The GitHub audit exposed unique PR refs before deletion; Hermes profile/toolset isolation was effective. The public free-model router is prototype-only and must be replaced with a budgeted provider/model policy before production.

---

## [2026-07-13] — Documentation — Canonical RICE ownership reconciled

**Changed:** Recorded `apps/rice/` as the canonical RICE source, the archived standalone repository as historical only, and `/api/works?program=rice` with static `assets/articles.json` fallback plus `/api/updates` as the shared runtime seams.
**Checks:** `git diff --check` passed.
**Follow-ups:** Keep Worker API documentation synchronized with contract changes.
**Tooling notes:** Direct documentation inspection was sufficient.

---

## [2026-06-03] — Phase 2 — v1.1.0: Full aesthetic audit pass (22 issues)

**Entity:** Project
**Process:** Live Site Fix Cycle
**Subagent:** direct
**Changes:** 12 files changed, 1 migration created

**donate-portal.css:** Removed `title-breathe` animation (was causing DONATE heading fuzz/bloom). Turnstile repositioned after preset buttons, centered with `justify-self: center`, `min-height: 65px`. Mobile `padding-top` now clears hero-bar height.
**donate.astro:** Turnstile moved to between `donate-feedback` and `donate-console`.
**mission.css:** `.mission-essay` + `margin-inline: auto` — centers 65ch column on wide screens.
**forms.css:** `.section-copy--large` `max-width` 28rem → 40rem.
**components.css:** `.cf-turnstile { min-height: 65px }` global — reserves widget slot on contact/submit. `.check-list`/`.meta-list` items: reduced padding/border so they read as tags not inputs.
**services.css:** `.services-grid` `margin-top: 1.5rem`.
**portal.css:** `.portal-link-row` added; portal-link font-size reduced to fit 2 per row.
**site.json:** Lab subtitle → "Field instruments". donateThanks title → "Donation" (was "Donation Complete", was wrapping to 2 lines). Homepage footer links consistent across mobile/desktop.
**contact.astro:** "Use the Submit page." → link wraps as a natural unit.
**404.astro:** Footer nav added (Books/About/Contact/Submit/Donate). Sigil gap tightened.
**index.astro:** Mobile portal now shows BOOKS+STORE / crow / ABOUT+LAB in paired rows. Both splash footers include Lab and Store.
**0016_cover_image_lift_wind_webp.sql:** Updates cover_image to webp path (split from 0015 to unblock image fix without requiring buy_url).

**Outstanding:** Run migration 0016 remotely once ready. buy_url for Lift Wind still pending vendor URL.

**Outcome:** All 22 audit items addressed. Full check suite passes. Pushed to main; Cloudflare Pages auto-deploy triggered.

---

## [2026-06-02] — Phase 2 — Portal splash spacing + aesthetic pass findings

**Entity:** Page (index portal)
**Process:** Live Site Fix Cycle
**Subagent:** direct
**Changes:**
- `apps/web/public/assets/css/portal.css`: Desktop `.splash` — `bottom: 3.3vh` → `2vh`; `.lede` margin `0.3rem` → `0.55rem`; `.divider` margin-top `0.4rem` → `0.7rem`; `.splash__foot` added `margin-top: 0.9rem`
- `portal.css`: Mobile `.portal-mobile .lede` margin `0.3rem` → `0.5rem`; `.portal-mobile .divider` margin-top `0.4rem` → `0.65rem`; `.portal-mobile .splash__foot` added `margin-top: 0.65rem`
- `portal.css`: `max-height: 680px` override proportionally adjusted (lede `0.2rem` → `0.3rem`, divider `0.25rem` → `0.4rem`, splash__foot `0.4rem` added)

**Outcome:** Splash block lowered 1.3vh on desktop; "Books // Submit // About // Donate" row now has 0.9rem separation from the △†△ divider. Pending build + deploy to go live.

**Aesthetic pass findings (not yet fixed — open items):**
- `lift-wind-cover.jpg` still black rectangle on /books: migration 0015 needs splitting — run cover_image update independently of buy_url
- `.section-copy--large { max-width: 28rem }` creates lopsided form cards at desktop — increase to ~40rem
- `.mission-essay` 65ch column left-aligned on /about — add `margin-inline: auto` to center it
- `.cf-turnstile` in `.form-grid` has no `min-height` — add `min-height: 65px` to reserve space

---

## [2026-06-02] — Phase 2 — Fix GitHub health monitor after Turnstile activation

**Entity:** CI/Workflow
**Process:** Live Site Fix Cycle
**Subagent:** direct
**Changes:**
- `.github/workflows/api-health-monitor.yml`: `updates` probe expected codes `400` → `400 403`; `contact` probe `400 500` → `400 403 500`; `submit` probe `400 500` → `400 403 500`

**Outcome:** v1.0.9 set `TURNSTILE_SECRET` in the Worker, activating Turnstile verification. The Turnstile check (index.ts:1159) runs before input validation, so unauthenticated POST probes now receive 403 instead of 400. The three broken probes now accept 403 as a valid response. `donate-session` and `updates-unsubscribe` already listed 403 and were unaffected.

---

## [2026-06-01] — Phase 2 — v1.0.9: Turnstile bot protection wired

**Entity:** Project
**Process:** Live Site Fix Cycle
**Subagent:** direct
**Changes:**
- `wrangler secret put TURNSTILE_SECRET` — Cloudflare Managed Turnstile secret set in Worker `stexpedite-communications`
- `form-utils.js`: `getTurnstileToken()` and `resetTurnstile()` helpers exported
- `contact-page.js`, `submit-page.js`, `donate-page.js`: `turnstileToken` included in POST body; `resetTurnstile()` called on error
- `index.astro` inline `wireUpdatesForm`: Turnstile token extracted and included in `/api/updates` POST body
- Turnstile CDN script added to `contact.astro`, `submit.astro`, `donate.astro` scripts slot; `index.astro` head-extra
- `.cf-turnstile` widget divs added to all 4 forms (contact, submit, donate, index updates); `data-size="compact"` on thin form
- Site key: `0x4AAAAAADc-GOYeYwVaZA_I` (Managed mode, `stexpedite.press` hostname)

**Outcome:** All 4 public form surfaces now have bot protection. Worker already had `verifyTurnstile()` logic — it bypassed when secret was empty. Setting the secret activates it automatically for `/api/contact`, `/api/submit`, `/api/donate/session`, and `/api/updates`. Full check suite passes.

---

## [2026-06-01] — Phase 2 — v1.0.8: audit fixes + aesthetic upgrades

**Entity:** Project
**Process:** Live Site Fix Cycle
**Subagent:** direct
**Changes:**
- `donate.astro`: added `<p id="donate-selected-amount">` — restores "X selected. Seal it." copy
- `gallery-page.js`: fallback copy now shows when products.length < 3
- `form-utils.js`: `escapeHtml` extracted here; `books-page.js`, `gallery-page.js`, `lab-anglossic-ui.js` now import it
- `tokens.css`: removed `--dark` alias and `--relief-base` legacy alias (both confirmed unused)
- `404.astro`: `--relief-base` → `--relief` in scoped style
- `donate-portal.css`: `--relief-base` fallbacks → `--relief`; `.donate-feedback` style added; `preset-seal` keyframe on selected preset button; donate-portal glassmorphism preserved
- `dialog.js`: `setBackgroundInert()` helper — sets `inert` on all body children except the dialog container on open/close; completes the ARIA modal pattern
- `lab.css`: `.lab-dialog` glassmorphism — `backdrop-filter: blur(8px)`, border, box-shadow
- `layout.css`: `page-intro__title` font-size → `clamp(1.9rem, 4.5vw, 3.2rem)` (up from 2.2rem max)
- `components.css`: `reveal-up` animation on `.card` gated on `prefers-reduced-motion`
- `interior-base.css`: `reveal-up` animation on `.page-intro`; `@keyframes reveal-up` defined
- `apps/web/package.json`: `@astrojs/cloudflare` removed (dead dependency, 31 packages uninstalled)
- `AGENTS.md §11`: gaps resolved, Closed/Resolved updated

**Outcome:** All Medium + Low audit items resolved except: Turnstile (requires external config), `updates-signup.js` inline dedup (Low), donate/thanks session check (Low), OG image differentiation (Low). Full check suite passes: build ✅ · HTML lint ✅ · links ✅ · a11y ✅ · 20 worker tests ✅ · 0 vuln ✅.

---

## [2026-06-01] — Phase 2 — agent/ dissolution, MCP skills, full site audit

**Entity:** Project
**Process:** Workspace Maintenance, Live Page Audit
**Subagent:** claude (MCP audit — 49 tool calls, all 11 pages)
**Changes:**
- `agent/AGENT.md` dissolved into root `AGENTS.md` (comprehensive doc)
- `agent/` fully dissolved: tools → `scripts/`, ops → `ops/`, skills → `skills/`, kits → `kits/`
- `CLAUDE.md` updated: `@agent/AGENT.md` → `@AGENTS.md`
- `check-tooling-integrity.mjs`, `package.json`, `Makefile`, `agent.config.json`, shell scripts all updated to new paths; `project-ontology.json` and `docs/ontology/ontology.md` updated
- `AGENTS.md §9` MCP Tools section added; §11 Known Gaps expanded with audit findings
- All 4 skills updated with MCP capabilities (playwright, playwright-ea, firecrawl, page-design-guide, screenshot-fast)
- Full 11-page live site audit completed via MCP browser tools

**Audit findings summary:**
- Site is in solid post-v1.0.7 state — no broken pages, all APIs responding, content finalized
- 1 product live in Fourthwall storefront (Lift Wind buy_url null confirmed)
- `donate-page.js` amountLabel null confirmed — "X selected. Seal it." copy never renders
- `dialog.js` focus trap confirmed complete; only gap is no `inert` on background DOM
- `@astrojs/cloudflare` dead dep confirmed
- Turnstile missing from all 5 form surfaces confirmed
- Self-hosted fonts and Session 3 fixes all confirmed live

**Outcome:** Session 4 doc work complete. Next priorities: (1) Turnstile configuration (High infrastructure), (2) donate amountLabel fix + gallery sparse fix (Medium functional), (3) scroll-reveal animations (Medium design — highest visual return), (4) quick-wins: dead dep removal, `--relief-base` fix, `escapeHtml` dedup.

---

## [2026-06-01] — Phase 2 — v1.0.7 deployed; workspace git isolation complete

**Entity:** Project
**Process:** Live Site Fix Cycle, Workspace Maintenance
**Subagent:** direct
**Changes:**
- All v1.0.7 work committed (54 files) and pushed to `St-Expedite-Press/this-place-feels-wrong`
- Self-hosted fonts committed: `apps/web/public/assets/fonts/` (12 woff2 files), `fonts.css`
- `BasePortal.astro` committed; `index.astro`, `donate.astro`, `404.astro` all use it
- `branding/tokens/brand-tokens.css` two-vocabulary bridge committed
- Audit reports committed: `audit/site-audit-2026-05-30.md`, `audit/visual-system-audit-2026-05-31.md`, `audit/code-review-2026-05-31.md`
- `docs/press/` added: commonsplaces, press reference, two book proposals
- `PHASE-PLAN.md` added to repo
- Pre-push hook: build ✅ · HTML lint ✅ · links ✅ · a11y ✅ · 20 worker tests ✅ · 0 vuln ✅
- Cloudflare Pages deploy: `validate` ✅ 27s · `deploy` ✅ 34s — stexpedite.press is live on v1.0.7
- Workspace isolation: this repo and the 3 other workspace projects (`barto-appliance`, `dixie-mag`, `ogc`) each now have their own private GitHub repos; workspace `.gitignore` updated to per-dir exclusions

**Outcome:** All v1.0.7 work is deployed and live. One outstanding item: Lift Wind buy URL — run migration 0015 once the vendor/Amazon link is confirmed. No other known blockers.

---

## [2026-05-31] — Phase 2 — Token reconciliation + branding docs update

**Entity:** Project
**Process:** Live Site Fix Cycle, Workspace Maintenance
**Subagent:** direct
**Changes:**
- `branding/tokens/brand-tokens.css`: Rewritten as a two-vocabulary bridge file. `--brand-*` names for design tools; implementation aliases (`--bg`, `--panel`, `--mode-*`, etc.) declared as `var(--brand-*)` references at the bottom. Both `[data-brand-mode]` override sections now set both vocabularies, keeping them in sync. Single source of truth for all values.
- `branding/README.md`: Updated token description; fixed stale `base.css` → `interior-base.css` path; replaced stale "Recommended Implementation Order" with current "Implementation Status" (tracking what's done vs. remaining)
- `branding/tokens/brand-tokens.json`: Updated version 0.1.0 → 0.2.0, lastUpdated, description, fixed stale `base.css` sourceFile reference
- Lift Wind buy URL: No Amazon listing found publicly. Migration `0015_buy_url_lift_wind.sql` remains ready to run once the link is confirmed.

**Outcome:** Token namespace divergence resolved. Designers using `--brand-*` names in mockups and developers using `--mode-*`/`--text-*` names in CSS are now working from the same file with no value drift risk. All documented items from the full refactor pass are complete.

---

## [2026-05-31] — Phase 2 — Subtitle cleanup, donate layout, book titles, BasePortal, docs

**Entity:** Project
**Process:** Live Site Fix Cycle, Workspace Maintenance
**Subagent:** claude (BasePortal refactor) + direct
**Changes:**
- `site.json`: Removed "The press catalog" (books subtitle) and "Experimental instruments" (lab subtitle) — overexplaining headers
- `SiteHeader.astro`: `subtitle` and `eyebrow` now conditionally rendered — empty string suppresses the element
- `donate-portal.css`: `align-content: space-between` → `center` — closes ~350px vertical void between DONATE heading and form
- `books.css`: `.book-row__title` changed from Cinzel uppercase to Cormorant Garamond weight 600 — literary titles render correctly with accents and mixed case
- `mission.css`: `.mission-essay` constrained to `65ch` (was 44rem); `.essay-phase` headings 0.72rem → 0.8rem, color to `text-soft`
- `BasePortal.astro` (NEW): Shared layout for `index.astro`, `donate.astro`, `404.astro` — eliminates ~120 lines of duplicated `<head>` boilerplate. Supports `bodyClass`, `ogTitle`, `ogDescription`, `pageTitle`, `head-extra` slot.
- `Head.astro`: Extended with `ogTitle`, `ogDescription`, `pageTitle` optional props + `head-extra` named slot
- `index.astro`, `donate.astro`, `404.astro`: All refactored to use `BasePortal.astro`
- `layouts/README.md`: Full prop documentation for both layouts
- `docs/state-of-play.md`: Layout architecture and font delivery sections added
- `CHANGELOG.md`: 1.0.7 entry with all changes from this full refactor pass

**Outcome:** 26 files changed. All M-effort items from the code review are now resolved except: legacy D1 query fallback cleanup (confirmed to check column availability first) and token/branding namespace reconciliation (design decision needed). Site is now deployment-ready — push when buy URL for Lift Wind is confirmed.

---

## [2026-05-31] — Phase 2 — Full visual system audit + code review; 20-file refactor pass

**Entity:** Project
**Process:** Live Page Audit (visual), Code Review, Live Site Fix Cycle
**Subagent:** claude ×2 (parallel background agents) + direct execution
**Changes:**

*Code review (code-review-2026-05-31.md):*
- `gallery-page.js`: Fixed critical ViewTransitions bug — module-scope DOM queries + loadCatalog() now wrapped in `astro:page-load` listener; all element refs moved inside loadCatalog() for fresh DOM access on each navigation
- `index.ts:538`: Stripe webhook "not configured" response changed from 500 → 200 (prevents Stripe retry flood)
- `index.astro` + `404.astro`: Removed stale Google Fonts preconnect hints (fonts are self-hosted)
- `a11y.css` + `donate-portal.css`: Replaced all literal `"Cinzel", serif` / `"Cormorant Garamond", serif` with `var(--font-display)` / `var(--font-body)` (6 instances)
- `index.astro`: Added `aria-label="Primary"` to `.mobile-index-nav`
- `lab.astro`: Added `aria-expanded="false"` + `aria-controls="compass-modal"` to compass-launch button
- `dialog.js`: open/close functions now toggle `aria-expanded` on the trigger element
- `wrangler.toml`: Added comments documenting all 6 required secrets
- `branding/web-elements.md`: Fixed stale `content-shell.css` → `interior-base.css` reference

*Visual system audit (visual-system-audit-2026-05-31.md):*
- `books.astro`: Removed duplicate intro sentence (body repeated page-intro__text verbatim)
- `books.astro`: Swapped button priority — "Submission inquiries" now primary, "Rights/press inquiries" now secondary
- `components.css`: Nav pill font-size 0.72rem → 0.8rem (Cinzel below legibility floor at 11.5px)

**Outcome:** 20 files changed. Critical ViewTransitions bug fixed. 3 critical/security issues addressed. ARIA improved across lab, nav, dialog. Font tokens de-duplicated. Full visual + code audit reports written. M-effort items remaining (BasePortal.astro layout consolidation, legacy D1 query cleanup, token/branding namespace reconciliation, scroll-reveal animation system) — flagged for prioritization.

---

## [2026-05-31] — Phase 1 → 2 — All 10 audit fixes applied

**Entity:** Project
**Process:** Live Site Fix Cycle
**Subagent:** direct
**Changes:**
- `site.json`: donate description rewritten in press voice; donateThanks introTitle/introText replaced (dedup fix); Submit added to footerLinks
- `about.astro`: removed duplicate Osiris opening paragraph (already in Base.astro intro section)
- `layout.css`: nav pills switch to `overflow-x: auto; flex-wrap: nowrap` at ≤480px — no more 3-row wrap
- `gallery.astro` + `gallery-page.js`: static fallback copy wrapped in `#store-fallback-copy`, hidden on successful product load
- `Head.astro` + `Base.astro` + `donate/thanks.astro`: robots prop added with default; donate/thanks now sets `noindex,nofollow`
- `donate.astro`: context copy added above donation form; `.donate-context` style added to `donate-portal.css`
- Fonts self-hosted: `assets/css/fonts.css` created with @font-face for Cinzel + Cormorant Garamond (12 woff2 files in `assets/fonts/`); `site.fontStylesheet` now points to local file; Google Fonts preconnect links removed from Head.astro and donate.astro
- `lift-wind-cover.webp` generated from source JPG via Pillow (1024×1536, RGB)
- Migration `0015_buy_url_lift_wind.sql` created — sets cover_image to webp path; buy_url requires vendor URL before running

**Outcome:** Fixes 3–10 fully applied. Fix 2 (cover image) complete as webp conversion. Fix 1 (buy link) is a migration ready to run once the Amazon/vendor URL is confirmed — the TODO placeholder is in the SQL. Phase 2 (design variants) is now unblocked.

---

## [2026-05-30] — Phase 1 — Full site audit complete

**Entity:** Project
**Process:** Live Page Audit + Site Audit
**Subagent:** claude (with firecrawl, screenshot-fast, design-copier, page-design-guide, source reads)
**Changes:** Full audit of all 11 pages at stexpedite.press. Report written to `audit/site-audit-2026-05-30.md`. PHASE-PLAN.md updated — Phase 1 now complete.
**Outcome:** 10-item priority fix list. Critical issues: (1) *Lift Wind / Love Heat* has no buy link — revenue leak; (2) `lift-wind-cover.jpg` renders as black rectangle — replace with webp; (3) intro text duplication on /about and /donate/thanks. Strong foundations: design token system is architecturally mature, copy quality is excellent, SEO is thorough and correct across all 11 pages. Phase 1 complete — Phase 2 (design variants) unblocked after fixes #1–3 are addressed.

---

## [2026-05-28] — Phase 1 — Project onboarded to workspace

**Entity:** Project
**Process:** Project Onboarding
**Subagent:** claude
**Changes:** Created CLAUDE.md, STEX_SANDBATCH.md, PHASE-PLAN.md, MEMORY.md. Migrated press reference content from `dixie_mag_branding/St Expedite Press/` to `content/`.
**Outcome:** Project is in standard workspace structure. Phase 1 audit is partial — live page issues were previously documented (see workspace auto-memory). Full content inventory and design work pending.
# Agent Framework Entry — 2026-06-25

**Scope:** Agent infrastructure
**Changed:** Refreshed root `ONTOLOGY.md`; updated `AGENTS.md`, `docs/ontology/ontology.md`, and `docs/ontology/project-ontology.json` with the `AGENTS.md`/`ONTOLOGY.md`/`MEMORY.md` framework; added local `AGENTS.md` and `MEMORY.md` files for `apps/web/`, `apps/communications-worker/`, `assets/`, `branding/`, `docs/`, `ops/`, `scripts/`, `skills/`, and `kits/`.
**Checks:** npm run check:tooling-integrity, npm run check, and git diff --check passed for the scaffold.
**Follow-ups:** Keep local memories concise during future work and periodically curate stale entries.
**Tooling notes:** Closeout now explicitly requires memory logging, tooling/skills assessment, and ontology upkeep when contracts move.

---
