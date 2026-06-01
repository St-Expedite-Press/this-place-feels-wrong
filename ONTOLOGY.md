# St. Expedite Press — Project Ontology

The detailed entity taxonomy for this project lives in the repo's own documentation system:

- **`docs/ontology/ontology.md`** — human-readable entity and relationship map
- **`docs/ontology/project-ontology.json`** — machine-readable ontology (navigation and constraint map for agents)

Read both before any repo-internal work. The JSON ontology is the authoritative routing surface for task classification, path ownership, and agent/tooling contracts.

---

## Project Summary

**Live site:** stexpedite.press  
**Stack:** Astro · Cloudflare Pages · Cloudflare Worker · D1 · Resend · Stripe · Fourthwall  
**Repo:** `St-Expedite-Press/this-place-feels-wrong` (the press site codebase)  
**Agent doctrine:** `agent/AGENT.md` — single source of truth for all repo-internal agent work  
**Phase tracking:** `PHASE-PLAN.md`  
**Change log:** `MEMORY.md` (gitignored)

---

## Key Entity Types (summary — see `docs/ontology/` for full detail)

| Entity | Description |
|--------|-------------|
| Public Route | An Astro page under `apps/web/src/pages/` — 11 routes |
| API Route | A Worker endpoint under `apps/communications-worker/src/index.ts` — 10 routes |
| CSS Token | A custom property in `apps/web/public/assets/css/tokens.css` |
| Brand Mode | `ritual` · `editorial` · `utility` — set via `data-brand-mode` on `<body>` |
| D1 Migration | An append-only SQL file in `apps/communications-worker/migrations/` |
| Asset | A media file synced from `assets/source/` via `npm run assets:sync` |
| Skill | A reusable agent skill in `agent/skills/` |
| Runbook | An operational procedure in `agent/ops/` |
