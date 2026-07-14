# Shared chat client

`browser.js` is the browser-safe transport used by the St. Expedite, RICE,
and full-page chat clients. It owns the public request shape, bounded history,
and OpenAI-compatible SSE parsing. It never contains an upstream URL, model
credential, Hermes profile name, or privileged behavior.

Run `npm run sync:chat-client` from the repository root after changing it.
The sync command updates the tracked browser copies consumed by the static
site builds; `npm run check:chat-client` fails when they drift.
