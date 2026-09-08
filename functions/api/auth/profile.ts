import { getAuthUser, signJWT } from '../../utils/crypto';

interface Env {
  DB: D1Database;
  JWT_SECRET?: string;
}

export const onRequestPut: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  try {
    const authUser = await getAuthUser(request, env.JWT_SECRET);
    if (!authUser) {
      return new Response(JSON.stringify({ error: 'Vui lòng đăng nhập.' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = await request.json() as any;
    const { name, avatar } = body || {};

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return new Response(JSON.stringify({ error: 'Tên hiển thị không được để trống.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const cleanName = name.trim();
    const cleanAvatar = avatar || authUser.avatar;
    const now = new Date().toISOString();

    await env.DB.prepare(
      'UPDATE users SET name = ?, avatar = ?, updated_at = ? WHERE id = ?'
    )
      .bind(cleanName, cleanAvatar, now, authUser.sub)
      .run();

    const exp = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60;
    const newToken = await signJWT(
      {
        sub: authUser.sub,
        email: authUser.email,
        name: cleanName,
        avatar: cleanAvatar,
        role: authUser.role,
        exp,
      },
      env.JWT_SECRET
    );

    return new Response(
      JSON.stringify({
        success: true,
        token: newToken,
        user: {
          id: authUser.sub,
          email: authUser.email,
          name: cleanName,
          avatar: cleanAvatar,
          role: authUser.role,
        },
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Lỗi cập nhật hồ sơ.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
