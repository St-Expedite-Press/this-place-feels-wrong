# Project Ontology

Primary machine-readable map:

- [project-ontology.json](/mnt/c/Users/rberr/Desktop/PROJECTS/press-page/docs/ontology/project-ontology.json)

## High-Signal Structure

- Web source: [apps/web/src](/mnt/c/Users/rberr/Desktop/PROJECTS/press-page/apps/web/src)
- Web output: [dist/site](/mnt/c/Users/rberr/Desktop/PROJECTS/press-page/dist/site)
- Web build script: [scripts/build-site.mjs](/mnt/c/Users/rberr/Desktop/PROJECTS/press-page/scripts/build-site.mjs)
- Worker implementation: [apps/communications-worker/src/index.ts](/mnt/c/Users/rberr/Desktop/PROJECTS/press-page/apps/communications-worker/src/index.ts)
- Worker contract: [apps/communications-worker/openapi.yaml](/mnt/c/Users/rberr/Desktop/PROJECTS/press-page/apps/communications-worker/openapi.yaml)
- Internal tooling: [internal/agent](/mnt/c/Users/rberr/Desktop/PROJECTS/press-page/internal/agent)
- Archive: [archive](/mnt/c/Users/rberr/Desktop/PROJECTS/press-page/archive)

## Notes

- Treat `apps/web/src/` as the only editable source for the public site.
- Treat `dist/site/` as generated output only.
- Treat `archive/` as non-live material.
