# St. Expedite Press — Change Log

## [2026-06-03] — Phase 2 — v1.1.0: Full aesthetic audit pass (22 issues)

**Entity:** Project
**Process:** Live Site Fix Cycle
**Subagent:** direct
**Changes:** 12 files changed, 1 migration created

**donate-portal.css:** Removed `title-breathe` animation (was causing DONATE heading fuzz/bloom). Turnstile repositioned after preset buttons, centered with `justify-self: center`, `min-height: 65px`. Mobile `padding-top` now clears hero-bar height.
**donate.astro:** Turnstile moved to between `donate-feedback` and `donate-console`.
**mission.css:** `.mission-essay` + `margin-inline: auto` — centers 65ch column on wide screens.
**forms.css:** `.section-copy--large` `max-width` 28rem → 40rem.
**components.css:** `.cf-turnstile { min-height: 65px }` global — reserves widget slot on contact/submit. `.check-list`/`.meta-list` items: reduced padding/border so they read as tags not inputs.
**services.css:** `.services-grid` `margin-top: 1.5rem`.
**portal.css:** `.portal-link-row` added; portal-link font-size reduced to fit 2 per row.
**site.json:** Lab subtitle → "Field instruments". donateThanks title → "Donation" (was "Donation Complete", was wrapping to 2 lines). Homepage footer links consistent across mobile/desktop.
**contact.astro:** "Use the Submit page." → link wraps as a natural unit.
**404.astro:** Footer nav added (Books/About/Contact/Submit/Donate). Sigil gap tightened.
**index.astro:** Mobile portal now shows BOOKS+STORE / crow / ABOUT+LAB in paired rows. Both splash footers include Lab and Store.
**0016_cover_image_lift_wind_webp.sql:** Updates cover_image to webp path (split from 0015 to unblock image fix without requiring buy_url).

**Outstanding:** Run migration 0016 remotely once ready. buy_url for Lift Wind still pending vendor URL.

**Outcome:** All 22 audit items addressed. Full check suite passes. Pushed to main; Cloudflare Pages auto-deploy triggered.

---

## [2026-06-02] — Phase 2 — Portal splash spacing + aesthetic pass findings

**Entity:** Page (index portal)
**Process:** Live Site Fix Cycle
**Subagent:** direct
**Changes:**
- `apps/web/public/assets/css/portal.css`: Desktop `.splash` — `bottom: 3.3vh` → `2vh`; `.lede` margin `0.3rem` → `0.55rem`; `.divider` margin-top `0.4rem` → `0.7rem`; `.splash__foot` added `margin-top: 0.9rem`
- `portal.css`: Mobile `.portal-mobile .lede` margin `0.3rem` → `0.5rem`; `.portal-mobile .divider` margin-top `0.4rem` → `0.65rem`; `.portal-mobile .splash__foot` added `margin-top: 0.65rem`
- `portal.css`: `max-height: 680px` override proportionally adjusted (lede `0.2rem` → `0.3rem`, divider `0.25rem` → `0.4rem`, splash__foot `0.4rem` added)

**Outcome:** Splash block lowered 1.3vh on desktop; "Books // Submit // About // Donate" row now has 0.9rem separation from the △†△ divider. Pending build + deploy to go live.

**Aesthetic pass findings (not yet fixed — open items):**
- `lift-wind-cover.jpg` still black rectangle on /books: migration 0015 needs splitting — run cover_image update independently of buy_url
- `.section-copy--large { max-width: 28rem }` creates lopsided form cards at desktop — increase to ~40rem
- `.mission-essay` 65ch column left-aligned on /about — add `margin-inline: auto` to center it
- `.cf-turnstile` in `.form-grid` has no `min-height` — add `min-height: 65px` to reserve space

---

## [2026-06-02] — Phase 2 — Fix GitHub health monitor after Turnstile activation

**Entity:** CI/Workflow
**Process:** Live Site Fix Cycle
**Subagent:** direct
**Changes:**
- `.github/workflows/api-health-monitor.yml`: `updates` probe expected codes `400` → `400 403`; `contact` probe `400 500` → `400 403 500`; `submit` probe `400 500` → `400 403 500`

