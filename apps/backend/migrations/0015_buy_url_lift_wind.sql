-- Set buy_url and update cover_image for Lift Wind / Love Heat: Symphony No. 1 in C Minor.
-- 1. Replace the placeholder buy_url below with the confirmed Amazon or vendor link.
-- 2. Apply: npx wrangler d1 execute stexpedite-press-db --file=migrations/0015_buy_url_lift_wind.sql
--    (or via Cloudflare dashboard D1 console)

UPDATE oncoming_projects
SET
  buy_url = 'TODO_REPLACE_WITH_AMAZON_OR_VENDOR_URL',
  cover_image = '/assets/img/covers/lift-wind-cover.webp',
  updated_at = datetime('now')
WHERE project_slug = 'lift-wind-love-heat-symphony-no-1-in-c-minor';
