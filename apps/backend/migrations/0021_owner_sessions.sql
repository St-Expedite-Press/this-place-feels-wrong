-- Owner-only magic-link auth: single-use login tokens and long-lived sessions.
-- Both tables store only a SHA-256 hash of the actual token/session value;
-- the raw value exists only in the emailed link / the browser cookie, never in D1.
-- expires_at is epoch milliseconds, matching api_rate_limits.reset_at's convention.

CREATE TABLE IF NOT EXISTS owner_login_tokens (
  token_hash TEXT    PRIMARY KEY,
  created_at TEXT    NOT NULL DEFAULT (datetime('now')),
  expires_at INTEGER NOT NULL,
  used_at    TEXT
);

CREATE TABLE IF NOT EXISTS owner_sessions (
  session_hash TEXT    PRIMARY KEY,
  created_at   TEXT    NOT NULL DEFAULT (datetime('now')),
  expires_at   INTEGER NOT NULL,
  last_seen_at TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_owner_login_tokens_expires ON owner_login_tokens (expires_at);
CREATE INDEX idx_owner_sessions_expires     ON owner_sessions (expires_at);
