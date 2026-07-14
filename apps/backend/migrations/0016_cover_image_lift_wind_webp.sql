-- Update cover_image for Lift Wind / Love Heat to the working webp file.
-- The original lift-wind-cover.jpg rendered as a black rectangle.
-- The webp was generated and committed in v1.0.7 but the DB path was not updated
-- because migration 0015 bundled it with the unconfirmed buy_url.
-- This migration fixes the image path only; buy_url remains null until confirmed.
--
-- Apply: npx wrangler d1 execute stexpedite-press-db --remote --file=migrations/0016_cover_image_lift_wind_webp.sql

UPDATE oncoming_projects
SET
  cover_image = '/assets/img/covers/lift-wind-cover.webp',
  updated_at = datetime('now')
WHERE project_slug = 'lift-wind-love-heat-symphony-no-1-in-c-minor';
