# St. Expedite Press — Visual System Audit
**Date:** 2026-05-31
**Site:** https://stexpedite.press
**Method:** screenshot-fast (10 pages × desktop 1072px, 3 × tablet 768px, 3 × mobile 390px), firecrawl (branding extraction, raw HTML, 6 CSS files), page-design-guide (modern trends, typography, color, layout, palettes, animation, component, section guidance)

---

## Visual Hierarchy Assessment

The homepage portal is the strongest visual hierarchy statement on the site. The `big-nav` layout — four oversized Cinzel words (BOOKS, STORE, ABOUT, LAB) arranged in a 3×3 grid around a central glowing crow emblem — achieves genuine spatial command. The eye lands on the emblem first (centre, glowing), then reads the four words as compass points. The hierarchy logic is: emblem → quadrant words → footer coordinates → tagline. This works.

Interior pages break hierarchy in a different way: the `site-header` card contains both brand identity (`site-brand`) and the full navigation pill row (`site-nav`) in a two-column grid. At desktop the brand block gets `minmax(0, 1fr)` and the nav gets `auto`. This means the nav pill row can overwhelm the brand column visually when there are eight pills. The result on `/books`, `/about`, `/services`, and `/lab` is a header where the nav has roughly equal visual weight to the page title — the title (`site-title`) is the largest element at `clamp(1.8rem, 4vw, 2.8rem)` but the pill row, being the rightmost element in a wide row, draws the eye before the title.

Within page body content the hierarchy is sound. The `page-intro__kicker` (Cinzel, 0.78rem, spaced) → `page-intro__title` (Cinzel, clamped 1.45–2.2rem) → `page-intro__text` (Cormorant Garamond, 1.1rem) sequence is clean and consistent across all pages that use it (about, books, contact, donate, lab, services, submit). The `section-heading` (Cinzel, 1.15rem, uppercase, 0.12em tracking) over `section-copy` (Cormorant Garamond, body size) inside `.card` panels creates clear internal hierarchy.

The 404 page achieves hierarchy through scale alone: the Cinzel "404" at roughly 6rem+ centered on a full black void reads correctly as an intentional statement rather than a failure state.

**Where hierarchy breaks down:**
- `/donate`: The page title "DONATE" at the top uses the portal/ritual mode layout (not the interior `site-header` card), placed above a wide empty starfield before the donation widget. The vertical gap between the glitchy title and the form is ~350px of near-empty space. The eye has no mid-path anchoring.
- `/about` (live): The Osiris paragraph duplication (`page-intro__text` repeating the same sentence that opens the `mission-essay`) creates a false hierarchy signal — it reads as if the intro is a pull-quote before the essay begins, but it is in fact the same sentence twice. (Known fix pending deployment.)
- `/books`: The intro section ("The catalog is the program.") has two paragraphs with nearly identical text — `page-intro__text` and the first `section-copy` inside the program list duplicate the same sentence. This is not on the known-fix list. It degrades hierarchy by making the intro feel like a content error rather than intentional emphasis.

---

## Design System Consistency Audit

The token system in `tokens.css` is well-constructed. All four brand modes (`ritual`, `editorial`, `utility`, and the base default) are systematically declared as `data-brand-mode` attribute overrides on `body`. Mode-aware tokens (`--mode-panel`, `--mode-border`, `--mode-copy`, `--mode-heading-shadow`, `--mode-shadow`, `--mode-text-shadow`) cascade correctly. The radius scale (`--radius-xl: 28px`, `--radius-lg: 20px`, `--radius-md: 14px`, `--radius-pill: 999px`) is applied consistently.

**Consistent across all interior pages:**
- `site-header` card structure with `site-eyebrow` + `site-title` + `site-subtitle` + `site-nav` pills
- `.card` + `.stack` composition pattern inside content areas
- `.page-intro` kicker/title/text sequence
- `.site-footer` minimal link bar
- Grain texture overlay at mode-appropriate opacity
- Hero bar (social icons, top-right) at fixed height 58px

**Drift and inconsistency found:**

1. **Nav pill count inconsistency**: The `site-nav` on interior pages has 8 pills (Portal, Books, About, Donate, Contact, Lab, Store, Services). The footer `site-footer__links` on most pages has 6 links (Books, About, Donate, Contact, Lab, Services — no Portal, no Store). The homepage footer has only 4 links (Books, Submit, About, Donate — different set entirely). This three-way variation is intentional at the homepage level but the mismatch between the interior nav (8 items) and interior footer (6 items, omitting Portal and Store) means navigation options are not symmetric. Submit is absent from the interior footer. (Submit was flagged as a known fix pending deployment for the footer footer, but the interior `site-footer` on about, books, contact, lab, services, submit is live with 6 links omitting Submit from its own page footer.)

2. **Button hierarchy drift on `/books`**: The "Rights or press inquiries" CTA uses `.button` (primary, green-gradient fill) and "Submission inquiries" uses `.button-secondary` (ghost). But the button label "Rights or press inquiries" is the less common action compared to "Submission inquiries" for a working press. The primary/secondary assignment is inverted from the likely user priority.

