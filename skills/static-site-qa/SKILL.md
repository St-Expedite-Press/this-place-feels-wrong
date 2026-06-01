---
name: static-site-qa
description: Validate the Astro static web app, generated HTML, authored CSS/JS/media, links, accessibility heuristics, Lighthouse, and asset sync. Use after changes under apps/web, assets/source, public assets, static-site scripts, or site documentation. Also use for visual audits using MCP browser tools.
---

# Static Site QA

## Workflow

1. Read `apps/web/README.md`, `apps/web/src/README.md`, and `assets/README.md`.
2. Build before checking generated HTML:
   ```bash
   npm run build
   ```
3. Run the checks that match the change:
   ```bash
   npm run lint:html
   npm run check:links
   npm run check:a11y
   npm run assets:check
   npm run check:lighthouse
   ```
4. For visual or interaction work, use MCP browser tools (see below).

## MCP Visual Audit Workflow

Use these MCP tools for visual checks, audits, and interaction testing. Configured in the workspace root `.mcp.json`.

### Screenshot a live page
Use `screenshot-fast` with the live URL or dev server URL:
- Live: `https://stexpedite.press/[page]`
- Dev server: start `npm run dev:web` (localhost:4321), then `http://localhost:4321/[page]`

Capture at three viewports: **1280px** (desktop) · **768px** (tablet) · **390px** (mobile).

### Interactive visual testing
Use `playwright` to:
- Navigate to each of the 11 pages and screenshot
- Resize viewport to mobile (390px) and check nav scroll, form layout, portal layout
- Capture console errors (`playwright.console_messages` or equivalent)
- Test interactive elements: nav links, donate form preset buttons, lab compass, contact/submit forms
- Check that `astro:page-load` fires correctly on navigation (ViewTransitions compat)

### Content extraction
Use `firecrawl` to:
- Scrape all pages at stexpedite.press for a content inventory
- Check all links resolve (no 404s)
- Extract page copy to check for placeholder text or stale content

### Design evaluation
Use `page-design-guide` to:
- Consult current typography trends for literary/editorial dark-aesthetic sites
- Get layout pattern guidance for any proposed redesigns
- Check accessibility guidance for low-contrast dark palette

## Per-Page Checklist

For each of the 11 pages:

| Check | What to look for |
|-------|-----------------|
| Brand mode | Correct `data-brand-mode` attribute on `<body>` |
| Hero bar | Present and sticky on all pages |
| Fonts | Cinzel (display) and Cormorant Garamond (body) loaded from `assets/fonts/` |
| Dark background | `#050807` void black — no bleed or grey artifacts |
| Grain texture | Visible, not tiling obviously |
| Mode copy color | Warm cream (#e8f8ee), not green, for prose text |
| Signal green | Used only for UI elements, links, and accents — not body copy |
| Nav pills | Readable at all viewports; horizontal scroll on mobile |
| Console errors | None |

**Ritual pages** (`/`, `/lab`): grain + glow most intense; portal animation (crow webp) on home  
**Editorial pages** (`/books`, `/about`, `/gallery`, `/services`): measured; no portal effects  
**Utility pages** (`/donate`, `/contact`, `/submit`, `/donate/thanks`): task-focused; forms centered

## Guardrails

- Edit `apps/web/src/` and `apps/web/public/assets/`; never hand-edit `apps/web/dist/`.
- For media changes, edit `assets/source/`, then run `npm run assets:sync` and `npm run assets:check`.
- Keep `apps/web/src/pages/index.astro` as the standalone portal page unless the task explicitly changes that architecture.
- Keep `apps/web/src/README.pages.md` outside `src/pages/` so Astro does not build it as a route.

## Full Gate

Use the repo-wide gate for broad changes:

```bash
npm run check
```
