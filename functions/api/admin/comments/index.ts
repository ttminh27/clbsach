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

  const adminRow = await env.DB.prepare('SELECT id, role FROM users WHERE id = ?')
    .bind(authUser.sub)
    .first() as any;

  if (!adminRow || adminRow.role !== 'admin') {
    return { error: 'Bạn không có quyền quản trị.', status: 403 };
  }

  return { authUser };
}

// GET /api/admin/comments: List comments with filter
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
    const search = url.searchParams.get('q')?.trim() || '';
    const userId = url.searchParams.get('userId')?.trim() || '';
    const bookId = url.searchParams.get('bookId')?.trim() || '';
    const status = url.searchParams.get('status') || 'all'; // 'all' | 'active' | 'deleted'

    let query = `
      SELECT c.id, c.target_type, c.target_id, c.book_id, c.chapter_id, c.question_id, c.parent_id,
             c.user_id, c.content, c.is_pinned, c.is_deleted, c.created_at, c.updated_at,
             u.name as user_name, u.email as user_email, u.avatar as user_avatar, u.role as user_role,
             (SELECT COUNT(*) FROM comments rep WHERE rep.parent_id = c.id) as reply_count,
             (SELECT COUNT(*) FROM reactions rx WHERE rx.target_id = c.id) as reaction_count
      FROM comments c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE 1=1
    `;
    const bindings: any[] = [];

    if (search) {
      query += ' AND (c.content LIKE ? OR u.name LIKE ? OR u.email LIKE ?)';
      const term = `%${search}%`;
      bindings.push(term, term, term);
    }

    if (userId) {
      query += ' AND c.user_id = ?';
      bindings.push(userId);
    }

    if (bookId) {
      query += ' AND c.book_id = ?';
      bindings.push(bookId);
    }

    if (status === 'active') {
      query += ' AND c.is_deleted = 0';
    } else if (status === 'deleted') {
      query += ' AND c.is_deleted = 1';
    }

    query += ' ORDER BY c.created_at DESC LIMIT 200';

    const stmt = env.DB.prepare(query);
    const result = bindings.length > 0
      ? await stmt.bind(...bindings).all()
      : await stmt.all();

    const comments = (result.results || []).map((c: any) => ({
      id: c.id,
      targetType: c.target_type,
      targetId: c.target_id,
      bookId: c.book_id,
      chapterId: c.chapter_id,
      questionId: c.question_id,
      parentId: c.parent_id,
      userId: c.user_id,
      userName: c.user_name || 'Người dùng ẩn',
      userEmail: c.user_email || '',
      userAvatar: c.user_avatar || 'cat',
      userRole: c.user_role || 'member',
      content: c.content,
      isPinned: Boolean(c.is_pinned),
      isDeleted: Boolean(c.is_deleted),
      createdAt: c.created_at,
      updatedAt: c.updated_at,
      replyCount: Number(c.reply_count) || 0,
      reactionCount: Number(c.reaction_count) || 0,
    }));

    return new Response(JSON.stringify({ comments, total: comments.length }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Lỗi tải danh sách bình luận.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

// PATCH /api/admin/comments: Toggle pin or restore/soft-delete comment
export const onRequestPatch: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  try {
    const authResult = await checkAdmin(request, env);
    if ('error' in authResult) {
      return new Response(JSON.stringify({ error: authResult.error }), {
        status: authResult.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = await request.json() as {
      commentId?: string;
      isPinned?: boolean;
      isDeleted?: boolean;
    };
    const { commentId, isPinned, isDeleted } = body;

    if (!commentId) {
      return new Response(JSON.stringify({ error: 'Thiếu commentId.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const updates: string[] = [];
    const bindings: any[] = [];

    if (typeof isPinned === 'boolean') {
      updates.push('is_pinned = ?');
      bindings.push(isPinned ? 1 : 0);
    }

    if (typeof isDeleted === 'boolean') {
      updates.push('is_deleted = ?');
      bindings.push(isDeleted ? 1 : 0);
    }

    if (updates.length === 0) {
      return new Response(JSON.stringify({ error: 'Không có trường nào để cập nhật.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    updates.push('updated_at = ?');
    bindings.push(new Date().toISOString());
    bindings.push(commentId);

    await env.DB.prepare(`UPDATE comments SET ${updates.join(', ')} WHERE id = ?`)
      .bind(...bindings)
      .run();

    return new Response(JSON.stringify({ success: true, message: 'Đã cập nhật bình luận thành công.' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Lỗi cập nhật bình luận.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

// DELETE /api/admin/comments: Hard-delete a comment permanently
export const onRequestDelete: PagesFunction<Env> = async (context) => {
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
    const commentId = url.searchParams.get('commentId');

    if (!commentId) {
      return new Response(JSON.stringify({ error: 'Thiếu commentId cần xóa.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Delete reactions on this comment, child replies, and comment itself
    await env.DB.batch([
      env.DB.prepare('DELETE FROM reactions WHERE target_type = "comment" AND target_id = ?').bind(commentId),
      env.DB.prepare('DELETE FROM comments WHERE parent_id = ?').bind(commentId),
      env.DB.prepare('DELETE FROM comments WHERE id = ?').bind(commentId),
    ]);

    return new Response(JSON.stringify({ success: true, message: 'Đã xóa vĩnh viễn bình luận.' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Lỗi xóa bình luận.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