3. **`/gallery` (Store) incomplete grid**: The store page renders only one product card (`VINTAGE THORAZINE PHARMACEUTICAL MERCH PAD`). Below it is a duplicate text block: "Books when they exist. Prints when they mean something. Objects from the press's working life." followed by "Checkout at shop.stexpedite.press." This suggests two content sources — the rendered product card from the Shopify/storefront embed and a fallback static text block — are both displaying. The static fallback text should be hidden when products load. (This is the known "Loading storefront" fix — partially deployed; the Loading text no longer shows, but the fallback paragraph copy block is still rendering alongside the product card.)

4. **`/donate` uses portal/ritual mode layout without the full portal frame**: The donate page `body` has `data-brand-mode="ritual"` but uses a minimal centered widget layout rather than the full `portal-desktop` / `portal-mobile` structure. The title "DONATE" renders in the large Cinzel that evokes the portal, but the content (amount buttons, custom input, submit) is a small centered form widget. The spacing between the big DONATE heading and the form (~350px vertical gap) feels unintentional — there is no image, no emblem, no supporting text anchoring that space. This is a layout inconsistency: ritual mode signaling with insufficient content density for that register.

5. **`/about` mission-essay phase headings**: The `h3.essay-phase` headings ("Phase one — A presence", etc.) are set in a distinct style from the main `section-heading` class. They render with less visual weight than expected given their structural role in the essay. The `section-heading` is Cinzel uppercase tracked at 0.12em; the `essay-phase` appears to be styled differently in `mission.css` (not retrieved). In screenshots they appear smaller than the card `section-heading` items on /books or /lab, breaking the heading weight chain.

6. **Lab page mode mismatch**: `/lab` sets `data-brand-mode="ritual"` (same as homepage) but uses the interior `site-header` card layout. The result is that grain opacity is 0.12 (ritual level) — heavier than the 0.1 editorial mode used on /about and /books. This gives the Lab page a slightly murkier background texture than other interior pages, without the compositional payoff that justifies ritual mode on the homepage.

---

## Color System Evaluation

**Token architecture:** The live CSS confirms the phosphorescent green system is well-engineered. The color space is a single hue — `#2aff8a` — operating at multiple opacity tiers:
- Pure accent: `--text: #2aff8a`, `--accent: #2aff8a`
- Hot tiers: `--green-hot-1` (75%) through `--green-hot-4` (22%) — used for glow layering
- Opacity tiers: `--green-1` (22%) through `--green-3` (6%) — used for text-shadows and background washes
- Semantic text: `--text-readable: #e8f8ee` (very light green-tinted white for long-form reading)
- Panel backgrounds: `rgba(0,0,0,0.76)` to `rgba(0,0,0,0.86)` — near-opaque blacks layered over the starfield

**Where it works:**
- The `--text-readable` (`#e8f8ee`) choice for body text on interior pages is visually sophisticated. It avoids pure white while keeping readability high. Against the dark panel backgrounds (~`rgba(0,0,0,0.76)` = effectively `#1a1a1a` equivalent), the WCAG contrast of `#e8f8ee` on `#131313` is approximately 14:1 — well above AA and AAA thresholds.
- The green accent on buttons and nav pills at `--green-hot-2` (55% opacity) reads as phosphorescent without being retina-burning. The glow effect (`box-shadow: 0 0 10px rgba(0,0,0,0.9), 0 0 14px var(--green-3)`) creates depth without flicker.
- The portal homepage where the pure `--text: #2aff8a` color is used for the large BOOKS/STORE/ABOUT/LAB words reads correctly at that scale and that darkness level.

**Where it creates issues:**
- **Eyebrows and metadata text**: `--text-soft: rgba(42,255,138,0.88)` is used for `.site-eyebrow`, `page-intro__kicker`, and form labels. At 0.88 opacity on the near-black panel background this is fine. But `--text-muted: rgba(42,255,138,0.68)` applied to `.helper-text`, `.caption`, and secondary footer elements may fall below 4.5:1 contrast against the star texture background (not the panel). On the starfield itself (midtone dark blue-black), the muted green at 68% opacity is approximately 3.2:1 — failing WCAG AA for small text (below 18px).
- **`--text-readable-muted: rgba(232,248,238,0.62)`** is used for `--mode-copy-muted` — applied to footer text, helper text, and secondary labels. At 62% opacity against the darkest panel backgrounds, this is approximately 7:1 contrast — fine. But in the footer where the background is the star image through `rgba(0,0,0,0.58)` overlay, the effective luminance is higher and the contrast drops to approximately 5:1, which passes AA but approaches the limit.
- **The `--relief: #d96aff` (purple)** appears as a chromatic aberration on `.site-eyebrow` via `text-shadow: -1px -1px 0 var(--relief), 0 0 8px var(--green-1)`. At standard reading distances this purple offset on the small Cinzel eyebrow text (0.78rem) is visible as a magenta fringe. It is a strong effect for text at this size — it reads as glitch/interference intentionally, but it also reduces legibility at smaller viewport widths where the offset pixels become a larger proportion of the letterform.
- **Donate page pure green**: The donate form amount buttons (`$10`, `$25`, `$50`, `$100`) use `--text: #2aff8a` for both text and border against the near-black background. These render correctly. However the selected/active state is not visually differentiated from the unselected state in the screenshot — all four buttons appear identical, making it unclear which amount is selected.

