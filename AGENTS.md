# St. Expedite Press — Agent Doctrine

Single source of truth for every agent working in this repository. `CLAUDE.md` imports this file. Operational tooling lives in `agent/tools/`, `agent/ops/`, `agent/skills/`, `agent/kits/` — referenced by npm scripts and make targets.

---

## Session Start Checklist

1. Read this file in full
2. Open `docs/ontology/project-ontology.json` — navigation and constraint map for repo structure, commands, agent surfaces, and maintenance rules
3. Read `docs/ontology/ontology.md` — human-readable companion; keep both in sync when either changes
4. Read last 30 lines of `MEMORY.md` — recent changes and open items
5. Confirm current phase from `PHASE-PLAN.md`
6. State: active project, current phase, last logged action

---

## 1. Project Shape

| Layer | Path | Purpose |
|---|---|---|
| Web source | `apps/web/src/` | Astro pages, components, data |
| Web assets | `apps/web/public/assets/` | Authored CSS, JS, synced images |
| Web output | `apps/web/dist/` | **Generated only — never edit by hand** |
| Worker source | `apps/communications-worker/src/index.ts` | Cloudflare Worker API |
| Worker contract | `apps/communications-worker/openapi.yaml` | OpenAPI spec (single source of truth for routes) |
| D1 migrations | `apps/communications-worker/migrations/` | **Append-only — never edit existing files** |
| Media source | `assets/source/` | Canonical image/GIF variants mirrored into the web tree |
| Brand package | `branding/` | Design docs and tokens — no runtime behavior |
| Agent tooling | `agent/` | Operational tools, runbooks, skills, kits (see §9) |
| Docs | `docs/` | State of play, infrastructure, operations notes |
| Archive | `archive/` | Non-live historical material — treat as read-only |

---

## 2. Repository Ontology

### 2.1 Public Routes

| Route | Source File | Brand Mode | CSS Stack |
|---|---|---|---|
| `/` | `apps/web/src/pages/index.astro` | ritual | tokens + interior-base + effects + hero-bar + footer + portal |
| `/books` | `apps/web/src/pages/books.astro` | editorial | tokens + interior-base + layout + components + books |
| `/about` | `apps/web/src/pages/about.astro` | editorial | tokens + interior-base + layout + components + mission |
| `/contact` | `apps/web/src/pages/contact.astro` | utility | tokens + interior-base + layout + components + forms |
| `/donate` | `apps/web/src/pages/donate.astro` | utility | tokens + interior-base + effects + hero-bar + donate-portal |
| `/donate/thanks` | `apps/web/src/pages/donate/thanks.astro` | utility | tokens + interior-base + layout + components + forms |
| `/submit` | `apps/web/src/pages/submit.astro` | utility | tokens + interior-base + layout + components + forms |
| `/gallery` | `apps/web/src/pages/gallery.astro` | editorial | tokens + interior-base + layout + components + gallery |
| `/lab` | `apps/web/src/pages/lab.astro` | ritual | tokens + interior-base + layout + components + lab |
| `/services` | `apps/web/src/pages/services.astro` | editorial | tokens + interior-base + layout + components + services |

### 2.2 API Routes (Worker)

| Method | Route | Description |
|---|---|---|
| GET | `/api/health` | Runtime health probe |
| GET | `/api/storefront` | Fourthwall catalog snapshot |
| GET | `/api/projects` | D1-backed projects list |
| POST | `/api/contact` | General inquiry → Resend |
| POST | `/api/submit` | Manuscript submission inquiry → Resend |
| POST | `/api/donate/session` | Stripe checkout session |
| POST | `/api/stripe/webhook` | Stripe webhook — `checkout.session.completed` → D1 log + email receipt |
| POST | `/api/updates` | Newsletter signup |
| POST | `/api/updates/import` | Bulk import (protected) |
| POST | `/api/updates/unsubscribe` | Unsubscribe |

### 2.3 CSS Architecture

All custom properties are defined in **`tokens.css`** — load it first on every page.

**Token namespaces:**

| Variable | Value | Notes |
|---|---|---|
| `--bg` / `--dark` | `#050807` | void black — same value, two names for legacy compat |
| `--text` | `#2aff8a` | signal green — canonical name for all green text |
| `--text-soft` | 88% opacity | near-signal green |
| `--text-muted` | 68% opacity | secondary/muted green — NOT the default `--mode-copy-muted` |
| `--text-readable` | `#e8f8ee` | warm cream — body copy in all modes; use via `--mode-copy` |
| `--text-readable-muted` | 62% cream | muted cream — used by `--mode-copy-muted` in all brand modes |
| `--accent` | `#2aff8a` | action/interactive green |
| `--relief` / `--relief-base` | `#d96aff` | relief magenta — canonical name is `--relief` |
| `--green-1/2/3` | 22/12/6% opacity | glow tiers |
| `--green-hot-1/2/3/4` | 75/55/38/22% opacity | active/hover tiers |

