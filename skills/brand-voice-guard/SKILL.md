---
name: brand-voice-guard
description: Check new copy, UI text, or generated content against St. Expedite Press's design system and voice before it ships. Use before publishing new page copy, chat system prompts, social copy, or any visitor-facing text.
---

# Brand Voice Guard

A consistency check, not a copy generator — flag drift, don't rewrite
wholesale unless asked.

## Workflow

1. Read `branding/` (tokens + exports) and `docs/branding/` (prose voice
   docs) before reviewing anything.
2. Check tone: "dark void aesthetic" — measured, editorial, not marketing-
   breathless. Root `AGENTS.md`'s design-system section is the fast
   reference: Cinzel (display) / Cormorant Garamond (body) / system mono
   (kickers, metadata, instrument text); body copy is warm cream
   (`--text-readable`), not signal green; signal green is accent-only;
   magenta (`--relief`) is anomaly/relief only, never routine emphasis.
3. Check brand mode fit: `ritual` (home/lab — most intense), `editorial`
   (books/about/work/store — measured), `utility` (chat/donate —
   task-focused). New copy should read like its mode, not like the others.
4. For any new UI color, confirm it resolves to a token in
   `apps/stex/public/assets/css/tokens.css` — flag raw hex/rgba in
   component CSS, per `AGENTS.md`'s explicit rule against it.
5. For AI-facing copy specifically (chat system prompts, `SOUL.md`), voice
   matters less than accuracy and boundary-correctness — don't apply this
   skill's tone guidance in a way that would soften a safety/boundary
   instruction for the sake of "sounding more in-voice."

## Guardrails

- This skill informs a review comment or a small copy edit; it doesn't
  authorize a redesign or a new brand mode on its own.
- When in doubt about a genuinely new pattern (not covered by existing
  tokens/docs), flag it for a human design decision rather than guessing.
