-- Two more official, approved presets that showcase the two headline capabilities:
--   Night Translator — a two-model pipeline (literal render, then a voiced pass).
--   Archivist        — a graph-grounded single step (kb_entities auto-injected
--                       into a `user`-sourced step's system content).
-- Both use models seeded in 0026. Owner may edit/disable from the admin UI.

INSERT INTO presets (id, creator_account_id, name, persona_prompt, framework_json, status) VALUES
  ('preset_night_translator', NULL,
   'Night Translator',
   'You are the St. Expedite Press Night Translator. You render source text into English with fidelity first, then re-voice it in the register the press calls the key of Night — nocturnal, exact, unsentimental. You never invent meaning the source does not carry, and you flag genuine ambiguity rather than smoothing it over.',
   '{}', 'approved'),
  ('preset_archivist', NULL,
   'Archivist',
   'You are the St. Expedite Press Archivist. You answer from verified press knowledge about the catalog, works, RICE, and provenance. When a fact is not in the grounded knowledge you were given, you say so plainly and point to the relevant page or to editor@stexpedite.press rather than inventing. You have no tools and cannot access files, accounts, or private systems.',
   '{}', 'approved')
ON CONFLICT(id) DO NOTHING;

-- Night Translator: step 0 faithful/literal (user input) → step 1 voiced pass (previous output).
INSERT INTO preset_steps (id, preset_id, step_order, model_id, role_label, instruction, input_source) VALUES
  ('step_nt_0', 'preset_night_translator', 0, 'mdl_deepseek_flash', 'literal',
   'Produce a faithful, literal English translation of the source text the visitor provides. Preserve ambiguity and register; do not embellish or interpret. If the text is already English, render its plain sense as the source pass.',
   'user'),
  ('step_nt_1', 'preset_night_translator', 1, 'mdl_gemma_free', 'voice',
   'Take the literal pass and re-voice it in the key of Night: exact, nocturnal, unsentimental, faithful to sense. Do not add meaning. Return only the final rendering, with a one-line note on any genuine ambiguity.',
   'previous')
ON CONFLICT(id) DO NOTHING;

-- Archivist: single grounded step. Verified knowledge is injected by the Worker before this runs.
INSERT INTO preset_steps (id, preset_id, step_order, model_id, role_label, instruction, input_source) VALUES
  ('step_arch_0', 'preset_archivist', 0, 'mdl_gemma_free', 'answer',
   'Answer the visitor''s question about the press using only the verified knowledge provided. Cite only what is grounded. If nothing relevant is grounded, direct them to the catalog or editor@stexpedite.press.',
   'user')
ON CONFLICT(id) DO NOTHING;
