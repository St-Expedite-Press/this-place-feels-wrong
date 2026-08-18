-- Chat conversation persistence: an opaque, client-generated conversation id
-- (not tied to any account) maps to a small transcript. Images are never
-- stored here (only "[image attached]" placeholder text) — only the raw
-- upload sent live to Hermes for that one turn ever carries image bytes.
-- Rows are purged by the Worker's scheduled() handler after 30 days.

CREATE TABLE IF NOT EXISTS chat_conversations (
  id              TEXT    PRIMARY KEY,
  surface         TEXT    NOT NULL,
  created_at      TEXT    NOT NULL DEFAULT (datetime('now')),
  last_message_at TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  conversation_id TEXT    NOT NULL REFERENCES chat_conversations(id),
  role            TEXT    NOT NULL CHECK (role IN ('user', 'assistant')),
  content         TEXT    NOT NULL,
  created_at      TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_chat_messages_conversation      ON chat_messages (conversation_id, id);
CREATE INDEX idx_chat_conversations_last_message ON chat_conversations (last_message_at);
