-- Seed the owner-curated model allow-list and one official starter preset.
-- upstream_ref values match models this repo already references (the public
-- Hermes profile's free Gemma, and the delegate model named in AGENTS.md).
-- The owner adjusts this allow-list from the admin UI; these are defaults only.

INSERT INTO preset_models (id, label, upstream_ref, enabled, notes) VALUES
  ('mdl_gemma_free',   'Gemma (free)',   'google/gemma-4-26b-a4b-it:free', 1, 'Default free tier; matches the public Hermes profile model.'),
  ('mdl_deepseek_flash','DeepSeek Flash', 'deepseek/deepseek-v4-flash',     1, 'Fast, low-cost; the delegate model named in AGENTS.md.')
ON CONFLICT(id) DO NOTHING;

-- One official, approved, single-step preset so the feature has content on day one.
INSERT INTO presets (id, creator_account_id, name, persona_prompt, framework_json, status)
VALUES (
  'preset_press_guide',
  NULL,
  'Press Guide',
  'You are the St. Expedite Press public guide. Help with verified public information, the catalog, RICE, and submissions. You have no tools and cannot access files, accounts, private data, or deployments.',
  '{}',
  'approved'
) ON CONFLICT(id) DO NOTHING;

INSERT INTO preset_steps (id, preset_id, step_order, model_id, role_label, instruction, input_source)
VALUES (
  'step_press_guide_1',
  'preset_press_guide',
  0,
  'mdl_gemma_free',
  'answer',
  'Answer the visitor directly and concisely in the press voice.',
  'user'
) ON CONFLICT(id) DO NOTHING;
