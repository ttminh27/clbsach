import { verifyPassword, signJWT } from '../../utils/crypto';

interface Env {
  DB: D1Database;
  JWT_SECRET?: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  try {
    const body = await request.json() as any;
    const { email, password } = body || {};

    if (!email || !password) {
      return new Response(JSON.stringify({ error: 'Vui lòng nhập đầy đủ Email và Mật khẩu.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Find user in D1
    const userRow = await env.DB.prepare(
      'SELECT id, email, password_hash, salt, name, avatar, role, created_at FROM users WHERE email = ?'
    )
      .bind(cleanEmail)
      .first() as any;

    if (!userRow) {
      return new Response(JSON.stringify({ error: 'Email hoặc mật khẩu không chính xác.' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Verify password
    const isMatch = await verifyPassword(password, userRow.salt, userRow.password_hash);
    if (!isMatch) {
      return new Response(JSON.stringify({ error: 'Email hoặc mật khẩu không chính xác.' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Generate JWT (30 days)
    const exp = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60;
    const token = await signJWT(
      {
        sub: userRow.id,
        email: userRow.email,
        name: userRow.name,
        avatar: userRow.avatar,
        role: userRow.role,
        exp,
      },
      env.JWT_SECRET
    );

    const user = {
      id: userRow.id,
      email: userRow.email,
      name: userRow.name,
      avatar: userRow.avatar,
      role: userRow.role,
      createdAt: userRow.created_at,
    };

    return new Response(JSON.stringify({ success: true, token, user }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    console.error('Login error:', err);
    return new Response(JSON.stringify({ error: err.message || 'Lỗi xử lý đăng nhập.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
