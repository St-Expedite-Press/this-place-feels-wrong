# Agent framework memory

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
