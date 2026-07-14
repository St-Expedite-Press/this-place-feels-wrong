-- Unify the catalog into a single `works` model spanning St. Expedite books
-- and RICE editorial works. Rebuild pattern (SQLite) to: rename
-- oncoming_projects -> works, expand the status CHECK (add sample, withdrawn),
-- relax author to nullable (RICE planned works have no author yet), and add the
-- unified columns kind/place/keywords/disclosure/href.

CREATE TABLE works (
  id                 INTEGER PRIMARY KEY AUTOINCREMENT,
  project_slug       TEXT    NOT NULL UNIQUE,
  program_key        TEXT    NOT NULL,
  series_key         TEXT    NOT NULL,
  series_title       TEXT    NOT NULL,
  cluster_key        TEXT,
  cluster_title      TEXT,
  author             TEXT,
  title              TEXT    NOT NULL,
  subtitle           TEXT,
  publication_year   INTEGER,
  status             TEXT    NOT NULL DEFAULT 'planned'
                             CHECK (status IN ('concept','planned','in_progress','forthcoming','sample','published','withdrawn')),
  sort_order         INTEGER NOT NULL,
  notes              TEXT,
  created_at         TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at         TEXT    NOT NULL DEFAULT (datetime('now')),
  cover_image        TEXT,
  popup_description  TEXT,
  buy_url            TEXT,
  completion_percent REAL,
  isbn               TEXT,
  published_at       TEXT,
  page_count         INTEGER,
  -- unified additions (RICE + future editorial works)
  kind               TEXT    NOT NULL DEFAULT 'book',
  place              TEXT,
  keywords           TEXT,   -- JSON array as text
  disclosure         TEXT,
  href               TEXT
);

INSERT INTO works (
  id, project_slug, program_key, series_key, series_title,
  cluster_key, cluster_title, author, title, subtitle,
  publication_year, status, sort_order, notes, created_at, updated_at,
  cover_image, popup_description, buy_url, completion_percent,
  isbn, published_at, page_count, kind
)
SELECT
  id, project_slug, program_key, series_key, series_title,
  cluster_key, cluster_title, author, title, subtitle,
  publication_year, status, sort_order, notes, created_at, updated_at,
  cover_image, popup_description, buy_url, completion_percent,
  isbn, published_at, page_count, 'book'
FROM oncoming_projects;

DROP TABLE oncoming_projects;

-- Zero-downtime compat: the currently-deployed Worker still reads
-- `oncoming_projects`. Expose it as a books-only view so /api/projects keeps
-- returning books during the Worker redeploy window. Drop in a later migration
-- once the Worker queries `works` directly.
CREATE VIEW oncoming_projects AS SELECT * FROM works WHERE kind = 'book';

CREATE INDEX IF NOT EXISTS idx_works_sort_order ON works(sort_order);
CREATE INDEX IF NOT EXISTS idx_works_program_key ON works(program_key);
CREATE INDEX IF NOT EXISTS idx_works_series_key ON works(series_key);
