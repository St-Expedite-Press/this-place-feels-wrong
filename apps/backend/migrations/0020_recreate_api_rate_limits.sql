-- api_rate_limits is missing from the live database even though migration
-- 0008 is recorded as applied in d1_migrations. checkRateLimit() in
-- src/index.ts fails open on the missing table (rate limiting is silently
-- disabled), so recreate it. IF NOT EXISTS makes this safe to apply
-- regardless of how the original table was lost.

CREATE TABLE IF NOT EXISTS api_rate_limits (
  bucket_key TEXT PRIMARY KEY,
  count INTEGER NOT NULL DEFAULT 0,
  reset_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_api_rate_limits_reset_at
  ON api_rate_limits (reset_at);
