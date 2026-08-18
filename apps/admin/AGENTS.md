# Admin app agent guide

This directory owns the single-owner admin dashboard.

- Read the root `AGENTS.md`, `ONTOLOGY.md`, and this directory's `MEMORY.md`.
- The browser may call only `/api/admin/*` on the backend Worker
  (`apps/backend/src/index.ts`). Never add a direct D1 connection, a second
  auth mechanism, or a visitor-facing (non-owner) account path here — this is
  intentionally single-user.
- Session state lives entirely in the `stex_owner_session` cookie set by the
  Worker's `GET /api/admin/verify`; this app never reads or writes it
  directly, only relies on the browser sending it via `credentials: "include"`.
- Never edit `dist/`; regenerate it with `npm run build:admin`.
- Live at `https://admin.stexpedite.press` (Cloudflare Pages project
  `stexpedite-admin`), deployed 2026-07-27. CI validates PRs touching
  `apps/admin/**` and deploys on manual dispatch via `deploy-admin.yml`,
  mirroring `deploy-chat.yml` — same "a successful local build does not
  authorize a push or deploy" rule as every other app here.

Closeout requires `npm run build:admin`, `npm run test:backend` (covers the
`/api/admin/*` contract this app depends on), and root/local memory updates
when the admin route contract changes.
