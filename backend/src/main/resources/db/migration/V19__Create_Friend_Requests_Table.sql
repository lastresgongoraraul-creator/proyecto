-- Friend Requests table
CREATE TABLE friend_requests (
    id BIGSERIAL PRIMARY KEY,
    sender_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(sender_id, receiver_id)
);

CREATE INDEX idx_fr_sender ON friend_requests(sender_id);
CREATE INDEX idx_fr_receiver ON friend_requests(receiver_id);
CREATE INDEX idx_fr_status ON friend_requests(status);
