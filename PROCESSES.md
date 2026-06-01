# St. Expedite Press — Project Processes

The full process documentation for this project lives in **`agent/AGENT.md`** — the repo's single source of truth for all agent workflows, task routing, command matrix, and subagent policy.

Workspace-level processes (Session Lifecycle, Orchestration, Change Logging, Workspace Maintenance) live in root `PROCESSES.md`.

---

## Process Summary (see `agent/AGENT.md` for full detail)

| Process | Where documented |
|---------|-----------------|
| Task routing loop | `agent/AGENT.md` §3 |
| CSS edits | `agent/AGENT.md` §7 |
| Asset updates | `agent/AGENT.md` §3 — `assets` task classification |
| Worker / API changes | `agent/AGENT.md` §3 — `worker` task classification |
| D1 migrations | `agent/AGENT.md` §5 — append-only rule |
| Release / deploy | `agent/AGENT.md` §4 command matrix |
| Subagent routing | `agent/AGENT.md` §8 |
| Known gaps + future work | `agent/AGENT.md` §10 |

---

## Live Site Fix Cycle

**When:** Deployed site has identified bugs, UX issues, or infrastructure gaps.  
**Trigger:** User surfaces a bug list or audit findings.

**Steps:**
1. Read `agent/AGENT.md` and recent `MEMORY.md` entries
2. Triage: visual/UX · copy · infrastructure · a11y · performance
3. Fix in priority order: infrastructure first, then UX, then copy
4. Run the narrowest test that covers each fix
5. Run `npm run check` before committing
6. Commit descriptively — what was broken, not just what changed
7. Push; confirm CF Pages deploy triggered
8. Update `agent/AGENT.md` §10 — move resolved items to Closed/Resolved

**Outstanding items (as of 2026-06-01):**
- Lift Wind buy URL — run `migrations/0015_buy_url_lift_wind.sql` once Amazon/vendor link is confirmed