**Three brand modes** — set via `data-brand-mode` on `<body>`:

| Mode | Pages | Character |
|---|---|---|
| `ritual` | `/`, `/lab` | full theatrical intensity |
| `editorial` | `/books`, `/about`, `/gallery`, `/services` | readable, measured |
| `utility` | `/donate`, `/donate/thanks`, `/contact`, `/submit` | task-focused, calm |

Mode-scoped variables: `--mode-copy`, `--mode-copy-muted`, `--mode-border`, `--mode-border-strong`, `--mode-panel`, `--mode-panel-strong`, `--mode-shadow`, `--mode-heading-shadow`, `--mode-text-shadow`.

**CSS file roles:**

| File | Purpose |
|---|---|
| `tokens.css` | All CSS custom properties + brand mode selectors |
| `interior-base.css` | All-page body/background/focus/grain/skip-link base styles |
| `portal.css` | `/` specific styles — overrides, animations |
| `layout.css` | `.page`, `.hero-bar`, `.site-header` grid |
| `components.css` | Cards, buttons, panels, tags — consume `--mode-*` vars |
| `forms.css` | Form inputs, validation states |
| `effects.css` | Grain texture, cursor glow |
| `hero-bar.css` | Fixed top navigation bar |
| `footer.css` | Page footer |
| `a11y.css` | Skip link, focus-visible |
| `fonts.css` | Self-hosted @font-face — Cinzel + Cormorant Garamond (12 woff2 subsets) |
| `books.css` / `gallery.css` / `mission.css` / `services.css` / `lab.css` / `donate-portal.css` | Page-specific |

### 2.4 Media Assets

Canonical media lives in `assets/source/`. Every shipped PNG, JPEG, WebP, SVG, and GIF variant must exist there; format conversion happens before accessioning, and sync does not generate variants. CSS, JavaScript, fonts, and the public asset README are authored directly under `apps/web/public/assets/`. Run `npm run assets:sync` after adding or changing canonical media, then `npm run assets:check` to verify source parity and both generated manifests.

| File | Format | Role |
|---|---|---|
| `img/crow_glitch_text_still.webp` | WebP | Portal still — primary OG image, portal frame fallback |
| `img/crow_glitch_text_still.png` | PNG | Browser fallback |
| `img/crow_glitch_text.webp` | WebP (animated) | Portal frame animation via JS swap |
| `gif/crow_glitch_text.gif` | GIF | Source format |
| `img/void_engine_twinkle_green.webp` | WebP | Background texture (preferred) |
| `img/void_engine_twinkle_green.png` | PNG | Background texture fallback |
| `img/favicon.svg` | SVG | Browser favicon |
| `img/les-fievres-cover.svg` | SVG | Book cover |
| `img/covers/lift-wind-cover.webp` | WebP | *Lift Wind / Love Heat* cover (1024×1536) |

### 2.5 JavaScript Modules

All in `apps/web/public/assets/js/` — loaded via `<script is:inline>` or at bottom of body.

| File | Page | Role |
|---|---|---|
| `site-shell.js` | all | Global nav, view transitions |
| `index-effects.js` | `/` | Portal animation, animated webp swap |
| `donate-page.js` | `/donate` | Stripe checkout, preset buttons |
| `contact-page.js` | `/contact` | Form submit, API call |
| `submit-page.js` | `/submit` | Submission form |
| `gallery-page.js` | `/gallery` | Storefront API fetch, product render (ViewTransitions-safe) |
| `books-page.js` | `/books` | Projects API fetch |
| `lab-anglossic-*.js` | `/lab` | Anglossic Compass instrument |
| `form-utils.js` | forms | Shared validation helpers |
| `api-client.js` | forms | Shared fetch wrapper for Worker API |
| `dialog.js` | `/lab` | Modal dialog controller — manages aria-expanded on trigger |
| `updates-signup.js` | `/` mobile | Newsletter signup |

### 2.6 Runtime Dependencies

