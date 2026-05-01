# Web Element Guidelines

These recipes define how to create more branded web elements without drifting away from the current site identity.

## Element Modes

Every new element should declare one mode before design or implementation:

- `ritual`: theatrical, symbolic, atmospheric.
- `editorial`: readable, structured, literary.
- `utility`: direct, task-oriented, low-friction.

If an element mixes modes, the user's task wins. For example, a donation page can open with ritual atmosphere, but the amount selector and checkout action should use utility rules.

## Portal Hero

Use for:

- Homepage.
- Major campaign entry.
- Lab instrument entry.

Guidance:

- Anchor the composition around crow/portal imagery.
- Keep navigation targets large and memorable.
- Limit the number of primary choices.
- Use motion sparingly and make reduced-motion behavior explicit.

Do not:

- Reuse portal scale effects for ordinary article or form pages.
- Put critical legal, checkout, or form copy only inside decorative portal text.

Implementation source:

- `apps/web/src/pages/index.astro`
- `apps/web/public/assets/css/effects.css`
- `apps/web/public/assets/js/index-effects.js`

## Compact Header

Use for:

- Interior pages.
- High-intent pages like donate, contact, submit, store.

Guidance:

- Keep the brand mark visible.
- Keep the current page obvious.
- Separate primary site navigation from social links.
- Collapse gracefully on mobile.

Implementation source:

- `apps/web/src/components/SiteHeader.astro`
- `apps/web/src/components/HeroBar.astro`
- `apps/web/public/assets/css/layout.css`
- `apps/web/public/assets/css/hero-bar.css`

## CTA System

Use these roles:

- `primary`: one main action on the current surface.
- `secondary`: supporting action or alternate path.
- `quiet`: low-emphasis text or utility link.
- `external`: outbound social, store, checkout, or partner link.
- `danger`: destructive or failure recovery action.

Guidance:

- Primary CTAs can use signal green fill or strong glow.
- Secondary CTAs should be outlined or quieter.
- External CTAs should include clear destination language.
- Danger states should not use green or magenta.

Implementation source:

- `apps/web/public/assets/css/components.css`
- `apps/web/public/assets/css/forms.css`
- `apps/web/public/assets/js/form-utils.js`

## Editorial Panel

Use for:

- About sections.
- Services explanations.
- Publishing program descriptions.
- Mission statements.

Guidance:

- Use a quieter black panel.
- Use readable body text.
- Use a short kicker or label, then a strong heading.
- Avoid overusing borders on nested panels.

Implementation source:

- `apps/web/src/components/Base.astro`
- `apps/web/public/assets/css/content-shell.css`
- `apps/web/public/assets/css/mission.css`
- `apps/web/public/assets/css/services.css`

## Book Card Or Book Row

Use for:

- Catalog pages.
- Featured releases.
- Archive or reprint lists.

Guidance:

- Let the cover be the visual lead.
- Keep title, status, program, and availability easy to scan.
- Use status chips consistently.
- Avoid heavy glow over covers.

Implementation source:

- `apps/web/src/pages/books.astro`
- `apps/web/public/assets/css/books.css`
- `assets/source/img/covers/`

## Product Card

Use for:

- Store grid.
- Fourthwall-fed storefront data.
- Press objects.

Guidance:

- Keep image fields calm and clear.
- Separate product title, price, availability, and action.
- Use loading and empty states that feel intentional.
- Keep outbound purchase language direct.

Implementation source:

- `apps/web/src/pages/gallery.astro`
- `apps/web/public/assets/css/gallery.css`
- `apps/web/public/assets/js/gallery-page.js`

## Form Console

Use for:

- Contact.
- Submit.
- Updates signup.
- Donate setup.
- Unsubscribe.

Guidance:

- Use utility mode.
- Keep labels clear and persistent.
- Place trust or "what happens next" copy near the submit action.
- Standardize validation, loading, success, and API failure states.
- Preserve keyboard and screen-reader clarity over atmosphere.

Implementation source:

- `apps/web/public/assets/css/forms.css`
- `apps/web/public/assets/js/form-utils.js`
- `apps/web/public/assets/js/contact-page.js`
- `apps/web/public/assets/js/submit-page.js`
- `apps/web/public/assets/js/updates-signup.js`
- `apps/web/public/assets/js/donate-page.js`

## Status Panel

Use for:

- Worker/API status.
- Form success and failure.
- Donation confirmation.
- Import or update operations.

Guidance:

- Do not rely on color alone.
- Pair color with text, icon, or label.
- Success can use green, warning can use ember, error should use red.
- Keep state language short and concrete.

Implementation source:

- `apps/web/public/assets/css/components.css`
- `apps/web/public/assets/css/donate.css`
- `apps/web/public/assets/js/api-client.js`

## Glyph Divider

Use for:

- Separating major editorial sections.
- Ending a ritual block.
- Marking transitions between program areas.

Guidance:

- Keep glyphs sparse.
- Use dividers to create rhythm, not filler.
- Prefer one repeated symbol family over many unrelated decorations.

## Social Rail

Use for:

- Persistent social/external identity.

Guidance:

- Icon-only links need accessible labels.
- Keep social links visually subordinate to primary user tasks.
- Do not let social navigation compete with Donate, Submit, Store, or Contact.

Implementation source:

- `apps/web/src/components/HeroBar.astro`
- `apps/web/src/data/site.json`

## New Element Checklist

Before adding a new branded element:

1. Pick `ritual`, `editorial`, or `utility`.
2. Identify the nearest existing CSS/component source.
3. Use tokens from `tokens/brand-tokens.css` or `apps/web/public/assets/css/tokens.css`.
4. Define the primary user action.
5. Define mobile behavior before desktop polish.
6. Define focus, loading, empty, success, and error states where applicable.
7. Run the narrowest valid checks, then `npm run check` for broad visual-system changes.

