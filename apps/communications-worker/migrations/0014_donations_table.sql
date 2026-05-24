-- Donation log table for Stripe webhook confirmations.
-- One row per confirmed checkout.session.completed event.
-- UNIQUE on stripe_session_id ensures idempotent webhook delivery.

CREATE TABLE IF NOT EXISTS donations (
  id                TEXT    PRIMARY KEY,
  stripe_session_id TEXT    NOT NULL UNIQUE,
  amount_cents      INTEGER,
  email             TEXT,
  payment_status    TEXT,
  receipt_email_id  TEXT,
  received_at       TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_donations_received_at ON donations (received_at);
CREATE INDEX idx_donations_email       ON donations (lower(email));
