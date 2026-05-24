# St. Expedite Press — Agent Operating Guide

This is the **single source of truth** for every coding agent (Claude Code, Codex, CI bots) working in this repository. `CLAUDE.md` at the root imports this file. All other agent docs defer to it.

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
| Media source | `assets/source/` | Canonical image/gif sources |
| Brand package | `branding/` | Design docs and tokens — no runtime behavior |
| Agent infra | `agent/` | This file + all tooling, skills, runbooks, ontology |
| Docs | `docs/` | State of play, infrastructure, operations notes |
| Archive | `archive/` | Non-live historical material — treat as read-only |

---

## 2. Complete Repository Ontology

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
| `--text-muted` | 68% opacity | secondary/muted green — used for status badges and intentional green accents; NOT the default `--mode-copy-muted` |
| `--text-readable` | `#e8f8ee` | warm cream — body copy in ritual/editorial/utility modes; use via `--mode-copy` |
| `--text-readable-muted` | 62% cream | muted cream — used by `--mode-copy-muted` in all brand modes |
| `--accent` | `#2aff8a` | action/interactive green — used for buttons, focus, icons |
| `--relief` / `--relief-base` | `#d96aff` | relief magenta — canonical name is `--relief` |
| `--green-1/2/3` | 22/12/6% opacity | glow tiers |
| `--green-hot-1/2/3/4` | 75/55/38/22% opacity | active/hover tiers |

**Three brand modes** — set via `data-brand-mode` on `<body>`:

| Mode | Pages | Character | Copy color |
|---|---|---|---|
| `ritual` | `/`, `/lab` | full theatrical intensity | warm cream (`--text-readable`) |
| `editorial` | `/books`, `/about`, `/gallery`, `/services` | readable, measured | warm cream (`--text-readable`) |
| `utility` | `/donate`, `/donate/thanks`, `/contact`, `/submit` | task-focused, calm | warm cream (`--text-readable`) |

Mode-scoped variables: `--mode-copy`, `--mode-copy-muted`, `--mode-border`, `--mode-border-strong`, `--mode-panel`, `--mode-panel-strong`, `--mode-shadow`, `--mode-heading-shadow`, `--mode-text-shadow`.

**CSS file roles:**

| File | Purpose |
|---|---|
| `tokens.css` | All CSS custom properties + brand mode selectors |
| `interior-base.css` | All-page body/background/focus/grain/skip-link base styles (loads after tokens.css) |
| `portal.css` | Portal page (`/`) specific styles — overrides, animations, desktop/mobile surfaces |
| `layout.css` | `.page`, `.hero-bar`, `.site-header` grid |
| `components.css` | Cards, buttons, panels, tags — all consume `--mode-*` vars |
| `forms.css` | Form inputs, validation states |
| `effects.css` | Grain texture, cursor glow |
| `hero-bar.css` | Fixed top navigation bar |
| `footer.css` | Page footer |
| `a11y.css` | Skip link, focus-visible |
| `books.css` | Catalog page specifics |
| `gallery.css` | Store grid |
| `mission.css` | About page essay |
| `services.css` | Services cards/grid |
| `lab.css` | Lab instruments |
| `donate-portal.css` | Donate page standalone shell |

### 2.4 Media Assets

Canonical source lives in `assets/source/`. Run `npm run assets:sync` after adding or changing source files. Run `npm run assets:check` to verify no drift.

| File | Format | Role |
|---|---|---|
| `img/crow_glitch_text_still.webp` | WebP | Portal still — primary OG image, portal frame fallback |
| `img/crow_glitch_text_still.png` | PNG | Browser fallback (picture element `<img>` src) |
| `img/crow_glitch_text.webp` | WebP (animated) | Portal frame animation via JS swap |
| `gif/crow_glitch_text.gif` | GIF | Source format — present in public as sync artifact |
| `img/void_engine_twinkle_green.webp` | WebP | Background texture (preferred) |
| `img/void_engine_twinkle_green.png` | PNG | Background texture fallback |
| `img/favicon.svg` | SVG | Browser favicon |
| `img/les-fievres-cover.svg` | SVG | Book cover |
| `img/covers/lift-wind-cover.jpg` | JPEG | Book cover — no webp variant yet |