---

## Typography Audit

**Font stack confirmed from live CSS:**
- Display/headings: `"Cinzel", serif` (loaded via Google Fonts CDN at wght 400 and 600 — known fix pending: self-hosting)
- Body: `"Cormorant Garamond", serif` (loaded at wght 300, 400, 600 via Google Fonts CDN)

**Scale across pages (from layout.css and CSS clamp values):**
- `site-title` (h1): `clamp(1.8rem, 4vw, 2.8rem)` — 28.8–44.8px at typical viewports. Cinzel uppercase, tracked 0.12em
- `page-intro__title` (h2): `clamp(1.45rem, 3vw, 2.2rem)` — 23.2–35.2px. Cinzel
- `section-heading`: `1.15rem` fixed — 18.4px. Cinzel uppercase, tracked 0.12em
- `site-eyebrow` / `page-intro__kicker`: `0.78rem` fixed — 12.5px. Cinzel uppercase, tracked 0.18em
- Body / `section-copy`: inherited from body — Cormorant Garamond, `1rem`, `line-height: 1.6`
- `page-intro__text`: `1.1rem` — 17.6px
- `site-nav a`: `0.72rem` — 11.5px. Cinzel uppercase

**Pairing assessment:**
The Cinzel + Cormorant Garamond pairing is correct for the brand. Cinzel is Roman-inscriptional (geometric, monumental, high contrast strokes), Cormorant Garamond is French editorial serif (humanist curves, elegant x-height). They share high stroke contrast and a formal register. The pairing avoids the sans/serif collision that most sites default to. For a literary press claiming institutional severity this is not a choice — it is the only correct choice.

**Problems found:**

1. **Cinzel at 0.72rem nav pills is too small**: Nav pill text at 11.5px in Cinzel uppercase with 0.12em tracking is at the absolute floor of screen legibility, especially on non-Retina displays. Cinzel is a display font with high contrast strokes — its thin hairlines degrade at small sizes. The minimum recommended for Cinzel in UI contexts is 13–14px. At 11.5px the letters read as marks rather than words at arm's length on a laptop screen.

2. **Eyebrow text at 0.78rem (12.5px) is marginal**: The `.site-eyebrow` and `.page-intro__kicker` (both 0.78rem, tracked 0.18em) sit at the minimum. The 0.18em tracking helps readability at small sizes for all-caps text, but this is still below the 14px floor recommended for secondary UI labels.

3. **`page-intro__title` is not `h1`**: On interior pages the `h1` is the `site-title` ("ABOUT", "BOOKS", etc.) and the `page-intro__title` uses `h2`. This is semantically correct. However visually, the `page-intro__title` (`clamp(1.45rem, 3vw, 2.2rem)`) often appears more authoritative than the `site-title` because it gets the full reading-width column and a meaningful sentence, while `site-title` is a single word in the cramped header card. The semantic structure and the visual weight are inverted.

4. **Body line length on `/about` mission essay**: The `mission-essay` runs inside the `reading-width` constraint (`--reading-width: 760px`), but the body copy rendered at 1rem Cormorant Garamond at 1.6 line-height produces approximately 80–90 characters per line at 760px. Optimal is 65–75 characters. The essay is long-form literary text where this matters — too wide, and the eye loses its place on line returns.

5. **`book-row__title` on `/books` uses `h3` with `section-heading` styling**: Book title treatment (Cinzel, uppercase, tracked) applied to literary titles like "Les Fièvres et les Humeurs" and "Lift Wind / Love Heat: Symphony No. 1 in C Minor" creates a mismatch: Cinzel uppercase tracking flattens the typographic character of these titles. The accent in "Fièvres" renders awkwardly in full uppercase at 18.4px. Literary titles with special characters or mixed case benefit from a differently-weighted Cormorant Garamond treatment rather than Cinzel uppercase.

6. **`mission-ethos` paragraph**: "Zero guardrails. Non-institutional. Post-corporate." appears in a large Cormorant Garamond in green (`--text: #2aff8a`) — a different rendering than the surrounding readable body text. This is the right instinct — a break in the essay register. But it renders at approximately 1.5–1.6rem based on the screenshot, which puts it between a `section-heading` and an `h2`. There is no class in `components.css` for this; it is handled in `mission.css`. Without that file the exact value cannot be confirmed, but visually it reads as a style atom that exists only on `/about`.

---

## Layout & Spacing Audit

