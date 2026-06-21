# Asset Sources

Canonical source media for the authored web asset tree. Every binary variant shipped by the site belongs here, including optimized WebP files.

Workflow:
- edit source media here
- for the St. Expedite seal, preserve `img/identity/expedite-seal-source-2026.png` and run `npm run identity:build`
- create and review any optimized variants here
- run `npm run assets:sync`
- review the synced output in `apps/web/public/assets/`
- build the public output into `apps/web/dist/assets/`
