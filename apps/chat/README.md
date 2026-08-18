# St. Expedite chat

An independent, static OpenUI-style client for the general public Osiris chat profile. It
builds to `dist/` and calls `https://stexpedite.press/api/chat`; it never calls
Hermes directly.

This is the site's single public intake surface — the "Chat" nav link on
stexpedite.press, RICE's submission portal, and the press's manuscript/rights/
press/collaboration CTAs all land here. It has four flows:

- **General chat** (`openui` surface, default) and **Ask about the press**
  (`stex` surface) — a visitor-controlled toggle in the rail. Both are bounded
  enum choices validated by the Worker against this origin's allow-list; the
  browser never supplies a system prompt, only picks which server-owned one to
  use. The conversation persists across a page refresh (not a browser
  restart) via a client-generated `conversationId` and `GET /api/chat/history`
  — this is Worker/D1-side bookkeeping only; the public Hermes profile itself
  still has memory disabled, unchanged, per the public/owner isolation
  boundary in `ops/hermes/README.md`.
- **Submit work** — an always-visible dialog that POSTs multipart form data
  directly to `/api/submit`. This bypasses chat/Hermes entirely: file bytes
  and manuscript metadata never enter chat history or a Hermes request, only a
  confirmation message (with reference number) is appended to the transcript
  on success. Opening `?open=submit` in the URL auto-opens this dialog (used
  by deep links from `/connect`, `books.astro`, and RICE's submissions page).
- **Get updates on new releases** — an always-visible inline form in the rail
  that posts directly to `/api/updates`, same as RICE's signup widget. Never
  touches chat history or Hermes.
- **Download / Upload conversation** — the transcript is exported to a local
  JSON file (`Blob` + a hidden `<a download>`, no server round-trip) and can
  be re-imported the same way. Upload is deliberately local-only: it repaints
  the transcript from the file and starts a fresh `conversationId` for
  anything sent afterward, but never re-uploads the restored history to the
  server. The point is that a visitor's own downloaded file, not the 30-day
  D1 store, is the thing they can actually rely on to keep their history.

It has no development, deployment, or private-retrieval capability, and
cannot read back a submitted manuscript once sent.

```bash
npm run build:chat
npm run dev:chat
```

The source is `public/` (Astro's static-asset convention) plus
`src/pages/index.astro`. `scripts/build.mjs` copies the canonical
`packages/chat-client/browser.js` transport into the generated artifact.
Production deploys manually through `deploy-chat.yml`; the custom hostname is
`https://chat.stexpedite.press`.
