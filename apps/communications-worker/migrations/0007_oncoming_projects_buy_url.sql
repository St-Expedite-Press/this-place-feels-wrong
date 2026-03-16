-- Add direct purchase URLs for books page CTA targets.

ALTER TABLE oncoming_projects ADD COLUMN buy_url TEXT;

UPDATE oncoming_projects
SET buy_url = 'https://www.amazon.com/dp/B0GQG71JT9'
WHERE project_slug = 'les-fievres-et-les-humeurs';
