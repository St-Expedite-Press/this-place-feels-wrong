-- Hermes-backed assistants. D1 owns application identity/authorization; Hermes
-- remains the runtime source of truth for each assistant profile.

CREATE TABLE IF NOT EXISTS assistant_profiles (
  id                 TEXT    PRIMARY KEY,
  owner_account_id   TEXT    REFERENCES visitor_accounts(id),
  hermes_profile_name TEXT   NOT NULL UNIQUE,
  display_name       TEXT    NOT NULL,
  description        TEXT,
  instructions       TEXT    NOT NULL DEFAULT '',
  primary_model      TEXT    NOT NULL DEFAULT '',
  delegation_model   TEXT,
  visibility         TEXT    NOT NULL DEFAULT 'private' CHECK (visibility IN ('public', 'private')),
  status             TEXT    NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'ready', 'error')),
  is_default         INTEGER NOT NULL DEFAULT 0 CHECK (is_default IN (0, 1)),
  created_at         TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at         TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_assistant_profiles_owner
  ON assistant_profiles (owner_account_id, created_at);
CREATE INDEX IF NOT EXISTS idx_assistant_profiles_visibility
  ON assistant_profiles (visibility, status);
CREATE UNIQUE INDEX IF NOT EXISTS idx_assistant_profiles_one_default
  ON assistant_profiles (is_default)
  WHERE is_default = 1;

INSERT OR IGNORE INTO assistant_profiles (
  id,
  owner_account_id,
  hermes_profile_name,
  display_name,
  description,
  instructions,
  primary_model,
  visibility,
  status,
  is_default
) VALUES (
  'profile-stexpedite',
  NULL,
  'stexpedite-public',
  'St. Expedite',
  'The public St. Expedite Press assistant.',
  '',
  '',
  'public',
  'ready',
  1
);

-- Bind newly-created conversations to one assistant. Existing conversations
-- remain nullable for compatibility and continue to use the legacy public path.
ALTER TABLE chat_conversations ADD COLUMN profile_id TEXT REFERENCES assistant_profiles(id);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_profile
  ON chat_conversations (profile_id, last_message_at);
