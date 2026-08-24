# St. Expedite Press — Current Roadmap

**Last updated:** 2026-08-21

This file records current product and institutional priorities. Completed historical build phases belong in `MEMORY.md` and the changelog; they should not remain here as apparently-pending work.

## Press — Phase One: a meaningful catalog 🚧 IN PROGRESS

Phase One is not complete merely because the website, commerce, or first title exists. It completes when St. Expedite has stood up a **meaningful catalog of original and archival titles**: enough books, across more than one publishing line, that a reader encounters a publishing program rather than a single release.

Current priorities:

| Priority | State |
|---|---|
| Email capture as the primary Press conversion | ✅ Implemented on portal; `/press` now also leads with signup |
| Catalog browsing as the second Press action | ✅ `/press` and `/press/books` |
| Southern Experimental Press (SEXP) named as the original-work line | ✅ Current public copy |
| *Lift Wind / Love Heat: Symphony No. 1 in C Minor* | 🚧 Manuscript complete; editing and typesetting |
| Grow original + archival catalog to the Phase One threshold | 🚧 Active institutional goal |
| Define the numerical catalog threshold for “meaningful” | ⬜ Owner decision |

### Phase Two — RICE

RICE becomes a print journal when the press reaches a defined target number of **$25 pre-orders**. The mechanism is fixed; the target count is not yet fixed and must not be invented by an agent.

RICE remains a publishing project during Phase One, but the print threshold is intentionally economic rather than rhetorical.

### Phase Three — Fellowship

The fellowship is a **long-term institutional aspiration**, not an active program. Do not present applications, dates, or funding as available until the press has the catalog, readership, and economics to support it.

---

## Lab — founder-facing creative systems practice

The Lab is a commissioned practice for **startups, founders, and small teams building unusual creative or cultural products**. It is not generic AI consulting.

Primary problem space:

- aesthetic product and interface design;
- memory layers, ontologies, knowledge graphs, and provenance-aware retrieval;
- specialized agents in creative domains;
- agent/application infrastructure that makes those systems operable.

### Flagship proof

**Signal Atlas is the marquee Lab product and primary proof of practice.** It should lead Lab credibility work ahead of generic service claims. Treat it as the clearest example of aesthetic direction, structured world models, memory/retrieval, agents, and interface design operating as one product system.

### Commercial posture

- No public rate card.
- First consultation: **30 minutes, free, no obligation**.
- Minimum desirable paid engagement remains an owner decision; do not publish or infer one.

---

## Chat — general AI product + framework showcase

`chat.stexpedite.press` is intended to become a **general ChatGPT alternative and a public showcase for the St. Expedite agent framework**, not merely a Press concierge.

The product direction therefore supports the complexity of:

- selectable assistants backed by real Hermes profiles;
- authenticated user-owned profiles where authorized;
- model abstraction behind first-party routes;
- conversation continuity and explicit memory boundaries;
- knowledge grounding and specialized assistants;
- strict separation between public/user profiles and the private owner/deployment profile.

The profile-native rule remains authoritative: **one selectable assistant = one Hermes profile**. Legacy Worker-executed preset pipelines are compatibility code only and should receive no new features.

Current engineering priorities:

1. complete and observe the profile-native cutover;
2. remove legacy preset execution only after the compatibility gate is proven safe;
3. keep browser clients behind first-party Worker authorization and never expose provider/Hermes credentials;
4. evolve Chat as a useful general assistant product, not as a wrapper around Press content.

---

## Repository truth and maintenance

The monorepo is the source of truth for St. Expedite, RICE, Chat, Admin, Backend, shared packages, and Hermes configuration.

Operational document roles:

- `AGENTS.md` — coding-agent rules and safety boundaries;
- `ONTOLOGY.md` — current architecture, ownership, routes, and runtime map;
- `PHASE-PLAN.md` — current roadmap and unresolved owner decisions;
- `MEMORY.md` — chronological implementation/deployment record;
- `CHANGELOG.md` — historical release summary.

Do not let historical phases remain marked “pending” after the product has moved beyond them.

## Owner decisions still open

1. Exact number of $25 RICE pre-orders that triggers print.
2. Numerical definition of a “meaningful catalog” for completion of Press Phase One.
3. Minimum paid Lab engagement worth accepting after the free consultation.
4. Whether “Psalter of the Crow Saint” names the archival line, the translation line, a series, or a title. Do not rename either catalog arm until this is explicit.
5. Longer-term user-authoring scope in Chat: how much profile/agent configuration visitors should control versus select from server-provided options.
