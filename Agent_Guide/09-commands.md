# Commands & Prompts

Use these as copy/paste prompts when working locally. All commands assume repo root unless noted.

## Serve locally
- Python HTTP server (no build step):
  - `python -m http.server 8000`
  - Open `http://localhost:8000`

## Inspect & search
- Fast search (prefer ripgrep):
  - `rg "big-word" index.html`
  - `rg "prefers-reduced-motion" assets/css`
- Show directory tree (PowerShell):
  - `Get-ChildItem -Recurse | Select-Object FullName`

## Ontology and graph
- View ontology file:
  - `Get-Content ontology/stxp.ttl`
- Render Graphviz DOT (requires dot):
  - `dot -Tpng ontology/stxp.dot -o ontology/stxp.png`

## Lint/check basics
- HTML sanity (PowerShell quick view):
  - `Get-Content -First 40 index.html`
- CSS sanity:
  - `rg --files assets/css`

## Clean ignores (already in .gitignore)
- Environment:
  - `.env`, `.env.*`
- OS/editor junk:
  - `.DS_Store`, `Thumbs.db`, `*.swp`, `.vscode/`

## Safety
- Avoid destructive commands (`git reset --hard`, `rm -rf`) unless explicitly approved.
- Keep `sep-theme` key and theme class names intact.
