-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Roles table (if not using Enum in DB, but User requested Enum in JPA)
-- I'll use a string column for roles in the users table for simplicity with Enum

CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL, -- Enum: USER, MODERATOR, ADMIN
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE games (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    genre VARCHAR(100),
    avg_score DECIMAL(3, 2) DEFAULT 0.0,
    total_reviews INTEGER DEFAULT 0,
    embedding vector(1536), -- Ready for pgvector (OpenAI style)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE reviews (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    game_id BIGINT NOT NULL,
    score INTEGER CHECK (score >= 1 AND score <= 10),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_reviews_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_reviews_game FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE
);

-- Specific Indexes requested
CREATE INDEX idx_games_genre ON games(genre);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_game_id ON reviews(game_id);

-- Optional: Index for Cursor Pagination if using ID (covered by PK)
-- If we use created_at, we might need an index there.
CREATE INDEX idx_games_created_at_id ON games(created_at DESC, id DESC);
