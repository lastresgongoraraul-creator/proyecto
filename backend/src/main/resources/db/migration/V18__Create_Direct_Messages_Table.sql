-- V18: Create direct_messages table for private communication
CREATE TABLE direct_messages (
    id BIGSERIAL PRIMARY KEY,
    sender_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_read BOOLEAN DEFAULT FALSE
);

-- Index for efficient retrieval of conversations between two users
CREATE INDEX idx_dm_sender ON direct_messages(sender_id);
CREATE INDEX idx_dm_receiver ON direct_messages(receiver_id);
CREATE INDEX idx_dm_participants ON direct_messages(sender_id, receiver_id);
CREATE INDEX idx_dm_created_at ON direct_messages(created_at);

-- Comments for documentation
COMMENT ON TABLE direct_messages IS 'Stores private messages between users';
COMMENT ON COLUMN direct_messages.sender_id IS 'User who sent the message';
COMMENT ON COLUMN direct_messages.receiver_id IS 'User who receives the message';
