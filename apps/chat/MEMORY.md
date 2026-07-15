# Standalone chat memory

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
