-- ─────────────────────────────────────────────────────────────────────────────
-- V15: Upgrade chat_messages to support threaded conversations at scale
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Thread support: self-referencing FK so any message can be a reply
ALTER TABLE chat_messages
    ADD COLUMN IF NOT EXISTS thread_id BIGINT,
    ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS edited_at TIMESTAMP WITH TIME ZONE;

-- FK: thread_id points to the root message of the thread
ALTER TABLE chat_messages
    ADD CONSTRAINT fk_chat_thread
        FOREIGN KEY (thread_id) REFERENCES chat_messages(id) ON DELETE SET NULL;

-- 2. Indexes for high-volume cursor-based pagination
--    Primary query: top-level messages for a game, newest first
CREATE INDEX IF NOT EXISTS idx_chat_game_thread_null
    ON chat_messages (game_id, id DESC)
    WHERE thread_id IS NULL AND is_deleted = FALSE;

--    Thread replies: all replies for a given root, oldest first
CREATE INDEX IF NOT EXISTS idx_chat_thread_replies
    ON chat_messages (thread_id, id ASC)
    WHERE is_deleted = FALSE;

--    User history: all messages sent by a user across games
CREATE INDEX IF NOT EXISTS idx_chat_user_id
    ON chat_messages (user_id, created_at DESC)
    WHERE is_deleted = FALSE;

--    Time-range queries on a per-game basis
CREATE INDEX IF NOT EXISTS idx_chat_game_created
    ON chat_messages (game_id, created_at DESC);

-- 3. Partial index to make soft-delete lookups cheap
CREATE INDEX IF NOT EXISTS idx_chat_not_deleted
    ON chat_messages (game_id, thread_id, id)
    WHERE is_deleted = FALSE;
