-- Fix les-fievres cover path (was missing /covers/ segment and leading slash).
-- Add lift-wind cover.

UPDATE oncoming_projects
SET cover_image = '/assets/img/covers/les-fievres-cover.svg'
WHERE project_slug = 'les-fievres-et-les-humeurs';

UPDATE oncoming_projects
SET cover_image = '/assets/img/covers/lift-wind-cover.jpg'
WHERE project_slug = 'lift-wind-love-heat-symphony-no-1-in-c-minor';
