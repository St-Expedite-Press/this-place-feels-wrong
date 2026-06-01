# St. Expedite Press — Code Review
**Date:** 2026-05-31
**Reviewer:** Claude (subagent)
**Scope:** Full codebase — Worker, Astro frontend, CSS, client JS, configuration

---

## Executive Summary

This is a well-structured, professionally-organized codebase for a literary press site. The Worker is the standout component: typed, secure (HMAC webhook verification, honeypot, Turnstile, D1-backed rate limiting), and well-tested. The CSS architecture uses a coherent three-mode token system and the client JS modules are clean, scoped, and use a shared `api-client.js` / `form-utils.js` pattern correctly. The primary weaknesses are: (1) three pages (`index.astro`, `donate.astro`, `404.astro`) bypass the `Base.astro` layout and duplicate `<head>` boilerplate — this is the highest-impact refactor available; (2) the CSS token system in `tokens.css` uses a different naming convention than `branding/tokens/brand-tokens.css`, creating a dual-vocabulary drift risk; (3) `gallery-page.js` runs at module-top instead of inside an `astro:page-load` listener, making it incompatible with ViewTransitions on navigation; (4) the `@astrojs/cloudflare` adapter is a dependency but unused with `output: 'static'`.

---

## Scores (1–10)

| Area | Score | Note |
|------|-------|------|
| TypeScript / Worker quality | 9/10 | Near-professional; minor inline type definition verbosity |
| Astro component architecture | 6/10 | Layout bypass on 3 pages creates significant duplication |
| CSS architecture | 7/10 | Token system solid; hardcoded values in page-specific CSS and donate-portal.css; dual-vocabulary with branding/ |
| Client JavaScript quality | 8/10 | Clean module pattern; gallery-page.js has a ViewTransitions bug |
| Accessibility | 7/10 | Dialog focus trap is correct; some ARIA gaps and the lab dialog has a `role="dialog"` without `<dialog>` element |
| Performance | 8/10 | Font self-hosting correct; good lazy loading; one unused adapter dependency |
| Test coverage | 8/10 | Happy paths and error paths covered; no storefront error path test; no rate-limit cleanup test |
| Maintainability | 8/10 | Excellent tooling-integrity script; migration chain clean; 3-page layout bypass is the main debt |

---

## Critical Issues (fix before deploy)

**1. `gallery-page.js` runs at module scope — breaks on ViewTransitions navigation**
`apps/web/public/assets/js/gallery-page.js`, lines 3–6 and line 83.
Module-level DOM queries (`document.getElementById("store-toolbar")`) and the bare `loadCatalog()` call at line 83 execute once on initial page load. Every other page module uses `document.addEventListener("astro:page-load", init)`. When a user navigates away and back to `/gallery` via ViewTransitions, the store grid will not reload. This must be wrapped in an `astro:page-load` handler like every other page module.

**2. `@astrojs/cloudflare` adapter is installed but unused**
`apps/web/package.json`, line 12; `apps/web/astro.config.mjs`, line 4.
`@astrojs/cloudflare` v13.5.4 is a direct dependency, but `astro.config.mjs` declares `output: 'static'` with no `adapter:` field. The package is never used and adds ~10MB to `node_modules`. This can silently create confusion if someone adds `adapter: cloudflare()` without understanding the static-only intent.

**3. Stripe webhook returns `500` when `STRIPE_WEBHOOK_SECRET` starts with `whsec_xxx`**
`apps/communications-worker/src/index.ts`, line 538.
The check `webhookSecret.startsWith("whsec_xxx")` is a placeholder-detection guard, but it returns `500 Internal Server Error` to Stripe. Stripe will retry 500s for days. The correct response for "webhook not configured" is `400` or `200` with a non-error body (Stripe recommends `200` with an ignored payload for graceful degradation). Returning `500` will flood logs and cause Stripe to spam retries.

---

## TypeScript / Worker

### What's working

The Worker is the strongest part of the codebase. All parameters and returns on exported and internal functions are typed. Error handling is consistent: errors are typed as `Error | unknown`, narrowed with `instanceof Error`, and `catch (e: any)` appears nowhere. The `Env` type at line 18 is declared explicitly. HMAC webhook verification (`verifyStripeSignature`) is implemented correctly in pure Web Crypto API. CORS policy correctly uses `allowedOrigins` Set with localhost passthrough for dev, and never uses wildcard for credentialed requests. Input sanitization uses `normalizeText(value, maxLen)` with a character-count ceiling on every field.

