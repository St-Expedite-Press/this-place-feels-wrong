# Standalone chat memory

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
