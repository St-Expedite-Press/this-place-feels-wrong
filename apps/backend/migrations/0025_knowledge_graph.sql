-- Knowledge graph: the retrieval substrate for chat grounding, and a portable
-- packet. These two tables are a ROW-FOR-ROW MIRROR of the graph packet's
-- `entities[]` and `relations[]` arrays (see the design doc). No D1-specific
-- types, no autoincrement leakage — export is SELECT->JSON, import is JSON->upsert,
-- and the same shape loads into Postgres/SQLite/a flat file unchanged. D1 is a
-- disposable, rebuildable copy; the exported packet is authoritative.

CREATE TABLE IF NOT EXISTS kb_entities (
  id          TEXT PRIMARY KEY,   -- stable id carried in the packet (not an autoincrement)
  type        TEXT NOT NULL,
  name        TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  source_ref  TEXT NOT NULL DEFAULT ''  -- provenance, e.g. works:<project_slug>
);

CREATE TABLE IF NOT EXISTS kb_relations (
  id               TEXT PRIMARY KEY,
  source_entity_id TEXT NOT NULL REFERENCES kb_entities(id),
  target_entity_id TEXT NOT NULL REFERENCES kb_entities(id),
  type             TEXT NOT NULL,
  description      TEXT NOT NULL DEFAULT ''
);

CREATE INDEX idx_kb_entities_name      ON kb_entities (name);
CREATE INDEX idx_kb_relations_source   ON kb_relations (source_entity_id);
CREATE INDEX idx_kb_relations_target   ON kb_relations (target_entity_id);
