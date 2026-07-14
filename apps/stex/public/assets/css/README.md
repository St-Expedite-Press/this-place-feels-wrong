# Web CSS

Authored CSS for the portal, shared shell, interior layout, and page-specific styling.

Important files:

- shared interior layers: `tokens.css`, `interior-base.css`, `layout.css`, `components.css`
- shared portal/shell layers: `base.css`, `effects.css`, `a11y.css`, `hero-bar.css`, `footer.css`
- page-specific layers: `books.css`, `donate.css`, `forms.css`, `gallery.css`, `lab.css`, `mission.css`, `services.css`

Brand intensity modes are assigned in Astro route shells with `data-brand-mode`:

- `ritual` for portal and lab experiences
- `editorial` for books, about, store, and services
- `utility` for contact, submit, donate confirmation, and other task flows

Mode-specific variables live in `tokens.css`; shared components consume those variables before page-specific styles add local refinements.
