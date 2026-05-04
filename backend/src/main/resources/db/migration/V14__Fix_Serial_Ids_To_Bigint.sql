-- Fix column type mismatch between SERIAL (integer) and BIGINT (long)
-- SERIAL creates an INTEGER column by default, but JPA entities use Long (BIGINT)

ALTER TABLE follows ALTER COLUMN id TYPE BIGINT;
ALTER TABLE review_likes ALTER COLUMN id TYPE BIGINT;
ALTER TABLE notifications ALTER COLUMN id TYPE BIGINT;
ALTER TABLE moderation_queue ALTER COLUMN id TYPE BIGINT;
