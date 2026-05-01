# Project Ontology

Source of truth:

- `docs/ontology/project-ontology.json`

Use this directory when an agent or maintainer needs a quick map from repo concepts to files, routes, commands, and validation.

## Agent Use

1. Open `docs/ontology/project-ontology.json`.
2. Match the task to `apps`, `routes`, `commands`, `agent_workflow`, or `maintenance`.
3. Open only the files referenced by that section unless the task requires deeper investigation.

## Update Rules

Update the ontology when changing:

- site routes or page files
- Worker routes, OpenAPI, or migrations
- root npm scripts or Make targets
- deployment or runtime verification commands
- agent instruction files or repo-scoped skills
