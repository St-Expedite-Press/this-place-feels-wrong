-- lift-wind-love-heat-symphony-no-1-in-c-minor was set forthcoming with published_at 2026-05-10.
-- As of 2026-05-24 the publication date has passed. Update status to published and
-- completion_percent to 100. buy_url left null until an Amazon/vendor link is confirmed.

UPDATE oncoming_projects
SET status = 'published', completion_percent = 100, updated_at = datetime('now')
WHERE project_slug = 'lift-wind-love-heat-symphony-no-1-in-c-minor';
