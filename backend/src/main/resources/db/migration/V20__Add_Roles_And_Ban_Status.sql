-- Create roles table
CREATE TABLE roles (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(20) UNIQUE NOT NULL
);

-- Insert default roles
INSERT INTO roles (name) VALUES ('USER'), ('MODERATOR'), ('ADMIN');

-- Create user_roles join table
CREATE TABLE user_roles (
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    PRIMARY KEY (user_id, role_id),
    CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_roles_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

-- Migrate existing roles
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id 
FROM users u 
JOIN roles r ON u.role = r.name;

-- Add status column to users
ALTER TABLE users ADD COLUMN status VARCHAR(20) DEFAULT 'ACTIVE';

-- Drop the old role column
ALTER TABLE users DROP COLUMN role;
