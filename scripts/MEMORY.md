# Scripts Memory

## 2026-07-14 — Scripts — Four-product paths and shared-client sync

**Changed:** Updated build, development, deployment, asset, link, accessibility, and backend-variable helpers for the four-product topology; added deterministic shared chat-client synchronization and drift checking.
**Checks:** Syntax, path, sync, product-build, link, accessibility, and diff checks passed.
**Follow-ups:** Keep compatibility aliases only until downstream automation adopts the explicit product names.
**Tooling notes:** Generated copies remain derived from `packages/chat-client/browser.js`.

## 2026-06-25 — Scripts — Local agent scaffold

**Changed:** Added local scripts guide and memory.
**Checks:** npm run check and git diff --check passed for the scaffold.
**Follow-ups:** Record future command, wrapper, and validation-script contract changes here.
**Tooling notes:** Script changes should update package/make wrappers and ontology together.
