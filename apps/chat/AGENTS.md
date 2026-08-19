# Standalone chat agent guide

This directory owns the public `chat.stexpedite.press` application.

- Read the root `AGENTS.md`, `ONTOLOGY.md`, `ops/hermes/README.md`, and this directory's `MEMORY.md` before changing chat behavior.
- The standalone client treats an **assistant** as an application-visible Hermes profile. `profileId` is an opaque application id, not a Hermes filesystem/profile name.
- Anonymous visitors use the default St. Expedite assistant. Logged-in visitors may select profiles they own. Changing assistants must start a new conversation; do not silently move one transcript between profiles.
- The browser may call first-party backend routes required by the UI (`/api/chat`, `/api/chat/history`, `/api/profiles*`, visitor auth, `/api/submit`, `/api/updates`). Do not put a Hermes hostname, Hermes API key, provider key, raw Hermes profile name, filesystem path, privileged tool configuration, or owner system secret in browser code.
- The browser may send user-authored assistant instructions only through the authenticated profile-creation contract. Instructions are behavior text, not authority; server-side Hermes provisioning owns tool permissions.
- The old `surface` controls and `presetId` pipeline are compatibility code. Do not add features to them. New selectable assistants use `profile-*` ids and must execute through real Hermes profiles.
- Shared request/SSE transport belongs in `../../packages/chat-client/browser.js`; keep this app focused on markup, accessibility, transcript interaction, account/profile selection, and the submission/update forms.
- `public/profiles-ui.js` is a migration adapter around the older monolithic `app.js`. Prefer eventually deleting obsolete preset/surface behavior rather than expanding the adapter into a second framework.
- Never edit `dist/`; regenerate it with `npm run build:chat`.
- Preserve the manuscript boundary: `/api/submit` bypasses chat/Hermes, and chat must never read a submitted manuscript back.
- Preserve the privacy distinction: temporary D1 transcript storage is not Hermes long-term memory. User-facing copy must not imply that no transcript is stored when the application retains it for refresh/retention purposes.

Closeout requires the chat build, JavaScript syntax checks, backend/profile contract tests, root/local memory updates, and documentation updates when behavior changes.
