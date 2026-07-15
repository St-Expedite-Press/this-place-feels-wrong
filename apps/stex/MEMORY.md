# Press Web App Memory

## 2026-07-15 — Portal and Connect — Chat replaces the form, newsletter removed

**Changed:** Removed the "Letters from the press" Substack signup (mobile form + desktop link, plus the now-dead `wireUpdatesForm`/`copyText` script and the page's Turnstile include) from `index.astro`. Converted `connect.astro` from a full Turnstile form page into a redirect stub to `https://chat.stexpedite.press`, following the existing `submit.astro`/`contact.astro` pattern plus an inline client script (needed since query params aren't available at static build time) to preserve `?about=manuscript` as a `?open=submit` deep link. Changed the nav/footer "Submit / Contact" entry in `site.json` to a single-word "Chat" label pointing at `https://chat.stexpedite.press`. Updated `ChatWidget.astro`'s noscript fallback, and the `/connect`-linking CTAs on `work.astro`, `books.astro`, and `404.astro`, to point directly at chat instead of round-tripping through the stub.
**Checks:** `npm run build` + `npm run lint:html` + `npm run check:links` + `npm run check:a11y` pass.
**Tooling notes:** Left `connect-page.js`, the orphaned `pages.connect`/`pages.submit`/`pages.contact` blocks in `site.json`, and the now-unused `.thin-band`/`.splash__subscribe` CSS in place — matches this repo's existing precedent of not doing speculative cleanup passes on already-orphaned code from the prior `/submit`/`/contact` → `/connect` conversion.

## 2026-07-14 — Portal and Work — Canonical intake plus public chat project

**Changed:** Recast `/connect` as the protected submission/contact portal, made manuscript and correspondence modes explicit, relabeled navigation, and added `chat.stexpedite.press` under Work projects.
**Checks:** Connect script syntax passes; Astro validation is delegated to the clean EC2 checkout because OneDrive placeholders block the local build.
**Tooling notes:** The existing Turnstile form remained the correct gate; no authentication layer or route break was needed.

## 2026-07-14 — Connect — Direct manuscript upload

**Changed:** Manuscript mode now collects author/title/genre/consent and one allowlisted document, posting multipart data to the shared submission Worker while preserving ordinary contact JSON and fallback email copy.
**Checks:** Browser scripts parse and production build validation runs at repository closeout.
**Follow-ups:** Deploy only after migration `0019` and complete desktop/mobile upload QA.
**Tooling notes:** The shared API client now preserves browser-generated multipart boundaries for `FormData`.

## 2026-07-14 — St. Expedite app — Explicit product boundary

**Changed:** Moved the history-preserving Press application from `apps/web` to `apps/stex` and replaced its private chat protocol duplication with the canonical Osiris browser client.
**Checks:** Staged Astro build produced 13 routes; HTML, links, accessibility, and client-sync checks passed.
**Follow-ups:** Add server-curated public knowledge grounding and validate a preview deployment before production.
**Tooling notes:** OneDrive dependency placeholders require the documented disposable staging build workaround.

## 2026-07-13 — Web App — Public Hermes chat surface

**Changed:** Added a reusable, progressively enhanced chat widget to both Astro layouts with plain-text SSE streaming, alternating bounded history, per-request Turnstile, Stop/Clear controls, focus and Escape handling, and a no-JavaScript Connect fallback.
**Checks:** `node --check public/assets/js/chat.js` and the 13-route Astro production build passed.
**Follow-ups:** Production still requires the authenticated tunnel and Worker runtime variables.
**Tooling notes:** Existing layout and token seams supported a narrow global integration; no new dependency was required.

---

## 2026-06-25 — Web App — Local agent scaffold

**Changed:** Added local web app guide and memory.
**Checks:** npm run check and git diff --check passed for the scaffold.
**Follow-ups:** Keep future entries focused on routes, Astro layout, CSS/JS, and generated-output boundaries.
**Tooling notes:** Web work now has a local memory surface for build and design-system lessons.
