-- Align games table with AI service requirements and IGDB standards

-- 1. Rename title to name
ALTER TABLE games RENAME COLUMN title TO name;

-- 2. Add IGDB synchronization fields
ALTER TABLE games ADD COLUMN igdb_id INTEGER UNIQUE;
ALTER TABLE games ADD COLUMN summary TEXT;
ALTER TABLE games ADD COLUMN platforms VARCHAR(255)[];
ALTER TABLE games ADD COLUMN release_year INTEGER;

-- 4. Change genre to genres (ARRAY) to handle multiple genres from IGDB
ALTER TABLE games RENAME COLUMN genre TO primary_genre; -- Keep it as primary or rename
ALTER TABLE games ADD COLUMN genres VARCHAR(100)[];

-- 5. Fix embedding dimension from 1536 (OpenAI) to 384 (all-MiniLM-L6-v2)
-- Since it's a new setup, we can safely alter the type
ALTER TABLE games ALTER COLUMN embedding TYPE vector(384);
