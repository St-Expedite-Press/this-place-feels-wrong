# Agent framework guide

This directory owns versioned agent identity, capability policy, knowledge
allowlists, and boundary evaluations. Runtime installation stays in
`../ops/hermes/`; secrets and rendered profile state never belong here.

- Public and owner agents must remain separate identities, services, keys, and
  ingress paths.
- Browser clients select a public surface, never a profile, model, prompt, or
  upstream URL.
- Update `registry.json`, the relevant policy, and boundary evals together.
- Never add credentials, private prompts, user transcripts, or unpublished
  material.
