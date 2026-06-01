# AGENT Static Web Stack

Reusable, project-agnostic toolkit for static web projects.

## What it includes

- Scaffolding: `scripts/scaffold-static.sh`
- Local development: `scripts/dev.sh`
- Build and preview: `scripts/build.sh`, `scripts/preview.sh`
- Quality checks: `scripts/check-links.sh`, `scripts/check-a11y.sh`, `scripts/check-lighthouse.sh`, `scripts/check-all.sh`
- Content utilities: `scripts/generate-sitemap.sh`, `scripts/generate-feed.sh`, `scripts/optimize-images.sh`
- Deploy adapters: `scripts/deploy-pages.sh`, `scripts/deploy-netlify.sh`, `scripts/deploy-vercel.sh`, `scripts/deploy-s3.sh`
- Starter template: `templates/static-basic`
- Task facade: `Makefile`

## Quick start

```bash
# Scaffold a new site
sh agent/kits/static-web/scripts/scaffold-static.sh /tmp/my-site "My Site"

# Build and run checks
sh agent/kits/static-web/scripts/check-all.sh /tmp/my-site

# Serve source and built outputs
sh agent/kits/static-web/scripts/dev.sh /tmp/my-site
sh agent/kits/static-web/scripts/preview.sh /tmp/my-site
```

## Make targets (from `agent/kits/static-web`)

```bash
cd agent/kits/static-web
make scaffold NAME=/tmp/my-site
make build TARGET=/tmp/my-site
make check-all TARGET=/tmp/my-site
```

## Deploy adapters

```bash
# Cloudflare Pages
PROJECT_NAME=my-pages-project sh scripts/deploy-pages.sh /tmp/my-site

# Netlify
sh scripts/deploy-netlify.sh /tmp/my-site

# Vercel
sh scripts/deploy-vercel.sh /tmp/my-site

# S3
S3_BUCKET=my-bucket sh scripts/deploy-s3.sh /tmp/my-site
```

## Notes

- `check-lighthouse.sh` skips automatically if Chrome/Chromium or `npx` is missing.
- `optimize-images.sh` uses `cwebp` when available.
- Machine-readable contract: `agent.config.json`.
