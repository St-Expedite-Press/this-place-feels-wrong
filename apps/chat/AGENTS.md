# Standalone chat agent guide

This directory owns the OpenUI-style public chat application.

- Read the root `AGENTS.md`, `ONTOLOGY.md`, and this directory's `MEMORY.md`.
- The browser may call only the backend `/api/chat` contract. Never place a
  Hermes hostname, bearer key, model selector, profile selector, or system
  prompt in browser code.
- Shared transport belongs in `../../packages/chat-client/browser.js`; keep
  this app focused on markup, accessibility, and branded interaction.
- Never edit `dist/`; regenerate it with `npm run build:chat`.

Closeout requires the chat build, JavaScript syntax checks, root/local memory,
and contract/docs updates when request behavior changes.
