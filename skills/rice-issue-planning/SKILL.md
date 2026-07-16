---
name: rice-issue-planning
description: Help plan a new RICE Magazine issue — seasonal theme, contributor/town scope, and submission windows. Use when starting a new RICE issue, updating apps/rice/docs planning material, or reviewing RICE's editorial calendar.
---

# RICE Issue Planning

## Workflow

1. Read `apps/rice/docs/` and `apps/rice/AGENTS.md`/`apps/rice/ONTOLOGY.md`
   for the current maintained structure and any documented seasonal
   convention (per the press's own framing: "four seasonal Southern
   literary and documentary journals, sixteen college towns, one finite
   year").
2. Check the current issue's actual published state via `GET
   /api/works?program=rice` and `apps/rice/assets/articles.json`, not just
   planning docs — confirm what's really live before proposing what's next.
3. Draft a planning brief: theme/season, target town(s) if the format calls
   for one, a submission-window date range, and what sections are
   placeholder vs. real per the existing site structure.
4. Cross-check any proposed submission-window dates against the live
   `/connect`-successor flow (chat.stexpedite.press's Submit work dialog)
   and `apps/rice/submissions.html`'s copy, so the plan and the public-facing
   submission page stay consistent.
5. Do not publish or restructure `apps/rice/` content from this skill alone
   — it drafts the plan; implementing it is ordinary edit work, subject to
   the same build/check gate as any RICE change (`npm run check:rice`,
   `npm run build:rice`).

## Guardrails

- `apps/rice/` is the canonical maintained RICE source; the archived
  standalone `rice-magazine` repo is historical reference only — never
  import from it as if it were current.
- Don't invent contributor names, town commitments, or dates not already
  confirmed somewhere in the repo or given directly by the editor.