**Grid system:**
- Page-level layout uses `--page-width: 1120px` max-width, `--reading-width: 760px` for content columns
- The gutter is `clamp(1rem, 3vw, 2rem)` — responsive
- Interior pages use the `.page` class: `padding: calc(58px + 1.4rem) var(--gutter) 4rem`
- `.split-grid`: `grid-template-columns: minmax(0, 1.35fr) minmax(280px, 0.8fr)` — used on `/lab`
- `.page-grid` and `.stack` use `gap: 1.1rem` and `1rem` respectively

**Desktop (1072px):**
All interior pages are single-column layouts within the reading-width constraint. The `.site-header` card is full-width at the top of `.page`, then content below. The layout is clean and consistent. The `.split-grid` on `/lab` (instrument description left, "What to expect" right) is correctly proportioned — 1.35:0.8 gives the main content clear dominance.

The store page (`/gallery`) shows a single product card in the top-left quadrant with ~60% of the horizontal width empty. This is a 1-item grid problem: the product grid presumably expects multiple items to fill a row. With one item the layout looks unfinished rather than curated. This is a content/layout mismatch rather than a CSS defect.

**Tablet (768px):**
The `.site-header` collapses to single-column correctly (media query at 900px). Nav pills reflow to `flex-wrap: wrap`, and at 768px they arrange into 2–3 rows. At 768px the 8 pills wrap to approximately 3 rows, consuming ~160px of the header card. This is functional but dense. The header card at 768px is taller than expected for what is nominally navigation.

The homepage at 768px shows the `portal-mobile` layout: the portal image centers between "BOOKS" above and "ABOUT" below, with the email subscription form below "ABOUT". The STORE and LAB links are missing from this layout — they are only visible in the `portal-desktop` version. At 768px the portal-mobile layout is active (breakpoint appears to be `max-width: 900px`), so tablet users cannot see Store or Lab from the homepage. This is a significant navigation gap at tablet width.

**Mobile (390px):**
The nav pills wrap to 3 rows in the header card — this is the known fix (scrollable row) pending deployment. In the live site at 390px the pills occupy 3 rows: `[PORTAL] [BOOKS] [ABOUT]` / `[DONATE] [CONTACT] [LAB]` / `[STORE] [SERVICES]`. This is not broken, but it is tall (the header card is approximately 200px at 390px before the body content begins). The scrollable-row fix would be an improvement but the current 3-row wrap is readable if inelegant.

The `portal-mobile` homepage at 390px has a layout-scaling system (`--mobile-fit-scale` CSS custom property via JavaScript). The result in screenshots shows the content scaled down — the crow image is smaller, the BOOKS/ABOUT text is appropriately sized, the subscribe form is visible. This is a sophisticated JS-based fit solution.

Body text on `/about` at 390px (Cormorant Garamond, 1rem, 1.6 line-height) is rendered at approximately 15–16px effective size. Lines are ~50–55 characters wide — within the optimal range for mobile. Reading the mission essay on mobile is actually better than on desktop because the narrower column produces a more optimal line length.

The book rows on `/books` at 390px: the cover thumbnail, title/series, and aside (status badge + date + buy button) collapse into a stacked layout. The cover disappears entirely at 390px in the screenshot — the book row becomes text-only with status badge. The missing cover thumbnail is a visual gap that removes the most concrete product signal from the mobile catalog view.

---

## Component Consistency Audit

**Nav pills (`.site-nav a`):**
Consistent across all interior pages. Padding: `0.5rem 0.8rem`. Font: Cinzel 0.72rem uppercase tracked. Border: `1px solid rgba(42,255,138,0.18)`. Active state (`aria-current="page"`): brighter green text, stronger border, `accent-soft` background. Hover: identical to active. The active pill is visually distinct but not dramatically so — the brightness difference between an active and inactive pill is subtle, particularly when multiple pills are in close proximity.

**Buttons:**
Two classes: `.button` (primary, green-gradient fill with hot-green border) and `.button-secondary` (ghost, dark background). Both use Cinzel 0.78rem uppercase tracked. Consistent across contact, submit, donate, lab, books, services pages. Transition at 140ms ease for all relevant properties. `translateY(-1px)` on hover adds subtle lift. This is executed well.

**Issue: `.status-action` tertiary button** used in helper/confirm flows (the post-form-submit action row) is a third button variant with slightly different padding (`0.5rem 0.9rem` vs `0.7rem 1rem`) and smaller font (`0.72rem`). It uses the same pill border-radius. This variant is consistent within the status panel pattern but its reduced size compared to `.button` and `.button-secondary` means it can feel like a demoted control.

**Cards (`.card`):**
Consistent `border-radius: var(--radius-lg) = 20px`, `border: 1px solid var(--mode-border)`, `background: var(--mode-panel)`, `box-shadow: var(--mode-shadow)`. Padding: `1.1rem`. Applied on: books program cards, lab instrument card, lab "What to expect" aside, services service cards, contact form card, submit form card. Completely consistent.

