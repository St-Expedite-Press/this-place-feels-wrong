# SEO/AIO Improvement Agent Plan

Last reviewed: 2026-02-23
Scope: planning only. Do not apply changes automatically.

## Objective
Improve both classic SEO and AI discoverability (AIO) for `stexpedite.press` without changing architecture.

## Current Baseline
- SEO: 6.8/10
- AIO: 2.9/10

## Priority 0: Crawl Policy Alignment (Largest AIO Impact)
1. Decide intentional AI crawler policy first.
2. If AIO is desired, remove blanket AI crawler blocks currently visible in live `robots.txt`:
- `ClaudeBot`
- `GPTBot`
- `Google-Extended`
- `CCBot`
- `meta-externalagent`
3. Keep `ai-train=no` if you want citation/answer visibility but not model training.

Files to touch when executing:
- `site/robots.txt`
- Cloudflare managed robots/content-signal settings (runtime control, outside repo)

## Priority 1: Heading Semantics and On-Page Structure
1. Enforce one `h1` per indexable page.
2. Convert visual title containers to semantic headings where missing.
3. Keep styling classes unchanged to avoid visual regressions.

Current targets:
- `site/index.html`: has two `h1` elements (mobile and desktop variants).
- `site/lab.html`: title is a `div`, no `h1`.
- `site/submit.html`: title is a `div`, no `h1`.

## Priority 2: Canonical + Share Metadata Completeness
1. Add `<link rel="canonical" ...>` to all indexable pages.
2. Add Twitter card tags to match existing OG tags.
3. Add `og:image` for key pages with stable static preview assets.

Files to touch when executing:
- `site/index.html`
- `site/books.html`
- `site/gallery.html`
- `site/mission.html`
- `site/lab.html`
- `site/services.html`
- `site/contact.html`
- `site/submit.html`

## Priority 3: Structured Data (Schema.org)
1. Add minimal `Organization` JSON-LD on all core pages.
2. Add page-specific schema where relevant:
- `WebSite` on `site/index.html`
- `CollectionPage` or `ItemList` on `site/books.html`
- `CollectionPage`/`Store` hints on `site/gallery.html` (as far as static content allows)
3. Keep schema truthful and conservative; avoid unverifiable claims.

Files to touch when executing:
- `site/index.html`
- `site/books.html`
- `site/gallery.html`
- `site/mission.html`
- `site/services.html`
- `site/contact.html`

## Priority 4: JS-Dependent Content Risk (Gallery)
Issue: product cards are rendered client-side after `fetch('/api/storefront')`, which can reduce indexable detail for non-rendering crawlers.

Improvement paths:
1. Preferred: pre-render a minimal static product summary snapshot at build/deploy.
2. Alternate: add a static textual fallback block with featured products/categories.
3. Ensure fallback includes crawlable links and descriptive copy.

Files to touch when executing:
- `site/gallery.html`
- Optional build tooling if pre-render path is chosen

## Priority 5: Sitemap Freshness and Governance
1. Update `<lastmod>` values whenever page content changes.
2. Add a lightweight release checklist item so sitemap dates stay aligned with deploys.

Files to touch when executing:
- `site/sitemap.xml`
- `docs/state-of-play.md` (process note)

## Optional Enhancements
1. Add `FAQPage` schema if you publish a stable FAQ section.
2. Add author/imprint entity blocks for books where public metadata exists.
3. Add an editorial standards page to improve trust and citation quality signals.

## Validation Checklist (When Executing)
1. Confirm no duplicate or missing `h1` on indexable pages.
2. Confirm canonical tags resolve to production URLs.
3. Confirm JSON-LD is parseable and valid.
4. Confirm `robots.txt` reflects intentional AI/search policy.
5. Confirm `sitemap.xml` includes accurate `lastmod`.
6. Verify deployed headers/pages via curl after release.

## Guardrail
This document is an execution plan only. Do not modify files outside this document unless explicitly requested.
