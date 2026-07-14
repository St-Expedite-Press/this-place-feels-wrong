# Operations Memory

## 2026-07-14 — Ops — Hermes consumes the Osiris registry source

**Changed:** Made `agents/public-guide/SOUL.md` the canonical public profile definition and updated provisioning to install it, removing the redundant operations copy.
**Checks:** Source paths and public-boundary scans passed locally.
**Follow-ups:** Apply the new definition only through an approved preview/canary rollout, then verify OS-user and network isolation.
**Tooling notes:** The live EC2 profile was not changed during this refactor.

## 2026-07-13 — Ops — Public Hermes isolation and repository preservation

**Changed:** Added reproducible `stexpedite-public` profile provisioning, its public-only SOUL and security runbook, plus the archived RICE repository retirement gate. Created and restore-tested an offline bundle containing archived main and otherwise-unreachable PR refs.
**Checks:** Public Hermes health/auth/listener/toolset checks passed; a real bounded chat completed; the Git bundle verified and restored with both PR commits present.
**Follow-ups:** Provision an authenticated Cloudflare Tunnel after Cloudflare account credentials are available; make a second off-machine archive copy and complete the authenticated repository metadata audit before deletion.
**Tooling notes:** Hermes profiles and per-platform toolsets provided the required isolation boundary; missing Cloudflare API credentials correctly blocked production ingress.

---

## 2026-06-25 — Ops — Local agent scaffold

**Changed:** Added local operations guide and memory.
**Checks:** npm run check and git diff --check passed for the scaffold.
**Follow-ups:** Log future release, smoke, runtime, and incident-runbook lessons here.
**Tooling notes:** Ops work remains explicit-authorization only for external mutations.
