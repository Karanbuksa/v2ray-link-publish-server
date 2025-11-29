-- Users table
-- Хранит пользователей системы с их персональными токенами
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    personal_token TEXT UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- User inbound mappings table
-- Связывает пользователей с их инбаундами из 3x-ui
CREATE TABLE IF NOT EXISTS user_inbound_mappings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    inbound_id INTEGER NOT NULL,
    client_email TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(user_id, inbound_id, client_email)
);

-- Cache for inbound configurations
-- Кеш конфигураций инбаундов для быстрого доступа
CREATE TABLE IF NOT EXISTS inbound_cache (
    inbound_id INTEGER PRIMARY KEY,
    config TEXT NOT NULL,
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_personal_token ON users(personal_token);
CREATE INDEX IF NOT EXISTS idx_user_inbound_mappings_user_id ON user_inbound_mappings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_inbound_mappings_inbound_id ON user_inbound_mappings(inbound_id);
