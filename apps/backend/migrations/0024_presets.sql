-- Presets: bundles of {persona, multi-model pipeline, framework, images} that a
-- visitor can run the public chat under. Official presets have creator_account_id
-- NULL and ship approved. A visitor's own preset is visible/runnable only by them
-- until the owner approves it (status='approved'), at which point it lists publicly.
--
-- A preset is a PIPELINE: an ordered list of preset_steps, each calling one
-- owner-allow-listed model. Only the final step's output streams to the browser;
-- intermediate steps run buffered server-side (see the design doc,
-- docs/design/visitor-presets-and-portable-graph.md).

CREATE TABLE IF NOT EXISTS preset_models (
  id           TEXT    PRIMARY KEY,
  label        TEXT    NOT NULL,              -- stable public label used in portable packets
  upstream_ref TEXT    NOT NULL,              -- Worker-side model id (e.g. OpenRouter model); NEVER sent to the client
  enabled      INTEGER NOT NULL DEFAULT 1,    -- owner kill-switch for a model
  notes        TEXT,
  created_at   TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS presets (
  id                 TEXT    PRIMARY KEY,
  creator_account_id TEXT    REFERENCES visitor_accounts(id),  -- NULL = official/press preset
  name               TEXT    NOT NULL,
  persona_prompt     TEXT    NOT NULL DEFAULT '',              -- preset-level framing shared by all steps
  framework_json     TEXT    NOT NULL DEFAULT '{}',            -- opaque behavioral-framework config
  status             TEXT    NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'approved', 'rejected')),
  created_at         TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at         TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS preset_steps (
  id           TEXT    PRIMARY KEY,
  preset_id    TEXT    NOT NULL REFERENCES presets(id),
  step_order   INTEGER NOT NULL,
  model_id     TEXT    NOT NULL REFERENCES preset_models(id),
  role_label   TEXT    NOT NULL DEFAULT '',
  instruction  TEXT    NOT NULL DEFAULT '',
  input_source TEXT    NOT NULL DEFAULT 'user' CHECK (input_source IN ('user', 'previous'))
);

CREATE TABLE IF NOT EXISTS preset_assets (
  id           TEXT    PRIMARY KEY,
  preset_id    TEXT    NOT NULL REFERENCES presets(id),
  kind         TEXT    NOT NULL,              -- e.g. 'avatar'
  ref          TEXT    NOT NULL,              -- size-capped data: URI (v1); never executed
  created_at   TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS preset_moderation (
  id           TEXT    PRIMARY KEY,
  preset_id    TEXT    NOT NULL REFERENCES presets(id),
  owner_action TEXT    NOT NULL CHECK (owner_action IN ('approved', 'rejected')),
  note         TEXT,
  acted_at     TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_presets_status              ON presets (status);
CREATE INDEX idx_presets_creator             ON presets (creator_account_id);
CREATE INDEX idx_preset_steps_preset         ON preset_steps (preset_id, step_order);
CREATE INDEX idx_preset_assets_preset        ON preset_assets (preset_id);
CREATE INDEX idx_preset_moderation_preset    ON preset_moderation (preset_id);
