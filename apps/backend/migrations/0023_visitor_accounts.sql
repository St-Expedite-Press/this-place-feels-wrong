-- Visitor accounts: a second, lower-privilege identity class alongside the owner.
-- Same magic-link mechanism as owner auth (0021) — both token and session
-- tables store only a SHA-256 hash of the raw value, never the value itself.
-- expires_at is epoch milliseconds, matching owner_sessions / api_rate_limits.

CREATE TABLE IF NOT EXISTS visitor_accounts (
  id           TEXT    PRIMARY KEY,
  email        TEXT    NOT NULL UNIQUE,
  status       TEXT    NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
  created_at   TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS visitor_login_tokens (
  token_hash   TEXT    PRIMARY KEY,
  email        TEXT    NOT NULL,
  created_at   TEXT    NOT NULL DEFAULT (datetime('now')),
  expires_at   INTEGER NOT NULL,
  used_at      TEXT
);

CREATE TABLE IF NOT EXISTS visitor_sessions (
  session_hash TEXT    PRIMARY KEY,
  account_id   TEXT    NOT NULL REFERENCES visitor_accounts(id),
  created_at   TEXT    NOT NULL DEFAULT (datetime('now')),
  expires_at   INTEGER NOT NULL,
  last_seen_at TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_visitor_login_tokens_expires ON visitor_login_tokens (expires_at);
CREATE INDEX idx_visitor_sessions_expires     ON visitor_sessions (expires_at);
CREATE INDEX idx_visitor_sessions_account     ON visitor_sessions (account_id);
