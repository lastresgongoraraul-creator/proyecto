-- V27__Reset_And_Recalculate_Scores.sql

-- Primero, ponemos todos los juegos a 0.0 y 0 reviews para limpiar las notas falsas (IGDB)
UPDATE games SET avg_score = 0.0, total_reviews = 0;

-- Luego, recalculamos basándonos únicamente en las reseñas reales que han escrito los usuarios de GameSphere
WITH stats AS (
    SELECT game_id, COUNT(*) as cnt, AVG(score) as avg_s
    FROM reviews
    GROUP BY game_id
)
UPDATE games g
SET 
    total_reviews = s.cnt,
    avg_score = ROUND(s.avg_s, 1)
FROM stats s
WHERE g.id = s.game_id;