**Known gap:** `lift-wind-cover.jpg` needs a webp variant. Generate with `cwebp -q 85 lift-wind-cover.jpg -o lift-wind-cover.webp` in `assets/source/img/covers/`, then run `npm run assets:sync`.

### 2.5 JavaScript Modules

All in `apps/web/public/assets/js/` — loaded via `<script is:inline>` in page `<head>` or at bottom of body.

| File | Page | Role |
|---|---|---|
| `site-shell.js` | all | Global nav, view transitions |
| `index-effects.js` | `/` | Portal animation, animated webp swap |
| `donate-page.js` | `/donate` | Stripe checkout, preset buttons |
| `contact-page.js` | `/contact` | Form submit, API call |
| `submit-page.js` | `/submit` | Submission form |
| `gallery-page.js` | `/gallery` | Storefront API fetch, product render |
| `books-page.js` | `/books` | Projects API fetch |
| `lab-anglossic-*.js` | `/lab` | Anglossic Compass instrument |
| `form-utils.js` | forms | Shared validation helpers |
| `api-client.js` | forms | Shared fetch wrapper for Worker API |
| `dialog.js` | `/lab` | Modal dialog controller |
| `updates-signup.js` | `/` mobile | Newsletter signup wire-up |

### 2.6 Runtime Dependencies

| Service | Binding | Used by |
|---|---|---|
| Cloudflare D1 | `DB` | `/api/projects`, `/api/updates*` |
| Resend | `RESEND_API_KEY` (secret) | `/api/contact`, `/api/submit` |
| Stripe | `STRIPE_SECRET_KEY` (secret) | `/api/donate/session` |
| Fourthwall | `FOURTH_WALL_API_KEY` (secret; `FW_STOREFRONT_TOKEN` accepted as compatibility alias) | `/api/storefront` |
| Cloudflare Turnstile | `TURNSTILE_SECRET` (secret) | form endpoints |

### 2.7 Key Config Files

| File | Purpose |
|---|---|
| `apps/web/src/data/site.json` | Site metadata, nav, OG tags, per-page copy |
| `apps/web/astro.config.mjs` | Astro configuration |
| `apps/communications-worker/wrangler.toml` | Worker + D1 bindings |
| `package.json` | Workspace root scripts |
| `Makefile` | Make targets mirroring npm scripts |

---

## 3. Task Routing Loop

Before touching code:

- Open `docs/ontology/project-ontology.json` first. It is the navigation and constraint map for repo structure, commands, agent surfaces, and maintenance rules.
- Classify the task through the ontology before broad exploration. Treat `apps`, `commands`, `agent`, `agent_data_dictionary`, and `maintenance` as the primary routing surfaces.
- Treat undocumented surfaces as suspect. If a path, command, or workflow is outside the ontology and not clearly historical or local-only, verify it before use and update the ontology if that surface should remain part of the maintained repo contract.

1. **Classify** the task: `web`, `worker`, `docs`, `ops`, `assets`, `archive`, or `tooling`.
2. **Read** `README.md`, `docs/state-of-play.md`, and the nearest domain README first.
3. **Identify** the owning source files — read those before writing.
4. **Keep edit surface narrow.** Behavior-preserving unless user explicitly requests a change.
5. **Update docs** in the same change when paths, commands, routes, or assets move (see §6 Source of Truth).
6. **Run the narrowest meaningful validation**, escalating to `npm run check` for broad changes.

For `web` tasks: read the target `.astro` file, the CSS it loads, and any JS it references before editing.

For `worker` tasks: read `openapi.yaml` and `src/index.ts` before editing. Update OpenAPI when route signatures change.

