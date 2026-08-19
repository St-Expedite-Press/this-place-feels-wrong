# St. Expedite chat

An independent static client for `https://chat.stexpedite.press`. It calls the St. Expedite Worker API and never calls Hermes or a model provider directly.

The standalone chat now treats an assistant as a Hermes profile.

## Default experience

Anonymous visitors get one default assistant: **St. Expedite**. It is the locked `stexpedite-public` Hermes profile. It behaves as a general-purpose assistant and also receives verified public St. Expedite/RICE context from the Worker when relevant.

There is no longer a meaningful visitor choice between "General chat" and "Ask about the press" on this standalone client. The old surface controls remain in markup temporarily only because the legacy browser controller is still shared with embedded clients; `profiles-ui.js` hides them here during migration.

## Signed-in visitors

A verified visitor account may select private assistants it owns and may create a new assistant. Each created assistant maps to a real isolated Hermes profile. The browser sends only an opaque application profile id; it never receives the Hermes profile name, Hermes API key, provider key, filesystem path, or tool configuration.

The current builder exposes:

- assistant name;
- assistant instructions;
- main model;
- optional delegation model.

The model choices come from the owner-controlled server allow-list. A profile cannot grant itself terminal, file, browser, deployment, memory, code-execution, or private Press access by changing its instructions.

## Other flows

- **Submit work** posts multipart form data directly to `/api/submit`. Manuscript bytes and metadata never enter chat history or a Hermes request. Only the receipt/reference is appended to the visible transcript.
- **Get updates** posts directly to `/api/updates` and never enters Hermes.
- **Download / Upload conversation** remains browser-local. Upload redraws the page and starts a fresh server conversation id; it does not upload the old transcript back to the server.
- **Temporary history** uses a client-generated `conversationId` and `/api/chat/history`. D1 may retain the text transcript for up to 30 days so refresh can restore it. This is application transcript storage, not Hermes long-term memory.

The client has no development, deployment, private-retrieval, or manuscript-readback capability.

## Source

```text
src/pages/index.astro        page structure
public/app.js                legacy browser controller
public/profiles-ui.js        profile-native standalone UI adapter
public/styles.css            presentation
packages/chat-client/        shared request/SSE transport
```

The adapter is intentionally transitional: once embedded clients no longer depend on the old surface/preset controller, fold assistant/profile behavior into a smaller conventional browser module and remove obsolete preset/surface UI code rather than creating another abstraction layer.

## Commands

```bash
npm run build:chat
npm run dev:chat
```

`scripts/build.mjs` copies the canonical `packages/chat-client/browser.js` transport into the generated artifact. Production deployment remains an explicit action; this migration branch must not be deployed until the backend migration and Hermes host service are verified.