**Outcome:** v1.0.9 set `TURNSTILE_SECRET` in the Worker, activating Turnstile verification. The Turnstile check (index.ts:1159) runs before input validation, so unauthenticated POST probes now receive 403 instead of 400. The three broken probes now accept 403 as a valid response. `donate-session` and `updates-unsubscribe` already listed 403 and were unaffected.

---

## [2026-06-01] — Phase 2 — v1.0.9: Turnstile bot protection wired

**Entity:** Project
**Process:** Live Site Fix Cycle
**Subagent:** direct
**Changes:**
- `wrangler secret put TURNSTILE_SECRET` — Cloudflare Managed Turnstile secret set in Worker `stexpedite-communications`
- `form-utils.js`: `getTurnstileToken()` and `resetTurnstile()` helpers exported
- `contact-page.js`, `submit-page.js`, `donate-page.js`: `turnstileToken` included in POST body; `resetTurnstile()` called on error
- `index.astro` inline `wireUpdatesForm`: Turnstile token extracted and included in `/api/updates` POST body
- Turnstile CDN script added to `contact.astro`, `submit.astro`, `donate.astro` scripts slot; `index.astro` head-extra
- `.cf-turnstile` widget divs added to all 4 forms (contact, submit, donate, index updates); `data-size="compact"` on thin form
- Site key: `0x4AAAAAADc-GOYeYwVaZA_I` (Managed mode, `stexpedite.press` hostname)

**Outcome:** All 4 public form surfaces now have bot protection. Worker already had `verifyTurnstile()` logic — it bypassed when secret was empty. Setting the secret activates it automatically for `/api/contact`, `/api/submit`, `/api/donate/session`, and `/api/updates`. Full check suite passes.

---

## [2026-06-01] — Phase 2 — v1.0.8: audit fixes + aesthetic upgrades

**Entity:** Project
**Process:** Live Site Fix Cycle
**Subagent:** direct
**Changes:**
- `donate.astro`: added `<p id="donate-selected-amount">` — restores "X selected. Seal it." copy
- `gallery-page.js`: fallback copy now shows when products.length < 3
- `form-utils.js`: `escapeHtml` extracted here; `books-page.js`, `gallery-page.js`, `lab-anglossic-ui.js` now import it
- `tokens.css`: removed `--dark` alias and `--relief-base` legacy alias (both confirmed unused)
- `404.astro`: `--relief-base` → `--relief` in scoped style
- `donate-portal.css`: `--relief-base` fallbacks → `--relief`; `.donate-feedback` style added; `preset-seal` keyframe on selected preset button; donate-portal glassmorphism preserved
- `dialog.js`: `setBackgroundInert()` helper — sets `inert` on all body children except the dialog container on open/close; completes the ARIA modal pattern
- `lab.css`: `.lab-dialog` glassmorphism — `backdrop-filter: blur(8px)`, border, box-shadow
- `layout.css`: `page-intro__title` font-size → `clamp(1.9rem, 4.5vw, 3.2rem)` (up from 2.2rem max)
- `components.css`: `reveal-up` animation on `.card` gated on `prefers-reduced-motion`
- `interior-base.css`: `reveal-up` animation on `.page-intro`; `@keyframes reveal-up` defined
- `apps/web/package.json`: `@astrojs/cloudflare` removed (dead dependency, 31 packages uninstalled)
- `AGENTS.md §11`: gaps resolved, Closed/Resolved updated

**Outcome:** All Medium + Low audit items resolved except: Turnstile (requires external config), `updates-signup.js` inline dedup (Low), donate/thanks session check (Low), OG image differentiation (Low). Full check suite passes: build ✅ · HTML lint ✅ · links ✅ · a11y ✅ · 20 worker tests ✅ · 0 vuln ✅.

---

## [2026-06-01] — Phase 2 — agent/ dissolution, MCP skills, full site audit

