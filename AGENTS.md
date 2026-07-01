# RICE Magazine Repository — Agent Guide

This file governs all work under `rice_site/`. The repository is the standalone RICE Magazine static site. It is independent of the sibling St. Expedite Press repository: do not import sibling code, assets, packages, deployment assumptions, or Git history unless the user explicitly requests an integration.

## Session start loop

1. Read this file in full.
2. Read `ONTOLOGY.md` for navigation, source ownership, update coupling, and validation commands.
3. Read the last relevant entries in `MEMORY.md`.
4. If working under `assets/`, `docs/`, `images/`, or `scripts/`, read that directory's local `AGENTS.md` and `MEMORY.md`.
5. Confirm the current worktree status with `git status -sb` before editing.

## Closeout loop

Every file-changing task must end by:

- running the narrowest meaningful checks;
- appending a concise entry to project `MEMORY.md`;
- appending to a local `MEMORY.md` when the touched directory has one;
- assessing whether scripts, skills, runbooks, `AGENTS.md`, or `ONTOLOGY.md` need updates;
- updating ontology or guidance in the same change when paths, ownership, commands, or generated-file rules changed.

## Agent orchestration

The primary agent is the orchestrator and keeps minimal context: the goal, governing instructions, decisions, interfaces, and verified conclusions.

- Spawn parallel subagents whenever tasks can be safely separated into independent read-only investigations or non-overlapping file ownership.
- Give each subagent explicit scope, owned paths, prohibited paths/actions, expected output, and validation requirements.
- Supply relevant raw artifacts directly, including file contents, paths, diffs, logs, screenshots, command output, or metadata. Avoid redundant rediscovery.
- Require evidence-backed returns listing findings, files inspected or changed, checks run, risks, and open questions.
- The primary agent integrates results, prevents conflicting edits, runs final checks, and reports to the user. Subagents do not push, deploy, alter secrets, or broaden scope without authorization.

Prefer built-in subagents when the runtime can select the requested model directly. If it cannot select `deepseek/deepseek-v4-flash`, the orchestrator must use the local `OPENROUTER_API_KEY` to make bounded chat-completions calls to `https://openrouter.ai/api/v1/chat/completions` with that model and treat the calls as read-only delegated subagents.

- Use the key only in the orchestrator-built HTTP authorization header. Never print, log, commit, place it in a prompt, or pass it to a child process or agent.
- Send a minimal task packet: task ID, objective, acceptance criteria, relevant artifact paths or excerpts, prohibited actions, and required output schema.
- Parallelize only independent read-only calls. Serialize overlapping or dependent tasks.
- Verify provider/model metadata, finish reason, and output shape before integration.
- Retry transient failures with bounded backoff. If OpenRouter remains unavailable, use built-in runtime subagents and disclose the fallback.
- OpenRouter delegates do not write files or mutate external systems. The primary agent integrates results and performs all authorized changes and validation.

## Static-site architecture

RICE is framework-free and dependency-light. Preserve semantic HTML, keyboard focus, reduced-motion behavior, and the shared visual and interaction systems.

| Surface | Source of truth |
|---|---|
| Page markup | root `*.html` files |
| Shared visual system | `styles.css`, `fonts.css`, `assets/fonts/` |
| Site behavior | `site.js` |
| Asset browser | `asset-library.html`, `asset-library.css`, `asset-library.js` (repository-local; excluded from Pages) |
| Served fallback images | `assets/images/<category>/` |
| Responsive public images | `assets/responsive/<category>/`, `assets/responsive.json` |
| Image masters | `assets/masters/<category>/` |
| Asset metadata | `assets/catalog.json` |
| Standalone site-media inventory | `assets/site-assets.json` |
| Photo-slot map | `assets/photo-slots.json` |
| Internal image pools | `assets/image-pools.json` (not used by the public archive) |
| Article (work) data model | `assets/articles.json` |
| Taxonomy source of truth | `scripts/asset_categories.py` (image `CATEGORIES` + work `ARTICLE_CATEGORIES`), `docs/ASSET_SCHEMA.md` |
| Prompt manifest | `docs/city-image-prompts.json` |
| Image doctrine | `docs/IMAGE_STYLE_GUIDE.md` |
| Asset build/check logic | `scripts/build_asset_library.py`, `scripts/build_site_asset_inventory.py`, `scripts/build_image_pools.py`, `scripts/build_responsive_images.py`, `scripts/check_assets.py` |
| Public artifact | `scripts/build_public_site.py` → ignored `_site/` |

