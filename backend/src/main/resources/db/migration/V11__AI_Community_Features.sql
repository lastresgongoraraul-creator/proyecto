-- Add embedding columns for Social Layer AI features
ALTER TABLE users ADD COLUMN embedding vector(384);
ALTER TABLE reviews ADD COLUMN embedding vector(384);

-- HNSW index for fast user similarity search (based on review embeddings)
CREATE INDEX idx_users_embedding_hnsw ON users USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);