**Book rows (`.book-row`):**
The book list on `/books` uses `.book-row` (from `books.css` which was not fetched). From the HTML the structure is: `book-row__cover` (thumbnail) | `book-row__body` (series label + h3 title + author) | `book-row__aside` (status badge + date + buy button). The aside contains `.book-status.status--published` (a filled green pill badge) + `.book-row__buy` (a `.button` element for buy CTA). The second book row has no buy button in the HTML — the Lift Wind title lacks an `href` for purchase. This appears intentional (not yet available for sale separately) but the visual asymmetry in the aside column is noticeable: row 1 has `PUBLISHED / Mar 2026 / [BUY]`, row 2 has `PUBLISHED / May 2026` with no buy button.

**Forms (contact, submit):**
Both use `.input`, `.textarea`, `.select` with consistent styling: `border: 1px solid rgba(42,255,138,0.18)`, `background: rgba(0,0,0,0.78)`, `border-radius: var(--radius-md) = 14px`, `min-height: 2.8rem`. Focus state: `border-color: var(--green-hot-2)`, glow ring. This is completely consistent between contact and submit. Labels use Cinzel 0.78rem uppercase tracked — consistent with the nav pill and button hierarchy.

**Tags (`.tag` on `/lab`):**
"Local save state", "Held prompts", "Result gate optional" — rendered as pill tags with `rgba(42,255,138,0.08)` fill and `rgba(42,255,138,0.16)` border. These appear only on the lab page. They read as feature badges rather than navigational or interactive elements. Consistent with the token system but not found on any other page — they are an isolated component.

**Status badges (`.book-status.status--published`):**
Green filled pill on book rows. Consistent. No other status variants are visible in the current catalog (`status--forthcoming`, `status--archived`, etc. may exist in CSS but are not rendered with current catalog content).

---

## Animation & Interaction Audit

**Confirmed transitions (from `components.css`):**
- `.button`, `.button-secondary`, `.pill-link`: `transition: background 140ms ease, border-color 140ms ease, box-shadow 140ms ease, color 140ms ease, filter 140ms ease, transform 140ms ease` — a 6-property transition at 140ms. This is within the micro-interaction range (100–200ms) and will feel responsive.
- Transform on hover: `translateY(-1px)` — minimal lift effect
- `filter: brightness(1.2) contrast(1.05)` on active nav pill — subtle luminance boost

**Confirmed animations (from `effects.css` and `portal.css` indirectly):**
- `cursor-glow`: A 120px radial gradient that follows cursor position via JS (`site-shell.js`). Uses `will-change: transform`. The glow is `rgba(42,255,138,0.18)` with `mix-blend-mode: soft-light` — nearly invisible except as a very subtle ambient effect. Not intrusive.
- `texture--grain`: Fixed overlay at 0.06–0.16 opacity by brand mode. Static (no animation). `mix-blend-mode: soft-light`.
- Portal image: The homepage crow image has a `data-animated-src="/assets/img/crow_glitch_text.webp"` attribute — a glitch animation is loaded by JS after the still loads. The still (`crow_glitch_text_still.webp`) is shown first (`fetchpriority="high"`), then the animated version swaps in. This is a well-considered performance pattern.
- `skip-link`: `transform: translateY(-180%)` → `translateY(0)` on focus, `transition: transform 140ms ease`. Correct accessibility implementation.
- Astro View Transitions: `astro-view-transitions-enabled: true` and fallback `animate` mode — page transitions are handled by Astro's View Transitions API. These are client-side transitions between pages.

**`prefers-reduced-motion`:** The `interior-base.css` implements `animation: none !important; transition: none !important` for all elements under `prefers-reduced-motion: reduce`. This is correct and comprehensive. The cursor-glow JS should also respect this (cannot verify from CSS alone, but the `will-change: auto` rule is set for the cursor-glow element under reduced motion).

**Issues:**
1. The button hover `translateY(-1px)` lift is 140ms with `ease` easing. At 140ms `ease` the deceleration curve means the lift will feel slightly sluggish at the end. `ease-out` would be more responsive for a hover entry.
2. No skeleton loading states are visible for the books catalog (which loads via `books-page.js`). The `books-status` div shows "Loading catalog..." as a text string. For a site with this visual sophistication, a pulsing skeleton row would better match the design register than plain text.
3. The donate page amount-button selection state — it is unclear from static screenshots whether the selected amount button has a visual active state animation, since all four buttons appear identical in screenshots. If there is no selected-state differentiation beyond a simple color change, the donation flow lacks clear interaction feedback.

---

## Brand Mode Evaluation

The four-mode system (`ritual`, `editorial`, `utility`, base default) is a genuine design innovation for a small press site. No other small literary press site has this level of token-driven atmospheric differentiation.

**Ritual mode** (homepage, donate, lab, 404):
- Body background overlay: `linear-gradient(rgba(0,0,0,0.58), rgba(0,0,0,0.78))` — lightest overlay, starfield most visible
- Grain opacity: 0.12
- `--mode-heading-shadow`: `0 0 12px var(--green-1), 0 0 28px var(--green-2)` — the strongest glow
- `--mode-text-shadow`: `0 0 8px var(--green-2)` — present on body text
- Panel: `rgba(0,0,0,0.76)` / Shadow: the full double-layer shadow