For `assets` tasks: edit `assets/source/`, run `npm run assets:sync`, then `npm run assets:check`.

For `css` tasks: all custom properties are in `tokens.css`. Never hardcode color values that have a token. Use `--mode-*` variables for mode-aware components.

For `tooling` and agent-infra tasks: consult `agent_data_dictionary` in `docs/ontology/project-ontology.json` before changing `agent/`, root command aliases, validation scripts, or kit contracts. Prefer only the command aliases, scripts, and contracts declared there unless the ontology is being intentionally extended.

---

## 4. Command Matrix

```
npm run build            # Build Astro site → apps/web/dist/
npm run dev:web          # Astro dev server (localhost:4321)
npm run dev:worker       # Wrangler dev (Worker local)
npm run check            # Full gate: links + a11y + HTML lint + worker tests
npm run check:links      # Broken link check
npm run check:a11y       # Accessibility heuristics
npm run check:tooling-integrity # Validate agent/tooling path consistency
npm run lint:html        # HTML validity
npm run test:worker      # Worker unit tests
npm run assets:sync      # Sync assets/source/ → apps/web/public/assets/
npm run assets:check     # Verify no asset drift
npm run runtime:config   # Check Cloudflare runtime bindings
npm run runtime:audit    # Read-only Worker/D1/schema audit
npm run smoke:api        # Production API smoke tests
npm run deploy:web       # Deploy Pages
npm run deploy:worker    # Deploy Worker
npm run release:dry-run  # Dry-run release check
npm run release          # Full release
```

On Windows, root scripts that invoke shell files route through `scripts/run-bash.mjs` (WSL → Git Bash fallback).

---

## 5. Safety Rules

- **Never edit `apps/web/dist/`** — it is generated by `npm run build`.
- **Never edit existing D1 migration files** — add a new numbered migration.
- **Never commit secrets** — `.env`, `.dev.vars`, `.wrangler/`, `.dev.vars.*`.
- **Keep `.claude/`, `CLAUDE.local.md`, `.env`, `.dev.vars` out of version control.**
- **Preserve public URLs** and `/api/*` response contracts unless a breaking change is explicitly requested.
- **Treat `archive/` as read-only** unless the user explicitly asks to retire or modify archived material.
- **When touching CSS**: always load `tokens.css` first. Use `--mode-*` vars in components. Do not hardcode colors that have tokens.
- **When touching assets**: edit `assets/source/` only, then sync and check.

---

## 6. Source of Truth Updates

Update these together when their surfaces change:

| What changed | Update |
|---|---|
| Site routes or assets | `README.md`, `docs/state-of-play.md`, `apps/web/src/README.pages.md`, `agent/AGENT.md` §2 |
| Worker routes or payloads | `apps/communications-worker/openapi.yaml`, `apps/communications-worker/README.md`, `docs/infrastructure/`, `agent/AGENT.md` §2 |
| Tooling commands | `package.json`, `Makefile`, `agent/tools/README.md`, `agent/AGENT.md` §4 |
| Agent workflows | `agent/AGENT.md`, `agent/skills/**`, `CLAUDE.md` |
| CSS tokens or structure | `apps/web/public/assets/css/tokens.css`, `branding/tokens/`, `agent/AGENT.md` §2.3 |
| D1 schema | New migration file + `apps/communications-worker/README.md` |

---

## 7. CSS Design System — Working Rules

This system intentionally uses a dark void aesthetic. Do not genericize it.

**Fonts:** Cinzel (display/headers/labels, Google Fonts) · Cormorant Garamond (body/editorial, Google Fonts). No local font files — CDN-served.

