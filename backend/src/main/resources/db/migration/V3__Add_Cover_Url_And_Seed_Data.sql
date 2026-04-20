-- Migration to add cover_url and seed the catalog with high-quality game data

-- 1. Add cover_url column
ALTER TABLE games ADD COLUMN cover_url VARCHAR(512);

-- 2. Seed Games
-- Each game includes a dummy zero-vector embedding of dimension 384
-- The format used for pgvector vector type is '[val1, val2, ...]'

INSERT INTO games (name, primary_genre, genres, platforms, release_year, summary, avg_score, total_reviews, cover_url, embedding, created_at)
VALUES 
(
    'Elden Ring', 
    'RPG', 
    ARRAY['RPG', 'Action'], 
    ARRAY['PC', 'PlayStation 5', 'Xbox Series X'], 
    2022, 
    'Álzate, Sinluz, y que la gracia te guíe para abrazar el poder del Círculo de Elden y encumbrarte como señor de Elden en las Tierras Intermedias.', 
    9.6, 
    150, 
    'https://images.igdb.com/igdb/image/upload/t_cover_big/co4p99.webp', 
    array_fill(0, ARRAY[384])::vector,
    CURRENT_TIMESTAMP
),
(
    'The Witcher 3: Wild Hunt', 
    'RPG', 
    ARRAY['RPG', 'Adventure'], 
    ARRAY['PC', 'PlayStation 5', 'Xbox Series X', 'Nintendo Switch'], 
    2015, 
    'Como el brujo Geralt de Rivia, deberás encontrar a la niña de la profecía en un mundo abierto vasto, rico en ciudades comerciales, islas piratas, peligrosos puertos de montaña y cuevas olvidadas.', 
    9.8, 
    300, 
    'https://images.igdb.com/igdb/image/upload/t_cover_big/co1wyy.webp', 
    array_fill(0, ARRAY[384])::vector,
    CURRENT_TIMESTAMP
),
(
    'Baldur''s Gate 3', 
    'RPG', 
    ARRAY['RPG', 'Strategy'], 
    ARRAY['PC', 'PlayStation 5', 'Xbox Series X'], 
    2023, 
    'Reúne a tu grupo y regresa a los Reinos Olvidados en una historia de compañerismo y traición, sacrificio y supervivencia, y el atractivo de un poder absoluto.', 
    9.7, 
    120, 
    'https://images.igdb.com/igdb/image/upload/t_cover_big/co67cn.webp', 
    array_fill(0, ARRAY[384])::vector,
    CURRENT_TIMESTAMP
),
(
    'Cyberpunk 2077', 
    'RPG', 
    ARRAY['RPG', 'Shooter'], 
    ARRAY['PC', 'PlayStation 5', 'Xbox Series X'], 
    2020, 
    'Cyberpunk 2077 es un RPG de aventura y acción de mundo abierto ambientado en la megalópolis de Night City, donde te pones en la piel de un mercenario cyberpunk.', 
    8.2, 
    250, 
    'https://images.igdb.com/igdb/image/upload/t_cover_big/co2mjt.webp', 
    array_fill(0, ARRAY[384])::vector,
    CURRENT_TIMESTAMP
),
(
    'God of War Ragnarök', 
    'Action', 
    ARRAY['Action', 'Adventure'], 
    ARRAY['PlayStation 5', 'PlayStation 4'], 
    2022, 
    'Kratos y Atreus deben viajar a cada uno de los Nueve Reinos en busca de respuestas mientras las fuerzas de Asgard se preparan para la batalla profetizada que supondrá el fin del mundo.', 
    9.5, 
    180, 
    'https://images.igdb.com/igdb/image/upload/t_cover_big/co5s5v.webp', 
    array_fill(0, ARRAY[384])::vector,
    CURRENT_TIMESTAMP
),
(
    'The Legend of Zelda: Breath of the Wild', 
    'Adventure', 
    ARRAY['Adventure', 'Action'], 
    ARRAY['Nintendo Switch'], 
    2017, 
    'Entra en un mundo de aventura, exploración y descubrimiento en The Legend of Zelda: Breath of the Wild, un nuevo juego de la aclamada serie que rompe fronteras.', 
    9.9, 
    400, 
    'https://images.igdb.com/igdb/image/upload/t_cover_big/co1mcc.webp', 
    array_fill(0, ARRAY[384])::vector,
    CURRENT_TIMESTAMP
),
(
    'Red Dead Redemption 2', 
    'Action', 
    ARRAY['Action', 'Adventure'], 
    ARRAY['PC', 'PlayStation 4', 'Xbox One'], 
    2018, 
    'Estados Unidos, 1899. El final de la era del salvaje oeste ha comenzado. Tras un atraco fallido en la ciudad de Blackwater, Arthur Morgan y la banda de Van der Linde se ven obligados a huir.', 
    9.8, 
    350, 
    'https://images.igdb.com/igdb/image/upload/t_cover_big/co1q1f.webp', 
    array_fill(0, ARRAY[384])::vector,
    CURRENT_TIMESTAMP
),
(
    'Hades', 
    'Action', 
    ARRAY['Action', 'RPG'], 
    ARRAY['PC', 'Nintendo Switch', 'PlayStation 5', 'Xbox Series X'], 
    2020, 
    'Desafía al dios de los muertos mientras te abres camino a base de tajos en este juego de mazmorras de los creadores de Bastion y Transistor.', 
    9.4, 
    200, 
    'https://images.igdb.com/igdb/image/upload/t_cover_big/co2947.webp', 
    array_fill(0, ARRAY[384])::vector,
    CURRENT_TIMESTAMP
),
(
    'Grand Theft Auto V', 
    'Action', 
    ARRAY['Action', 'Adventure'], 
    ARRAY['PC', 'PlayStation 5', 'Xbox Series X'], 
    2013, 
    'Cuando un joven estafador callejero, un ladrón de bancos retirado y un psicópata aterrador se ven involucrados con lo peor del submundo criminal, deben realizar una serie de peligrosos golpes.', 
    9.2, 
    500, 
    'https://images.igdb.com/igdb/image/upload/t_cover_big/co2lbd.webp', 
    array_fill(0, ARRAY[384])::vector,
    CURRENT_TIMESTAMP
),
(
    'Starfield', 
    'RPG', 
    ARRAY['RPG', 'Adventure'], 
    ARRAY['PC', 'Xbox Series X'], 
    2023, 
    'Starfield es el primer universo nuevo en más de 25 años de Bethesda Game Studios. Crea el personaje que quieras y explora con una libertad sin precedentes.', 
    8.0, 
    80, 
    'https://images.igdb.com/igdb/image/upload/t_cover_big/co6m8s.webp', 
    array_fill(0, ARRAY[384])::vector,
    CURRENT_TIMESTAMP
);
