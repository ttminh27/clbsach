import { getAuthUser } from '../../utils/crypto';

interface Env {
  DB: D1Database;
  JWT_SECRET?: string;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  try {
    const authUser = await getAuthUser(request, env.JWT_SECRET);
    if (!authUser) {
      return new Response(JSON.stringify({ error: 'Chưa đăng nhập hoặc phiên làm việc đã hết hạn.' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const userRow = await env.DB.prepare(
      'SELECT id, email, name, avatar, role, created_at FROM users WHERE id = ?'
    )
      .bind(authUser.sub)
      .first() as any;

    if (!userRow) {
      return new Response(JSON.stringify({ error: 'Tài khoản không tồn tại.' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(
      JSON.stringify({
        user: {
          id: userRow.id,
          email: userRow.email,
          name: userRow.name,
          avatar: userRow.avatar,
          role: userRow.role,
          createdAt: userRow.created_at,
        },
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Lỗi kiểm tra phiên đăng nhập.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
