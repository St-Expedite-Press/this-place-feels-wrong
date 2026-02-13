# Project Ontology

Source of truth:
- `docs/ontology/project-ontology.json`

This ontology is meant to be:
- Machine-usable (agents/tools can map concepts -> files/endpoints quickly)
- Token-efficient (read this first; avoid scanning the repo unless needed)

## How to use (for agents)

1. Open `docs/ontology/project-ontology.json`.
2. If your prompt is an edit task (most are), start with `intents`:
   - `intents.<name>.touch` = minimal files to open/edit
   - `intents.<name>.related` = supporting context (open only if needed)

3. Use `files["<path>"].anchors` to jump inside large files:
   - anchors are search snippets so you do not need to re-read entire HTML/TS files.

4. Use subsystem sections only when no matching intent exists:
   - Static site: `site.pages`, `site.assets`, `site.seo`
   - Flows + dependencies: `site.flows`, `site.dependency_structure`
   - Shared styling: `site.asset_bundles`, `site.duplication_clusters`
   - Deployment: `deploy.github_pages`
   - Forms + email: `workers.communications.routes`
   - OpenAPI contract: `workers.communications.openapi`

5. Open only the files referenced by ontology fields.

## How to update

If you move/rename pages or assets under `site/`, or add/change worker endpoints, update the ontology immediately.

Use these built-in reminders:
- `maintenance.when_changing_site_pages_or_assets`
- `maintenance.when_changing_worker_routes_or_contracts`

If you change API request/response shapes, also update:
- `workers.communications.routes["/api/*"].request/response/errors`
- `workers.communications.openapi`
- `site.flows.*.frontend` selectors (if element IDs changed)
