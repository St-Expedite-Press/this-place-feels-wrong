SHELL := /usr/bin/env bash

.PHONY: help bootstrap-python-venv bootstrap-git-auth install-hooks lint-html test-worker check-all deploy-worker smoke-api smoke-api-full runtime-audit runtime-config release release-dry-run release-log check-seo

help:
	@echo "Available targets:"
	@echo "  bootstrap-git-auth  Configure repo-local GitHub auth from .env"
	@echo "  bootstrap-python-venv  Create/update local Python virtualenv at .venv"
	@echo "  install-hooks       Install tracked git hooks (.githooks)"
	@echo "  lint-html           Run htmlhint for site pages"
	@echo "  test-worker         Run worker test suite"
	@echo "  check-all           Run lint + tests"
	@echo "  runtime-config      Verify Cloudflare runtime prerequisites"
	@echo "  runtime-audit       Run runtime audit checks"
	@echo "  smoke-api           Run production API smoke checks"
	@echo "  smoke-api-full      Run full production API smoke checks"
	@echo "  deploy-worker       Deploy Cloudflare worker with keep-vars"
	@echo "  release-log         Append release evidence entry"
	@echo "  release             Run release orchestration"
	@echo "  release-dry-run     Print release actions without mutating"
	@echo "  check-seo           Run advisory SEO structure checks"

bootstrap-python-venv:
	sh tools/bootstrap-python-venv.sh

bootstrap-git-auth:
	sh tools/bootstrap-git-auth.sh

install-hooks:
	sh tools/install-hooks.sh

lint-html:
	npx -y htmlhint "site/**/*.html"

test-worker:
	npm --prefix workers/communications run test

check-all: lint-html test-worker

runtime-config:
	sh tools/check-runtime-config.sh

runtime-audit:
	sh skills/ops/cloudflare-stability/scripts/runtime-audit.sh

smoke-api:
	sh skills/ops/cloudflare-stability/scripts/smoke-api.sh

smoke-api-full:
	sh skills/ops/cloudflare-stability/scripts/smoke-api.sh --full

deploy-worker:
	npm --prefix workers/communications run deploy

release-log:
	sh skills/ops/cloudflare-stability/scripts/log-release-evidence.sh

release:
	sh tools/release.sh

release-dry-run:
	sh tools/release.sh --dry-run

check-seo:
	sh tools/check-site-seo.sh
