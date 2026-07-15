# St. Expedite chat

An independent, static OpenUI-style client for the general public Osiris chat profile. It
builds to `dist/` and calls `https://stexpedite.press/api/chat`; it never calls
Hermes directly.

This is the site's single public intake surface — the "Chat" nav link on
stexpedite.press, RICE's submission portal, and the press's manuscript/rights/
press/collaboration CTAs all land here. It has three flows:

- **General chat** (`openui` surface, default) and **Ask about the press**
  (`stex` surface) — a visitor-controlled toggle in the rail. Both are bounded
  enum choices validated by the Worker against this origin's allow-list; the
  browser never supplies a system prompt, only picks which server-owned one to
  use.
- **Submit work** — an always-visible dialog that POSTs multipart form data
  directly to `/api/submit`. This bypasses chat/Hermes entirely: file bytes
  and manuscript metadata never enter chat history or a Hermes request, only a
  confirmation message (with reference number) is appended to the transcript
  on success. Opening `?open=submit` in the URL auto-opens this dialog (used
  by deep links from `/connect`, `books.astro`, and RICE's submissions page).

It has no email, memory, development, deployment, or private-retrieval
capability, and cannot read back a submitted manuscript once sent.

```bash
npm run build:chat
npm run dev:chat
```

The source is `src/`. `scripts/build.mjs` copies source files and the canonical
`packages/chat-client/browser.js` transport into the generated artifact.
Production deploys manually through `deploy-chat.yml`; the custom hostname is
`https://chat.stexpedite.press`.