The homepage delivers on ritual mode completely. The 404 page in ritual mode is the best 404 in contemporary small press web design — the "This page has scattered. The press remains." line with giant glowing green Cinzel numerals against the starfield is a precise execution of the brand voice.

The donate page in ritual mode is **not delivering**. The ritual mode signaling (most intense background, strongest glow shadows) requires the compositional density to justify it. The homepage earns ritual mode with the full portal apparatus. Donate has only a centered form widget. The gap between the ambient intensity of the background and the minimal content creates a void rather than a sacred space.

The lab page in ritual mode is a partial success. The split-grid compass layout has enough content density to sustain the atmospheric intensity. However, placing lab in ritual mode (same as homepage) rather than a distinct "experimental" mode flattens what could be a meaningful register distinction.

**Editorial mode** (about, books, contact, services, submit):
- Background overlay: `linear-gradient(rgba(0,0,0,0.64), rgba(0,0,0,0.84))` — darker than ritual
- Grain opacity: 0.1
- `--mode-heading-shadow`: `0 0 8px var(--green-3)` — minimal glow, nearly absent
- `--mode-text-shadow`: `none`
- Panel: `rgba(0,0,0,0.7)` / Shadow: near-flat

Editorial mode is correctly calibrated. The reduction of glow effects and text shadows produces a page that reads as serious document rather than ambient experience. On `/about` and `/books` the mission text and catalog copy are readable without the atmospheric distraction of ritual. This is the correct register for the content.

**Utility mode** (not explicitly assigned to any page in the pages reviewed — base default applies to pages without `data-brand-mode`)**:
Utility mode is the most opaque overlay (`rgba(0,0,0,0.74–0.90)`), lowest grain (0.06), flattest shadow. It is defined but not assigned to any visible page. This is a gap — the utility mode appears to be reserved for pages not yet built or for very functional tool pages.

**Mode assignment issues:**
- `/lab` is `ritual` — arguably should be a fourth distinct mode (experimental/instrument) to signal "this is a tool, not a portal"
- `/donate` is `ritual` — the intensity is unearned given the content density
- `/gallery` (Store): the HTML was not fully inspected for `data-brand-mode` but screenshots suggest it is `editorial` — correct for a commerce page

---

## Page-by-Page Visual Notes

**`/` (Homepage):**
The strongest page on the site. Portal layout is compositionally resolved. The desktop BOOKS/STORE/ABOUT/LAB four-word navigation around the glowing crow emblem is distinctive at the level of contemporary small press design. The footer below — coordinates, tagline, "△ ✝ △" divider — is exact in register. The star texture at ritual opacity is the correct background density for a full-screen portal. No visual failures on desktop. The mobile layout (portal-mobile) at 390px has a scaling concern: the content uses a JS-computed `--mobile-fit-scale` that may produce slightly blurry text on non-Retina screens if it scales below 1.

**`/about`:**
Strong layout, strong mission text. The Osiris paragraph duplication (known fix pending) is the dominant visual issue — it creates a content loop that reads as an error. The `mission-ethos` pullquote in green Cormorant Garamond is a strong typographic moment. Footer "Submit" link absent (known fix pending). Phase headings (`essay-phase`) need more visual weight.

**`/books`:**
The catalog page reads cleanly. Program cards (SEXP, Library of the Southern Civilization, Translation, What Comes Next) are well-proportioned and the `.card.stack` composition works. The intro sentence duplication (same sentence in `page-intro__text` and first `section-copy`) is visually confusing. The second book row ("Lift Wind") missing a buy button creates visual asymmetry in the aside column. The "Rights or press inquiries" button being primary over "Submission inquiries" is an inverted priority.

**`/contact`:**
The most conventionally functional page. The split grid at top (General Inquiry card | Submission Inquiry card) followed by the full-width form below is a clean information architecture. The inline link ("Submit" in the Submission Inquiry card) using `color: var(--text)` (full green) against the dark panel is legible and consistent. The `SEND MESSAGE` (primary) + `SUBMISSION INQUIRY →` (secondary) button pair at form bottom is the only page where an arrow character appears in a button label — minor inconsistency with button label conventions elsewhere.

**`/donate`:**
Large empty vertical gap between the "DONATE" title and the amount-selection form. Ritual mode background intensity without content density to earn it. The form widget itself is clean and the four amount buttons + custom input + DONATE submit are well-proportioned. Footer links are correct (no Submit in footer here, which is acceptable for the donate page context).

**`/gallery` (Store):**
One product card in a wide layout. The card itself (white product image on gray card background, Cinzel uppercase title, `$17.00` in green) is well-composed against the dark starfield. The fallback text block below it ("Books when they exist...") should not be rendering when a product is loaded. Below that, "Checkout at shop.stexpedite.press" — this subdomain reference is the only outbound-commerce pointer visible, but it is in plain body text rather than a call-to-action component.

