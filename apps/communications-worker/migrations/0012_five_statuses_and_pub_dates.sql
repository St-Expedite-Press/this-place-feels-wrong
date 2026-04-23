-- Expand status CHECK constraint to five values and set publication dates.
-- The old constraint only allowed planned|in_progress|published.
-- SQLite requires table recreation to alter a CHECK constraint.
-- Note: buy_url was never applied to this DB so it is omitted from the SELECT
-- and will default to NULL, then set explicitly for published titles below.

CREATE TABLE oncoming_projects_new (
  id                 INTEGER PRIMARY KEY AUTOINCREMENT,
  project_slug       TEXT    NOT NULL UNIQUE,
  program_key        TEXT    NOT NULL,
  series_key         TEXT    NOT NULL,
  series_title       TEXT    NOT NULL,
  cluster_key        TEXT,
  cluster_title      TEXT,
  author             TEXT    NOT NULL,
  title              TEXT    NOT NULL,
  subtitle           TEXT,
  publication_year   INTEGER,
  status             TEXT    NOT NULL DEFAULT 'planned'
                             CHECK (status IN ('concept', 'planned', 'in_progress', 'forthcoming', 'published')),
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
  page_count         INTEGER
);

INSERT INTO oncoming_projects_new (
  id, project_slug, program_key, series_key, series_title,
  cluster_key, cluster_title, author, title, subtitle,
  publication_year, status, sort_order, notes, created_at, updated_at,
  cover_image, popup_description, completion_percent,
  isbn, published_at, page_count
)
SELECT
  id, project_slug, program_key, series_key, series_title,
  cluster_key, cluster_title, author, title, subtitle,
  publication_year, status, sort_order, notes, created_at, updated_at,
  cover_image, popup_description, completion_percent,
  isbn, published_at, page_count
FROM oncoming_projects;

DROP TABLE oncoming_projects;
ALTER TABLE oncoming_projects_new RENAME TO oncoming_projects;

CREATE INDEX IF NOT EXISTS idx_oncoming_projects_sort_order
  ON oncoming_projects(sort_order);
CREATE INDEX IF NOT EXISTS idx_oncoming_projects_series_key
  ON oncoming_projects(series_key);

UPDATE oncoming_projects
SET status = 'published', published_at = '2026-03-03', buy_url = 'https://www.amazon.com/dp/B0GQG71JT9'
WHERE project_slug = 'les-fievres-et-les-humeurs';

UPDATE oncoming_projects
SET status = 'forthcoming', published_at = '2026-05-10'
WHERE project_slug = 'lift-wind-love-heat-symphony-no-1-in-c-minor';
