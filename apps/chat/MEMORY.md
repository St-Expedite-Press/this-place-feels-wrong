# Standalone chat memory

## 2026-07-22 — Visitor sign-in, preset picker, preset builder

**Changed:** Added a visitor magic-link sign-in form, a preset `<select>` (sends `presetId` with chat requests via `requestBody`'s new 5th arg), and a "Build a preset" dialog (persona + up to 4 model steps, or import a preset packet file) in the rail. All gated behind `GET /api/visitor/me`; unauthenticated visitors still get the normal surface chat unchanged. New `api-base` meta tag. Part of the visitor-presets feature — see root `MEMORY.md` 2026-07-27.
**Checks:** `node --check app.js`, `npm run build:chat`. Not yet clicked through against a live backend.
**Follow-ups:** Preset builder UI is functional, not brand-polished. No live end-to-end run yet.
**Tooling notes:** none.

## 2026-07-22 — Download/upload conversation (local-only, no server round-trip)

**Changed:** Added `data-download-chat`/`data-upload-chat` buttons + a hidden file input to the rail. Download serializes the in-memory `messages` array (already client-side, never fetched fresh from the server) to a JSON file via `Blob`/`URL.createObjectURL`, no network call. Upload reads the file, validates each entry (`role` must be `user`/`assistant`, `content` must be a non-empty string, capped at `protocol.MAX_MESSAGE_LENGTH`; malformed entries are silently dropped rather than rejecting the whole file), optionally restores `surface` if the file names a valid one, then repaints the transcript and starts a **fresh `conversationId`** — explicitly chosen (owner decision, same conversation as the D1 persistence work above) to keep upload from ever re-transmitting the restored history to the server. This is the direct answer to "I don't want users to have to trust me to hold onto their history": the download file is the durable copy; D1/`sessionStorage` persistence is just a same-session refresh convenience on top.
**Checks:** `node --check app.js` passes; `npm run build:chat` succeeds. The parsing/validation function was extracted and exercised standalone (valid export-shaped file, bare array, mixed valid/invalid entries, invalid `surface` field, non-JSON input) since this app has no in-repo test runner of its own — matches this file's existing verification convention (syntax check + build, no unit tests).
**Follow-ups:** Not yet clicked through in a real browser (no live backend deployed). No visible feedback distinguishing "0 valid messages found" from "file wasn't JSON" beyond the thrown error text reaching `status.textContent` — fine for now, revisit if it proves confusing.
**Tooling notes:** none.

## 2026-07-22 — Conversation persistence + inline updates signup

**Changed:** `app.js` now generates a `conversationId` (`crypto.randomUUID()`, kept in `sessionStorage`), sends it with every `/api/chat` call via `protocol.requestBody`'s new optional 4th argument, regenerates it whenever the transcript resets ("+ New conversation", surface switch — both already meant "start over"), and rehydrates the transcript from `GET /api/chat/history` on load when a prior id is found in `sessionStorage`. `index.astro` gained `chat-history-endpoint`/`updates-endpoint` meta tags and an always-visible inline signup form in the rail (`data-updates-form`), posting straight to `/api/updates` — copied RICE's exact working pattern (`apps/rice/site.js`: honeypot field, no Turnstile token) rather than inventing a new one. This is the "embed signup in chat" direction chosen earlier today over reviving a standalone stex form (see root `MEMORY.md`).
**Checks:** `node --check app.js` passes. `npm run build:chat` succeeds. `npm run test:backend` (50/50) covers the persistence/history contract this depends on. `npm run test:chat-client` covers `requestBody`'s new argument.
**Follow-ups:** Not yet verified in a real browser against a live backend (no Hermes/D1 deployed yet). The inline signup form's copy/placement hasn't had a design pass — it's functional, not yet brand-polished.
**Tooling notes:** History rehydration fails silently (falls back to a blank transcript) rather than surfacing an error — matches this app's existing philosophy of never blocking the chat itself over a non-essential feature.

## 2026-07-16 — Chat migrates from vanilla-JS/build.mjs to Astro (Phase 1 of a 3-app unification)

**Changed:** Replaced the hand-rolled static build (custom `scripts/build.mjs` copying `src/` → `dist/`) with a minimal Astro project: `astro.config.mjs` (`output: 'static'`, `site: 'https://chat.stexpedite.press'`), `src/pages/index.astro` (verbatim port of the former `index.html`), and static files (`app.js`, `styles.css`, `favicon.svg`) moved into Astro's `public/` convention — no path changes needed since Astro serves `public/` flat at the root, matching the existing relative references. `build.mjs` now runs `npx astro build` then still copies `packages/chat-client/browser.js` into `dist/chat-client.js`, unchanged from before. `package.json` gained the `astro` dependency and a `dev: astro dev` script (previously `build.mjs && wrangler pages dev`); added a `preview` script for the old wrangler-based behavior. This is a straight port, not a redesign — first phase of a user-approved full framework unification across stex/rice/chat (target: Astro everywhere; RICE is Phase 2, much higher risk, deliberately deferred).
**Checks:** `npm run build:chat` output verified byte-identical to pre-migration for `app.js`/`styles.css`/`chat-client.js`; served `dist/` locally and confirmed every asset (including the favicon added just before this migration) returns 200. `lint:html`, `check:links`, `check:a11y`, `test:backend` (40/40) all pass; `.github/workflows/deploy-chat.yml` needed no changes (still `npm run build:chat` → deploy `apps/chat/dist`).
**Tooling notes:** `wrangler pages dev` failed locally with a workerd/compatibility-date mismatch unrelated to this change (sandbox clock vs. installed binary) — verified the build output directly with a plain static file server instead.

## 2026-07-15 — Chat becomes the site's single intake surface

**Changed:** Restored the Submit work dialog and a visitor-facing surface toggle (`openui` general chat, default; `stex` "Ask about the press"), reversing the 2026-07-14 text-only hardening now that `/connect` is retired in favor of this page. Added a `?open=submit` deep link for `/connect`, `books.astro`, and RICE's submissions page to land directly in the upload dialog.
**Checks:** `node --check app.js` and `npm run build:chat` pass; `npm run test:backend` covers the new per-origin surface allow-list.
**Tooling notes:** The pre-hardening `app.js` had a latent bug — the surface toggle changed UI copy but the fetch body always hardcoded `requestBody('openui', ...)`, so switching to "Ask about the press" never actually changed what was sent (moot at the time since the backend also force-matched this origin to `openui` only). Fixed while restoring: the fetch now sends the live `surface` variable, and the backend origin/surface policy was loosened specifically for `chat.stexpedite.press` to allow both `openui` and `stex` — so the toggle is now load-bearing, not cosmetic.
**Follow-ups:** Re-run `ops/hermes/setup-public-profile.sh` after deploy so the updated `SOUL.md` submission guidance reaches the live Hermes profile.

## 2026-07-14 — Public chat — General text-only surface

**Changed:** Removed publication switching and the submission/email dialog; the standalone product now always uses `openui` as a general public LLM text surface with a single Turnstile gate.
**Checks:** JavaScript syntax and chat build pass.
**Tooling notes:** Submission remains on `/connect`, preserving a clean no-file/no-email chatbot boundary.

## 2026-07-14 — Submissions — Worker-only upload handoff

**Changed:** Added a guided Submit work dialog that sends manuscript metadata and one document directly to `/api/submit`; file bytes never enter Osiris chat history or Hermes.
**Checks:** Chat build and JavaScript syntax validation pass.
**Follow-ups:** Install the revised public-guide SOUL and run a live Turnstile upload canary after backend deployment.
**Tooling notes:** A separate Turnstile widget keeps chat and submission tokens single-use.

## 2026-07-14 — Initial OpenUI-style client

**Changed:** Added a full-page accessible conversation workspace with
Press/RICE context selection, Turnstile, bounded history, streaming, Stop/New
controls, and the shared browser transport.
**Checks:** Build and syntax validation run at closeout.
**Follow-ups:** Preview deployment, hostname/CORS canary, and visual browser QA
remain gated on backend production configuration.