| Service | Binding | Used by |
|---|---|---|
| Cloudflare D1 | `DB` | `/api/projects`, `/api/updates*` |
| Resend | `RESEND_API_KEY` (secret) | `/api/contact`, `/api/submit` |
| Stripe | `STRIPE_SECRET_KEY` (secret) | `/api/donate/session`, `/api/stripe/webhook` |
| Fourthwall | `FOURTH_WALL_API_KEY` (secret) | `/api/storefront` |
| Cloudflare Turnstile | `TURNSTILE_SECRET` (secret) | form endpoints (currently unconfigured — bot check bypassed) |

**Pages deploy auth:** `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID` (required env/CI secrets). Optional local override: `CF_PAGES_PROJECT`.

### 2.7 Key Config Files

| File | Purpose |
|---|---|
| `apps/web/src/data/site.json` | Site metadata, nav, OG tags, per-page copy |
| `apps/web/astro.config.mjs` | Astro configuration |
| `apps/communications-worker/wrangler.toml` | Worker + D1 bindings (secrets documented in comments) |
| `package.json` | Workspace root scripts |
| `Makefile` | Make targets mirroring npm scripts |

---

## 3. Task Routing Loop

Before touching code:

1. Open `docs/ontology/project-ontology.json` — navigate and classify the task through the ontology
2. Read `docs/ontology/ontology.md` as the human-readable companion
3. **Classify** the task: `web`, `worker`, `docs`, `ops`, `assets`, `archive`, or `tooling`
4. **Read** `README.md`, `docs/state-of-play.md`, and the nearest domain README first
5. **Identify** owning source files — read before writing
6. **Keep edit surface narrow** — behaviour-preserving unless explicitly requested otherwise
7. **Update docs** in the same change when paths, commands, routes, or assets move (see §6)
8. **Run the narrowest meaningful validation**, escalating to `npm run check` for broad changes
9. **Close out with evidence:** tool calls, validation results, tooling/skills scrum (see §6.1)

For `web` tasks: read the target `.astro` file, its CSS stack, and any JS it references.  
For `worker` tasks: read `openapi.yaml` and `src/index.ts` before editing. Update OpenAPI when routes change.  
For media tasks: edit `assets/source/`, then `npm run assets:sync` and `npm run assets:check`. For CSS, JavaScript, or font assets, edit their owned public directories and run the same commands to refresh and verify manifests.
For `css` tasks: all custom properties are in `tokens.css`. Never hardcode colors with tokens. Use `--mode-*` vars in components.

**Task routing quick reference:**

| Task type | Read first | Run after |
|-----------|------------|-----------|
| Edit Astro page | Target `.astro`, its CSS, its JS | `npm run check` |
| Edit Worker route | `openapi.yaml`, `src/index.ts` | `npm run test:worker` |
| Add D1 migration | Latest migration file | `wrangler d1 execute … --file=migrations/NNNN_….sql` |
| Edit CSS token | `tokens.css`, affected pages | `npm run check:a11y` |
| Update docs / ontology | Affected docs + `project-ontology.json` | `npm run check:tooling-integrity` |
| Release | `docs/state-of-play.md`, last migration | `npm run release:dry-run` then `npm run release` |
| Add media | `assets/source/` | `npm run assets:sync && npm run assets:check` |

---

## 4. Command Matrix

```
npm run build            # Build Astro site → apps/web/dist/
npm run dev:web          # Astro dev server (localhost:4321)
npm run dev:worker       # Wrangler dev (Worker local)
npm run check            # Full gate: tooling-integrity + build + HTML lint + links + a11y + worker tests + audit
npm run check:links      # Broken link check
npm run check:a11y       # Accessibility heuristics
npm run check:audit      # Dependency audit (root, web, worker)
npm run check:tooling-integrity  # Ontology, path, and API route parity checks
npm run lint:html        # HTML validity
npm run test:worker      # Worker unit tests
npm run assets:sync      # Sync assets/source/ → apps/web/public/assets/
npm run assets:check     # Verify no asset drift
npm run runtime:config   # Check Cloudflare runtime bindings
npm run runtime:audit    # Read-only Worker/D1/schema audit
npm run smoke:api        # Production API smoke tests
npm run deploy:web       # Deploy Pages (requires CLOUDFLARE_API_TOKEN + CLOUDFLARE_ACCOUNT_ID)
npm run deploy:worker    # Deploy Worker
npm run release:dry-run  # Dry-run release check
npm run release          # Full release
```

On Windows, root scripts that invoke shell files route through `scripts/run-bash.mjs` (WSL → Git Bash fallback).

---

