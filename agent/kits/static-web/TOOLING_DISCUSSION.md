# Tooling Discussion: AGENT Stack Assessment

Date: 2026-02-24

## Objective

Provide an agent-ready static web development stack that is reusable outside this repository.

## What was missing

- No project-agnostic scaffold for new static sites.
- No unified quality gate for links, a11y heuristics, and Lighthouse.
- No portable deploy wrappers for common static hosts.
- No machine-readable contract declaring toolkit capabilities.

## What is now implemented in `agent/kits/static-web`

- Reusable shell script suite for scaffold/dev/build/preview/check/deploy.
- Starter template project (`templates/static-basic`) with content and assets.
- Aggregated quality command (`scripts/check-all.sh`).
- Feed and sitemap generation scripts for static publishing workflows.
- Optional image optimization hook via `cwebp`.
- Deploy adapters for Cloudflare Pages, Netlify, Vercel, and S3.
- `Makefile` entrypoints for ergonomic local usage.
- `agent.config.json` as a machine-readable capability contract.

## Efficiency impact

- New static project spin-up reduced to one command.
- Build + quality checks run through a single stable interface.
- Same toolkit can be pointed at any static-site directory, not just this repo.
- Deployment commands are standardized across platforms.

## Recommended next upgrades

- Add optional TypeScript-based checker binaries for richer HTML/SEO validation.
- Add test fixtures for each script in `scripts/` (Bats or shunit2).
- Add a small JSON schema for `agent.config.json` validation in CI.
