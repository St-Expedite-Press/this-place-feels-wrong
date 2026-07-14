-- Track inbound contact and submission form messages in D1 so no message
-- is silently lost if the Resend API is unavailable or the email is deleted.
--
-- Also adds basic bibliographic fields to oncoming_projects that will be
-- needed once books reach distribution (ISBN, page count, exact pub date).

CREATE TABLE IF NOT EXISTS contact_submissions (
  id               TEXT    PRIMARY KEY,
  type             TEXT    NOT NULL CHECK(type IN ('contact', 'submit')),
  email            TEXT    NOT NULL,
  reason           TEXT,
  message          TEXT,
  received_at      TEXT    NOT NULL DEFAULT (datetime('now')),
  editor_email_id  TEXT,
  receipt_email_id TEXT
);

CREATE INDEX idx_contact_submissions_received_at ON contact_submissions (received_at);
CREATE INDEX idx_contact_submissions_email       ON contact_submissions (lower(email));

-- Bibliographic fields — nullable so existing rows are unaffected.
ALTER TABLE oncoming_projects ADD COLUMN isbn       TEXT;
ALTER TABLE oncoming_projects ADD COLUMN published_at TEXT;
ALTER TABLE oncoming_projects ADD COLUMN page_count INTEGER;
