# Project Ontology

Source of truth:
- `docs/ontology/project-ontology.json`

This ontology is meant to be:
- **Machine-usable** (agents/tools can map “concepts” → “files/endpoints” quickly)
- **Token-efficient** (read this first; avoid scanning the repo unless needed)

## How to use (for agents)

1. Open `docs/ontology/project-ontology.json`.
2. Find the relevant subsystem:
   - Static site: `site.pages`, `site.assets`, `site.seo`
   - Deployment: `deploy.github_pages`
   - Forms + email: `workers.communications.routes`
3. Only then open the specific files referenced by the ontology.

## How to update

This file is intentionally generated from the repo structure (pages/assets + known roles).

If you move/rename pages or assets under `site/`, or add/change worker endpoints, regenerate `docs/ontology/project-ontology.json` so agents don’t drift.

