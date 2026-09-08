import { getAuthUser } from '../../utils/crypto';

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

// GET /api/admin/reactions: List reactions with filters
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
    const targetType = url.searchParams.get('targetType')?.trim() || '';
    const reactionType = url.searchParams.get('reactionType')?.trim() || '';

    let query = `
      SELECT r.id, r.target_type, r.target_id, r.user_id, r.reaction_type, r.created_at,
             u.name as user_name, u.email as user_email, u.avatar as user_avatar
      FROM reactions r
      LEFT JOIN users u ON r.user_id = u.id
      WHERE 1=1
    `;
    const bindings: any[] = [];

    if (userId) {
      query += ' AND r.user_id = ?';
      bindings.push(userId);
    }

    if (targetType) {
      query += ' AND r.target_type = ?';
      bindings.push(targetType);
    }

    if (reactionType) {
      query += ' AND r.reaction_type = ?';
      bindings.push(reactionType);
    }

    query += ' ORDER BY r.created_at DESC LIMIT 200';

    const stmt = env.DB.prepare(query);
    const result = bindings.length > 0
      ? await stmt.bind(...bindings).all()
      : await stmt.all();

    const reactions = (result.results || []).map((r: any) => ({
      id: r.id,
      targetType: r.target_type,
      targetId: r.target_id,
      userId: r.user_id,
      reactionType: r.reaction_type,
      createdAt: r.created_at,
      userName: r.user_name || 'Người dùng ẩn',
      userEmail: r.user_email || '',
      userAvatar: r.user_avatar || 'cat',
    }));

    return new Response(JSON.stringify({ reactions, total: reactions.length }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Lỗi tải danh sách reactions.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

// DELETE /api/admin/reactions: Delete a reaction by id
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
    const reactionId = url.searchParams.get('reactionId');

    if (!reactionId) {
      return new Response(JSON.stringify({ error: 'Thiếu reactionId cần xóa.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    await env.DB.prepare('DELETE FROM reactions WHERE id = ?')
      .bind(reactionId)
      .run();

    return new Response(JSON.stringify({ success: true, message: 'Đã xóa reaction thành công.' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Lỗi xóa reaction.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
