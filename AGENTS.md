# RICE Magazine Repository — Agent Guide

This file governs all work under `rice_site/`. The repository is the standalone RICE Magazine static site. It is independent of the sibling St. Expedite Press repository: do not import sibling code, assets, packages, deployment assumptions, or Git history unless the user explicitly requests an integration.

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
| Shared visual system | `styles.css` |
| Site behavior | `site.js` |
| Asset browser | `asset-library.html`, `asset-library.css`, `asset-library.js` |
| Approved generated-image masters | `images/editorial/city-field-notes/<city>/master/` |
| Web image derivatives | `images/editorial/city-field-notes/<city>/web/` |
| Thumbnail derivatives | `images/editorial/city-field-notes/<city>/thumb/` |
| Asset metadata | `assets/catalog.json` |
| Standalone site-media inventory | `assets/site-assets.json` |
| Prompt manifest | `docs/city-image-prompts.json` |
| Image doctrine | `docs/IMAGE_STYLE_GUIDE.md` |
| Asset build/check logic | `scripts/build_asset_library.py`, `scripts/build_site_asset_inventory.py`, `scripts/check_assets.py` |

Keep the implementation lightweight and dependency-free. Preserve restrained acid-yellow use, quiet reading-page texture, and the C86 × South × St. Expedite image grammar.

## Image pipeline

Do not hand-edit files in `web/` or `thumb/`, or generated catalog measurements. Change the canonical master or prompt record, then rebuild:

```powershell
python scripts/build_asset_library.py
python scripts/build_site_asset_inventory.py
python scripts/check_assets.py
```

Generated archival images must remain labeled as visual reconstructions and must never be presented as authenticated historical records. Preserve prompt, provenance, accession, transformation, and licensing metadata.

## Local preview and validation

Start the preview from this repository:

```powershell
python -m http.server 4173
```

Representative URLs:

- `http://127.0.0.1:4173/splash.html`
- `http://127.0.0.1:4173/index.html`
- `http://127.0.0.1:4173/asset-library.html`

Run checks proportionate to the change:

```powershell
node --check site.js
node --check asset-library.js
python -m py_compile scripts/build_asset_library.py
git diff --check
```

For markup or path changes, crawl local HTML references and verify representative pages at desktop and mobile widths. For image-pipeline changes, run all three asset build/check scripts and inspect representative derivatives and catalog entries.

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

RICE deploys from the repository root on `main` through GitHub Pages. With explicit authorization:

```powershell
git push origin main
```

Production:

- Pages root: `https://st-expedite-press.github.io/rice-magazine/`
- Splash: `https://st-expedite-press.github.io/rice-magazine/splash.html`

The Pages root serves `index.html`; do not assume it redirects to the splash page. A successful local build does not authorize a push or deployment.

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
