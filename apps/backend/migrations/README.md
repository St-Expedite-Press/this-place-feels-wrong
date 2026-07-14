# Communications Migrations

D1 schema and data migrations for updates capture, projects, rate limiting, contact logs, and books presentation state.

Current coverage includes:

- updates signup storage and Substack enrichment fields
- canonical projects catalog
- projects presentation fields, buy URLs, completion percentages, and publication dates
- shared rate-limit state
- contact/submission log storage

Migration files are append-only. Add a new numbered migration instead of editing an existing one.
