-- ============================================================
-- V15: Community System
-- ============================================================

-- Membership table: users joining a game community
CREATE TABLE community_members (
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    game_id     BIGINT NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    joined_at   TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, game_id)
);

-- Discussion threads inside a community (differentiated from global chat)
CREATE TABLE discussion_threads (
    id          BIGSERIAL PRIMARY KEY,
    game_id     BIGINT NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    author_id   BIGINT NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    title       VARCHAR(255) NOT NULL,
    body        TEXT,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Messages inside a discussion thread
CREATE TABLE thread_messages (
    id          BIGSERIAL PRIMARY KEY,
    thread_id   BIGINT NOT NULL REFERENCES discussion_threads(id) ON DELETE CASCADE,
    user_id     BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message     TEXT NOT NULL,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_community_members_user   ON community_members(user_id);
CREATE INDEX idx_community_members_game   ON community_members(game_id);
CREATE INDEX idx_discussion_threads_game  ON discussion_threads(game_id);
CREATE INDEX idx_thread_messages_thread   ON thread_messages(thread_id);
