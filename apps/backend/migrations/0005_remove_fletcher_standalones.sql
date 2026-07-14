-- Remove standalone Fletcher reprint entries; keep only the monograph.

DELETE FROM oncoming_projects
WHERE project_slug IN (
  'fletcher-irradiations-sand-and-spray-1915',
  'fletcher-goblins-and-pagodas-1916'
);
