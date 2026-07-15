# Agent framework memory

## 2026-07-15 — Public guide — Submission handoff and surface choice updated

**Changed:** Updated `SOUL.md` to describe chat.stexpedite.press as a visitor-choosable (but still server-validated) toggle between general chat and "Ask about the press," replacing the old single-surface-per-server-context description. Replaced the stale `https://stexpedite.press/connect/?about=manuscript` submission-guidance URL with: use the visible "Submit work" button if already on chat.stexpedite.press, otherwise go to `https://chat.stexpedite.press/?open=submit`. Added an `editor@stexpedite.press` line for rights/press/collaboration/general inquiries that want a guaranteed human reply, now that the structured `/connect` contact form is retired. `policy.json` and `agents/evals/public-boundary.json` needed no changes — the upload dialog remains a sibling UI component that bypasses Hermes entirely, and the client still only ever picks a bounded surface enum, never an actual system prompt.
**Checks:** Policy/eval JSON still parses; `npm run test:backend` covers the corresponding origin/surface change.
**Follow-ups:** Re-run `ops/hermes/setup-public-profile.sh` after deploy — editing `SOUL.md` in the repo does not itself update the live isolated Hermes profile.

## 2026-07-14 — Public chat — Text-only multi-surface role

**Changed:** Generalized the public SOUL to accept trusted server surface context while explicitly denying file, email, profile/model/prompt selection, development, deployment, and private-system capabilities. Publication surfaces remain guides; `openui` is general-purpose text chat.
**Checks:** Policy/eval JSON parses and backend routing tests pass.
**Tooling notes:** Capability boundaries stay uniform and tool-free; only server-owned conversational instructions vary by surface.

## 2026-07-14 — Public guide — Constrained submission handoff

**Changed:** Taught the public guide the verified submission sequence and added explicit policy/eval boundaries: it may direct visitors to the Worker form but cannot access files, email tools, private submissions, or submission status.
**Checks:** Agent JSON parsing and boundary scans run at repository closeout.
**Follow-ups:** Install the revised SOUL in the isolated public profile before production canary.

## 2026-07-14 — Osiris framework foundation

**Changed:** Added the public-guide and owner-worker registry, explicit
capability policies, public knowledge allowlist, and boundary evaluations.
**Checks:** JSON parsing and repository-wide validation run at closeout.
**Follow-ups:** Render policies into separate OS-level Hermes services before
production; keep the owner profile outside public DNS and Worker routes.
