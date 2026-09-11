import { getAuthUser } from '../../utils/crypto';

interface Env {
  DB: D1Database;
  JWT_SECRET?: string;
}

interface ReadingProgressInput {
  bookId: string;
  bookTitle: string;
  lastChapterId: string;
  lastChapterTitle: string;
  lastChapterOrder?: number;
  progressPercent?: number;
  scrollRatio?: number;
  completedChapterIds?: string[];
  lastReadAt?: number;
}

// GET /api/history - Get reading history of current authenticated user
export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  try {
    const authUser = await getAuthUser(request, env.JWT_SECRET);
    if (!authUser) {
      return new Response(JSON.stringify({ error: 'Chưa đăng nhập.' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { results } = await env.DB.prepare(
      `SELECT * FROM reading_history WHERE user_id = ? ORDER BY last_read_at DESC`
    )
      .bind(authUser.sub)
      .all();

    const history: Record<string, any> = {};
    for (const row of (results || []) as any[]) {
      let completedChapterIds: string[] = [];
      try {
        completedChapterIds = JSON.parse(row.completed_chapter_ids || '[]');
      } catch {
        completedChapterIds = [];
      }

      history[row.book_id] = {
        bookId: row.book_id,
        bookTitle: row.book_title,
        lastChapterId: row.last_chapter_id,
        lastChapterTitle: row.last_chapter_title,
        lastChapterOrder: Number(row.last_chapter_order) || 0,
        progressPercent: Number(row.progress_percent) || 0,
        scrollRatio: Number(row.scroll_ratio) || 0,
        lastReadAt: Number(row.last_read_at) || Date.now(),
        completedChapterIds,
      };
    }

    return new Response(JSON.stringify({ history }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Lỗi tải lịch sử đọc sách.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

// POST /api/history - Save or batch sync reading progress
export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  try {
    const authUser = await getAuthUser(request, env.JWT_SECRET);
    if (!authUser) {
      return new Response(JSON.stringify({ error: 'Chưa đăng nhập.' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = (await request.json()) as { items?: ReadingProgressInput[] } & Partial<ReadingProgressInput>;
    const itemsToSave: ReadingProgressInput[] = Array.isArray(body.items)
      ? body.items
      : body.bookId
      ? [body as ReadingProgressInput]
      : [];

    if (itemsToSave.length === 0) {
      return new Response(JSON.stringify({ error: 'Dữ liệu tiến độ không hợp lệ.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const upsertSql = `
      INSERT INTO reading_history (
        id, user_id, book_id, book_title, last_chapter_id, last_chapter_title,
        last_chapter_order, progress_percent, scroll_ratio, completed_chapter_ids,
        last_read_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(user_id, book_id) DO UPDATE SET
        book_title = excluded.book_title,
        last_chapter_id = excluded.last_chapter_id,
        last_chapter_title = excluded.last_chapter_title,
        last_chapter_order = excluded.last_chapter_order,
        progress_percent = excluded.progress_percent,
        scroll_ratio = excluded.scroll_ratio,
        completed_chapter_ids = excluded.completed_chapter_ids,
        last_read_at = excluded.last_read_at,
        updated_at = CURRENT_TIMESTAMP
    `;

    const statements = itemsToSave.map((item) => {
      const id = `${authUser.sub}:${item.bookId}`;
      const completedJson = JSON.stringify(item.completedChapterIds || []);
      const lastReadAt = item.lastReadAt || Date.now();

      return env.DB.prepare(upsertSql).bind(
        id,
        authUser.sub,
        item.bookId,
        item.bookTitle || '',
        item.lastChapterId || '',
        item.lastChapterTitle || '',
        item.lastChapterOrder || 0,
        item.progressPercent || 0,
        item.scrollRatio || 0,
        completedJson,
        lastReadAt
      );
    });

    if (statements.length === 1) {
      await statements[0].run();
    } else {
      await env.DB.batch(statements);
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Lỗi lưu lịch sử đọc sách.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

// DELETE /api/history - Clear history for a specific book or all books
export const onRequestDelete: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  try {
    const authUser = await getAuthUser(request, env.JWT_SECRET);
    if (!authUser) {
      return new Response(JSON.stringify({ error: 'Chưa đăng nhập.' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const url = new URL(request.url);
    const bookId = url.searchParams.get('bookId');

    if (bookId) {
      await env.DB.prepare(
        'DELETE FROM reading_history WHERE user_id = ? AND book_id = ?'
      )
        .bind(authUser.sub, bookId)
        .run();
    } else {
      await env.DB.prepare('DELETE FROM reading_history WHERE user_id = ?')
        .bind(authUser.sub)
        .run();
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Lỗi xóa lịch sử đọc sách.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
