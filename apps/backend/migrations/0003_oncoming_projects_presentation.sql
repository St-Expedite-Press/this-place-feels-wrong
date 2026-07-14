-- Add presentation metadata for books UI cards and modal descriptions.

ALTER TABLE oncoming_projects ADD COLUMN cover_image TEXT;
ALTER TABLE oncoming_projects ADD COLUMN popup_description TEXT;

UPDATE oncoming_projects
SET
  title = 'Les Fièvres et les humeurs',
  cover_image = 'assets/img/les-fievres-cover.svg',
  popup_description = 'What if a single emotion strained itself to breaking? Would it yield? Can words and thought transmute to music; can coal''s obsession crystallize into the hardness of desire?\n\nLes Fièvres et les humeurs is a sequence in three parts, written deliberately under pressure. Its poems attend to fever, fixation, and desire as formal problems rather than narrative events, favoring compression, fracture, and controlled repetition.\n\nThis book is concerned with how intensity reshapes language, and what remains when heat dissipates.'
WHERE project_slug = 'les-fievres-et-les-humeurs';

UPDATE oncoming_projects
SET popup_description = 'Known book project in development.'
WHERE popup_description IS NULL;
