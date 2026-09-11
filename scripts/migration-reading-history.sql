-- ==============================================================================
-- CLB Đọc Sách - Migration: Add reading_history Table
-- ==============================================================================

CREATE TABLE IF NOT EXISTS reading_history (
    id TEXT PRIMARY KEY,                             -- '${user_id}:${book_id}'
    user_id TEXT NOT NULL,                           -- Khóa ngoại liên kết users(id)
    book_id TEXT NOT NULL,                           -- ID tựa sách
    book_title TEXT NOT NULL,                        -- Tên tựa sách
    last_chapter_id TEXT NOT NULL,                   -- ID chương đang đọc gần nhất
    last_chapter_title TEXT NOT NULL,                -- Tiêu đề chương gần nhất
    last_chapter_order INTEGER NOT NULL DEFAULT 0,   -- Thứ tự chương
    progress_percent INTEGER NOT NULL DEFAULT 0,     -- % hoàn thành (0 - 100)
    scroll_ratio REAL NOT NULL DEFAULT 0,            -- Tỉ lệ cuộn trang (0 - 1)
    completed_chapter_ids TEXT NOT NULL DEFAULT '[]',-- JSON Array chứa danh sách chapter id đã hoàn thành
    last_read_at INTEGER NOT NULL,                  -- Unix timestamp (ms)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, book_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_reading_history_user ON reading_history(user_id, last_read_at DESC);
CREATE INDEX IF NOT EXISTS idx_reading_history_book ON reading_history(book_id);
