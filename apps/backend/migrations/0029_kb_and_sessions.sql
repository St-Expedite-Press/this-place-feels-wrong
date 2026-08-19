-- Knowledge-base chat: pluggable KB registry, document backend, account-owned sessions.
-- Additive. The existing works-graph (kb_entities/kb_relations from 0025) becomes the
-- default official graph KB via a seeded knowledge_bases row + backfilled kb_id.

CREATE TABLE IF NOT EXISTS knowledge_bases (
  id               TEXT PRIMARY KEY,
  owner_account_id TEXT REFERENCES visitor_accounts(id),   -- NULL = official/press KB
  name             TEXT NOT NULL,
  kind             TEXT NOT NULL CHECK (kind IN ('graph','documents','connector')),
  config_json      TEXT NOT NULL DEFAULT '{}',
  status           TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','disabled')),
  created_at       TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS kb_documents (
  id         TEXT PRIMARY KEY,
  kb_id      TEXT NOT NULL REFERENCES knowledge_bases(id),
  title      TEXT NOT NULL,
  source_ref TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS kb_chunks (
  id          TEXT PRIMARY KEY,
  kb_id       TEXT NOT NULL REFERENCES knowledge_bases(id),
  document_id TEXT NOT NULL REFERENCES kb_documents(id),
  ordinal     INTEGER NOT NULL,
  content     TEXT NOT NULL,
  embedding   TEXT NOT NULL DEFAULT ''      -- JSON array of floats
);

CREATE TABLE IF NOT EXISTS chat_sessions (
  id               TEXT PRIMARY KEY,
  owner_account_id TEXT NOT NULL REFERENCES visitor_accounts(id),
  title            TEXT NOT NULL DEFAULT '',
  kb_id            TEXT REFERENCES knowledge_bases(id),
  preset_id        TEXT REFERENCES presets(id),
  created_at       TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at       TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Scope the existing graph to a KB, and link messages to sessions.
ALTER TABLE kb_entities  ADD COLUMN kb_id      TEXT;
ALTER TABLE kb_relations ADD COLUMN kb_id      TEXT;
ALTER TABLE chat_messages ADD COLUMN session_id TEXT;

-- Seed the existing works graph as the default official graph KB and backfill.
INSERT INTO knowledge_bases (id, owner_account_id, name, kind, status)
  VALUES ('kb_works', NULL, 'Press catalog graph', 'graph', 'active')
  ON CONFLICT(id) DO NOTHING;
UPDATE kb_entities  SET kb_id = 'kb_works' WHERE kb_id IS NULL;
UPDATE kb_relations SET kb_id = 'kb_works' WHERE kb_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_kb_documents_kb   ON kb_documents (kb_id);
CREATE INDEX IF NOT EXISTS idx_kb_chunks_kb      ON kb_chunks (kb_id);
CREATE INDEX IF NOT EXISTS idx_kb_entities_kb    ON kb_entities (kb_id);
CREATE INDEX IF NOT EXISTS idx_kb_relations_kb   ON kb_relations (kb_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_owner ON chat_sessions (owner_account_id);
