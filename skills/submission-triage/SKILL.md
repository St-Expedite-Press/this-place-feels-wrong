---
name: submission-triage
description: Summarize new manuscript submissions and general correspondence for editorial review. Use when asked to review, triage, or catch up on incoming submissions, or when `apps/backend/migrations/0019_submission_attachments.sql`-era submission metadata needs a human-readable digest.
---

# Submission Triage

Read-only. This skill drafts a summary for the editor to act on; it never
accepts, rejects, or replies to a submission on its own.

## Workflow

1. Pull recent submission metadata from D1 (`stexpedite-updates`, the
   `contact_submissions`/works-adjacent tables introduced across
   `apps/backend/migrations/0011_contact_submissions_and_biblio_fields.sql`
   and `0019_submission_attachments.sql`) — filename, size, content type,
   submitter email, author name, work title, genre, note, and the
   `SUBMIT-…` reference. Never the manuscript bytes themselves; per
   `apps/backend/src/index.ts`, attachment content is forwarded to Resend and
   is not retained in D1.
2. For each submission, draft a one-paragraph summary: what it is, stated
   genre/length signal from the note field, and anything that looks
   incomplete or malformed (missing consent, empty note, suspicious genre
   field).
3. Group by age (oldest first) and flag anything older than a week without a
   recorded reply.
4. Present as a scannable list, not a table dump — the editor reads this to
   decide what to open next, not to re-derive the raw data.

## Guardrails

- This is a drafting aid, not a decision. Never imply a submission was
  accepted, rejected, or replied to unless that's independently confirmed.
- Do not invent genre, quality, or fit judgments beyond what the submitter
  wrote in the note field.
- Never surface donor, subscriber, or other non-submission personal data
  while doing this — stay scoped to `contact_submissions`/attachment
  metadata.