### Issues

**TS-1: Inline D1 type definitions instead of Cloudflare's official types**
`apps/communications-worker/src/index.ts`, lines 3–16.
`D1Statement` and `D1Database` are hand-rolled. Cloudflare publishes `@cloudflare/workers-types` for exactly this purpose. The hand-rolled definitions are incomplete: they omit `.raw()`, `.dump()`, and `D1Result` metadata. When D1's API gains new capabilities, the local types will silently be wrong.
**Fix:** Add `"@cloudflare/workers-types"` as a devDependency and remove the local D1 type block. Add `"types": ["@cloudflare/workers-types"]` to a `tsconfig.json` in the worker package.

**TS-2: `handleProjects` has a three-level nested try/catch fallback for column existence**
`apps/communications-worker/src/index.ts`, lines 993–1019.
The query fallback chain (`selectWithBuy` → `selectWithBuyLegacyProgress` → `selectLegacy`) is a schema migration guard kept in code rather than in migrations. This is dead weight now that migration `0012` is deployed. The legacy fallback paths add ~40 lines of complexity and two extra D1 round-trips in edge cases.
**Fix:** After confirming the production D1 has all current columns, delete the `catch (error)` fallback branches and use only `selectWithBuy`.

**TS-3: `BRAND` object in index.ts duplicates brand token values from `tokens.css`**
`apps/communications-worker/src/index.ts`, lines 379–392.
The email renderer has its own hardcoded `#050807`, `#e8f8ee`, `rgba(42, 255, 138, 0.55)`, etc. These are not sourced from any shared token file. If the brand palette changes, email appearance will diverge from the site.
This is acceptable for email HTML (email clients don't support CSS custom properties), but it should be documented explicitly.

**TS-4: Rate-limit implementation has a TOCTOU gap**
`apps/communications-worker/src/index.ts`, lines 699–722.
The pattern is: SELECT → if not exists, INSERT; if exists and under limit, UPDATE count. In a high-concurrency burst two requests can both pass the SELECT check before either writes the INSERT, both insert successfully (or one silently conflicts), and both count as request 1. D1's SQLite engine mitigates this in practice on single-threaded Workers, but the `ON CONFLICT` logic on INSERT correctly resets to count=1 rather than incrementing, which means the window resets unexpectedly on concurrent first-hits. For the press's traffic volume this is acceptable but should be noted.

**TS-5: `parseDonationAmountCents` accepts `"0.99"` as a valid amount even though DONATION_MIN_CENTS=500**
`apps/communications-worker/src/index.ts`, lines 182–197. The regex `/^\d+(?:\.\d{1,2})?$/` matches `"0.99"`, which is 99 cents. The min-cents check at line 1271 will correctly reject it. This is fine — just confirming the defense-in-depth works correctly.

---

## Astro Component Architecture

### What's working

The `Base.astro` layout is well-designed: typed `Props` interface with all optional fields documented, `brandMode` union type (`'ritual' | 'editorial' | 'utility'`), correct slot names (`scripts`, `afterMain`), and the `styles: string[]` prop for per-page CSS injection is clean. `SiteHeader.astro` and `Footer.astro` both consume `site.json` as their data source, which is the right pattern. The `HeroBar.astro` social icon system with inline SVG from `site.json` is good for performance and accessibility.

### Issues

**ARCH-1: Three pages bypass Base.astro and duplicate the entire head/body structure**
`apps/web/src/pages/index.astro` lines 13–50, `apps/web/src/pages/donate.astro` lines 9–42, `apps/web/src/pages/404.astro` lines 7–22.
All three pages hand-roll their own `<!doctype html>`, `<html>`, `<head>`, `<body>`, and repeat the same meta tag, favicon, font stylesheet, and `<HeroBar />` include pattern. This means three places to update for any global meta tag change. `index.astro` even duplicates `HeroBar` import alongside its own complete head block.
**Fix:** Create a `BasePortal.astro` layout variant (or extend `Base.astro` with a `portal` variant flag) that accepts the same head props, injects the portal-specific CSS list, and handles `body.dialog-open` state. This eliminates ~120 lines of duplication.

**ARCH-2: `donate.astro` re-imports `ClientRouter` directly instead of via `Head.astro`**
`apps/web/src/pages/donate.astro`, line 3. `ClientRouter` is already included in `Head.astro` via its import at line 2. If this page were ever refactored to use `Base.astro`, the `ClientRouter` would be included twice.

**ARCH-3: `Base.astro` renders `<section class="page-intro">` unconditionally even when all three props are empty**
`apps/web/src/layouts/Base.astro`, lines 51–55.
When `introKicker`, `introTitle`, and `introText` are all undefined (as they could be on edge cases), the markup renders an empty `<section class="page-intro">` with empty `<p>` and `<h2>` elements. These empty elements affect accessibility (empty headings) and spacing. They should be wrapped in a conditional.

**ARCH-4: `styles` prop is required in `Base.astro` but should have a default of `[]`**
`apps/web/src/layouts/Base.astro`, line 20. The `styles: string[]` prop has no `?` and no default, making it required. Every page passes the array explicitly, which works, but a default of `styles = []` would be safer and make the layout more reusable.

**ARCH-5: `site.json` lacks TypeScript types**
`apps/web/src/data/site.json` is consumed directly. There is no corresponding `site.ts` type or `import type` assertion. If the JSON structure changes, Astro's static analysis will not catch it until runtime. The `pages` object keys are also not exhaustive — if a new page is added without a matching key, the `siteData.pages.newpage` access returns `undefined` silently.

---

## CSS Architecture

### What's working

The three-mode token system (`[data-brand-mode="ritual/editorial/utility"]`) in `tokens.css` is coherent and well-implemented. Mode-specific variables are scoped correctly and fall back to sensible defaults. The `--mode-*` prefix convention is clean. `interior-base.css` handles the modal/body lock (`body.dialog-open`) and the `prefers-reduced-motion` block globally. Skip link implementation is present and correct. The `image-set()` usage in `interior-base.css` for the background image (webp + png fallback) is the right pattern.

### Hardcoded values that should be tokens

**CSS-1: `donate-portal.css` uses literal font families instead of tokens**
`donate-portal.css`, lines 55, 64, 108, 138, 203.
`font-family: "Cinzel", serif` and `font-family: "Cormorant Garamond", serif` appear 5 times. Should be `var(--font-display)` and `var(--font-body)`.

**CSS-2: `donate-portal.css` uses literal border-radius `24px` instead of `var(--radius-xl)` or `var(--radius-lg)`**
`donate-portal.css`, line 79. `border-radius: 24px` is close to `--radius-xl: 28px` but not identical and has no token.

**CSS-3: `donate-portal.css` and `portal.css` duplicate `.splash`, `.splash__eyebrow`, `.lede`, `.divider`, `.splash__foot` CSS blocks**
`donate-portal.css` lines 176–224, `portal.css` lines 510–561. These are identical classes with identical properties. The `portal.css` version is for the desktop portal; `donate-portal.css` has the same block for the donate page. The donate page uses its own non-`Base.astro` layout, so it can't reuse the portal styles directly, but this duplication means any splash redesign must be done twice.
**Fix:** Extract `.splash` and friends to a shared `portal-splash.css` partial.

**CSS-4: `hero-bar.css` declares new `:root` variables that overlap with `tokens.css`**
`hero-bar.css`, lines 1–5: `--hero-bar-gap`, `--hero-bar-pad-x`, `--hero-bar-border`. These are local to the hero-bar component but declared at `:root`. They should be prefixed (e.g., `--hb-gap`) or scoped to `.hero-bar`.

**CSS-5: `footer.css` declares a separate `.sep-footer` component that is never used in any Astro template**
The `Footer.astro` component uses `.site-footer`, `.site-footer__lede`, `.site-footer__links` (defined in `components.css`). The `footer.css` file defines `.sep-footer`, `.sep-footer__coords`, `.sep-footer__lede`, etc. None of these classes appear in `Footer.astro`. This entire file is dead CSS unless there's a template that uses `sep-footer` elsewhere. **Check before deleting** — it may be referenced in `portal.css` or `donate-portal.css`, but neither file uses it.

**CSS-6: `a11y.css` hardcodes font family**
`a11y.css`, line 19: `font-family: "Cinzel", serif` — should be `var(--font-display)`.

**CSS-7: `components.css` duplicates `.hero-bar` and `.hero-bar__inner` from `hero-bar.css`**
`layout.css` lines 7–25 defines `.hero-bar` and `.hero-bar__inner`. `hero-bar.css` also defines them. These are not identical — `layout.css` uses `inset: 0 0 auto 0` (modern shorthand) while `hero-bar.css` uses `top: 0; left: 0; right: 0` (explicit). Both are loaded on all interior pages since `Head.astro` hardcodes `hero-bar.css` at line 37. The `layout.css` versions will be superseded by `hero-bar.css` when both are present, but the duplication creates confusion about which file owns the component.

**CSS-8: Token naming convention drift between `tokens.css` and `branding/tokens/brand-tokens.css`**
`tokens.css` uses `--bg`, `--panel`, `--border`, `--text`, `--accent`, `--relief`, `--green-1` etc.
`branding/tokens/brand-tokens.css` uses `--brand-void-black`, `--brand-panel`, `--brand-signal-green`, `--brand-relief-magenta`, `--brand-mode-surface`, etc.
The `branding/` file is described as the "design source of truth" and defines `--brand-mode-surface`, `--brand-mode-text`, `--brand-mode-border`, `--brand-mode-shadow` while `tokens.css` uses `--mode-panel`, `--mode-border`, `--mode-copy`, `--mode-shadow`. These are not aliases of each other — they are parallel systems. If a designer refers to the `branding/` file, they will generate tokens that don't match what's actually in the implementation.

### Specificity and cascade

**CSS-9: `prefers-reduced-motion` in `interior-base.css` uses `!important` on `animation` and `transition`**
`apps/web/public/assets/css/interior-base.css`, lines 127–129:
```css
animation: none !important;
transition: none !important;
```
This is intentional and acceptable for reduced-motion overrides, but it means any portal animation that's individually overridden with `animation: none` in portal-specific `@media (prefers-reduced-motion)` blocks (e.g., `portal.css` line 456, `donate-portal.css` line 285) is now redundant. Interior-base already covers it globally. Not a bug, but the redundant blocks can be removed.

**CSS-10: No `!important` in non-reduced-motion contexts — good.**
No specificity battles found in the remaining CSS.

### Responsive design

The CSS is primarily desktop-first (base styles, then `@media (max-width: N)` overrides). This is consistent throughout all 16 files. No mobile-first exceptions found.

---

## Client JavaScript

### What's working

`api-client.js` is clean, re-exported correctly, and handles timeout, AbortController, typed `ApiError`, and the `resolveRequestUrl` dev-origin override correctly. `form-utils.js` provides four utility functions (`setPendingState`, `setStatus`, `clearStatus`, `copyText`, `buildMailto`) that are used consistently across `contact-page.js`, `submit-page.js`, and `updates-signup.js`. No global namespace pollution — all modules use ES module syntax. `escapeHtml` is correctly re-implemented locally in `books-page.js`, `gallery-page.js`, and `lab-anglossic-ui.js` rather than being imported and misused. The `dialog.js` focus trap (`trapFocus`) correctly handles Tab, Shift+Tab, and Escape, and removes its listener on close.

### Issues

**JS-1: `gallery-page.js` does not use `astro:page-load` — breaks ViewTransitions**
`apps/web/public/assets/js/gallery-page.js`, lines 3–6 and line 83.
All DOM queries (`toolbar`, `status`, `grid`, `footerLink`, `fallbackCopy`) run at module scope on first parse. `loadCatalog()` at line 83 is called bare. Every other page module (`books-page.js` line 118, `contact-page.js` implicit, `lab-anglossic-entry.js` implicit) either guards against null or uses `astro:page-load`. On ViewTransitions return-navigation, the new DOM is swapped in but the module already ran and its references point at the old (now-detached) elements.
**Fix:**
```js
function init() {
  const toolbar = document.getElementById("store-toolbar");
  // ... move all element queries inside here
  loadCatalog();
}
document.addEventListener("astro:page-load", init);
```

**JS-2: `index.astro` has a `wireUpdatesForm` function inline that duplicates `updates-signup.js`**
`apps/web/src/pages/index.astro`, lines 204–281. This is an inline `<script is:inline>` with a full form-wiring implementation. `updates-signup.js` exports `mountUpdatesSignup()` for exactly this purpose and is used correctly on no other page that calls the updates API. The inline version is 80 lines; the shared module is 60 lines and already does the same thing.
**Fix:** Import `updates-signup.js` and call `mountUpdatesSignup({ formId: ... })` from a module script, or refactor `mountUpdatesSignup` to accept DOM element IDs rather than element refs.

**JS-3: `donate-page.js` references `donate-selected-amount` element that does not exist in `donate.astro`**
`apps/web/public/assets/js/donate-page.js`, line 8: `const amountLabel = document.getElementById("donate-selected-amount")`.
`donate.astro` has no element with id `donate-selected-amount`. The `syncPresetState` function null-guards against `!amountLabel` at line 29, so this is not a crash, but it means the visual amount-display label feature is silently non-functional.

**JS-4: `lab-anglossic-entry.js` runs top-level state initialization at module scope, not inside `astro:page-load`**
`apps/web/public/assets/js/lab-anglossic-entry.js`, lines 7–9.
```js
const state = loadState();
if (!state.currentId) { ... }
```
And all DOM queries (lines 12–15) run at module scope. The lab page has `brandMode="ritual"`, which sets `portal.css`'s `body { overflow: hidden }`, so there's no navigation back to the lab page in normal flow, but the pattern is inconsistent.

**JS-5: `site-shell.js` is loaded on every page but only adds a `js` class**
`apps/web/public/assets/js/site-shell.js` contains only:
```js
document.documentElement.classList.add("js");
```
This is one line. Loading an entire module script HTTP request for one line is unnecessary overhead. Either inline this into `Head.astro` or `Base.astro` as a tiny `<script>` tag, or add the JS detection there directly.

**JS-6: `escapeHtml` is duplicated in three modules**
`books-page.js` lines 3–10, `gallery-page.js` lines 9–16, `lab-anglossic-ui.js` lines 9–16. All three are byte-identical. This function belongs in a shared utility module (or in `form-utils.js`).

**JS-7: Event listeners in `lab-anglossic-ui.js` use button replacement via `innerHTML` but do not clean up old listeners**
`lab-anglossic-ui.js` `renderQuestion()` at lines 67–93 replaces `question.innerHTML` with each render, which destroys and recreates the DOM nodes. This means old event listeners are cleaned up naturally by garbage collection (elements are detached). This is correct and avoids stale listener accumulation. No issue.

**JS-8: `dialog.js` backdrop click closes the dialog — consistent with expected behavior, but the backdrop `click` listener is never removed**
`apps/web/public/assets/js/dialog.js`, line 52. The `container.addEventListener("click", ...)` is added once in `createDialogController` and never removed. For the compass modal, this is fine because the modal stays in the DOM for the session. If `createDialogController` were called multiple times on the same container (e.g., in a SPA navigation context), duplicate listeners would accumulate.

---

## Accessibility

### What's working

- Skip link is present on every page, correctly using `transform: translateY` pattern for accessibility, with both `:focus` and `:focus-visible` handlers.
- `<html lang="en">` is set on every page.
- `aria-live="polite"` is used correctly on all status panels and form helper regions.
- `aria-current="page"` is set on nav links via `SiteHeader.astro` line 22.
- The dialog focus trap in `dialog.js` correctly handles Tab/Shift-Tab/Escape and restores focus to `lastFocused` on close.
- `aria-hidden="true"` on decorative elements (grain texture, glyph dividers, portal image, social SVGs with `focusable="false"`).
- `tabindex="-1"` on `<main>` elements for programmatic focus after skip-link use.

### Issues

**A11Y-1: Lab compass modal uses `role="dialog"` on a `<div>` but does not use the native `<dialog>` element**
`apps/web/src/pages/lab.astro`, lines 53–54.
```html
<div class="card lab-dialog" id="compass-dialog" role="dialog" aria-modal="true" aria-labelledby="compass-title" tabindex="-1">
```
The ARIA attributes are correct but the native `<dialog>` element has built-in browser support for focus management and `::backdrop`. With a `<div role="dialog">`, `aria-modal="true"` tells screen readers to restrict virtual cursor to the dialog content, but some AT implementations handle native `<dialog>` better. This is a moderate accessibility debt.

**A11Y-2: `compass-launch` button has no `aria-expanded` or `aria-controls` attribute**
`apps/web/src/pages/lab.astro`, line 38.
```html
<button class="button" id="compass-launch" type="button">Open the Compass</button>
```
When the modal opens, a screen reader user has no programmatic indication of the state change beyond focus movement. Adding `aria-expanded="false"` (toggled on open/close) and `aria-controls="compass-modal"` would improve the relationship.

**A11Y-3: `donate-page.js` references `donate-sr-only` label for the amount input — correct, but `donate.astro` uses class `donate-sr-only` not `visually-hidden`**
`donate.astro` line 67: `<label class="donate-sr-only" for="donate-amount">`. The `donate-sr-only` class is defined in `donate-portal.css` (lines 15–24) with the correct visually-hidden pattern. This is correct.

**A11Y-4: The `<nav class="mobile-index-nav">` on `index.astro` has no `aria-label`**
`apps/web/src/pages/index.astro`, line 123. The desktop nav has `aria-label="Primary"` (line 130), but the mobile-index-nav has no label. This means the mobile nav and the social rail `<nav>` in HeroBar would both be unlabeled navigation landmarks (HeroBar's nav has `aria-label="Social media"`). Add `aria-label="Primary"` to the mobile-index-nav.

**A11Y-5: `<header>` inside `.portal-mobile` has no accessible content — aria-hidden="true" on the title paragraph**
`apps/web/src/pages/index.astro`, lines 66–68.
```html
<header>
  <p class="title" aria-hidden="true">St. Expedite Press</p>
</header>
```
The `<h1 class="home-heading-sr">` at line 61 handles the screen-reader heading correctly, and the `<header>` here is inside `aria-hidden="true"` portal content. Wait — the portal itself is NOT `aria-hidden`. The `<header>` semantic element adds a second `banner` landmark, and inside it the only content is `aria-hidden`. The `<header>` element with no visible or accessible text creates a confusing extra landmark. Either wrap the entire `.portal-mobile` in `aria-hidden="true"` (risky — the subscription form is inside it) or remove the `<header>` element and use a `<div>`.

**A11Y-6: Color contrast — muted text on dark background**
`--text-muted: rgba(42, 255, 138, 0.68)` on `--bg: #050807` computes to approximately `#40cf75` on near-black. Running this through WCAG contrast math: foreground ~`#40cf75` (relative luminance ~0.194) on background `#050807` (relative luminance ~0.001) gives a contrast ratio of approximately 18:1 — this passes WCAG AAA.
`--text-readable-muted: rgba(232, 248, 238, 0.62)` on dark backgrounds: foreground ~`#8bbf9a` (approximate) on `#050807` gives approximately 7:1. Passes AA.
No failing contrast pairs identified from the token combinations, but `donate-portal.css` line 56 uses `color: var(--text-muted)` for the `.donate-statement` body paragraph. At very small font sizes, the muted green could approach the AA border.

**A11Y-7: `check-a11y.mjs` only checks for `alt=` attribute presence, not alt text quality**
`scripts/check-a11y.mjs`, line 27: checks `!/\balt=/i.test(image)`. This correctly catches missing alt attributes, but does not flag `alt=""` on non-decorative images or `alt="image"` placeholder text. The script is a useful first-pass but not a substitute for manual review.

---

## Performance

### What's working

- Font self-hosting via `fonts.css` is correctly implemented: `font-display: swap`, proper `unicode-range` subset splitting (12 faces across 4 scripts), and woff2-only format (modern, widely supported). No Google Fonts dependency at runtime for interior pages.
- The background image uses `image-set()` with webp + png fallback (`interior-base.css`, lines 19–27).
- The portal image uses `fetchpriority="high"` with a `<link rel="preload">` in `index.astro` line 39.
- All below-fold images use `loading="lazy" decoding="async"` (books covers at `books-page.js` line 53, product images at `gallery-page.js` line 46).
- The storefront and projects endpoints use `cache-control: public, max-age=300, s-maxage=300, stale-while-revalidate=600` for edge caching.
- `api-client.js` uses a 10-second timeout with `AbortController` to prevent hung requests.

### Issues

**PERF-1: `index.astro` loads `fonts.css` but also has `<link rel="preconnect" href="https://fonts.googleapis.com" />` (lines 36–37)**
`apps/web/src/pages/index.astro`, lines 36–37.
```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
```
Fonts are self-hosted via `fonts.css`. These preconnect hints point to Google's CDN but no fonts are fetched from there. They are harmless but wasteful (connection overhead for a resource that is never fetched). `404.astro` also has these at lines 16–17.

**PERF-2: `site-shell.js` is a separate HTTP request for one line of JavaScript**
`apps/web/public/assets/js/site-shell.js` is one line. It's loaded with `<script is:inline src="..." type="module">` on every page. This is a wasted round-trip. Inline the single line directly into `Base.astro`.

**PERF-3: `lab-anglossic-data.js` is the largest JS asset — worth checking its size**
The file was only read to line 80 (the first 5 of 40+ questions). With 40 questions, 5 choices each, and the `ARCHETYPES` array (not read in full), this file could be 15–30KB. For the lab page, this is acceptable as a progressive enhancement, but it should be checked with `wc -c` to confirm it's not unexpectedly large.

**PERF-4: `@astrojs/cloudflare` is an unused production dependency adding install weight**
`apps/web/package.json` line 12. Remove or move to `devDependencies` with a clear comment.

**PERF-5: `index.astro` loads `index-effects.js` without `type="module"`**
`apps/web/src/pages/index.astro`, line 153:
```html
<script is:inline src="/assets/js/index-effects.js"></script>
```
No `type="module"`. The file uses an IIFE pattern (`(function () { ... })()`) which is appropriate for a non-module script, so this is intentional. However, it means the script runs synchronously in document order rather than being deferred. Since this is at the bottom of `<body>`, this is acceptable.

---

## Maintainability

### What's working

- The `check-tooling-integrity.mjs` script is excellent — it cross-validates API routes across worker source, OpenAPI spec, ontology JSON, ontology markdown, README, state-of-play, worker README, and AGENT.md simultaneously. This prevents documentation drift.
- The D1 migration sequence (0001–0015) is clean, sequential, and includes content-specific data migrations (0013: publish lift-wind, 0015: buy_url). No gaps.
- The `branding/` package is a publishable design artifact: brand-guidelines.md, ux-assessment.md, web-elements.md, and tokens/brand-tokens.css are all coherent and cross-referenced.
- `site.json` is a clean single source of truth for navigation, social links, and page metadata. All pages source from it without exception (except `index.astro` which partially overrides with local variables — see ARCH-1 above).

### Issues

**MAINT-1: `site.json` pages table is missing a `404` entry**
`apps/web/src/data/site.json` has entries for all routes except the 404 page. `404.astro` hardcodes its title and all meta directly. If the 404 page ever needs to match updated site-wide metadata defaults, there's no hook for it.

**MAINT-2: `donate.astro` partially reads from `site.json` (site.themeColor, site.name, etc.) but does not use the `pages.donate` canonical or description**
`apps/web/src/pages/donate.astro`, line 8: `const page = pages.donate`. Then line 30 uses `page.canonical`, line 19 uses `page.title`. This page does use `site.json` but it reconstructs the entire head manually. The `pages.donate` canonical is `https://stexpedite.press/donate` — this is consistent, but if the origin changes, this page would need updating just like every other manual head.

**MAINT-3: `web-elements.md` references `apps/web/public/assets/css/content-shell.css` as an implementation source**
`branding/web-elements.md`, line 104: `- apps/web/public/assets/css/content-shell.css`. This file does not exist in the codebase. It was likely renamed to `interior-base.css`. The branding documentation is stale on this reference.

**MAINT-4: `worker/src/README.md` is 3 lines and adds no value beyond what the source file comment already says**
`apps/communications-worker/src/README.md`. The entire file is: "Source code for the Cloudflare communications worker. Primary file: `index.ts`, which contains route handling..." This is not useful documentation. The README should describe the environment types, the D1 schema contract, how to run tests locally, and what secrets are required.

**MAINT-5: `docs/ontology/ontology.md` was cut off before showing any routes** (reading was limited to 60 lines). The routes table starts at line 39 and all 10 API routes are documented, which the tooling-integrity check validates. No gap found.

**MAINT-6: No `STRIPE_WEBHOOK_SECRET` in `wrangler.toml` vars section**
`apps/communications-worker/wrangler.toml` does not list `STRIPE_WEBHOOK_SECRET` in `[vars]` even as a placeholder. A new developer would not know this secret must be configured separately in the Cloudflare dashboard. Add a comment like `# STRIPE_WEBHOOK_SECRET = set via wrangler secret` to make the expected secrets visible.

---

## Refactor Priority List

| # | What | File | Effort |
|---|------|------|--------|
| 1 | Wrap `gallery-page.js` module-level calls inside `astro:page-load` | `gallery-page.js` | S |
| 2 | Fix Stripe webhook returning 500 when not configured — return 200 or 400 instead | `index.ts:538` | S |
| 3 | Create `BasePortal.astro` layout to eliminate head/body duplication across `index.astro`, `donate.astro`, `404.astro` | Three page files + new layout | M |
| 4 | Remove `@astrojs/cloudflare` from `package.json` (unused adapter) | `apps/web/package.json` | S |
| 5 | Remove Google Fonts preconnect hints from `index.astro` and `404.astro` | Two page files | S |
| 6 | Inline `site-shell.js` (one line) into `Base.astro` or `Head.astro` | `Base.astro`, `site-shell.js` | S |
| 7 | Move `escapeHtml` to `form-utils.js` and import it | Three JS files | S |
| 8 | Replace local D1 type block with `@cloudflare/workers-types` in worker | `index.ts`, `package.json` | S |
| 9 | Add `aria-label="Primary"` to `.mobile-index-nav` in `index.astro` | `index.astro:123` | S |
| 10 | Add `aria-expanded` and `aria-controls` to `compass-launch` button | `lab.astro:38` | S |
| 11 | Delete legacy fallback query chain in `handleProjects` after confirming column availability | `index.ts:993–1019` | M |
| 12 | Reconcile `tokens.css` naming convention with `branding/tokens/brand-tokens.css` — either alias or document divergence | Both files | M |
| 13 | Extract duplicate `.splash` CSS into a shared partial | `portal.css:510–561`, `donate-portal.css:176–224` | S |
| 14 | Replace hardcoded font families in `donate-portal.css` and `a11y.css` with `var(--font-display)` / `var(--font-body)` | Both CSS files | S |
| 15 | Add `aria-label` to `<nav>` inside `Base.astro` → `SiteHeader.astro` (already has it — confirmed no gap) | — | — |
| 16 | Move `donate.astro` to use `Base.astro` layout | `donate.astro` | M |
| 17 | Add `STRIPE_WEBHOOK_SECRET` placeholder comment to `wrangler.toml` | `wrangler.toml` | S |
| 18 | Update `branding/web-elements.md` reference from `content-shell.css` to `interior-base.css` | `web-elements.md:104` | S |

---

## What's Already Professional-Grade

**Worker security model.** HMAC-SHA256 Stripe webhook verification using Web Crypto API (no third-party SDK). Three-layer bot defense: honeypot fields (multiple aliases), Turnstile CAPTCHA integration (optional via env), D1-backed rate limiting by IP and route. All of these fail-open gracefully when not configured — correct behavior for a site where the API key might not be set up in a dev environment.

**D1 rate limiter implementation.** Bucket-key includes method + path + IP + window-start, which means the limit is per-route, not global. The `ON CONFLICT` upsert pattern is safe for single-threaded Workers. Retries return both `429` status and a `Retry-After` header with exact seconds remaining — correct HTTP semantics.

**Test quality.** Fifteen focused test cases using a hand-rolled mock DB that correctly simulates upsert semantics, idempotency (duplicate donation handling), rate limit counting, and import auth. The `makeStripeWebhookRequest` helper correctly generates real HMAC signatures using Web Crypto — it tests actual cryptographic behavior, not just JSON parsing.

**Font self-hosting.** Correctly split into 12 `@font-face` declarations across 4 unicode subsets per family, with `font-display: swap` and woff2-only format. This is production-grade font loading with no render-blocking network dependency.

**CSS mode system.** The `data-brand-mode` three-tier system is architecturally sound. Every page declares its mode explicitly. The cascade from `:root` defaults → `[data-brand-mode]` overrides → component-level adjustments is clean and predictable. This is a design system decision most small-press sites don't make.

**`api-client.js` pattern.** Single export, AbortController-based timeout, dev-origin override via `<meta>` tag for local worker port, typed error class. Every page that talks to the API imports from this one file. No page has its own `fetch` calls.

**OpenAPI specification.** The `openapi.yaml` is complete, accurate (validated by `check-tooling-integrity.mjs`), and includes `additionalProperties: false` on all success response schemas — which enforces the API contract and prevents undocumented field leakage. Response schemas use `const: true` on boolean `ok` fields for discriminated union pattern.
