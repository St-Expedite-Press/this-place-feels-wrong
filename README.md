# St. Expedite Press

Proprietary repository for the St. Expedite Press web presence and communications API.

## Layout

- `apps/web/src/`
  - authoritative source for the public site
  - Nunjucks templates, static files, CSS, and JS
- `apps/communications-worker/`
  - Cloudflare Worker for `/api/*`
  - D1 migrations, OpenAPI contract, tests, and Wrangler config
- `dist/site/`
  - generated static artifact
  - produced by `npm run build`
- `internal/agent/`
  - internal maintenance tooling, release scripts, skills, and reusable scaffolding
- `archive/`
  - non-live legacy material, including the former checked-in site output and archived quiz content

## Commands

From repo root:

```bash
npm run build
npm run dev:web
npm run dev:worker
npm run check
npm run deploy:web
npm run deploy:worker
```

Supporting commands:

```bash
npm run assets:sync
npm run assets:check
make dev-web
make dev-worker
make release
```

## Runtime Surface

Public pages remain stable at the domain root, including:

- `/`
- `/books.html`
- `/mission.html`
- `/contact.html`
- `/submit.html`
- `/gallery.html`
- `/lab.html`
- `/services.html`

Worker routes remain stable:

- `GET /api/health`
- `GET /api/storefront`
- `GET /api/projects`
- `POST /api/contact`
- `POST /api/submit`
- `POST /api/updates`
- `POST /api/updates/import`

## Deployment Model

- GitHub Pages publishes the generated artifact from `dist/site/`
- Cloudflare fronts the domain and routes `/api/*` to `apps/communications-worker/`
- Resend handles outgoing mail
- D1 stores the updates list and books/program data
- Fourthwall provides storefront data for the merch page

## Notes

- The homepage is now generated from `apps/web/src/pages/index.njk`; it is no longer a copied static exception.
- The checked-in `site/` tree has been retired to `archive/site-legacy/`.
- `archive/anglossic_quiz/` is preserved as historical product material and is not part of the live build.
- This repository is not licensed for public redistribution or reuse.
