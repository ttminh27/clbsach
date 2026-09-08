-- ==============================================================================
-- CLB Đọc Sách - Cloudflare D1 Database Schema
-- ==============================================================================

-- 1. Bảng Quản lý Người dùng (Users)
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    salt TEXT NOT NULL,
    name TEXT NOT NULL,
    avatar TEXT NOT NULL,
    role TEXT DEFAULT 'member',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 2. Bảng Bình luận (Comments) - Hỗ trợ phân cấp / lồng nhau
CREATE TABLE IF NOT EXISTS comments (
    id TEXT PRIMARY KEY,
    target_type TEXT NOT NULL,                 -- 'chapter' | 'quiz_question'
    target_id TEXT NOT NULL,                   -- '${bookId}:${chapterId}' hoặc '${bookId}:${chapterId}:${questionId}'
    book_id TEXT NOT NULL,
    chapter_id TEXT NOT NULL,
    question_id TEXT,
    parent_id TEXT DEFAULT NULL,               -- NULL nếu là comment gốc, id nếu là reply
    user_id TEXT NOT NULL,
    content TEXT NOT NULL,
    is_pinned BOOLEAN DEFAULT 0,
    is_deleted BOOLEAN DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_comments_target ON comments(target_type, target_id, created_at);
CREATE INDEX IF NOT EXISTS idx_comments_parent ON comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_comments_user ON comments(user_id);

-- 3. Bảng Cảm xúc (Reactions) - Cho chapter, quiz question, và comment
CREATE TABLE IF NOT EXISTS reactions (
    id TEXT PRIMARY KEY,
    target_type TEXT NOT NULL,                 -- 'chapter' | 'quiz_question' | 'comment'
    target_id TEXT NOT NULL,                   -- target_id hoặc comment_id
    user_id TEXT NOT NULL,
    reaction_type TEXT NOT NULL,               -- 'like' | 'heart' | 'insightful' | 'clap' | 'mindblown'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(target_type, target_id, user_id, reaction_type),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_reactions_lookup ON reactions(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_reactions_user ON reactions(user_id, target_id);
