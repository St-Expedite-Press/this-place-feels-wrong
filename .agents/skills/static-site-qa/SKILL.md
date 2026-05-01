---
name: static-site-qa
description: Validate the Astro static web app, generated HTML, authored CSS/JS/media, links, accessibility heuristics, Lighthouse, and asset sync. Use after changes under apps/web, assets/source, public assets, static-site scripts, or site documentation.
---

# Static Site QA

## Workflow

1. Read `apps/web/README.md`, `apps/web/src/README.md`, and `assets/README.md`.
2. Build before checking generated HTML:
   ```bash
   npm run build
   ```
3. Run the checks that match the change:
   ```bash
   npm run lint:html
   npm run check:links
   npm run check:a11y
   npm run assets:check
   npm run check:lighthouse
   ```
4. For visual or interaction work, start `npm run dev:web` and use Playwright MCP from `.mcp.json`.

## Guardrails

- Edit `apps/web/src/` and `apps/web/public/assets/`; never hand-edit `apps/web/dist/`.
- For media changes, edit `assets/source/`, then run `npm run assets:sync` and `npm run assets:check`.
- Keep `apps/web/src/pages/index.astro` as the standalone portal page unless the task explicitly changes that architecture.
- Keep `apps/web/src/README.pages.md` outside `src/pages/` so Astro does not build it as a route.

## Full Gate

Use the repo-wide gate for broad changes:

```bash
npm run check
```