Keep the implementation lightweight and dependency-free. Preserve the warm-paper,
carbon-ink, restrained Seed-green system, quiet reading-page texture, and the
C86 × South × St. Expedite image grammar.

## Image pipeline

Images are categorized assets: fallback renditions live in
`assets/images/<category>/`, responsive monochrome WebP outputs in
`assets/responsive/<category>/`, and masters in `assets/masters/<category>/`.
Do not hand-edit generated renditions or measurements. Change the master,
prompt record, or generator, then rebuild:

```powershell
python scripts/build_asset_library.py
python scripts/build_site_asset_inventory.py
python scripts/build_image_pools.py
python scripts/build_responsive_images.py
python scripts/check_assets.py
python scripts/build_public_site.py
```

Public archive slots are deterministic and have stable records. Internal pools
remain available for editorial selection but are not randomized at runtime.
See `docs/PHOTO_SLOTS.md`.

Generated archival images must remain labeled as visual reconstructions and must never be presented as authenticated historical records. Preserve prompt, provenance, accession, transformation, and licensing metadata.

## Local preview and validation

Start the preview from this repository:

```powershell
python -m http.server 4173
```

Representative URLs:

- `http://127.0.0.1:4173/splash.html`
- `http://127.0.0.1:4173/index.html`
- `http://127.0.0.1:4173/year.html`
- `http://127.0.0.1:4173/asset-library.html`

Run checks proportionate to the change:

```powershell
node --check site.js
node --check asset-library.js
python -m py_compile scripts/*.py
python scripts/check_assets.py
python scripts/build_public_site.py
git diff --check
```

For markup or path changes, crawl local HTML references and verify representative
pages at desktop and mobile widths. For image-pipeline changes, run all builders
and inspect representative derivatives, catalog entries, and the `_site/` boundary.

## Git and editing discipline

- Inspect `git status -sb` before editing and preserve unrelated work.
- This repository has its own Git history, remote, identity, checks, and deployment. Run Git commands here, never from the untracked workspace root.
- Use `apply_patch` for hand-authored text and code. Keep generated artifacts reproducible through their documented generators.
- Do not copy a sibling `.git` directory or use relative asset/code imports from `st-expedite-press/`.
- Do not rewrite authorship. Preserve the configured identity `CSandbatch <175889416+CSandbatch@users.noreply.github.com>` unless the user explicitly requests a change.
- Do not commit, push, deploy, release, or modify external services unless the user explicitly asks.

Remote: `https://github.com/St-Expedite-Press/rice-magazine.git`

Default branch: `main`

## Deployment

RICE deploys the allowlisted `_site/` artifact through
`.github/workflows/pages.yml` on `main`. The repository root, masters, prompts,
scripts, docs, and internal asset browser are not the deployment artifact.
With explicit authorization:

```powershell
git push origin main
```

Production:

- Pages root: `https://rice.stexpedite.press/`
- Splash: `https://rice.stexpedite.press/splash.html`

The Pages root serves `index.html`; do not assume it redirects to the splash
page. A successful local build does not authorize a push or deployment.

## Secrets

Secrets stay local.

- Never commit, print, copy, or expose `.env` contents, tokens, credentials, passwords, or sessions.
- Ordinary RICE development requires no committed environment file.
- Do not copy `../.env` into this repository or assume commands load it automatically.
- Load only the specific variable needed for an authorized task. Report variable names and presence only, never values.
- Keep secrets out of fixtures, examples, prompts, skills, logs, screenshots, generated metadata, and Git history.

## Skill generation and curation

Use this loop for repository or workspace skills:

1. Search installed, workspace, repository, and curated skills first.
2. Reuse a fitting skill; update or extend a near match before creating another.
3. Follow the `skill-creator` anatomy for new or material revisions: narrow trigger, concise `SKILL.md`, progressive disclosure, referenced scripts/templates/assets, explicit inputs/outputs, safety boundaries, and validation.
4. Validate structure and references, then forward-test success, edge, and failure cases with fresh subagents that did not author the skill.
5. Revise from evidence and rerun validation.
6. Periodically inventory and curate: consolidate overlaps, refresh stale instructions and tool/model references, and remove obsolete duplicates only after checking active dependencies.

Never embed secret values in a skill. Name required environment variables without recording their contents.
