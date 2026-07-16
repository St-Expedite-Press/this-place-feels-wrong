---
name: release-notes-and-changelog
description: Draft MEMORY.md and CHANGELOG.md entries from a diff or session of work, in this repo's established format. Use at the close of any file-changing task, per root AGENTS.md's closeout loop, or when asked to write up recent changes.
---

# Release Notes and Changelog

## Workflow

1. Identify the touched subtrees from `git diff --stat` or the session's
   file list. Each touched app/dir with its own `MEMORY.md`
   (`apps/stex/`, `apps/rice/`, `apps/chat/`, `apps/backend/`, `agents/`,
   `packages/`, `assets/`, `branding/`, `docs/`, `scripts/`, `ops/`,
   `skills/`, `kits/`) gets its own entry in addition to the root one.
2. Match the existing format exactly — read a few recent entries in the
   target `MEMORY.md` first, then write:
   ```
   ## [YYYY-MM-DD] — Area — Title
   **Changed:** what actually changed, in prose, naming real files/routes.
   **Checks:** which commands were run and their result (test:backend,
   build:all, lint:html, check:links, check:a11y, etc. — only the ones
   actually run).
   **Follow-ups:** anything gated on a later step (deploy, migration apply,
   ops re-run) — omit this line if there are none.
   **Tooling notes:** anything a future agent should know that isn't obvious
   from the diff (a bug fixed along the way, a design tradeoff, a gotcha).
   ```
3. For `CHANGELOG.md` (root, user-facing release history — distinct from
   `MEMORY.md`'s agent-facing session log): only add an entry for
   changes that affect what a visitor or deployer experiences, in plainer
   language than `MEMORY.md`.
4. Never backdate or invent a date; use the actual date the change was made.
5. Keep entries prepended (newest first), matching the existing file order.

## Guardrails

- Don't summarize work that didn't happen — if checks weren't run, say so
  rather than implying they passed.
- Don't fold multiple unrelated changes into one entry; split them.
- This drafts the entry; per `AGENTS.md`, committing it is part of the
  normal edit flow, but push/deploy still needs separate authorization.
