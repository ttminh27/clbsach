import { getAuthUser, hashPassword, generateSalt } from '../../../utils/crypto';

interface Env {
  DB: D1Database;
  JWT_SECRET?: string;
}

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

    // Verify admin role in DB
    const adminRow = await env.DB.prepare(
      'SELECT id, role FROM users WHERE id = ?'
    )
      .bind(authUser.sub)
      .first() as any;

    if (!adminRow || adminRow.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Bạn không có quyền quản trị.' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = await request.json() as { userId?: string; newPassword?: string };
    const { userId, newPassword: customPassword } = body;

    if (!userId) {
      return new Response(JSON.stringify({ error: 'Thiếu thông tin người dùng (userId).' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Check target user
    const targetUser = await env.DB.prepare(
      'SELECT id, email, name, role FROM users WHERE id = ?'
    )
      .bind(userId)
      .first() as any;

    if (!targetUser) {
      return new Response(JSON.stringify({ error: 'Không tìm thấy người dùng cần đổi mật khẩu.' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Determine new password
    let finalPassword = customPassword?.trim();
    if (!finalPassword) {
      // Auto-generate random friendly password (e.g. Clb@938271)
      const randomNum = Math.floor(100000 + Math.random() * 900000);
      finalPassword = `Clb@${randomNum}`;
    } else if (finalPassword.length < 6) {
      return new Response(JSON.stringify({ error: 'Mật khẩu mới phải có ít nhất 6 ký tự.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Hash with PBKDF2 and new salt
    const salt = generateSalt(16);
    const passwordHash = await hashPassword(finalPassword, salt);
    const now = new Date().toISOString();

    await env.DB.prepare(
      'UPDATE users SET password_hash = ?, salt = ?, updated_at = ? WHERE id = ?'
    )
      .bind(passwordHash, salt, now, userId)
      .run();

    return new Response(
      JSON.stringify({
        success: true,
        message: `Đã đặt lại mật khẩu cho tài khoản "${targetUser.name}" (${targetUser.email}) thành công.`,
        newPassword: finalPassword,
        user: {
          id: targetUser.id,
          name: targetUser.name,
          email: targetUser.email,
        },
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Lỗi đặt lại mật khẩu.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
