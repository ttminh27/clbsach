import { hashPassword, generateSalt, signJWT } from '../../utils/crypto';

interface Env {
  DB: D1Database;
  JWT_SECRET?: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  try {
    const body = await request.json() as any;
    const { email, password, name, avatar } = body || {};

    // 1. Validation
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return new Response(JSON.stringify({ error: 'Email không hợp lệ.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return new Response(JSON.stringify({ error: 'Mật khẩu phải có ít nhất 6 ký tự.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return new Response(JSON.stringify({ error: 'Vui lòng nhập tên hiển thị.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();
    const selectedAvatar = avatar || 'avatar-1';

    // 2. Check existing user
    const existing = await env.DB.prepare('SELECT id FROM users WHERE email = ?')
      .bind(cleanEmail)
      .first();

    if (existing) {
      return new Response(JSON.stringify({ error: 'Email này đã được đăng ký tài khoản.' }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 3. Hash password and insert
    const userId = crypto.randomUUID();
    const salt = generateSalt();
    const passwordHash = await hashPassword(password, salt);
    const now = new Date().toISOString();

    await env.DB.prepare(
      `INSERT INTO users (id, email, password_hash, salt, name, avatar, role, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, 'member', ?, ?)`
    )
      .bind(userId, cleanEmail, passwordHash, salt, cleanName, selectedAvatar, now, now)
      .run();

    // 4. Generate JWT Token (30 days expiration)
    const exp = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60;
    const token = await signJWT(
      {
        sub: userId,
        email: cleanEmail,
        name: cleanName,
        avatar: selectedAvatar,
        role: 'member',
        exp,
      },
      env.JWT_SECRET
    );

    const user = {
      id: userId,
      email: cleanEmail,
      name: cleanName,
      avatar: selectedAvatar,
      role: 'member',
      createdAt: now,
    };

    return new Response(JSON.stringify({ success: true, token, user }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    console.error('Register error:', err);
    return new Response(JSON.stringify({ error: err.message || 'Lỗi xử lý đăng ký tài khoản.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
