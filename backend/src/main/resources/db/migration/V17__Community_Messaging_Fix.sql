-- Migration to support community messaging requirements
-- 1. Add avatar_url to users table
ALTER TABLE users ADD COLUMN avatar_url VARCHAR(512);

-- 2. Ensure chat_messages matches requested schema
-- Note: V12 already created it with 'message', we rename it to 'content'
DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'chat_messages') THEN
        ALTER TABLE chat_messages RENAME COLUMN message TO content;
    ELSE
        CREATE TABLE chat_messages (
            id BIGSERIAL PRIMARY KEY,
            game_id BIGINT NOT NULL REFERENCES games(id) ON DELETE CASCADE,
            user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            content TEXT NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
        CREATE INDEX idx_chat_messages_game_id ON chat_messages(game_id);
    END IF;
END $$;
