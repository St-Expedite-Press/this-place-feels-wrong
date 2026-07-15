# St. Expedite chat

An independent, static OpenUI-style client for the general public Osiris chat profile. It
builds to `dist/` and calls `https://stexpedite.press/api/chat`; it never calls
Hermes directly.

The interface is text-only and always sends the `openui` surface. It has no
file, email, memory, development, deployment, profile-selection, or private
retrieval capability. Publication submissions remain on the protected St.
Expedite `/connect` portal and never enter chat history or Hermes requests.

```bash
npm run build:chat
npm run dev:chat
```

The source is `src/`. `scripts/build.mjs` copies source files and the canonical
`packages/chat-client/browser.js` transport into the generated artifact.
Production deploys manually through `deploy-chat.yml`; the custom hostname is
`https://chat.stexpedite.press`.
