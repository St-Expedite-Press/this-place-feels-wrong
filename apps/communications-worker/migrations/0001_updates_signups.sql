-- Creates the table used by POST /api/updates.

CREATE TABLE IF NOT EXISTS updates_signups (
  email TEXT PRIMARY KEY,
  first_seen_at TEXT NOT NULL,
  last_seen_at TEXT NOT NULL,
  source TEXT,
  user_agent TEXT,
  unsubscribed_at TEXT
);