**Entity:** Project
**Process:** Workspace Maintenance, Live Page Audit
**Subagent:** claude (MCP audit — 49 tool calls, all 11 pages)
**Changes:**
- `agent/AGENT.md` dissolved into root `AGENTS.md` (comprehensive doc)
- `agent/` fully dissolved: tools → `scripts/`, ops → `ops/`, skills → `skills/`, kits → `kits/`
- `CLAUDE.md` updated: `@agent/AGENT.md` → `@AGENTS.md`
- `check-tooling-integrity.mjs`, `package.json`, `Makefile`, `agent.config.json`, shell scripts all updated to new paths; `project-ontology.json` and `docs/ontology/ontology.md` updated
- `AGENTS.md §9` MCP Tools section added; §11 Known Gaps expanded with audit findings
- All 4 skills updated with MCP capabilities (playwright, playwright-ea, firecrawl, page-design-guide, screenshot-fast)
- Full 11-page live site audit completed via MCP browser tools

**Audit findings summary:**
- Site is in solid post-v1.0.7 state — no broken pages, all APIs responding, content finalized
- 1 product live in Fourthwall storefront (Lift Wind buy_url null confirmed)
- `donate-page.js` amountLabel null confirmed — "X selected. Seal it." copy never renders
- `dialog.js` focus trap confirmed complete; only gap is no `inert` on background DOM
- `@astrojs/cloudflare` dead dep confirmed
- Turnstile missing from all 5 form surfaces confirmed
- Self-hosted fonts and Session 3 fixes all confirmed live

**Outcome:** Session 4 doc work complete. Next priorities: (1) Turnstile configuration (High infrastructure), (2) donate amountLabel fix + gallery sparse fix (Medium functional), (3) scroll-reveal animations (Medium design — highest visual return), (4) quick-wins: dead dep removal, `--relief-base` fix, `escapeHtml` dedup.

---

## [2026-06-01] — Phase 2 — v1.0.7 deployed; workspace git isolation complete

**Entity:** Project
**Process:** Live Site Fix Cycle, Workspace Maintenance
**Subagent:** direct
**Changes:**
- All v1.0.7 work committed (54 files) and pushed to `St-Expedite-Press/this-place-feels-wrong`
- Self-hosted fonts committed: `apps/web/public/assets/fonts/` (12 woff2 files), `fonts.css`
- `BasePortal.astro` committed; `index.astro`, `donate.astro`, `404.astro` all use it
- `branding/tokens/brand-tokens.css` two-vocabulary bridge committed
- Audit reports committed: `audit/site-audit-2026-05-30.md`, `audit/visual-system-audit-2026-05-31.md`, `audit/code-review-2026-05-31.md`
- `docs/press/` added: commonsplaces, press reference, two book proposals
- `PHASE-PLAN.md` added to repo
- Pre-push hook: build ✅ · HTML lint ✅ · links ✅ · a11y ✅ · 20 worker tests ✅ · 0 vuln ✅
- Cloudflare Pages deploy: `validate` ✅ 27s · `deploy` ✅ 34s — stexpedite.press is live on v1.0.7
- Workspace isolation: this repo and the 3 other workspace projects (`barto-appliance`, `dixie-mag`, `ogc`) each now have their own private GitHub repos; workspace `.gitignore` updated to per-dir exclusions

**Outcome:** All v1.0.7 work is deployed and live. One outstanding item: Lift Wind buy URL — run migration 0015 once the vendor/Amazon link is confirmed. No other known blockers.

---

## [2026-05-31] — Phase 2 — Token reconciliation + branding docs update