## 5. Safety Rules

- **Never edit `apps/web/dist/`** — generated by `npm run build`
- **Never edit existing D1 migration files** — add a new numbered migration
- **Never commit secrets** — `.env`, `.dev.vars`, `.wrangler/`, `.dev.vars.*`
- **Keep `.claude/`, `CLAUDE.local.md`, `.env`, `.dev.vars` out of version control**
- **Preserve public URLs** and `/api/*` response contracts unless a breaking change is explicitly requested
- **Treat `archive/` as read-only** unless explicitly asked to modify it
- **When touching CSS:** always load `tokens.css` first; use `--mode-*` vars in components; do not hardcode colors that have tokens; do not remove the grain texture or cursor glow
- **When touching assets:** keep media canonical in `assets/source/`; keep CSS/JS/fonts authored in their public directories; then sync and check

---

## 6. Source of Truth Updates

Update these together when their surfaces change:

| What changed | Update |
|---|---|
| Site routes or assets | `README.md`, `docs/state-of-play.md`, `apps/web/src/README.pages.md`, `AGENTS.md` §2 |
| Worker routes or payloads | `apps/communications-worker/openapi.yaml`, `apps/communications-worker/README.md`, `docs/infrastructure/`, `AGENTS.md` §2.2 |
| Tooling commands | `package.json`, `Makefile`, `agent/tools/README.md`, `AGENTS.md` §4 |
| Agent workflows | `AGENTS.md`, `agent/skills/`, `CLAUDE.md` |
| CSS tokens or structure | `apps/web/public/assets/css/tokens.css`, `branding/tokens/`, `AGENTS.md` §2.3 |
| D1 schema | New migration file + `apps/communications-worker/README.md` |

When changing routes, commands, validation scripts, deployment/runtime surfaces, agent workflows, skills, runbooks, or maintained path ownership — update both `docs/ontology/project-ontology.json` and `docs/ontology/ontology.md`, then run `npm run check:tooling-integrity`.

### 6.1 Task Closeout

Every task that changes files or performs repo investigation must end with:

- **Tool calls:** concise list of commands, scripts, and repo tools used, grouped by purpose
- **Checks:** validation commands and outcomes
- **Tooling/skills scrum:** 1–3 notes on how to improve future tooling, skills, runbooks, or ontology rules

---

## 7. CSS Design System — Working Rules

Dark void aesthetic. Do not genericize it.

**Fonts:** Cinzel (display/headers/labels) · Cormorant Garamond (body/editorial) — self-hosted woff2 files in `apps/web/public/assets/fonts/`, declared via `fonts.css`.

