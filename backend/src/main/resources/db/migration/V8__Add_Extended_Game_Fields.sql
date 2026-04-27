-- Add extended fields to games table
ALTER TABLE games ADD COLUMN pegi VARCHAR(20);
ALTER TABLE games ADD COLUMN is_multiplayer BOOLEAN DEFAULT FALSE;
ALTER TABLE games ADD COLUMN developer VARCHAR(255);
ALTER TABLE games ADD COLUMN publisher VARCHAR(255);
ALTER TABLE games ADD COLUMN official_website VARCHAR(512);

-- Update existing games with some default/dummy data
UPDATE games SET pegi = 'PEGI 16', developer = 'Unknown Developer', publisher = 'Unknown Publisher', official_website = 'https://www.example.com' WHERE pegi IS NULL;
UPDATE games SET is_multiplayer = TRUE WHERE primary_genre IN ('Action', 'Shooter', 'Sports', 'MOBA');
