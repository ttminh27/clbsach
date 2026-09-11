import { getAuthUser } from '../../../utils/crypto';

interface Env {
  DB: D1Database;
  JWT_SECRET?: string;
}

async function checkAdmin(request: Request, env: Env) {
  const authUser = await getAuthUser(request, env.JWT_SECRET);
  if (!authUser) {
    return { error: 'Chưa đăng nhập.', status: 401 };
  }

  const adminRow = (await env.DB.prepare('SELECT id, role FROM users WHERE id = ?')
    .bind(authUser.sub)
    .first()) as any;

  if (!adminRow || adminRow.role !== 'admin') {
    return { error: 'Bạn không có quyền quản trị.', status: 403 };
  }

  return { authUser };
}

// GET /api/admin/reading-progress
export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  try {
    const authResult = await checkAdmin(request, env);
    if ('error' in authResult) {
      return new Response(JSON.stringify({ error: authResult.error }), {
        status: authResult.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const url = new URL(request.url);
    const userId = url.searchParams.get('userId')?.trim() || '';
    const bookId = url.searchParams.get('bookId')?.trim() || '';
    const search = url.searchParams.get('q')?.trim() || '';

    let query = `
      SELECT
        rh.id,
        rh.user_id,
        u.name as user_name,
        u.email as user_email,
        u.avatar as user_avatar,
        u.role as user_role,
        rh.book_id,
        rh.book_title,
        rh.last_chapter_id,
        rh.last_chapter_title,
        rh.last_chapter_order,
        rh.progress_percent,
        rh.scroll_ratio,
        rh.completed_chapter_ids,
        rh.last_read_at,
        rh.created_at,
        rh.updated_at
      FROM reading_history rh
      JOIN users u ON rh.user_id = u.id
      WHERE 1=1
    `;
    const bindings: any[] = [];

    if (userId) {
      query += ' AND rh.user_id = ?';
      bindings.push(userId);
    }

    if (bookId) {
      query += ' AND rh.book_id = ?';
      bindings.push(bookId);
    }

    if (search) {
      query += ' AND (u.name LIKE ? OR u.email LIKE ? OR rh.book_title LIKE ?)';
      const term = `%${search}%`;
      bindings.push(term, term, term);
    }

    query += ' ORDER BY rh.last_read_at DESC LIMIT 300';

    const stmt = env.DB.prepare(query);
    const result = bindings.length > 0 ? await stmt.bind(...bindings).all() : await stmt.all();

    const items = (result.results || []).map((row: any) => {
      let completedChapterIds: string[] = [];
      try {
        completedChapterIds = JSON.parse(row.completed_chapter_ids || '[]');
      } catch {
        completedChapterIds = [];
      }

      return {
        id: row.id,
        userId: row.user_id,
        userName: row.user_name,
        userEmail: row.user_email,
        userAvatar: row.user_avatar,
        userRole: row.user_role,
        bookId: row.book_id,
        bookTitle: row.book_title,
        lastChapterId: row.last_chapter_id,
        lastChapterTitle: row.last_chapter_title,
        lastChapterOrder: Number(row.last_chapter_order) || 0,
        progressPercent: Number(row.progress_percent) || 0,
        scrollRatio: Number(row.scroll_ratio) || 0,
        completedChapterIds,
        lastReadAt: Number(row.last_read_at) || 0,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };
    });

    return new Response(JSON.stringify({ items, total: items.length }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Lỗi tải tiến độ đọc của người dùng.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