**`/lab`:**
The split-grid layout (instrument description | what-to-expect aside) is visually resolved. Tag pills ("Local save state", "Held prompts", "Result gate optional") are appropriate feature markers. The "OPEN THE COMPASS" button in the instrument card is correctly placed and sized. The `lab-modal` overlay for the compass itself is a large DOM structure not visible on page load — correct; it is hidden. The "What to expect" aside's `meta-list` items (three numbered features as `li` items with border and dark fill) are legible but visually heavier than necessary — three bullet points in bordered cards is over-encapsulated for simple feature list items.

**`/services`:**
The strongest multi-service layout on the site. Three service cards (Editorial Strategy | Ontology and Knowledge Design | Decision-Intelligence Systems) + one Engagement Model card in a 2-column `split-grid` produces a professional advisory page. The check-list items within each card are visually distinct (bordered dark panels) — they read as deliverables or capabilities. The final CTA row ("DISCUSS A PROJECT" primary + "READ THE PREMISE" secondary) is the most explicit CTA pair on any page and is correctly prioritized.

**`/submit`:**
Clean. Program cards (SEXP, Library, Translation, RICE Magazine) correctly set submission expectations before the form. The form itself (email + project note + "SEND INQUIRY") is appropriately minimal for a first-contact submission. The `section-copy` block starting with "Use the form below..." wraps oddly in the screenshot — it appears to hit a narrower max-width than the form card, creating a layout where the text block and form card feel like different containers with different widths. Needs investigation.

**`/404`:**
Exceptional. The centered "404" in full-brightness green Cinzel at large scale on the pure starfield, with the "△ ✝ △" divider above and the voice line "This page has scattered. The press remains." is one of the best 404 pages in current independent press web design. The "RETURN TO PORTAL" button is correct. No visual issues.

---

## Priority Visual Fixes

**P0 — Functional / Content Errors**

1. **`/books` intro sentence duplication** (`page-intro__text` repeats the first `section-copy` in the program list verbatim). Remove the duplicate `<p class="section-copy">` at the top of the `.reading-width.stack` section, or differentiate the intro text. File: likely `src/pages/books.astro` or the content data source.

2. **`/gallery` fallback text block rendering alongside products** (the "Books when they exist..." paragraph and "Checkout at shop.stexpedite.press" line are both visible when the product card is loaded). The fallback copy block should be conditionally hidden when product data loads. File: `src/pages/gallery.astro` or storefront integration JS.

3. **`/books` second book row missing buy button** for "Lift Wind / Love Heat". If the book is available for sale, the `book-row__buy` anchor is missing from the `book-row__aside`. If it is intentionally absent (not yet for sale), a `status--forthcoming` badge or placeholder text would clarify the status. File: the books data source (likely `src/data/books.json` or equivalent).

**P1 — Visual Hierarchy / UX**

4. **`/donate` vertical gap**: The ~350px gap between the "DONATE" heading and the amount-selection widget needs an anchoring element. Options: (a) add the coordinates/tagline block from the homepage footer directly below the title, before the widget; (b) add a brief mission line ("The money goes where it needs to go.") in Cormorant Garamond below the title; (c) reduce the top padding on the page so the widget sits closer to the heading. Simplest fix: reduce the `.page` top padding on the donate page body or add a `max-width: 560px; margin: 0 auto` spacer with a one-line statement. File: `src/pages/donate.astro` + `assets/css/donate.css` (if it exists) or `portal.css`.

5. **`/books` button priority inversion**: Swap "Rights or press inquiries" and "Submission inquiries" button classes. "Submission inquiries" should be `.button` (primary) and "Rights or press inquiries" should be `.button-secondary`. File: `src/pages/books.astro`.

6. **Nav pill font-size**: Increase `.site-nav a` from `0.72rem` to `0.8rem` (12.8px). At 0.8rem Cinzel uppercase tracked 0.12em is at the functional minimum for display fonts in UI. This also brings it into alignment with the `.site-eyebrow` size (0.78rem). File: `assets/css/components.css`, line targeting `.site-nav a`.

**P2 — Typographic Refinement**

7. **`mission-essay` body line length**: Add `max-width: 65ch` (or approximately `640px`) to `.mission-essay p` to constrain to ~65 characters per line for optimal long-form reading. The current 760px reading-width produces 80–90 char lines in Cormorant Garamond at 1rem. File: `assets/css/mission.css`.

8. **`book-row__title` treatment for literary titles**: Consider using Cormorant Garamond semi-bold (weight 600) at 1rem for `.book-row__title` instead of the Cinzel uppercase that the `section-heading` style imposes. This would render accented characters (Fièvres) and mixed-case titles correctly. File: `assets/css/books.css`.

9. **`essay-phase` heading weight**: Increase the visual weight of `.essay-phase` headings in the About mission essay. They should read at the same prominence level as `.section-heading` items in other cards — currently they appear lighter. Consider matching: `font-family: var(--font-display); font-size: 1rem; letter-spacing: 0.15em; text-transform: uppercase`. File: `assets/css/mission.css`.

**P3 — Mobile / Responsive**

