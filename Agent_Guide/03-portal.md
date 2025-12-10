# Portal (index variants)

## Key Elements
- Portal flash overlay (`.portal-flash`): brief entry flash; keep duration < 0.5s.
- Header title: centered neon crest text with breathing shadow.
- Crest (`.crest`): appears after interaction; rotates slowly.
- Cursor glow: follows pointer; prefer soft-light blend.
- Logo circle: neon halo around center.
- Grid nav (`.big-nav` with `.big-word` links): 3x3 grid; hover amplifies glow.
- Splash footer: coordinates line, lede, divider, micro links.
- Under-construction routing: current grid/footer links go to `under-construction.html` (stub); stub must include a return-to-portal CTA.

## Variants
- `index.html`, `index_0_1.html`, `index_0_2.html` share the same language; keep interactions consistent.

## When Editing
- Preserve glow stacks (`--rest-glow`, `--excited-glow`).
- Keep radial background gradients dark with neon hints.
- Do not add new navigation entries without design approval; maintain grid symmetry.
- Ensure crest reveal remains tied to first interaction (scroll/wheel/key).

## Reduced Motion
- Ensure `prefers-reduced-motion` disables or softens flash, crest rotation, and cursor glow animations.
