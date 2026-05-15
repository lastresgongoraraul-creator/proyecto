-- Migration to fix incorrect image IDs and add missing games requested by the user

-- 1. Fix existing games cover URLs to use correct IDs and .jpg extension
UPDATE games SET cover_url = 'https://images.igdb.com/igdb/image/upload/t_cover_big/co2o5z.jpg' WHERE name = 'Elden Ring';
UPDATE games SET cover_url = 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1wyy.jpg' WHERE name = 'The Witcher 3: Wild Hunt';
UPDATE games SET cover_url = 'https://images.igdb.com/igdb/image/upload/t_cover_big/co67cn.jpg' WHERE name = 'Baldur''s Gate 3';
UPDATE games SET cover_url = 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1r6m.jpg' WHERE name = 'Cyberpunk 2077';
UPDATE games SET cover_url = 'https://images.igdb.com/igdb/image/upload/t_cover_big/co5s5v.jpg' WHERE name = 'God of War Ragnarök';
UPDATE games SET cover_url = 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1mcc.jpg' WHERE name = 'The Legend of Zelda: Breath of the Wild';
UPDATE games SET cover_url = 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1q1f.jpg' WHERE name = 'Red Dead Redemption 2';
UPDATE games SET cover_url = 'https://images.igdb.com/igdb/image/upload/t_cover_big/co2947.jpg' WHERE name = 'Hades';
UPDATE games SET cover_url = 'https://images.igdb.com/igdb/image/upload/t_cover_big/co2lbd.jpg' WHERE name = 'Grand Theft Auto V';
UPDATE games SET cover_url = 'https://images.igdb.com/igdb/image/upload/t_cover_big/co6m8s.jpg' WHERE name = 'Starfield';

-- 2. Add requested games
INSERT INTO games (name, primary_genre, genres, platforms, release_year, summary, avg_score, total_reviews, cover_url, embedding, created_at)
VALUES 
(
    'Persona 5 Royal', 
    'RPG', 
    ARRAY['RPG', 'Adventure'], 
    ARRAY['PlayStation 4', 'PC', 'Nintendo Switch', 'PlayStation 5'], 
    2019, 
    'Ponte la máscara de Joker y únete a los Ladrones de Guante Blanco. Rompe las cadenas de la sociedad moderna y organiza grandes asaltos para infiltrarte en la mente de los corruptos y haz que cambien de parecer.', 
    9.5, 
    220, 
    'https://images.igdb.com/igdb/image/upload/t_cover_big/co1r7z.jpg', 
    array_fill(0, ARRAY[384])::vector,
    CURRENT_TIMESTAMP
),
(
    'Pragmata', 
    'Action', 
    ARRAY['Action', 'Adventure', 'Sci-Fi'], 
    ARRAY['PC', 'PlayStation 5', 'Xbox Series X'], 
    2026, 
    'Pragmata es un título de aventura de acción de ciencia ficción ambientado en un futuro cercano en el mundo lunar de la Tierra, que ofrece una visión del futuro con una atmósfera profunda.', 
    0.0, 
    0, 
    'https://images.igdb.com/igdb/image/upload/t_cover_big/co2f7z.jpg', 
    array_fill(0, ARRAY[384])::vector,
    CURRENT_TIMESTAMP
);
