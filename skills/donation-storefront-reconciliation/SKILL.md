---
name: donation-storefront-reconciliation
description: Cross-check Stripe donation records and the Fourthwall storefront snapshot against D1 to catch webhook drift or missed receipts. Use when a donation or storefront number looks off, after a Stripe/Fourthwall incident, or as a periodic reconciliation pass.
---

# Donation and Storefront Reconciliation

## Workflow

1. Read `apps/backend/migrations/0014_donations_table.sql` for the D1
   donations schema, and `apps/backend/src/index.ts`'s
   `/api/donate/session` and `/api/stripe/webhook` handlers for how a
   donation is created (Stripe checkout session) and confirmed (webhook →
   D1 log + receipt).
2. For a reconciliation pass: compare Stripe's dashboard/API record of
   recent successful charges against D1's donation log for the same
   window. A charge with no matching D1 row means the webhook didn't land
   (or failed) — that's the actual bug to chase, not a UI issue.
3. For storefront checks: `GET /api/storefront` returns a live Fourthwall
   catalog snapshot (not a D1 cache) — compare against Fourthwall's own
   dashboard for the same items if a listing looks stale or missing;
   drift here is more likely a Fourthwall-side sync delay than a bug in
   this repo.
4. Use `ops/cloudflare-stability/scripts/smoke-api.sh --full` (which
   includes gated donate/submit probes) to confirm the checkout-session
   path itself is healthy before assuming a data problem.

## Guardrails

- Never fabricate a reconciled total — if Stripe and D1 disagree and you
  can't determine which is right, say so and flag it rather than picking
  one.
- Do not print Stripe secret keys, webhook signing secrets, or full card
  metadata; work from transaction IDs, amounts, and timestamps only.
- Any fix (replaying a webhook, re-triggering a receipt) is a production
  write and needs explicit authorization, same as any deploy.
