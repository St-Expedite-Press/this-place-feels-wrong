# Accessibility

## Focus & Keyboard
- Ensure interactive elements remain keyboard accessible; add `:focus-visible` outlines if adding controls.
- Preserve `aria-pressed` on theme toggles.

## Motion
- Honor `prefers-reduced-motion`: disable/soften flash, crest rotation, glitch pulses, and heavy glows when reduced motion is requested.

## Color & Contrast
- Neon on dark must maintain sufficient contrast for text; avoid lowering neon alpha on text labels.
- Background sigils/textures must stay faint enough to avoid reducing readability.

## Semantics
- Keep heading order logical in any added content.
- Use `aria-hidden="true"` for purely decorative elements (textures, masks, animated sigils).

## Screen Readers
- Hidden headings (`sr-only`) are used where needed; preserve them if adding new sections.

## Testing
- Keyboard nav through all interactive elements.
- Check with `prefers-reduced-motion` enabled.
- Validate focus visibility against dark backgrounds.
