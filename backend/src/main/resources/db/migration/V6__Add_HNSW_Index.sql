-- Migration to add HNSW index for fast similarity search with pgvector
-- M=16 and ef_construction=64 are reasonable defaults for general purpose
CREATE INDEX idx_games_embedding_hnsw ON games USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);
