# UX And Aesthetic Assessment

Date: 2026-05-01

Scope reviewed:

- Root app and asset documentation.
- `apps/web/src/pages/` and shared Astro components.
- CSS tokens, base, layout, component, page-specific, and effect styles.
- Site navigation and metadata in `apps/web/src/data/site.json`.
- Published and source asset inventory.

This assessment is based on source review, not a new browser screenshot pass. Treat it as an aesthetic and UX roadmap for future implementation.

## Current Visual System

The site is built around a dark ritual-editorial identity:

- Black void background with green signal texture.
- Electric green as the dominant text, border, and action color.
- Magenta as a relief color for contrast and supernatural heat.
- Cinzel display type and Cormorant Garamond body type.
- Crow, portal, glitch, and glyph-adjacent imagery.
- Rounded black panels with green borders, glows, and pill controls.

The identity is coherent and memorable. It differentiates the press from institutional publisher sites and generic ecommerce pages.

## High-Impact Opportunities

### 1. Control Visual Intensity

Current issue: almost every surface uses the same high-intensity green-on-black treatment. This makes the brand strong, but it reduces hierarchy and can tire users during reading, purchasing, donating, or form entry.

Change:

- Define three intensity modes:
  - `ritual`: homepage portal, major launch moments, lab instruments, campaign landings.
  - `editorial`: books, about, services, long-form pages.
  - `utility`: contact, submit, donate checkout setup, unsubscribe, errors, confirmations.
- Keep full glow, large letterspacing, portal animation, and dense texture in `ritual` mode.
- Use quieter panels, warmer readable copy, fewer shadows, and stronger labels in `editorial` and `utility` modes.

Expected UX gain: better orientation, less visual fatigue, higher completion rate on donation/contact/submit flows.

### 2. Add Readable Text Tiers

Current issue: the green body copy is distinctive, but long passages and dense form text rely too heavily on the same neon tier.

Change:

- Keep `#2aff8a` as the signal/accent color.
- Add a warmer near-ivory body tier for sustained reading, such as `#e8f8ee`.
- Use muted green for metadata, not primary paragraphs.
- Reduce text-shadow on long body copy.

Expected UX gain: improved reading speed and accessibility without weakening the brand.

### 3. Clarify Navigation Hierarchy

Current issue: the homepage has a strong portal navigation language, while interior pages use a more conventional header. Social icons sit in the fixed top rail. The result is atmospheric but not always obvious for task-oriented users.

Change:

- Preserve the homepage portal as the ceremonial entry.
- Add a compact, consistent primary navigation treatment for interior and high-intent pages.
- Make user-intent paths visually distinct:
  - Read: Books, About, Lab.
  - Act: Donate, Submit, Contact.
  - Buy: Store.
- Consider one persistent primary action per page instead of equal-weight pill clusters.

Expected UX gain: faster path selection and lower bounce from users looking for submission, donation, or purchasing actions.

### 4. Rebalance Product And Book Presentation

Current issue: the atmosphere sometimes competes with the actual objects: books, covers, products, and press artifacts.

Change:

- Give covers and product images larger quiet fields.
- Reduce glow inside product grids and book rows.
- Make price, availability, publication status, and purchase actions easier to scan.
- Use the ritual frame around featured releases, not every item.

Expected UX gain: stronger commerce and catalog comprehension while keeping the press aura.

### 5. Normalize CTAs And State Styles

Current issue: many actions use similar pill treatments. This makes primary, secondary, external, disabled, loading, and destructive states harder to distinguish.

Change:

- Define CTA hierarchy:
  - Primary: one per major surface.
  - Secondary: supporting navigation.
  - Quiet: low-intent links.
  - External: outbound commerce/social.
  - Danger/error: form and API failure only.
- Reserve full green fill/glow for primary action.
- Use outlined or text treatments for secondary actions.

Expected UX gain: clearer decisions and less cognitive load.

### 6. Make Forms Feel Safer

Current issue: contact, submit, updates, donate, and unsubscribe flows share the site's intensity. For forms, users need reassurance, privacy cues, and visible system state.

Change:

- Use utility mode for forms.
- Add clear "what happens next" panels near submit buttons.
- Show privacy and delivery expectations plainly.
- Standardize loading, success, validation, and API error states.

Expected UX gain: higher form completion and fewer uncertain submissions.

### 7. Preserve Mobile Drama, Reduce Mobile Friction

Current issue: the portal homepage is visually ambitious and mobile-specific. The risk is overflow, tap-target crowding, and reduced scannability on small screens.

Change:

- Keep the mobile portal, but define strict spacing and scale limits.
- Give tap targets a minimum 44px physical height.
- Avoid placing essential copy only inside highly animated or decorative regions.
- Test homepage, donate, submit, store, and lab on narrow widths first.

Expected UX gain: the brand remains expressive without making mobile users fight the layout.

### 8. Use Motion As Meaning

Current issue: glow, twinkle, and portal effects create strong atmosphere. If overused, they become background noise.

Change:

- Use motion to signal arrival, reveal, loading, or state change.
- Avoid constant motion near long text or forms.
- Respect `prefers-reduced-motion`.
- Keep page-load motion short and purposeful.

Expected UX gain: more premium feel, better accessibility, less distraction.

### 9. Create A Stronger Editorial Grid

Current issue: page sections are visually related, but many panels share similar weight. Editorial pages could benefit from stronger sectioning.

Change:

- Add repeatable editorial modules:
  - Feature statement.
  - Proof/metadata panel.
  - Object card.
  - Program card.
  - Callout quote.
  - Next action strip.
- Use more negative space around major claims.
- Use typography scale instead of glow to create hierarchy.

Expected UX gain: users understand page structure faster and remember the message better.

### 10. Document Reuse Before Expanding

Current issue: the homepage has significant inline style logic and the interior pages rely on many CSS files. This is workable, but new brand work could drift.

Change:

- Treat this package as the shared design source.
- Before adding new pages, decide the intensity mode, component recipes, token roles, and asset source path.
- When implementation begins, prefer extracting repeated patterns over copying more inline CSS.

Expected UX gain: faster future buildout with less visual inconsistency.

## Priority Roadmap

### Phase 1: Documentation And Tokens

- Keep this `branding/` package current.
- Add role aliases to CSS only when implementing a UI change.
- Use `tokens/brand-tokens.json` for design tools and external collaborators.

### Phase 2: Low-Risk UX Cleanup

- Normalize button hierarchy.
- Improve long-copy readability.
- Reduce glow on form and commerce surfaces.
- Strengthen focus, loading, success, and error states.

### Phase 3: Visual System Extraction

- Extract reusable portal, panel, CTA, product, and editorial modules.
- Align homepage and interior pages through shared tokens rather than identical layouts.
- Add component-level examples or screenshots after implementation.

## Non-Goals

- Do not remove the dark ritual identity.
- Do not make the press look like a generic ecommerce storefront.
- Do not flatten all pages into the same visual template.
- Do not change public routes, API contracts, or deployed behavior as part of brand documentation.

