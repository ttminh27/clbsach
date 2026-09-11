import { getAuthUser } from '../../../utils/crypto';

interface Env {
  DB: D1Database;
  JWT_SECRET?: string;
}

// Helper: Check admin permission
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

// GET /api/admin/users?q=...
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

    let query = `
      SELECT u.id, u.email, u.name, u.avatar, u.role, u.created_at, u.updated_at,
        (SELECT COUNT(*) FROM comments c WHERE c.user_id = u.id AND c.is_deleted = 0) as comment_count,
        (SELECT COUNT(*) FROM reactions r WHERE r.user_id = u.id) as reaction_count,
        (SELECT COUNT(*) FROM reading_history rh WHERE rh.user_id = u.id) as reading_count
      FROM users u
    `;
    let bindings: any[] = [];

    if (search) {
      query += ' WHERE u.name LIKE ? OR u.email LIKE ?';
      const term = `%${search}%`;
      bindings = [term, term];
    }

    query += ' ORDER BY u.created_at DESC LIMIT 200';

    const stmt = env.DB.prepare(query);
    const result = bindings.length > 0
      ? await stmt.bind(...bindings).all()
      : await stmt.all();

    const users = (result.results || []).map((u: any) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      avatar: u.avatar,
      role: u.role,
      createdAt: u.created_at,
      updatedAt: u.updated_at,
      commentCount: Number(u.comment_count) || 0,
      reactionCount: Number(u.reaction_count) || 0,
      readingCount: Number(u.reading_count) || 0,
    }));

    return new Response(JSON.stringify({ users }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Lỗi tải danh sách người dùng.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

// PATCH /api/admin/users: Update user role (e.g. member <-> admin)
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

    const body = await request.json() as { userId?: string; role?: 'member' | 'admin' };
    const { userId, role } = body;

    if (!userId || !role || !['member', 'admin'].includes(role)) {
      return new Response(JSON.stringify({ error: 'Dữ liệu không hợp lệ (userId, role).' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (authResult.authUser.sub === userId && role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Không thể tự hạ quyền quản trị của chính mình.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const now = new Date().toISOString();
    await env.DB.prepare('UPDATE users SET role = ?, updated_at = ? WHERE id = ?')
      .bind(role, now, userId)
      .run();

    return new Response(JSON.stringify({ success: true, message: `Đã cập nhật vai trò thành ${role}.` }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Lỗi cập nhật vai trò.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

// DELETE /api/admin/users: Delete a user
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
    const userId = url.searchParams.get('userId');

    if (!userId) {
      return new Response(JSON.stringify({ error: 'Thiếu userId cần xóa.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (authResult.authUser.sub === userId) {
      return new Response(JSON.stringify({ error: 'Không thể tự xóa tài khoản của chính mình.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Delete comments, reactions, reading history, and user
    await env.DB.batch([
      env.DB.prepare('DELETE FROM reactions WHERE user_id = ?').bind(userId),
      env.DB.prepare('DELETE FROM comments WHERE user_id = ?').bind(userId),
      env.DB.prepare('DELETE FROM reading_history WHERE user_id = ?').bind(userId),
      env.DB.prepare('DELETE FROM users WHERE id = ?').bind(userId),
    ]);

    return new Response(JSON.stringify({ success: true, message: 'Đã xóa tài khoản người dùng thành công.' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Lỗi xóa người dùng.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