**Entity:** Project
**Process:** Live Site Fix Cycle, Workspace Maintenance
**Subagent:** direct
**Changes:**
- `branding/tokens/brand-tokens.css`: Rewritten as a two-vocabulary bridge file. `--brand-*` names for design tools; implementation aliases (`--bg`, `--panel`, `--mode-*`, etc.) declared as `var(--brand-*)` references at the bottom. Both `[data-brand-mode]` override sections now set both vocabularies, keeping them in sync. Single source of truth for all values.
- `branding/README.md`: Updated token description; fixed stale `base.css` → `interior-base.css` path; replaced stale "Recommended Implementation Order" with current "Implementation Status" (tracking what's done vs. remaining)
- `branding/tokens/brand-tokens.json`: Updated version 0.1.0 → 0.2.0, lastUpdated, description, fixed stale `base.css` sourceFile reference
- Lift Wind buy URL: No Amazon listing found publicly. Migration `0015_buy_url_lift_wind.sql` remains ready to run once the link is confirmed.

**Outcome:** Token namespace divergence resolved. Designers using `--brand-*` names in mockups and developers using `--mode-*`/`--text-*` names in CSS are now working from the same file with no value drift risk. All documented items from the full refactor pass are complete.

---

## [2026-05-31] — Phase 2 — Subtitle cleanup, donate layout, book titles, BasePortal, docs

**Entity:** Project
**Process:** Live Site Fix Cycle, Workspace Maintenance
**Subagent:** claude (BasePortal refactor) + direct
**Changes:**
- `site.json`: Removed "The press catalog" (books subtitle) and "Experimental instruments" (lab subtitle) — overexplaining headers
- `SiteHeader.astro`: `subtitle` and `eyebrow` now conditionally rendered — empty string suppresses the element
- `donate-portal.css`: `align-content: space-between` → `center` — closes ~350px vertical void between DONATE heading and form
- `books.css`: `.book-row__title` changed from Cinzel uppercase to Cormorant Garamond weight 600 — literary titles render correctly with accents and mixed case
- `mission.css`: `.mission-essay` constrained to `65ch` (was 44rem); `.essay-phase` headings 0.72rem → 0.8rem, color to `text-soft`
- `BasePortal.astro` (NEW): Shared layout for `index.astro`, `donate.astro`, `404.astro` — eliminates ~120 lines of duplicated `<head>` boilerplate. Supports `bodyClass`, `ogTitle`, `ogDescription`, `pageTitle`, `head-extra` slot.
- `Head.astro`: Extended with `ogTitle`, `ogDescription`, `pageTitle` optional props + `head-extra` named slot
- `index.astro`, `donate.astro`, `404.astro`: All refactored to use `BasePortal.astro`
- `layouts/README.md`: Full prop documentation for both layouts
- `docs/state-of-play.md`: Layout architecture and font delivery sections added
- `CHANGELOG.md`: 1.0.7 entry with all changes from this full refactor pass

**Outcome:** 26 files changed. All M-effort items from the code review are now resolved except: legacy D1 query fallback cleanup (confirmed to check column availability first) and token/branding namespace reconciliation (design decision needed). Site is now deployment-ready — push when buy URL for Lift Wind is confirmed.

---

## [2026-05-31] — Phase 2 — Full visual system audit + code review; 20-file refactor pass

**Entity:** Project
**Process:** Live Page Audit (visual), Code Review, Live Site Fix Cycle
**Subagent:** claude ×2 (parallel background agents) + direct execution
**Changes:**

*Code review (code-review-2026-05-31.md):*
- `gallery-page.js`: Fixed critical ViewTransitions bug — module-scope DOM queries + loadCatalog() now wrapped in `astro:page-load` listener; all element refs moved inside loadCatalog() for fresh DOM access on each navigation
- `index.ts:538`: Stripe webhook "not configured" response changed from 500 → 200 (prevents Stripe retry flood)
- `index.astro` + `404.astro`: Removed stale Google Fonts preconnect hints (fonts are self-hosted)
- `a11y.css` + `donate-portal.css`: Replaced all literal `"Cinzel", serif` / `"Cormorant Garamond", serif` with `var(--font-display)` / `var(--font-body)` (6 instances)
- `index.astro`: Added `aria-label="Primary"` to `.mobile-index-nav`
- `lab.astro`: Added `aria-expanded="false"` + `aria-controls="compass-modal"` to compass-launch button
- `dialog.js`: open/close functions now toggle `aria-expanded` on the trigger element
- `wrangler.toml`: Added comments documenting all 6 required secrets
- `branding/web-elements.md`: Fixed stale `content-shell.css` → `interior-base.css` reference

*Visual system audit (visual-system-audit-2026-05-31.md):*
- `books.astro`: Removed duplicate intro sentence (body repeated page-intro__text verbatim)
- `books.astro`: Swapped button priority — "Submission inquiries" now primary, "Rights/press inquiries" now secondary
- `components.css`: Nav pill font-size 0.72rem → 0.8rem (Cinzel below legibility floor at 11.5px)

**Outcome:** 20 files changed. Critical ViewTransitions bug fixed. 3 critical/security issues addressed. ARIA improved across lab, nav, dialog. Font tokens de-duplicated. Full visual + code audit reports written. M-effort items remaining (BasePortal.astro layout consolidation, legacy D1 query cleanup, token/branding namespace reconciliation, scroll-reveal animation system) — flagged for prioritization.

---

## [2026-05-31] — Phase 1 → 2 — All 10 audit fixes applied

**Entity:** Project
**Process:** Live Site Fix Cycle
**Subagent:** direct
**Changes:**
- `site.json`: donate description rewritten in press voice; donateThanks introTitle/introText replaced (dedup fix); Submit added to footerLinks
- `about.astro`: removed duplicate Osiris opening paragraph (already in Base.astro intro section)
- `layout.css`: nav pills switch to `overflow-x: auto; flex-wrap: nowrap` at ≤480px — no more 3-row wrap
- `gallery.astro` + `gallery-page.js`: static fallback copy wrapped in `#store-fallback-copy`, hidden on successful product load
- `Head.astro` + `Base.astro` + `donate/thanks.astro`: robots prop added with default; donate/thanks now sets `noindex,nofollow`
- `donate.astro`: context copy added above donation form; `.donate-context` style added to `donate-portal.css`
- Fonts self-hosted: `assets/css/fonts.css` created with @font-face for Cinzel + Cormorant Garamond (12 woff2 files in `assets/fonts/`); `site.fontStylesheet` now points to local file; Google Fonts preconnect links removed from Head.astro and donate.astro
- `lift-wind-cover.webp` generated from source JPG via Pillow (1024×1536, RGB)
- Migration `0015_buy_url_lift_wind.sql` created — sets cover_image to webp path; buy_url requires vendor URL before running

**Outcome:** Fixes 3–10 fully applied. Fix 2 (cover image) complete as webp conversion. Fix 1 (buy link) is a migration ready to run once the Amazon/vendor URL is confirmed — the TODO placeholder is in the SQL. Phase 2 (design variants) is now unblocked.

---

## [2026-05-30] — Phase 1 — Full site audit complete

**Entity:** Project
**Process:** Live Page Audit + Site Audit
**Subagent:** claude (with firecrawl, screenshot-fast, design-copier, page-design-guide, source reads)
**Changes:** Full audit of all 11 pages at stexpedite.press. Report written to `audit/site-audit-2026-05-30.md`. PHASE-PLAN.md updated — Phase 1 now complete.
**Outcome:** 10-item priority fix list. Critical issues: (1) *Lift Wind / Love Heat* has no buy link — revenue leak; (2) `lift-wind-cover.jpg` renders as black rectangle — replace with webp; (3) intro text duplication on /about and /donate/thanks. Strong foundations: design token system is architecturally mature, copy quality is excellent, SEO is thorough and correct across all 11 pages. Phase 1 complete — Phase 2 (design variants) unblocked after fixes #1–3 are addressed.

---

## [2026-05-28] — Phase 1 — Project onboarded to workspace

**Entity:** Project
**Process:** Project Onboarding
**Subagent:** claude
**Changes:** Created CLAUDE.md, STEX_SANDBATCH.md, PHASE-PLAN.md, MEMORY.md. Migrated press reference content from `dixie_mag_branding/St Expedite Press/` to `content/`.
**Outcome:** Project is in standard workspace structure. Phase 1 audit is partial — live page issues were previously documented (see workspace auto-memory). Full content inventory and design work pending.
# Agent Framework Entry — 2026-06-25

**Scope:** Agent infrastructure
**Changed:** Refreshed root `ONTOLOGY.md`; updated `AGENTS.md`, `docs/ontology/ontology.md`, and `docs/ontology/project-ontology.json` with the `AGENTS.md`/`ONTOLOGY.md`/`MEMORY.md` framework; added local `AGENTS.md` and `MEMORY.md` files for `apps/web/`, `apps/communications-worker/`, `assets/`, `branding/`, `docs/`, `ops/`, `scripts/`, `skills/`, and `kits/`.
**Checks:** npm run check:tooling-integrity, npm run check, and git diff --check passed for the scaffold.
**Follow-ups:** Keep local memories concise during future work and periodically curate stale entries.
**Tooling notes:** Closeout now explicitly requires memory logging, tooling/skills assessment, and ontology upkeep when contracts move.

---
