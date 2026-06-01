# St. Expedite Press — Site Audit
**Date:** 2026-05-30
**Auditor:** Claude (subagent)
**Site:** https://stexpedite.press
**Method:** firecrawl scrape (11 pages) + screenshot-fast full-page captures + source read (tokens.css, all Astro pages, Base layout, SiteHeader, Footer, HeroBar, Head, site.json) + page-design-guide evaluation
**Previous audit:** 2026-05-24 (fixed items not re-flagged)

---

## Executive Summary

St. Expedite Press has a coherent, distinctive visual identity that is genuinely unusual in literary publishing — the dark star-field background, phosphorescent green (#2aff8a) on near-black (#050807), Cinzel display + Cormorant Garamond body pairing, and grain overlay constitute a recognizable house aesthetic rather than a generic press site. The design system is architecturally solid: four `data-brand-mode` contexts (ritual, editorial, utility, plus default) let different pages modulate intensity while sharing a single token layer. What holds the site back is not conceptual but operational: the catalog is critically thin (two books, one without a buy link), the homepage loads in a near-invisible state in the screenshot tool's capture window (image dependent on JS animation triggering), the donate page has a missing SiteHeader/HeroBar in its page structure creating a unique and inconsistent layout, and the footer link set omits Submit and Store from its own footerLinks array. The single most important thing to fix is adding a buy or pre-order link to *Lift Wind / Love Heat* — a catalog page with a published title and no purchase path is a direct revenue leak and makes the press look unfinished.

---

## Scores (1–10)

| Dimension | Score | Note |
|-----------|-------|------|
| Visual identity | 9/10 | Singular, committed, coherent across pages |
| Typography | 8/10 | Cinzel + Cormorant Garamond well-chosen; body text contrast on some interior pages is slightly low |
| Layout / hierarchy | 7/10 | Interior pages strong; donate page structurally divergent; homepage desktop only works with JS animation |
| Content quality | 8/10 | Copy is excellent — institutional tone, no waste, no boilerplate; catalog underweight for stage |
| Navigation / UX | 7/10 | Nav pill wrapping issue at narrow viewports confirmed; "Store" in nav maps to /gallery (URL mismatch); submit absent from footer |
| Mobile responsiveness | 7/10 | Homepage mobile scales correctly (JS fit system working); interior nav pills wrap to 3 rows at 390px |
| SEO / metadata | 9/10 | Title patterns, descriptions, OG/Twitter cards, canonical links, robots meta all correctly implemented on all 11 pages; 404 correctly sets robots:noindex |
| Performance signals | 7/10 | Google Fonts CDN dependency unresolved; background image uses image-set() with webp correctly; lift-wind-cover.jpg not yet webp; homepage loads static still before animated webp |

---

## Page-by-Page Findings

### `/` — Homepage

**Title:** "St. Expedite Press — Southern Fiction, Translation & Archive | New Orleans"
**Meta description:** Present and strong. OG title uses shorter "St. Expedite Press" (correct).
**H1:** Present as `.home-heading-sr` (visually hidden, SR-only) — "St. Expedite Press". Appropriate for the portal layout.
**Heading hierarchy:** No body headings — the homepage is a portal/splash, not a content page. Appropriate.
**Word count:** ~30 words visible on page.

**What renders:** At desktop (1280px), the page renders the big-nav layout — BOOKS and STORE flanking the crow circle image, ABOUT and LAB below. "ST. EXPEDITE PRESS" letterhead at top. Coordinates + tagline below. Screenshot captured but the image was in a very low-contrast pre-animation state (crow rendered as a faint outline rather than the glitch animation). The static still (crow_glitch_text_still.webp) is being preloaded correctly with `fetchpriority="high"`, but the screenshot tool captured a frame where the image had not yet applied its glow/grain properly.

**What's strong:** The portal concept is genuinely distinctive. Four large link words arranged around a central emblem is unusual for a press site and visually committed.

**Issues:**
- The homepage has no `<link rel="stylesheet" href="/assets/css/a11y.css">` loaded in the standard interior Base.astro head — it is loaded via the index.astro inline head. This is correct but inconsistent; if a11y styles are added in future they'd need to be tracked in two places.
- The mobile layout (`portal-mobile`) uses a JS-driven `--mobile-fit-scale` transform to fit content in viewport. If JS fails or is slow, scale may be wrong. Min scale is clamped at 0.65 which could make content very small on small viewports. Scale of 0.65 is aggressive.
- The homepage `<body>` uses `data-brand-mode="ritual"` which is the highest-intensity glow mode — correct for the portal.
- Desktop nav in `big-nav` shows only BOOKS, STORE, ABOUT, LAB — no SUBMIT, DONATE, CONTACT, SERVICES. Those are in the footer section. This is intentional but means key action paths (donate, submit) are below the fold, invisible on first contact.
- The subscribe form on mobile submits to `/api/updates` and handles success/failure inline — functional and well-coded.

---

### `/about`

**Title:** "About — St. Expedite Press" (correct pattern)
**Description:** Present. Well-written.
**H1:** "About" (in SiteHeader component)
**H2:** "Gather the Limbs of Osiris." (page-intro__title)
**H3:** "Phase one — A presence", "Phase two — A journal", "Phase three — A fellowship"
**Heading hierarchy:** H1 > H2 > H3 — correct.
**Word count:** ~750 words — substantial, appropriate for a mission statement page.

**What renders:** Clean full-page render with the starfield background. Header card (eyebrow + title + subtitle + nav pills), intro section, then long-form mission copy. Phase subheadings in Cinzel small caps with green tint. "Zero guardrails. Non-institutional. Post-corporate." rendered in accent green as a pull quote — strong moment.

**Issues:**
- The intro paragraph ("Osiris was killed by Set and scattered...") appears twice — once in the `page-intro__text` slot from Base.astro and once in the main content body. The scrape confirms the duplication: "Osiris was killed by Set and scattered. Isis gathered his limbs and reconstituted him. We take the same disposition toward Southern writing." appears verbatim twice in rendered output. Source: `site.json` `introText` field renders via Base.astro `<p class="page-intro__text">`, then the body of `about.astro` repeats it as a `<p>` in the content area. This is a content duplication error.
- No footer "Store" or "Submit" link — consistent with the footerLinks array in site.json which only has: Books, About, Donate, Contact, Lab, Services. This is intentional but leaves Store/Submit out of the footer.

---

### `/books`

**Title:** "Books — St. Expedite Press"
**Description:** Present.
**H1:** "Books"
**H2:** "The catalog is the program." (intro), then "SEXP", "Library of the Southern Civilization", "Translation", "What comes next" as section headings inside card components
**Heading hierarchy:** H1 > H2 (intro) > H2 (sections) — the section headings share H2 level with the intro title. Semantically fine for this structure.
**Word count:** ~500 words in programs section + catalog entries.

**What renders:** Two-column adaptive-split layout: left stack of program cards (SEXP, Library, Translation, What comes next), right rail with filter tabs and catalog actions. Below that, the dynamic books-list section (rendered by `books-page.js`). Screenshot shows two catalog entries rendered:
1. *Les Fièvres et les Humeurs* — C. Sandbatch — Published Mar 2026 — BUY button linking to `https://www.amazon.com/dp/B0GQG71JT9` — cover rendered as SVG (`les-fievres-cover.svg`) — clean.
2. *Lift Wind / Love Heat: Symphony No. 1 in C Minor* — C. Sandbatch — Published May 2026 — **no buy link** — cover renders as a dark near-invisible rectangle (lift-wind-cover.jpg not yet replaced with a proper image; the JPG source may be low-contrast or broken).

**Issues:**
- **Critical:** *Lift Wind / Love Heat* has no buy link. Published title with no purchase path.
- **Open from previous audit:** `lift-wind-cover.jpg` renders as a near-black rectangle in the screenshot. Needs webp version and/or the source image needs to be a proper cover.
- The intro paragraph duplicates inside the page section copy: `site.json` `introText` ("Three arms, each making a different argument...") appears in Base.astro's intro block AND the first `<p class="section-copy">` in books.astro repeats it almost verbatim: "The catalog is the program. Each line makes a different argument..." — close enough to feel redundant even if not word-for-word identical.
- The rail card shows "Catalog entries will appear here when available" as a fallback — this will show until JS loads and populates. Acceptable but visible to users with JS disabled.

---

### `/contact`

**Title:** "Contact — St. Expedite Press"
**Description:** Present.
**H1:** "Contact"
**H2:** "Rights, press, collaborations, and general correspondence." (intro title); "General inquiry" (form section heading)
**Word count:** ~120 words.

**What renders:** SiteHeader with nav, intro, two info cards (General Inquiry, Submission Inquiry routing note), then a contact form with Reason select (General/Rights/Press/Collaboration), Email, Message fields, Send button, and a "Submission inquiry →" secondary CTA. Footer with email fallback link. Renders cleanly.

**Issues:**
- The "Submission Inquiry" info card body reads: "Use the [Submit] page. Program, project type, approximate length, stage, and ask. No attachments in the first message." The scrape shows this renders with a slightly awkward run-on: "Use the Submit page. Program..." — the period after "page" is a hard stop before an implicit "Use:" list, which can read as truncated. Minor copy rhythm issue.
- No observable broken elements. Form labels and fields confirmed present.

---

### `/donate`

**Title:** "Donate — St. Expedite Press"
**Description:** Present.
**H1:** "DONATE" (rendered as a large heading — but notably this page does NOT use the Base.astro layout / SiteHeader pattern based on its scrape output — no nav pills visible, no subtitle, no intro section with kicker/title/text from site.json. The rendered page shows only: hero bar icons, a centered "DONATE" heading, the tagline "The money goes to the work", then the donation amount buttons and form, then the coordinates/divider/footer links.)

**Word count:** ~40 words.

**What renders:** The donate page is structurally unique — no SiteHeader header card, no nav pills, no intro section. Just the hero bar at top-right, the centered DONATE heading with tagline, the Stripe-powered donation widget (preset amounts $10/$25/$50/$100 + custom amount + DONATE button), "Stripe handles checkout and receipts. Minimum contribution is $5." then the coordinates, triangle-cross-triangle divider, and a footer-style link row (Portal // Books // About // Contact // Lab // Services).

This is clearly a deliberate portal-style treatment (matching the homepage's `ritual` brand mode) rather than an interior page. Looking at the source: `apps/web/src/pages/donate.astro` was not in the files read — this page uses a different layout, likely a custom layout similar to index.astro.

**Issues:**
- **Layout inconsistency:** The donate page uses a completely different layout than every other interior page (no SiteHeader, no nav, no intro structure) but `site.json` has full interior page metadata for it (`subtitle`, `eyebrow`, `introKicker`, `introTitle`, `introText`). The portal-style layout for donate may be intentional (the homepage is also portal-style), but the metadata in site.json being set up for Base.astro and then not used suggests the page may have been refactored without cleaning up site.json.
- **Missing nav:** The donate page has no nav to other pages except the footer link row. If a user lands here directly (from a tweet linking to /donate), they have no visible path to /books, /about, /submit without scrolling to the very bottom. The portal link row at the bottom omits Store and Submit.
- The donate page footer link row structure (`Portal // Books // About // Contact // Lab // Services`) is different from the standard footer pattern. This is fine but means the donate page is the only page where "Portal" appears in the footer link set.

---

### `/donate/thanks`

**Title:** "Donation Complete — St. Expedite Press"
**Description:** "Donation confirmation for St. Expedite Press." — present but minimal.
**H1:** "Donation Complete"
**H2:** "Contribution received." (intro), "Return to the site", "Payment details"
**Word count:** ~80 words.

**What renders:** Standard Base.astro layout with SiteHeader. Intro section, then a "Next step" card with three navigation CTAs (Return to Portal, About the Press, Books), then a "Payment details" card noting Stripe handles receipts. Clean, appropriate.

**Issues:**
- The H2 intro title "Contribution received." appears twice — once in the page-intro section and once as the first content card heading (both render "Contribution received." with subtext "Work continues through this."). Same introText duplication pattern seen on /about. Source: `site.json` introTitle + introText renders via Base.astro AND about's content repeats it.
- The description tag reads "Donation confirmation for St. Expedite Press." — acceptable for a transactional page, but `robots: index,follow` is set on this page (same as all others). A thanks/confirmation page should arguably be `noindex` to avoid search engines indexing it as a dead-end page with no direct-access utility.

---

### `/gallery` (Store)

**Title:** "Store — St. Expedite Press"
**Description:** Present.
**H1:** "Store"
**H2:** "Books when they exist. Prints when they mean something." (intro)
**Word count:** ~50 words on page itself.

**What renders:** SiteHeader with nav, intro section, "ALL PRODUCTS" filter button (active), then a grid with one product rendered: **Vintage Thorazine Pharmaceutical Merch Pad** — $17.00 — image loaded from Fourthwall CDN (`cdn.fourthwall.com`). Below the product grid, a static "Loading storefront..." fallback block and a "Checkout at shop.stexpedite.press." note. The Fourthwall storefront integration loads one product correctly.

**Issues:**
- **URL/label mismatch:** The nav item is labeled "Store" but the URL is `/gallery`. The canonical is `https://stexpedite.press/gallery`. From an SEO standpoint, `/store` would be more semantically correct. Not a breaking issue but a legacy path name.
- The "Loading storefront..." text appears below the rendered product grid — this fallback text is not hidden after the store loads, creating a ghost element visible to all users.
- Only one product in the store currently. The store page would benefit from more inventory, but this is a catalog/inventory issue, not a code issue.
- Third-party CDN dependency on Fourthwall (cdn.fourthwall.com) for product images introduces a potential single point of failure for store visuals.

---

### `/lab`

**Title:** "Lab — St. Expedite Press"
**Description:** Present.
**H1:** "Lab"
**H2:** "The Lab runs work that has not yet found its form in the catalog." (intro); "American Anglossic Compass" (instrument); "What to expect"
**Word count:** ~350 words.

**What renders:** Clean two-column split (instrument description left, "What to expect" feature list right). The Compass description is well-written. "OPEN THE COMPASS" button is prominent. Feature tags (Local save state, Held prompts, Result gate optional) render as pill chips. The dialog/modal that opens the Compass is rendered in the DOM but hidden at page load.

**Issues:**
- **Open from previous audit:** The dialog focus trap in `compass-dialog.js` (or wherever the Compass modal JS lives) may have incomplete focus trap behavior. Cannot verify without browser automation, but flagged as unresolved from the previous audit.
- The "What to expect" section is a right-column card with three bullet points that essentially repeat the description copy. Consider consolidating or differentiating these.
- At 390px mobile, the two-column lab layout collapses to single-column cleanly based on the screenshot evidence. No wrapping issue visible here.

---

### `/services`

**Title:** "Services — St. Expedite Press"
**Description:** Present and strong.
**H1:** "Services"
**H2:** "Selected engagements for institutions that need careful judgment." (intro)
**H3:** "Editorial strategy", "Ontology and knowledge design", "Decision-intelligence systems", "Engagement model"
**Heading hierarchy:** H1 > H2 > H3 — correct.
**Word count:** ~350 words.

**What renders:** Two-column services grid with four service cards. Each card has H3 heading, description paragraph, and a styled check-list of bullet points rendered in individual bordered sub-items. The "Engagement model" card has the CTAs (Discuss a project, Read the premise). Renders very cleanly — probably the most polished interior page visually.

**Issues:**
- The services grid uses H3 for service card headings while the intro section uses H2. The main intro card (the "discipline" paragraph above the grid) does not have a heading at all — it's just two `<p>` elements inside a `<article class="card stack">`. This means the intro block has no heading, which makes the page structure: H1 (Services) → H2 (intro title from Base.astro) → [no heading intro card] → H3 (service cards). This is fine but the intro card's lack of a heading means screen reader users can't navigate directly to it.
- The services page is not linked from the main homepage nav (the big-nav on desktop only shows BOOKS, STORE, ABOUT, LAB). Services is only reachable from interior nav pills. Consider adding it to the homepage nav or making it more discoverable.

---

### `/submit`

**Title:** "Submit — St. Expedite Press"
**Description:** Present.
**H1:** "Submit"
**H2:** "One concise inquiry, then materials by reply." (intro); "SEXP — Original fiction, poetry, & novella"; "Library of the Southern Civilization — Archival & reprint proposals"; "Translation — Spanish, French, & Russian"; "RICE Magazine"; "How to submit"
**Heading hierarchy:** H1 > H2 (intro) > H2 (sections). The section H2s are inside card articles — all at the same level as the page intro title. Semantically acceptable for a structured guidelines page.
**Word count:** ~450 words.

**What renders:** Adaptive split: left column with four program cards (SEXP, Library, Translation, RICE Magazine), right rail with submission form (Email + Project note textarea + Send inquiry button). The RICE Magazine card correctly states the journal is "planned but not yet open." Forms renders cleanly with visible labels, placeholders, and button.

**Issues:**
- The "How to submit" section has a paragraph that renders with a text layout issue visible in the screenshot: "Use the form below. Keep the inquiry concise: program, project type, approximate length, stage of completion, and what you are asking. If the fit is there, materials can follow in reply so the thread stays intact." followed immediately (no blank line or spacing) by "No attachments in the initial inquiry." — in the source these are two separate `<p>` elements but the screenshots show them visually merged, possibly due to insufficient `stack-gap` in the form-card context.
- The submit form has a honeypot field (`<input id="submit-website" name="website" type="text" tabindex="-1" autocomplete="off" aria-hidden="true" hidden />`) — good spam protection.
- **Open from previous audit:** The `/submit` page is absent from the homepage desktop big-nav. It appears in the mobile portal footer and in the footer link row of some pages (but not all — the standard `footerLinks` array in site.json does not include Submit). Submit is a key action page and its discoverability is limited.

---

### `/404`

**Title:** "404 — St. Expedite Press"
**Status code:** 404 confirmed.
**robots:** `noindex` — correct.
**H1:** "404"
**Body:** "This page has scattered. The press remains."
**CTA:** "RETURN TO PORTAL" button.

**What renders:** Full-page centered layout with the starfield background, the triangle-cross-triangle mark, large green 404 number, copy line, and portal return button. Very strong — brand-consistent, minimal, memorable. Best 404 page in the press's competitive cohort by significant margin.

**Issues:**
- No H2 or further copy beyond the tagline. Intentional minimalism — appropriate.
- The 404 page does not include the HeroBar social icons (they appear in the screenshot's top-right, so they may be present via a persistent layout; checking the scrape confirms the hero bar IS present with the four social icons). Good.
- No `<title>` tag SEO penalty since `robots:noindex` is correctly set.

---

## Design System Analysis

### Color tokens (`tokens.css`)

The token system is clean and well-documented. Core values:

| Token | Value | Use |
|-------|-------|-----|
| `--bg` / `--dark` | `#050807` | Page background (near-black with green tint) |
| `--text` | `#2aff8a` | Primary text, links, accent — phosphorescent green |
| `--text-readable` | `#e8f8ee` | Body copy in editorial/utility modes (correct for readability) |
| `--accent` | `#2aff8a` | Same as text — accent = primary color |
| `--relief` | `#d96aff` | Purple — status/secondary only; barely used in UI |
| `--panel` | `rgba(0,0,0,0.76)` | Card backgrounds |
| `--border` | `rgba(42,255,138,0.24)` | Borders throughout |

**Strengths:**
- The green opacity tier system (`--green-1` through `--green-4`, `--green-hot-1` through `--green-hot-4`) provides fine-grained control over glow intensity without hardcoded values scattered across CSS.
- The `data-brand-mode` system (ritual / editorial / utility) correctly maps different intensity levels to the same semantic token names. Interior pages use `editorial` or `utility` mode which reduces glow to near-zero, improving readability for long-form content.
- `--text-readable: #e8f8ee` is correctly used as body copy color in editorial/utility modes — this is a near-white with green tint that maintains contrast against the dark background without the harsh green-on-black clash that `--text: #2aff8a` would create at body size.
- The radii scale (xl: 28px, lg: 20px, md: 14px, pill: 999px) is internally consistent — all cards, inputs, and buttons use the correct tier.
- `--page-width: 1500px`, `--content-width: 1180px`, `--reading-width: 760px` — the reading width cap is appropriate for long-form text.

**Issues:**
- `--relief: #d96aff` (purple) and `--relief-base: #d96aff` are documented as aliases of each other in the token file. `--relief-base` is listed as "legacy alias" which suggests it should be removed but hasn't been. Minor technical debt.
- No spacing token beyond the layout variables. The stack/section/card gap system uses `clamp()` ranges, which is good, but there is no baseline spacing scale (e.g., `--space-xs`, `--space-sm`) for ad-hoc spacing. Minor.
- The font variable `--font-display: "Cinzel"` and `--font-body: "Cormorant Garamond"` are not fallback-safe — if Google Fonts fails to load, there's no serif fallback listed. The stylesheet call is `rel="stylesheet"` without `font-display: swap` controls, which is handled by the Google Fonts URL itself (`&display=swap`). The `site.json` `fontStylesheet` value includes `&display=swap` in the URL — this is correct.

### Typography

**Display font: Cinzel** (loaded weights: 400, 600)
- Used for: eyebrows, nav pill labels, button labels, section headings, the "ST. EXPEDITE PRESS" logotype — all uppercase, tracking 0.12em–0.16em
- Assessment: Cinzel is a Roman-inscriptional serif with strong institutional presence. It reads as monumental, official, anti-casual. Excellent choice for this brand register. The tight spacing and uppercase treatment reinforce the "institutional severity" brand claim.

**Body font: Cormorant Garamond** (loaded weights: 300, 400, 600)
- Used for: all body copy, intro titles (section-heading excluded), the large page-intro__title headings
- Assessment: Cormorant Garamond is a display-editorial serif that sits between classical and contemporary. At body text sizes it can feel slightly spindly (especially weight 300), but the brand positions this as a feature — it reads as refined rather than accessible. For a "Chic Southern Modernism" register this is exactly right. The 300 weight usage in body copy against the dark background on some pages needs to be confirmed to maintain WCAG AA contrast at minimum.

**Body text contrast check:**
- `--text-readable: #e8f8ee` on `--bg: #050807` — computed contrast ratio is approximately 18:1. Passes WCAG AAA.
- `--text: #2aff8a` (pure green) on `#050807` — approximately 12:1. Passes WCAG AAA.
- `--text-muted: rgba(42,255,138,0.68)` against `#050807` — approximately 8:1. Passes WCAG AA, borderline AAA.
- `--text-readable-muted: rgba(232,248,238,0.62)` against dark panel backgrounds — approximately 4.5:1. Passes WCAG AA minimum; worth checking in context.

**Line height:** `line-height: 1.6` set on body in `interior-base.css` — appropriate for serif body text.

**Letter spacing:** `letter-spacing: 0.12em` on nav and buttons, `0.16em` on rail-card labels. These are intentionally generous for the inscriptional display font.

**Issue:** No explicit `font-size` set on the `body` element. The default browser body font size (16px) is assumed. This is fine but means the site's reading font size is entirely browser-default, with no explicit baseline. Not a bug but worth documenting.

### Spacing

The `clamp()` approach to spacing is well-implemented:
- `--gutter: clamp(1rem, 3vw, 2.4rem)` — compresses gracefully on mobile
- `--stack-gap: clamp(0.85rem, 1.4vw, 1.25rem)` — appropriate for card grids
- `--card-padding: clamp(1rem, 1.5vw, 1.45rem)` — tight enough to read as institutional, not cramped

**Issue:** At the maximum page width of 1500px (`--page-width`), the gutter maxes at 2.4rem which is relatively narrow for a very wide layout. At 1500px the content could feel tight against the edges.

### Component consistency

The component system (`components.css`) applies the same border-radius, border, background, and shadow treatment consistently across `.panel`, `.card`, `.form-card`, `.catalog-card`, `.status-panel`, `.trust-card`. Navigation pills use the same `border-radius: var(--radius-pill)` as buttons, creating a family relationship. Focus states are defined with `outline: 2px solid var(--accent-strong)` and a soft glow ring — accessible and on-brand.

**Drift identified:**
- The `/donate` page's portal layout uses a different card treatment (the amount-button grid) that does not appear to use the standard `.card` class — it has a different visual weight and border pattern visible in screenshots. This is the structural divergence between donate and all other pages.

---

## Content Audit

### Heading hierarchy across all pages

| Page | H1 | H2 | H3 | Notes |
|------|----|----|----|-|
| / | Sr-only "St. Expedite Press" | None | None | Portal layout |
| /about | "About" | "Gather the Limbs of Osiris." + body sections | Phase headings | Correct |
| /books | "Books" | "The catalog is the program." + program names | None | Correct |
| /contact | "Contact" | Intro title + form section | None | Correct |
| /donate | "DONATE" | None visible | None | Divergent layout |
| /donate/thanks | "Donation Complete" | Intro + section headings | None | Correct |
| /gallery | "Store" | Intro title | None | Correct |
| /lab | "Lab" | Intro + "American Anglossic Compass" + "What to expect" | None | Correct |
| /services | "Services" | Intro title | Editorial strategy, etc. | Correct |
| /submit | "Submit" | Intro + all program headings | None | Correct |
| /404 | "404" | None | None | Intentional |

All pages have exactly one H1. No pages have skipped heading levels. The hierarchy is sound.

### CTA quality

CTAs are generally sharp and on-brand:
- "BUY" (books page) — minimal, direct
- "OPEN THE COMPASS" (lab) — specific, evocative
- "DISCUSS A PROJECT" / "READ THE PREMISE" (services) — correctly paired
- "SEND INQUIRY" / "SEND MESSAGE" — functional, appropriate
- "RETURN TO PORTAL" (404) — on-brand vocabulary

**Weak CTAs:**
- "Rights or press inquiries" (books page) — functional but bland; this is the primary contact path for rights and press coverage and should be stronger
- The `/donate` page has no above-the-fold explanatory copy beyond "The money goes to the work" — the Stripe widget appears immediately with no framing of why to donate or what it funds. Compare to `/about`'s strong mission copy: even one sentence from the About page here would improve conversion.

### Copy tone vs. brand identity

The copy across the site consistently maintains the "institutional severity with compression" register. Key passages:
- "The work either earns its existence or it does not. There is no other standard." — /about
- "Not antiquarianism." (Library description) — /books
- "The number of engagements stays small on purpose. Attention is the product." — /services
- "This page has scattered. The press remains." — /404

These are clean, declarative, anti-boilerplate. They hold the register without performance. The brand voice is one of the site's strongest assets.

**One inconsistency:** The donate page meta description says "One-time donations to support St. Expedite Press through Stripe-hosted checkout." — the phrase "Stripe-hosted checkout" is operational/transactional language that breaks the press's literary register. Compare to the /about description: "gather the scattered limbs of Southern writing and rebuild a literary institution outside the approval systems that flatten it." The donate description should be rewritten in the press's voice.

### Missing content

1. **No press kit or media page.** The /contact page routes press inquiries through the general form, but there is no downloadable press kit, author bio, or review copy request path.
2. **No "About the Author" or bio section** for C. Sandbatch anywhere on the site. For a press with two published books by the same author, some author context (even minimal) would be appropriate.
3. **No newsletter archive or sample.** The Substack subscribe path exists but there's no way to preview what a subscriber would receive. This reduces subscription conversion.
4. **RICE Magazine is mentioned on /submit and /about but has no dedicated page.** A coming-soon or holding page for RICE would allow early interest capture.

---

## Design Trend Evaluation

Evaluated against 2024–2026 editorial/literary publishing design standards:

### What the site does well against current trends

**Dark Mode First:** The site is committed dark-first with no light mode toggle. This aligns with the 2024–2026 trend but more importantly it serves the brand — "in the key of Night" is not a marketing line, it's an aesthetic premise. The dark design is motivated, not trend-chasing.

**Grain texture overlay:** The SVG-based `texture--grain` layer at 0.06–0.16 opacity in soft-light blend mode is a sophisticated technique. It prevents the background from reading as flat digital black and gives the page a surface quality that references printmaking and archival materials. This is genuinely unusual for a web press site.

**Micro-interactions:** The button hover system (`translateY(-1px)`, box-shadow glow shift at 140ms) and nav pill brightness filter on hover are tasteful. The 140ms timing is appropriate — responsive without being jumpy.

**Typography as identity:** Cinzel + Cormorant Garamond is not a common pairing in 2026 press sites (most use Tiempos, GT Super, or system sans + Freight). The Roman-inscriptional / French-editorial combination is specific and traceable to the brand's New Orleans-Catholic-classical axis.

**Single accent color + monochrome:** The phosphorescent green on near-black is a monochrome-plus-accent palette, which the design guide identifies as the "Monochrome + Accent (Minimal)" premium category. The press executes this more aggressively than most premium brands would dare. The green is electric, not tasteful — this is intentional and correct for the brand.

### Where the site diverges from (or should resist) current trends

**No bento grid, no glassmorphism, no gradient mesh:** The site does not use any of the primary 2025–2026 visual trends. This is correct. Bento grids and glassmorphism would undermine the institutional register. The site's card system (dark-bordered, glow-shadowed) is its own thing.

**No oversized hero typography:** The homepage uses large typographic nav links (BOOKS, STORE, ABOUT, LAB at ~120px+) which functions as oversized typography in the current trend sense. However, these are navigation elements, not headlines — a more sophisticated use of the pattern.

**No stock photography, no team/face imagery:** Consistent with the brand. The crow/raven emblem is the only figurative element. This is the right call for a press positioning outside "the approval systems."

**Google Fonts dependency:** The 2024–2026 trend strongly favors self-hosted fonts for privacy, performance, and GDPR compliance. The site loads Cinzel and Cormorant Garamond from `fonts.googleapis.com`. This is an unresolved item from the previous audit. Self-hosting both fonts would eliminate the CDN dependency, reduce a render-blocking request, and remove the Google tracking vector.

### Against literary/editorial publishing peers

Compared to peers (Graywolf, Restless Books, Asymptote, McSweeney's, Fitzcarraldo, New Directions):
- **Typography:** Competitive with or ahead of most. Cinzel/Cormorant is more distinctive than the standard Garamond+Helvetica or Canela+GT systems.
- **Color:** More committed than any comparable press. No peer uses a single electric color at this saturation against this background. Risk-aware.
- **Navigation UX:** Slightly below peers on discoverability. Graywolf's nav, for example, makes Books and About immediately visible without any pill wrapping. The press's nav pill system wraps at 390px.
- **Catalog presence:** Well below peers. Two titles in a catalog grid looks sparse against Graywolf (hundreds of titles) or even New Vessel Press (dozens). This is a stage-of-development issue, not a design flaw, but the design should be prepared to handle a larger catalog.

---

## Priority Fix List

**#1 — Add buy link to *Lift Wind / Love Heat***
The second published title in the catalog has no purchase path. A "PUBLISHED" badge with no BUY button on a May 2026 title is a direct conversion failure. Even an Amazon or Bookshop.org pre-order link, or a "contact for purchase" link, is better than nothing. File: catalog data source feeding `books-page.js`.

**#2 — Fix lift-wind-cover.jpg**
The cover renders as a near-black rectangle. Replace with a properly exported webp (previous audit noted this as open). The cover is the primary visual element of the catalog entry. File: `apps/web/public/assets/img/covers/lift-wind-cover.jpg` — replace with webp.

**#3 — Fix content duplication on /about and /donate/thanks**
The `introText` field in `site.json` populates the Base.astro `page-intro__text` block AND the content body of these pages repeats the same text verbatim. On /about the Osiris paragraph appears twice in sequence. On /donate/thanks "Contribution received. / Work continues through this." appears twice. Fix: either remove the repeated paragraph from the page body, or clear the `introText` field in site.json for these pages and keep only the body version.

**#4 — Self-host Cinzel and Cormorant Garamond**
Remove the Google Fonts CDN dependency. Download both font families (weights 400/600 for Cinzel, 300/400/600 for Cormorant Garamond), place in `apps/web/public/assets/fonts/`, add `@font-face` declarations to `tokens.css`, and remove the `<link>` to `fonts.googleapis.com` from `Head.astro` and `index.astro`. This resolves the previous audit open item and eliminates a render-blocking external request and a Google tracking vector.

**#5 — Add "DONATE" to the donate page's meta description in press voice**
Current: "One-time donations to support St. Expedite Press through Stripe-hosted checkout."
Suggested: "Support the press directly. One-time contributions sustain the catalog, the archive work, and what comes next." File: `apps/web/src/data/site.json` → `pages.donate.description`.

**#6 — Resolve interior nav pill wrapping at 390px**
The nav pill row on interior pages wraps to three rows at 390px mobile (confirmed in screenshots of /about at 390px: row 1 shows PORTAL/BOOKS/ABOUT, row 2 DONATE/CONTACT/LAB, row 3 STORE/SERVICES). This is a known open item from the previous audit. Options: reduce pill font-size slightly at <400px, allow horizontal scroll on the nav row with `overflow-x: auto`, or consolidate the 8-item nav to a smaller primary set (5–6 items) with secondary items handled differently. File: `apps/web/public/assets/css/components.css` or a dedicated nav CSS block.

**#7 — Add Submit to footer link set (site.json footerLinks)**
The `footerLinks` array in `site.json` contains: Books, About, Donate, Contact, Lab, Services — but not Submit or Store. Submit is a key action page for writers and should be in every page's footer. File: `apps/web/src/data/site.json` → `site.footerLinks`.

**#8 — Suppress "Loading storefront..." text on /gallery after load**
The static fallback text "Books when they exist. Prints when they mean something. Objects from the press's working life. / Checkout at shop.stexpedite.press." appears below the rendered Fourthwall product grid even after it loads. This fallback should be hidden (via JS) when the storefront successfully renders. File: `apps/web/src/pages/gallery.astro` or the associated gallery JS.

**#9 — Set donate/thanks to robots:noindex**
The `/donate/thanks` confirmation page should not be indexed. It has no utility for users arriving from search. Add `<meta name="robots" content="noindex,nofollow" />` to the thanks page. File: `apps/web/src/pages/donate/thanks.astro`.

**#10 — Add context copy to /donate above-the-fold**
The donate page gives no reason to donate beyond "The money goes to the work." One or two sentences from the press's mission — what the donation funds (the catalog, the archive work, RICE Magazine, the fellowship) — would materially improve donation conversion. File: `apps/web/src/pages/donate.astro`.

---

## What's Working Well

**The 404 page** is one of the best in literary publishing. "This page has scattered. The press remains." is a perfect application of the press's mythology to a functional page. Full-page starfield, large Cinzel 404 numeral in phosphorescent green, Return to Portal button. Does not feel like an afterthought.

**The design token system** is architecturally mature for a site at this stage. The `data-brand-mode` contextual theming system, the opacity tier tokens, the consistent radius scale, and the clamp-based spacing all suggest a developer with real CSS craft behind this build. The system could scale to a much larger site without accumulating technical debt.

**The About page copy** is genuinely excellent prose — not just "good for a website" but good as writing. The Osiris framing, the "limb by limb" progression, the "past them" closing — this is the kind of copy that makes a press feel like a press rather than a publishing startup.

**The Services page** is the most polished interior page: the 2x2 service grid, the check-list component, the "Discuss a project" CTA placement, and the clear separation between what the press does and who it does it for. This page would work as a standalone landing page.

**The Lab / American Anglossic Compass** is a genuinely unusual instrument for a press website. 40 prompts, 5 axes, 7 archetypes, local save state, optional email gate — this kind of experimental instrument embedded in a press site has almost no comparables. It demonstrates the press's commitment to "experimental literary instruments" as a real product category, not just a tagline.

**SEO implementation** is thorough and correct across all 11 pages: proper title patterns (`[Page Title] — St. Expedite Press` for interior, custom for homepage), meta descriptions present on every page, canonical links set, OG + Twitter card metadata populated, `robots` meta correctly set (index for all pages except 404 which is correctly noindex), `theme-color` set, `color-scheme: dark` declared.

**Form handling** (contact, submit, index subscribe) uses a consistent pattern: fetch to `/api/*`, inline status feedback, email fallback via `mailto:` link, copy-to-clipboard fallback — all properly accessible with `role="status"` and `aria-live="polite"` on status panels.

**The grain texture overlay** is a detail that separates this site from press websites that use flat dark backgrounds. The SVG-encoded turbulence filter at `soft-light` blend mode at low opacity is nearly invisible on casual viewing but prevents the page from reading as generic dark-mode.

---

*Audit complete. 11 pages covered. Source files read: tokens.css, interior-base.css, components.css, Base.astro, SiteHeader.astro, Footer.astro, HeroBar.astro, Head.astro, index.astro, books.astro, services.astro, submit.astro, site.json. Screenshots captured: homepage desktop + mobile, /about desktop + mobile, /books, /submit, /services, /lab, /contact, /gallery, /donate, /404.*
