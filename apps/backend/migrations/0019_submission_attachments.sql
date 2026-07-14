-- Record manuscript metadata without storing manuscript contents in D1.
-- The uploaded file is forwarded to the editor through Resend and is not
-- exposed through a public retrieval route.

ALTER TABLE contact_submissions ADD COLUMN author_name TEXT;
ALTER TABLE contact_submissions ADD COLUMN work_title TEXT;
ALTER TABLE contact_submissions ADD COLUMN genre TEXT;
ALTER TABLE contact_submissions ADD COLUMN attachment_name TEXT;
ALTER TABLE contact_submissions ADD COLUMN attachment_type TEXT;
ALTER TABLE contact_submissions ADD COLUMN attachment_bytes INTEGER;