**Color discipline:**
- Every UI color must be a token from `tokens.css`. No raw hex values in component CSS.
- Brand green has three alias names (`--text`, `--green-base`, `--accent`) — prefer `--text` in new code, use aliases only when consuming legacy selectors.
- Body copy in editorial and utility pages uses `--text-readable` (#e8f8ee warm cream), not green.
- Use `--mode-copy` and `--mode-copy-muted` for text in components — the mode system handles the correct value per page.

**Component pattern:**
1. Pick a brand mode (`ritual` / `editorial` / `utility`) for the page.
2. Use `--mode-*` vars for all borders, panels, shadows, and copy.
3. Define hover/focus states using `--green-hot-*` tiers.
4. Validate at 900px and 768px breakpoints.
5. Add `prefers-reduced-motion` guard for any animation.

**Do not:**
- Add new CSS files without a clear single-page or single-component scope.
- Override `--mode-*` variables inline or per-element — override at the page `data-brand-mode` level only.
- Use `opacity` on text as the sole legibility mechanism without checking contrast.
- Remove the grain texture or cursor glow — they are brand elements, not decoration.

---

## 8. Subagent Policy

Use subagents when work can proceed in parallel without blocking the main path.

Recommended scopes:

| Role | Owns |
|---|---|
| `web-surface` | Astro pages, CSS, JS, a11y, links |
| `worker-contract` | Worker routes, OpenAPI, D1 migrations, tests |
| `docs-curator` | Markdown, README, ontology consistency |
| `ops-release` | Cloudflare runtime checks, release scripts, smoke |
| `assets` | Media sync, format conversion, manifest |

Give each subagent: explicit file scope, read/write ownership, and expected output format. Do not delegate the immediately blocking task.

---

## 9. Agent Infrastructure Layout

```
agent/
├── AGENT.md          ← you are here
├── skills/           ← repo-scoped Codex skills
│   ├── cloudflare-release-ops/
│   ├── docs-assay/
│   ├── static-site-qa/
│   └── worker-contract-review/
├── ops/              ← operational runbooks
│   └── cloudflare-stability/
├── tools/            ← shell scripts invoked via npm run
│   ├── sync-assets.sh
│   ├── check-assets-sync.sh
│   ├── check-runtime-config.sh
│   ├── check-site-seo.sh
│   ├── release.sh
│   └── …
└── kits/             ← reusable scaffolding templates
    └── static-web/
```

Local-only (never commit): `.claude/`, `CLAUDE.local.md`, `.env`, `.dev.vars`, `.wrangler/`, `.reports/`.

---

## 10. Known Gaps and Future Work

### Site

| Item | Priority | Notes |
|---|---|---|
| `lift-wind-cover.jpg` needs webp | Medium | Run `cwebp -q 85 lift-wind-cover.jpg -o lift-wind-cover.webp` in `assets/source/img/covers/`, then `npm run assets:sync` |
| Lab dialog: `<div role="dialog">` not native `<dialog>` | Low | Audit `dialog.js` for complete focus trap (move-in, trap, return-on-close). Migrate to native `<dialog>` if trap is incomplete. |
| Mobile interior nav: 8 pills wrap to 3 rows at 390px | Low | Consider hamburger/drawer pattern for mobile nav once catalog grows. |
| Google Fonts CDN dependency | Low | Consider self-hosting Cinzel + Cormorant Garamond for offline/perf resilience |
| `branding/tokens/` and `tokens.css` are two token systems | Tracked | `branding/tokens/` is documentation/export only; `tokens.css` is the live system. Consolidation deferred. |

### Cloudflare Infrastructure

| Item | Priority | Notes |
|---|---|---|
| Turnstile not configured | High | `TURNSTILE_SECRET` not set → all POST endpoints bypass bot check. Add `wrangler secret put TURNSTILE_SECRET` + Turnstile widget on all forms. Or reduce `RATE_LIMIT_MAX` to 5 for POST endpoints as interim mitigation. |
| `lift-wind` buy_url null | Medium | Published 2026-05-10, `buy_url = null`. Set when Amazon/vendor link is available: `UPDATE oncoming_projects SET buy_url = '…' WHERE project_slug = 'lift-wind-…'` + new migration. |
| Stripe webhook endpoint not registered in Stripe | Medium | Handler live at `/api/stripe/webhook`. `donations` D1 table exists (migration 0014). `STRIPE_WEBHOOK_SECRET` set via wrangler. Still needs one step: create the endpoint in Stripe dashboard → Developers → Webhooks → Add endpoint → `https://server.stexpedite.press/api/stripe/webhook`, select `checkout.session.completed`. Until then, donations are not logged or receipted but checkout still works. |
| Rate limit generous for form endpoints | Low | `RATE_LIMIT_MAX=20` per IP per path/minute is high for contact/submit. Consider per-route override at 5 for POST mutation endpoints. |
| `contact_submissions` has no admin read endpoint | Low | Submit/contact submissions stored in D1 but only accessible via `wrangler d1 execute … --command "SELECT * FROM contact_submissions …"`. Add token-protected `/api/admin/submissions` if Resend reliability degrades. |

### Closed / Resolved (2026-05-24)

**Session 1 — Infrastructure + Doc restructure**
- ~~`--text-readable` token missing~~ — added to `tokens.css`; `--mode-copy` updated in editorial + utility modes
- ~~Mobile portal nav unreachable~~ — Books/Submit/Donate/Contact added to portal mobile footer
- ~~X/Substack icons wrong~~ — corrected in `site.json`
- ~~Duplicate submission form on /contact~~ — removed; single general inquiry form
- ~~No 404 page~~ — `404.astro` created in ritual mode
- ~~`check:seo` false positives on Windows (ripgrep missing)~~ — grep fallback added
- ~~`smoke-api.sh` fails on Windows (ripgrep missing)~~ — grep fallback added
- ~~`BRAND.text` in Worker diverged from frontend token~~ — aligned to `#e8f8ee`
- ~~`compatibility_date` stale at 2026-02-05~~ — bumped to 2026-05-01
- ~~`completion_percent` type mismatch (INTEGER in OpenAPI vs REAL in SQLite)~~ — changed to `number` in openapi.yaml
- ~~lift-wind status stuck at `forthcoming` past published_at~~ — migration 0013: `published` + `completion_percent = 100`

**Session 2 — MCP audit fixes + Stripe webhook + text color standardization**
- ~~Donate page: cyan heading (contrast() in keyframe animation)~~ — removed contrast() from `title-breathe`, clean green glow now
- ~~Donate page: ~400px dead space around form~~ — grid `auto 1fr auto` → `auto auto auto` + `align-content: space-between`
- ~~Donate page: HeroBar missing~~ — `HeroBar` component + `hero-bar.css` added to `donate.astro`
- ~~/books renders editorial notes in production~~ — `project.notes` fallback removed from `books-page.js`
- ~~/contact shows "If the API is unavailable…" always~~ — implementation copy removed from `form-assurance`
- ~~/gallery shows "Loaded N products" debug string~~ — status element hidden after load
- ~~/services has duplicate introText paragraph~~ — removed hardcoded duplicate from `services.astro`
- ~~`--hero-bar-height` duplicate token (48px vs 58px)~~ — 48px removed from `hero-bar.css`; 58px in `tokens.css` canonical
- ~~Ritual mode `--mode-copy` was signal green~~ — changed to `--text-readable` (warm cream) for prose readability
- ~~/submit project note textarea not required~~ — `required` attribute added
- ~~No sitemap.xml~~ — `@astrojs/sitemap` integration added; `sitemap-index.xml` generated on every build
- ~~Stripe webhook missing~~ — handler deployed at `/api/stripe/webhook`; `donations` D1 table (migration 0014); `STRIPE_WEBHOOK_SECRET` set; HMAC-SHA256 verification + D1 log + email receipt + editor notification
- ~~`--mode-copy-muted` resolved to signal green in brand modes~~ — `--text-readable-muted` token added; all three brand modes now use it for `--mode-copy-muted`; `.card-kicker`, `.aside-note`, `.book-row__series`, `.book-row__date` wired through `--mode-copy-muted`
