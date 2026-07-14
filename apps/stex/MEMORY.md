# Press Web App Memory

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