**Color discipline:**
- Every UI color must be a token from `tokens.css`. No raw hex values in component CSS.
- Brand green: `--text` is canonical; `--green-base` and `--accent` are aliases — prefer `--text` in new code
- Body copy in all modes uses `--text-readable` (#e8f8ee warm cream), not green
- Use `--mode-copy` and `--mode-copy-muted` for text in components — mode system handles the value per page

**Component pattern:**
1. Pick a brand mode (`ritual` / `editorial` / `utility`) for the page
2. Use `--mode-*` vars for all borders, panels, shadows, and copy
3. Hover/focus states use `--green-hot-*` tiers
4. Validate at 900px and 768px breakpoints
5. Guard animations behind `prefers-reduced-motion`

**Do not:**
- Add new CSS files without a clear single-page or single-component scope
- Override `--mode-*` variables inline — override at the `data-brand-mode` level only
- Use `opacity` on text as sole legibility mechanism without checking contrast
- Remove the grain texture or cursor glow

---

## 8. Subagent Policy

Use subagents when work can proceed in parallel without blocking the main path.

| Role | Owns |
|---|---|
| `web-surface` | Astro pages, CSS, JS, a11y, links |
| `worker-contract` | Worker routes, OpenAPI, D1 migrations, tests |
| `docs-curator` | Markdown, README, ontology consistency |
| `ops-release` | Cloudflare runtime checks, release scripts, smoke |
| `assets` | Media sync, format conversion, manifest |

Give each subagent: explicit file scope, read/write ownership, expected output format. Do not delegate the immediately blocking task.

Each skill in `skills/` is a self-contained agent definition:

| Skill | When to invoke |
|-------|---------------|
| `cloudflare-release-ops` | Pre-deploy runtime check, post-deploy verification |
| `docs-assay` | Documentation consistency review, ontology audit |
| `static-site-qa` | Full HTML + a11y + links + SEO gate |
| `worker-contract-review` | OpenAPI ↔ Worker source parity check |

---

## 9. MCP Tools

MCP servers are configured in the workspace root `.mcp.json` and are available to any agent working in this repository.

| Server | Use for this project |
|--------|---------------------|
| `playwright` | Visual testing of the live or dev site; interaction testing (nav, forms, dialogs); screenshot at specific viewports; console error capture |
| `playwright-ea` | API endpoint testing for Worker routes (`/api/*`) — fire POST/GET requests and assert responses alongside browser |
| `screenshot-fast` | Full-page screenshots of the live site (pass an HTTPS URL) or the dev server (pass `http://localhost:4321/...`) |
| `firecrawl` | Content extraction and crawl of stexpedite.press — extract page copy, structured data, and link inventory for audits |
| `page-design-guide` | Consult 2024–2026 design trends, typography, layout patterns, and accessibility guidance when evaluating or proposing design changes |

**Not typically needed for this project** (more relevant to design-iteration projects): `crawl4ai`, `web-cloner`, `design-copier`, `claude-design`.

### When to use MCP vs. npm scripts

| Task | Use |
|------|-----|
| Check the live site visually | `playwright` → navigate → screenshot |
| Audit all live pages at once | `firecrawl` scrape or `playwright` multi-page loop |
| Take full-page screenshots for design review | `screenshot-fast` with live URL |
| Test a Worker API endpoint manually | `playwright-ea` POST/GET |
| Check design direction before proposing changes | `page-design-guide` |
| Run automated HTML/links/a11y checks | `npm run check` (faster, no browser needed) |

### Viewports to test

| Viewport | Width | When |
|----------|-------|------|
| Desktop | 1280px | Always |
| Tablet | 768px | Layout breakpoints |
| Mobile | 390px | Nav scroll, form usability, portal layout |

---

## 10. Tooling Layout

```
scripts/            ← all operational shell scripts + Node.js scripts
    lib/
        repo-root.sh        ← shared path resolution helper
    sync-assets.sh
    check-assets-sync.sh
    check-runtime-config.sh
    check-site-seo.sh
    release.sh
    bootstrap-git-auth.sh
    bootstrap-python-venv.sh
    install-hooks.sh
    run-bash.mjs            ← WSL/Git Bash router for .sh scripts
    check-tooling-integrity.mjs
    check-links.mjs
    check-a11y.mjs
    …

ops/                ← operational runbooks
    cloudflare-stability/
        SKILL.md
        references/
        scripts/    ← smoke-api.sh, runtime-audit.sh, log-release-evidence.sh

skills/             ← repo-scoped agent skills (each has SKILL.md + openai.yaml)
    cloudflare-release-ops/
    docs-assay/
    static-site-qa/
    worker-contract-review/

kits/               ← reusable scaffolding templates
    static-web/
```

Never invoke shell scripts directly — always use `npm run` or `make` wrappers (they handle WSL/Git Bash routing on Windows).

Local-only (never commit): `.claude/`, `CLAUDE.local.md`, `.env`, `.dev.vars`, `.wrangler/`, `.reports/`

---

## 11. Known Gaps and Future Work

### Site

| Item | Priority | Notes |
|---|---|---|
| Turnstile missing from all forms | High | All POST forms (contact, submit, donate, updates, lab gate) have no Turnstile widget. No bot protection on any form. |
| `updates-signup.js` duplication | Low | `index.astro` has inline 80-line `wireUpdatesForm` that duplicates `updates-signup.js` — also duplicates `copyText` from `form-utils.js`. Extract to shared modules. |
| `donate/thanks` accessible without Stripe session | Low | Page is `noindex` but fully navigable without completing a donation. Low cosmetic trust risk. |
| OG image identical across all pages | Low | All 11 pages share the same crow OG image. Per-page OG images (book covers for `/books`) would improve social sharing differentiation. |

### Cloudflare Infrastructure

| Item | Priority | Notes |
|---|---|---|
| ~~Turnstile~~ | ~~High~~ | ~~Resolved in v1.0.9~~ — `TURNSTILE_SECRET` live in Worker; widget on contact/submit/donate/updates; token sent in all POST bodies |
| `lift-wind` buy_url null | Medium | Migration `0015_buy_url_lift_wind.sql` ready — update placeholder and run once Amazon/vendor URL is confirmed |
| Rate limit generous for form endpoints | Low | `RATE_LIMIT_MAX=20` per IP/minute — consider 5 for POST mutation endpoints |
| `contact_submissions` no admin read endpoint | Low | Accessible only via wrangler CLI — add `/api/admin/submissions` if Resend reliability degrades |
| Legacy D1 query fallback | Low | `handleProjects` lines 993–1019: three-level nested try/catch for column existence — remove after confirming prod has all columns from migration 0012+ |

### Closed / Resolved

**Session 1 — Infrastructure + Doc restructure (2026-05-24)**
- ~~`--text-readable` token missing~~ · ~~Mobile portal nav unreachable~~ · ~~X/Substack icons wrong~~ · ~~Duplicate submission form on /contact~~ · ~~No 404 page~~ · ~~smoke-api.sh fails on Windows~~ · ~~`BRAND.text` diverged~~ · ~~`compatibility_date` stale~~ · ~~`completion_percent` type mismatch~~ · ~~lift-wind status stuck at `forthcoming`~~

**Session 2 — MCP audit fixes + Stripe webhook + text color (2026-05-24)**
- ~~Donate page cyan heading~~ · ~~Donate page dead space~~ · ~~HeroBar missing on donate~~ · ~~/books shows editorial notes~~ · ~~/contact shows "If API unavailable…"~~ · ~~/gallery debug string~~ · ~~/services duplicate introText~~ · ~~`--hero-bar-height` duplicate~~ · ~~Ritual mode `--mode-copy` was signal green~~ · ~~/submit textarea not required~~ · ~~No sitemap.xml~~ · ~~Stripe webhook missing~~ · ~~`--mode-copy-muted` resolved to signal green~~

**Session 4 — agent/ dissolution, MCP skills, full site audit + v1.0.8 + v1.0.9 Turnstile (2026-06-01)**
- ~~`agent/AGENT.md` dissolved into root `AGENTS.md`~~ · ~~`agent/` directory fully dissolved — tools→scripts/, ops/→ops/, skills/→skills/, kits/→kits/~~ · ~~All 4 skills updated with MCP capabilities~~ · ~~`AGENTS.md §9` MCP Tools section added~~ · ~~`docs/ontology/*` and `project-ontology.json` updated for new paths~~ · ~~stale `agent/*` patterns added to docs-assay allowlist~~
- ~~`donate-page.js` amountLabel null — `<p id="donate-selected-amount">` added to donate.astro~~ · ~~`escapeHtml` dedup — extracted to `form-utils.js`, imported in books/gallery/lab~~ · ~~`@astrojs/cloudflare` dead dep removed~~ · ~~`--relief-base` alias removed from tokens.css; all usages → `--relief`~~ · ~~`--dark` alias removed from tokens.css~~ · ~~Lab dialog `inert` — `setBackgroundInert()` added to `dialog.js`~~ · ~~Gallery sparse fix — fallback copy shows when products.length < 3~~ · ~~Scroll-reveal animations — `reveal-up` keyframes + `@media (prefers-reduced-motion)` on `.card` and `.page-intro`~~ · ~~Lab dialog glassmorphism — `backdrop-filter: blur(8px)` + border on `.lab-dialog`~~ · ~~Interior heading scale — `page-intro__title` pushed to `clamp(1.9rem, 4.5vw, 3.2rem)`~~ · ~~Donate preset micro-interaction — `preset-seal` keyframe on `data-selected="true"`~~ · ~~donate-portal.css `--relief-base` fallbacks → `--relief`~~
- ~~Turnstile wired: `TURNSTILE_SECRET` set in Worker via `wrangler secret put`; `.cf-turnstile` widget on contact/submit/donate/index-updates; `getTurnstileToken()` + `resetTurnstile()` added to `form-utils.js`; token included in all 4 POST request bodies~~

**Session 3 — Full audit + refactor v1.0.7 (2026-05-31–2026-06-01)**
- ~~BasePortal.astro~~ · ~~Head.astro OG props + head-extra slot~~ · ~~Self-hosted fonts (12 woff2 subsets, fonts.css)~~ · ~~Token bridge (brand-tokens.css two-vocabulary)~~ · ~~Overexplaining subtitles removed (books, lab)~~ · ~~Nav font-size legibility fix~~ · ~~Mobile nav horizontal scroll overflow~~ · ~~gallery-page.js ViewTransitions bug~~ · ~~Stripe webhook 500→200 when unconfigured~~ · ~~lift-wind-cover.webp created~~ · ~~Google Fonts CDN dependency removed (self-hosted)~~ · ~~books.astro / about.astro duplicate content~~ · ~~aria-expanded on dialog + lab button~~
