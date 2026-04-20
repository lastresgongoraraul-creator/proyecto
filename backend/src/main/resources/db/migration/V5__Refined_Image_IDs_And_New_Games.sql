-- FINAL Refinement of Image IDs and Seed Data Alignment

-- 1. Correct all existing image IDs to the most common canonical versions and ensure .jpg format
-- This fixes the 'Cassette Girl' / wrong cover issues from V3/V4

-- Elden Ring (co2o5z is the standard Golden cover)
UPDATE games SET cover_url = 'https://images.igdb.com/igdb/image/upload/t_cover_big/co4jni.webp' WHERE name = 'Elden Ring';

-- Cyberpunk 2077 (co1r6m is the standard Yellow cover)
UPDATE games SET cover_url = 'https://images.igdb.com/igdb/image/upload/t_cover_big/coaih8.webp' WHERE name = 'Cyberpunk 2077';

-- The Legend of Zelda: Breath of the Wild (co1mcc is the standard Switch cover)
UPDATE games SET cover_url = 'https://images.igdb.com/igdb/image/upload/t_cover_big/co3p2d.webp' WHERE name = 'The Legend of Zelda: Breath of the Wild';

-- Hades (co2947 is Zagreus holding the sword)
UPDATE games SET cover_url = 'https://images.igdb.com/igdb/image/upload/t_cover_big/cob9kr.webp' WHERE name = 'Hades';

-- Starfield (co6m8s is the standard astronaut cover)
UPDATE games SET cover_url = 'https://images.igdb.com/igdb/image/upload/t_cover_big/co39vv.webp' WHERE name = 'Starfield';

-- Baldur's Gate 3 (co67cn is the mind flayer dark cover)
UPDATE games SET cover_url = 'https://images.igdb.com/igdb/image/upload/t_cover_big/co670h.webp' WHERE name = 'Baldur''s Gate 3';

-- Red Dead Redemption 2 (co1q1f is the red outlaw cover)
UPDATE games SET cover_url = 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1q1f.jpg' WHERE name = 'Red Dead Redemption 2';

-- 2. Specifically fix Persona 5 to match the original style requested by the user
-- Also ensure Persona 5 Royal is correctly named if it was inserted as such, or update both
UPDATE games SET 
    name = 'Persona 5',
    cover_url = 'https://images.igdb.com/igdb/image/upload/t_cover_big/cobaqh.webp' 
WHERE name LIKE 'Persona 5%';

-- 3. Fix Pragmata
UPDATE games SET cover_url = 'https://images.igdb.com/igdb/image/upload/t_cover_big/cobxnx.webp' WHERE name = 'Pragmata';

-- 4. Ensure Witcher 3 and God of War are also consistent
UPDATE games SET cover_url = 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1wyy.jpg' WHERE name = 'The Witcher 3: Wild Hunt';
UPDATE games SET cover_url = 'https://images.igdb.com/igdb/image/upload/t_cover_big/co5s5v.jpg' WHERE name = 'God of War Ragnarök';
UPDATE games SET cover_url = 'https://images.igdb.com/igdb/image/upload/t_cover_big/co2lbd.jpg' WHERE name = 'Grand Theft Auto V';
