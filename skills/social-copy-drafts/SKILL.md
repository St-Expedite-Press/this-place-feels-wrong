---
name: social-copy-drafts
description: Draft announcement copy for new book releases, RICE issues, or press updates, in brand voice, for the editor to review before posting. Use when asked to draft a social post, newsletter blurb, or announcement.
---

# Social Copy Drafts

Drafts only — this skill never posts anything itself; there is no
publishing tool wired to any social platform in this repo.

## Workflow

1. Apply `skills/brand-voice-guard/SKILL.md` first — pull tone from
   `branding/`/`docs/branding/` before drafting anything.
2. Ground every factual claim (title, date, price, availability) in real
   data: `GET /api/works` for books, `apps/rice/assets/articles.json` or
   the live RICE site for issue content — never invent a publication date,
   price, or availability status.
3. Draft 2-3 length variants (short/platform-constrained, medium, long/
   newsletter) so the editor can pick without a second round-trip.
4. Include a real, working link (stexpedite.press or rice.stexpedite.press
   page) with every draft — no placeholder URLs.
5. Flag anything that reads like a firm commitment (a date, a guarantee)
   that isn't independently confirmed — better to draft it softer and let
   the editor tighten it than overpromise on the press's behalf.

## Guardrails

- No claims about reviews, sales figures, or press coverage unless given
  directly — don't manufacture social proof.
- This produces drafts for human review and manual posting; it has no
  connection to any social platform's API.
