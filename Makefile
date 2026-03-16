SHELL := /usr/bin/env bash

.PHONY: help dev-web dev-worker bootstrap-python-venv bootstrap-git-auth install-hooks lint-html test-worker check-all deploy-web deploy-worker smoke-api smoke-api-full runtime-audit runtime-config release release-dry-run release-log check-seo assets-sync check-assets

help:
	@echo "Available targets:"
	@echo "  dev-web             Build and serve dist/site locally"
	@echo "  dev-worker          Start the communications worker in Wrangler dev mode"
	@echo "  bootstrap-git-auth  Configure repo-local GitHub auth from .env"
	@echo "  bootstrap-python-venv  Create/update local Python virtualenv at .venv"
	@echo "  install-hooks       Install tracked git hooks (.githooks)"
	@echo "  lint-html           Run htmlhint for generated HTML in dist/site"
	@echo "  test-worker         Run worker test suite"
	@echo "  check-all           Run lint + tests"
	@echo "  runtime-config      Verify Cloudflare runtime prerequisites"
	@echo "  runtime-audit       Run runtime audit checks"
	@echo "  smoke-api           Run production API smoke checks"
	@echo "  smoke-api-full      Run full production API smoke checks"
	@echo "  deploy-web          Push main to trigger GitHub Pages"
	@echo "  deploy-worker       Deploy Cloudflare worker with keep-vars"
	@echo "  release-log         Append release evidence entry"
	@echo "  release             Run release orchestration"
	@echo "  release-dry-run     Print release actions without mutating"
	@echo "  check-seo           Run advisory SEO structure checks"
	@echo "  assets-sync         Sync source assets -> apps/web/src/assets and regenerate manifest"
	@echo "  check-assets        Verify source/authored assets and manifest are in sync"

dev-web:
	npm run dev:web

dev-worker:
	npm run dev:worker

bootstrap-python-venv:
	sh internal/agent/tools/bootstrap-python-venv.sh

bootstrap-git-auth:
	sh internal/agent/tools/bootstrap-git-auth.sh

install-hooks:
	sh internal/agent/tools/install-hooks.sh

lint-html:
	npx -y htmlhint "dist/site/**/*.html"

test-worker:
	npm --prefix apps/communications-worker run test

check-all:
	npm run check

runtime-config:
	sh internal/agent/tools/check-runtime-config.sh

runtime-audit:
	sh internal/agent/skills/ops/cloudflare-stability/scripts/runtime-audit.sh

smoke-api:
	sh internal/agent/skills/ops/cloudflare-stability/scripts/smoke-api.sh

smoke-api-full:
	sh internal/agent/skills/ops/cloudflare-stability/scripts/smoke-api.sh --full

deploy-web:
	npm run deploy:web

deploy-worker:
	npm --prefix apps/communications-worker run deploy

release-log:
	sh internal/agent/skills/ops/cloudflare-stability/scripts/log-release-evidence.sh

release:
	sh internal/agent/tools/release.sh

release-dry-run:
	sh internal/agent/tools/release.sh --dry-run

check-seo:
	sh internal/agent/tools/check-site-seo.sh

assets-sync:
	sh internal/agent/tools/sync-assets.sh

check-assets:
	sh internal/agent/tools/check-assets-sync.sh
