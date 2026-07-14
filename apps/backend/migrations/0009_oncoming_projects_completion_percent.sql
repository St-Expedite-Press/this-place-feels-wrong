-- Track editorial completion on books page cards.

ALTER TABLE oncoming_projects
  ADD COLUMN completion_percent INTEGER NOT NULL DEFAULT 0
  CHECK (completion_percent >= 0 AND completion_percent <= 100);

UPDATE oncoming_projects
SET
  completion_percent = 100,
  status = 'published',
  cover_image = 'assets/img/les-fievres-cover.svg'
WHERE project_slug = 'les-fievres-et-les-humeurs';

UPDATE oncoming_projects
SET
  completion_percent = 80,
  status = 'in_progress',
  cover_image = NULL
WHERE project_slug = 'lift-wind-love-heat-symphony-no-1-in-c-minor';

UPDATE oncoming_projects
SET
  completion_percent = 0,
  cover_image = NULL
WHERE project_slug NOT IN (
  'les-fievres-et-les-humeurs',
  'lift-wind-love-heat-symphony-no-1-in-c-minor'
);