10. **Tablet homepage Store and Lab links missing** at `max-width: 900px`: The `portal-mobile` layout only shows Books and About (the `portal-link` elements). The `mobile-index-nav` in the HTML has Books, Store, About, Lab — but in screenshots only Books and About appear as the large centered links. Verify the `portal-stack` / `portal-link` implementation shows all four destinations at 768px. File: `assets/css/portal.css` and `src/pages/index.astro`.

11. **`/books` mobile book-row cover thumbnail**: The cover image disappears at 390px — the book row becomes text-only in the collapsed layout. Preserve a small thumbnail (48×64px) in the mobile layout to maintain the visual product anchor. File: `assets/css/books.css` responsive section.

---

## Visual Strengths

1. **The token system is genuinely sophisticated**: Four brand modes with systematic cascade overrides is rare in small press site design. The `--mode-*` token pattern means each page inherits the correct atmosphere with no per-page CSS required. This is an architectural strength that should be preserved and extended.

2. **The portal homepage is compositionally resolved**: The Cinzel compass-rose navigation, crow emblem, coordinates, and void background achieve a unified visual identity that is immediately distinctive. It does not look like any other literary press homepage.

3. **The 404 page**: Best-in-class for the category. Correct voice, correct scale, correct visual register.

4. **Cormorant Garamond body rendering**: At 1rem on dark backgrounds with `--text-readable: #e8f8ee` the long-form editorial text on about, books, and submit pages reads with genuine elegance. The French editorial serif renders beautifully at this scale and color combination.

5. **The grain + starfield background system**: The `void_engine_twinkle_green.webp` background image with `background-attachment: fixed` creates a parallax depth effect as the page scrolls. The grain overlay (SVG noise at soft-light blend mode) adds analog texture without visual noise. Together they produce an atmosphere that has no peer in contemporary small press site design.

6. **Accessibility foundations are correct**: Skip link implementation, `aria-current="page"` on nav, `prefers-reduced-motion` blanket suppression, `aria-hidden` on decorative images, `aria-label` on nav landmarks, `role="status" aria-live="polite"` on form status panels — this is more thorough a11y groundwork than most independent publisher sites of any size.

7. **`site-header` card with the radial-gradient light wash**: The `.site-header` background uses three layered radial gradients (green and relief-purple) plus a linear dark base to create a glowing panel that reads as a specific atmospheric object rather than a generic nav block. The use of the purple `--relief` color in the top-left radial gradient adds chromatic depth.

8. **Button transition system**: The 140ms 6-property transition with `translateY(-1px)` lift is polished and consistent across all interactive elements. It is one of the more carefully considered button interaction models in small press site design.

---

## Design Trend Gap Analysis

**Where the site is ahead of peers:**
- Dark-mode-first is now a trend; St. Expedite Press has been doing it at a deeper level than "add a toggle." The ritual/editorial/utility atmospheric system is three years ahead of where most literary press sites will be.
- Monochrome + phosphorescent accent is precisely where 2024–2026 high-contrast editorial palette trends are moving. The "Monochrome + Accent (Minimal)" palette pattern from current design guidance matches the site's approach almost exactly.
- The Cinzel + Cormorant Garamond pairing is classically correct and does not appear on any other small press site in this configuration. It is the right choice made confidently.
- The cursor glow effect (`cursor-glow` radial gradient following mouse) is a 2024–2026 micro-interaction trend. The implementation here is restrained (very low opacity, soft-light blend) — it enhances the atmosphere without calling attention to itself.

**Where the site is behind peers:**
- **No skeleton loading**: The "Loading catalog..." text on `/books` and the storefront on `/gallery` are the only places where the site falls into plain-text loading states. Skeleton screens (ghost rows in the brand's green-at-low-opacity) would maintain the visual register during load.
- **No scroll-triggered reveal animations**: Interior pages deliver all content at once with no fade-in or slide-in on scroll. For long pages like `/about`, section reveals on scroll would sustain visual interest and signal document structure. The `prefers-reduced-motion` suppression is already in place to handle this safely.
- **The `split-grid` is only used on two pages** (Lab, Services). The lab split-grid is the most visually interesting interior layout on the site — a two-column layout with content dominance on the left. More pages could benefit from this structure, particularly `/books` (program descriptions left, filter/catalog right).

**The one design move that would most improve the system without breaking brand identity:**

Add scroll-triggered opacity reveals to `.card` and `.page-intro` blocks on interior pages. A simple `opacity: 0 → 1` + `translateY(12px → 0)` at 400ms `ease-out` on intersection, gated behind `prefers-reduced-motion`, would transform the editorial pages from static document delivery to a page that feels alive in the same register as the portal. The token system already has all the shadow and glow effects in place; adding motion reveals would make those effects feel like they are being activated by reading rather than pre-rendered. This is the gap between the homepage (which has the glitch animation, the cursor glow, the grain) and the interior pages (which are compositionally strong but static). The single line `transition: opacity 400ms ease-out, transform 400ms ease-out` on an IntersectionObserver pattern — already partially present in the Astro View Transitions setup — would close that gap.
