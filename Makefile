SHELL := /usr/bin/env bash

.PHONY: help dev-web dev-worker bootstrap-python-venv bootstrap-git-auth install-hooks lint-html check-links check-a11y check-lighthouse check-audit test-worker check-all check-tooling-integrity deploy-web deploy-worker smoke-api smoke-api-full runtime-audit runtime-config release release-dry-run release-log check-seo identity-build assets-sync assets-check

help:
	@echo "Available targets:"
	@echo "  dev-web             Run Astro dev server"
	@echo "  dev-worker          Start the communications worker in Wrangler dev mode"
	@echo "  bootstrap-git-auth  Configure repo-local GitHub auth from .env"
	@echo "  bootstrap-python-venv  Create/update local Python virtualenv at .venv"
	@echo "  install-hooks       Install tracked git hooks (.githooks)"
	@echo "  lint-html           Run htmlhint for generated HTML in apps/web/dist"
	@echo "  check-links         Run generated-site link checks"
	@echo "  check-a11y          Run generated-site accessibility checks"
	@echo "  check-lighthouse    Run Lighthouse check when Chrome/Chromium is available"
	@echo "  check-audit         Run npm audit across root, web, and worker packages"
	@echo "  test-worker         Run worker test suite"
	@echo "  check-all           Run lint + tests"
	@echo "  check-tooling-integrity  Validate tooling path consistency"
	@echo "  runtime-config      Verify Cloudflare runtime prerequisites"
	@echo "  runtime-audit       Run runtime audit checks"
	@echo "  smoke-api           Run production API smoke checks"
	@echo "  smoke-api-full      Run full production API smoke checks"
	@echo "  deploy-web          Build and deploy to Cloudflare Pages"
	@echo "  deploy-worker       Deploy Cloudflare worker with keep-vars"
	@echo "  release-log         Append release evidence entry"
	@echo "  release             Run release orchestration"
	@echo "  release-dry-run     Print release actions without mutating"
	@echo "  check-seo           Run advisory SEO structure checks"
	@echo "  identity-build      Rebuild St. Expedite seal derivatives from the preserved source"
	@echo "  assets-sync         Sync source assets -> apps/web/public/assets and regenerate manifest"
	@echo "  assets-check        Verify source/public asset sync and manifest"

dev-web:
	npm --prefix apps/web run dev

dev-worker:
	npm run dev:worker

bootstrap-python-venv:
	sh scripts/bootstrap-python-venv.sh

bootstrap-git-auth:
	sh scripts/bootstrap-git-auth.sh

install-hooks:
	sh scripts/install-hooks.sh

lint-html:
	npx -y htmlhint "apps/web/dist/**/*.html"

check-links:
	npm run check:links

check-a11y:
	npm run check:a11y

check-lighthouse:
	npm run check:lighthouse

check-audit:
	npm run check:audit

test-worker:
	npm --prefix apps/communications-worker run test

check-all:
	npm run check

check-tooling-integrity:
	npm run check:tooling-integrity

runtime-config:
	sh scripts/check-runtime-config.sh

runtime-audit:
	sh ops/cloudflare-stability/scripts/runtime-audit.sh

smoke-api:
	sh ops/cloudflare-stability/scripts/smoke-api.sh

smoke-api-full:
	sh ops/cloudflare-stability/scripts/smoke-api.sh --full

deploy-web:
	npm run deploy:web

deploy-worker:
	npm --prefix apps/communications-worker run deploy

release-log:
	sh ops/cloudflare-stability/scripts/log-release-evidence.sh

release:
	sh scripts/release.sh

release-dry-run:
	sh scripts/release.sh --dry-run

check-seo:
	sh scripts/check-site-seo.sh

identity-build:
	npm run identity:build

assets-sync:
	sh scripts/sync-assets.sh

assets-check:
	sh scripts/check-assets-sync.sh
