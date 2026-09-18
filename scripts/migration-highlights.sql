-- ==============================================================================
-- Migration: Create highlights table on Cloudflare D1
-- ==============================================================================

CREATE TABLE IF NOT EXISTS highlights (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    book_id TEXT NOT NULL,
    chapter_id TEXT NOT NULL,
    chapter_title TEXT,
    text TEXT NOT NULL,
    color TEXT NOT NULL DEFAULT 'yellow',
    prefix TEXT,
    suffix TEXT,
    paragraph_index INTEGER DEFAULT -1,
    note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_highlights_user ON highlights(user_id);
CREATE INDEX IF NOT EXISTS idx_highlights_book ON highlights(user_id, book_id);
CREATE INDEX IF NOT EXISTS idx_highlights_chapter ON highlights(user_id, book_id, chapter_id);
