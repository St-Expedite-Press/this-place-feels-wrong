-- Canonical project catalog for oncoming/release tracking.

CREATE TABLE IF NOT EXISTS oncoming_projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_slug TEXT NOT NULL UNIQUE,
  program_key TEXT NOT NULL,
  series_key TEXT NOT NULL,
  series_title TEXT NOT NULL,
  cluster_key TEXT,
  cluster_title TEXT,
  author TEXT NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  publication_year INTEGER,
  status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'published')),
  sort_order INTEGER NOT NULL,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_oncoming_projects_sort_order
  ON oncoming_projects(sort_order);

CREATE INDEX IF NOT EXISTS idx_oncoming_projects_series_key
  ON oncoming_projects(series_key);

INSERT OR REPLACE INTO oncoming_projects (
  project_slug,
  program_key,
  series_key,
  series_title,
  cluster_key,
  cluster_title,
  author,
  title,
  subtitle,
  publication_year,
  status,
  sort_order,
  notes
) VALUES
  ('lift-wind-love-heat-symphony-no-1-in-c-minor', 'master-canon-structure', 'sexp-originals', 'SEXP - Flagship Original Works', NULL, NULL, 'C. Sandbatch', 'Lift Wind / Love Heat: Symphony No. 1 in C Minor', NULL, 2025, 'published', 10, 'Flagship original work.'),
  ('les-fievres-et-les-humeurs', 'master-canon-structure', 'sexp-originals', 'SEXP - Flagship Original Works', NULL, NULL, 'C. Sandbatch', 'Les Fievres et les humeurs', NULL, 2026, 'published', 20, 'Keep French title as canonical.'),
  ('the-hollowing-engine', 'master-canon-structure', 'sexp-originals', 'SEXP - Flagship Original Works', NULL, NULL, 'C. Sandbatch', 'The Hollowing Engine', 'Compression vs. Acceleration in History', NULL, 'planned', 30, 'Flagship original work.'),
  ('the-early-works-of-john-gould-fletcher', 'master-canon-structure', 'sexp-originals', 'SEXP - Flagship Original Works', NULL, NULL, 'C. Sandbatch', 'The Early Works of John Gould Fletcher', 'Scholarly monograph; historical-critical reconstruction', NULL, 'planned', 40, 'Intellectual hinge between scholarship and Southern canon reprints.'),

  ('fletcher-irradiations-sand-and-spray-1915', 'master-canon-structure', 'library-of-the-southern-civilization', 'Library of the Southern Civilization', 'southern-modernist-core', 'Southern Modernist Core', 'John Gould Fletcher', 'Irradiations; Sand and Spray', NULL, 1915, 'planned', 110, NULL),
  ('fletcher-goblins-and-pagodas-1916', 'master-canon-structure', 'library-of-the-southern-civilization', 'Library of the Southern Civilization', 'southern-modernist-core', 'Southern Modernist Core', 'John Gould Fletcher', 'Goblins and Pagodas', NULL, 1916, 'planned', 120, NULL),
  ('taggard-early-poems-1922-1926', 'master-canon-structure', 'library-of-the-southern-civilization', 'Library of the Southern Civilization', 'southern-modernist-core', 'Southern Modernist Core', 'Genevieve Taggard', 'Early Poems (1922-1926)', NULL, 1926, 'planned', 130, 'Includes For Eager Lovers (1922), Hawaiian Hilltop (1923), and selections from May Days (1926).'),
  ('davidson-the-tall-men-1927', 'master-canon-structure', 'library-of-the-southern-civilization', 'Library of the Southern Civilization', 'southern-modernist-core', 'Southern Modernist Core', 'Donald Davidson', 'The Tall Men', NULL, 1927, 'planned', 140, 'Establishes modernist-Agrarian transition.'),

  ('percy-selected-poems-and-essays', 'master-canon-structure', 'library-of-the-southern-civilization', 'Library of the Southern Civilization', 'southern-historical-civilizational-voices', 'Southern Historical and Civilizational Voices', 'William Alexander Percy', 'Selected Poems and Essays', NULL, NULL, 'planned', 210, NULL),
  ('ryan-the-conquered-banner-and-other-poems-1880', 'master-canon-structure', 'library-of-the-southern-civilization', 'Library of the Southern Civilization', 'southern-historical-civilizational-voices', 'Southern Historical and Civilizational Voices', 'Abram J. Ryan', 'The Conquered Banner and Other Poems', NULL, 1880, 'planned', 220, NULL),
  ('posey-poems-of-alexander-posey-1910', 'master-canon-structure', 'library-of-the-southern-civilization', 'Library of the Southern Civilization', 'southern-historical-civilizational-voices', 'Southern Historical and Civilizational Voices', 'Alexander L. Posey', 'Poems of Alexander Posey', NULL, 1910, 'planned', 230, NULL),
  ('miles-the-spirit-of-the-mountains-1905', 'master-canon-structure', 'library-of-the-southern-civilization', 'Library of the Southern Civilization', 'southern-historical-civilizational-voices', 'Southern Historical and Civilizational Voices', 'Emma Bell Miles', 'The Spirit of the Mountains', NULL, 1905, 'planned', 240, NULL),
  ('king-balcony-stories-1893', 'master-canon-structure', 'library-of-the-southern-civilization', 'Library of the Southern Civilization', 'southern-historical-civilizational-voices', 'Southern Historical and Civilizational Voices', 'Grace King', 'Balcony Stories', NULL, 1893, 'planned', 250, NULL),

  ('lost-southern-lyricists-1890-1915', 'master-canon-structure', 'library-of-the-southern-civilization', 'Library of the Southern Civilization', 'anthology', 'Anthology Volume', 'St. Expedite Press (Curated)', 'Lost Southern Lyricists, 1890-1915', 'Minor Voices Before the Agrarians', 1915, 'planned', 310, 'Single curated anthology volume.'),

  ('read-early-war-poems-1918-1919', 'master-canon-structure', 'european-classics-modernists', 'European Classics and Modernists', NULL, NULL, 'Herbert Read', 'Early War Poems (1918-1919)', NULL, 1919, 'planned', 410, 'Includes The End of a War and Naked Warriors.'),
  ('huxley-essays-1923', 'master-canon-structure', 'european-classics-modernists', 'European Classics and Modernists', NULL, NULL, 'Aldous Huxley', 'Essays, 1923', NULL, 1923, 'planned', 420, NULL),
  ('moody-the-masque-of-judgment', 'master-canon-structure', 'european-classics-modernists', 'European Classics and Modernists', NULL, NULL, 'William Vaughn Moody', 'The Masque of Judgment', NULL, NULL, 'planned', 430, NULL),
  ('meynell-the-loom-of-time', 'master-canon-structure', 'european-classics-modernists', 'European Classics and Modernists', NULL, NULL, 'Alice Meynell', 'The Loom of Time', NULL, NULL, 'planned', 440, NULL),
  ('bely-selected-early-poems', 'master-canon-structure', 'european-classics-modernists', 'European Classics and Modernists', NULL, NULL, 'Andrey Bely', 'Selected Early Poems', 'Careful translation basis', NULL, 'planned', 450, NULL);
