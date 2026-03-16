-- Reclassify the Gould Fletcher monograph into Library of the Southern Civilization.

UPDATE oncoming_projects
SET
  series_key = 'library-of-the-southern-civilization',
  series_title = 'Library of the Southern Civilization',
  cluster_key = 'southern-modernist-core',
  cluster_title = 'Southern Modernist Core',
  sort_order = 145
WHERE project_slug = 'the-early-works-of-john-gould-fletcher';
