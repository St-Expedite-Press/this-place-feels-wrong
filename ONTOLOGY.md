# St. Expedite Press Ontology

This is the project-level navigation contract for St. Expedite Press. Read it after `AGENTS.md` and before selecting files to edit.

Detailed ontology surfaces:

- `docs/ontology/ontology.md` — human-readable entity and relationship map.
- `docs/ontology/project-ontology.json` — machine-readable routing and constraint map.

Keep this file, the Markdown companion, and the JSON ontology aligned whenever paths, commands, ownership, validation, or agent workflow rules change.

## Project Summary

| Field | Value |
|---|---|
| Live site | `https://stexpedite.press` |
| Stack | Astro, Cloudflare Pages, Cloudflare Worker, D1, Resend, Stripe, Fourthwall |
| Repository | `St-Expedite-Press/this-place-feels-wrong` |
| Agent doctrine | `AGENTS.md` |
| Phase tracking | `PHASE-PLAN.md` |
| Change log | `MEMORY.md` |

## Maintained Surfaces

| Surface | Source of truth | Notes |
|---|---|---|
| Public web app | `apps/web/` | Astro pages, components, data, and authored public assets. |
| Communications Worker | `apps/communications-worker/` | Worker source, OpenAPI contract, D1 migrations, and tests. |
| Canonical media | `assets/source/` | Mirrored into `apps/web/public/assets/`; manifests generated at `assets/manifest.*`. |
| Branding | `branding/` | Brand docs, token exports, UX assessments; no runtime behavior. |
| Docs | `docs/` | Ontology, infrastructure, operations, and press documentation. |
| Operations | `ops/` | Runbooks, stability references, smoke/runtime scripts. |
| Scripts | `scripts/` | Root operational and validation tooling. |
| Skills | `skills/` | Repo-scoped agent skills. |
| Kits | `kits/` | Reusable static-web scaffolding. |

## Working Directories

| Directory | Owns | Local files |
|---|---|---|
| `apps/web/` | Astro site source, public authored assets, generated `dist/` output | `AGENTS.md`, `MEMORY.md`, `README.md` |
| `apps/communications-worker/` | Worker routes, OpenAPI, D1 migrations, tests | `AGENTS.md`, `MEMORY.md`, `README.md` |
| `assets/` | Canonical media source and generated manifests | `AGENTS.md`, `MEMORY.md`, `README.md` |
| `branding/` | Brand docs and exportable tokens | `AGENTS.md`, `MEMORY.md`, `README.md` |
| `docs/` | Documentation and ontology | `AGENTS.md`, `MEMORY.md`, `README.md` |
| `ops/` | Operational runbooks and stability scripts | `AGENTS.md`, `MEMORY.md`, `README.md` |
| `scripts/` | Root scripts and command helpers | `AGENTS.md`, `MEMORY.md`, `README.md` |
| `skills/` | Repo-scoped skills | `AGENTS.md`, `MEMORY.md` |
| `kits/` | Scaffolding kits | `AGENTS.md`, `MEMORY.md`, `README.md` |

## Update Loops

- Log each file-changing task in root `MEMORY.md`.
- If the changed subtree has a local `MEMORY.md`, add a short local entry too.
- Assess whether skills, tooling, runbooks, or validation scripts helped or got in the way; update the relevant surface when the improvement is clear.
- Keep `ONTOLOGY.md`, `docs/ontology/ontology.md`, and `docs/ontology/project-ontology.json` synchronized when navigation, ownership, commands, or workflow rules change.
- Run `npm run check:tooling-integrity` after ontology or tooling-contract changes.

## Validation

Use the narrowest relevant checks:

```powershell
npm run check:tooling-integrity
npm run build
npm run test:worker
npm run assets:check
npm run check
```

Do not deploy, push, mutate secrets, or alter Cloudflare resources unless explicitly authorized.
