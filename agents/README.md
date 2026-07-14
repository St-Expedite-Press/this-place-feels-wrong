# Osiris agent framework

This is the common control plane for the four products in `apps/`. It versions
agent identity, capabilities, knowledge provenance, limits, and evaluations.
It does **not** combine public and private authority into one runtime identity.

## Request path

```text
stex / rice / chat browser
          |
          v
apps/backend (origin, Turnstile, limits, context)
          |
          v
public-guide Hermes profile (no tools, files, memory, or deployment access)
```

The owner worker is a separate profile reached through SSH or a future
Cloudflare Access-protected owner surface. Public content can never invoke it.

`registry.json` is the machine-readable inventory. Profile policy and SOUL
files live under their profile directories. `knowledge/sources.json` is the
allowlist for public grounding; `evals/` contains release gates. Runtime setup
and incident procedures remain under `ops/hermes/`.
