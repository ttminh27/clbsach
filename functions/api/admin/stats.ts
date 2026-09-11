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

// GET /api/admin/stats: Dashboard metrics
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

    // Run parallel queries
    const [userCountRow, commentCountRow, reactionCountRow, distributionRows, readerCountRow, readingBooksRow] = await Promise.all([
      env.DB.prepare('SELECT COUNT(*) as count FROM users').first() as any,
      env.DB.prepare('SELECT COUNT(*) as count FROM comments WHERE is_deleted = 0').first() as any,
      env.DB.prepare('SELECT COUNT(*) as count FROM reactions').first() as any,
      env.DB.prepare('SELECT reaction_type, COUNT(*) as count FROM reactions GROUP BY reaction_type').all(),
      env.DB.prepare('SELECT COUNT(DISTINCT user_id) as count FROM reading_history').first().catch(() => ({ count: 0 })) as any,
      env.DB.prepare('SELECT COUNT(*) as count FROM reading_history').first().catch(() => ({ count: 0 })) as any,
    ]);

    const reactionDistribution: Record<string, number> = {};
    for (const row of (distributionRows.results || []) as any[]) {
      reactionDistribution[row.reaction_type] = Number(row.count) || 0;
    }

    return new Response(
      JSON.stringify({
        stats: {
          totalUsers: Number(userCountRow?.count) || 0,
          totalComments: Number(commentCountRow?.count) || 0,
          totalReactions: Number(reactionCountRow?.count) || 0,
          totalActiveReaders: Number(readerCountRow?.count) || 0,
          totalReadingBooks: Number(readingBooksRow?.count) || 0,
          reactionDistribution,
        },
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Lỗi tải số liệu thống kê.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
