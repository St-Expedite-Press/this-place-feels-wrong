# St. Expedite chat

An independent, static OpenUI-style client for the public Osiris guide. It
builds to `dist/` and calls `https://stexpedite.press/api/chat`; it never calls
Hermes directly.

```bash
npm run build:chat
npm run dev:chat
```

The source is `src/`. `scripts/build.mjs` copies source files and the canonical
`packages/chat-client/browser.js` transport into the generated artifact.
Production release is manual until the Pages project, custom hostname,
Turnstile hostname, backend origin pairing, and canary checks are complete.
