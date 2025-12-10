# Theme Toggle

## Behavior
- Toggle switches between `theme-day` and `theme-night` classes on `<body>`.
- Preference key: `sep-theme` in `localStorage`.
- Initial state: respects stored value; falls back to night by default (dark-preferred).

## UI
- Buttons carry `.theme-toggle` and `data-theme-toggle`; label flips between “Night Mode” / “Day Mode.”
- Update `aria-pressed` to reflect night = true.

## CSS Tokens
- Day and night both use neon slate palette; differences are subtle in gradients and texture opacity.
- Core variables in `assets/css/global.css` (`--bone`, `--obsidian`, `--silt`, `--occult`, `--occult-soft`).

## Reduced Motion
- Respect `prefers-reduced-motion` for transitions that rely on theme-triggered animations.

## Testing Checklist
- Toggle updates body class, button label, and `aria-pressed`.
- Reload preserves preference.
- No layout shift when switching themes.
