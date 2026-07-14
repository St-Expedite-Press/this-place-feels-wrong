# St. Expedite chat

An independent, static OpenUI-style client for the public Osiris guide. It
builds to `dist/` and calls `https://stexpedite.press/api/chat`; it never calls
Hermes directly.

The visible **Submit work** dialog posts a constrained multipart form directly
to `/api/submit`. Manuscript bytes never enter the conversation history or the
Hermes request. The Worker validates one allowlisted document up to 10 MiB,
forwards it to the editor through Resend, and returns a reference number.

```bash
npm run build:chat
npm run dev:chat
```

The source is `src/`. `scripts/build.mjs` copies source files and the canonical
`packages/chat-client/browser.js` transport into the generated artifact.
Production deploys manually through `deploy-chat.yml`; the custom hostname is
`https://chat.stexpedite.press`.
