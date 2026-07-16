# Agent framework memory

## 2026-07-16 — Public guide — 4 curated knowledge skills, registry sync

**Changed:** Added `agents/public-guide/skills/{press-voice,submission-guidance,rice-context,image-discussion}/SKILL.md` — pure knowledge/procedure content, no capability grant; each explicitly defers to `SOUL.md` if the two ever disagree. `image-discussion` formalizes a gap noticed while designing it: a visitor could photograph a manuscript page and attach it instead of using "Submit work," which would put manuscript *content* in front of the model despite submissions being deliberately routed around chat — the skill instructs the model to redirect rather than engage with image content that looks like a manuscript page. Also fixed `registry.json`'s stale `model` field for `public-guide` (still said `openrouter/free`; live profile has been on `google/gemma-4-26b-a4b-it:free` since the earlier free-tier-reliability fix) and added `skills` path pointers to both profile entries.
**Checks:** Mirrored onto the live `stexpedite-public` profile and confirmed via `hermes -p stexpedite-public skills list --source local` (4/4 local, enabled); confirmed the `skills` tool itself stays disabled on `api_server` (`hermes tools list --platform api_server`) so this doesn't reopen dynamic skill-search/install as a model capability, only adds static curated context.
**Follow-ups:** A live probe answer after installing didn't clearly reflect the skill's specific framing (plausible small-free-model behavior, not confirmed as a mechanism failure) — worth a follow-up check once the model tier question is revisited.
**Tooling notes:** `hermes skills install` doesn't accept local paths; local skills are picked up automatically by directory presence under `<profile>/skills/<category>/<name>/SKILL.md`.

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
