import { getAuthUser } from '../../utils/crypto';

interface Env {
  DB: D1Database;
  JWT_SECRET?: string;
}

export const onRequestDelete: PagesFunction<Env> = async (context) => {
  const { request, params, env } = context;
  const commentId = params.id as string;

  try {
    const authUser = await getAuthUser(request, env.JWT_SECRET);
    if (!authUser) {
      return new Response(JSON.stringify({ error: 'Vui lòng đăng nhập.' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const comment = await env.DB.prepare('SELECT id, user_id FROM comments WHERE id = ?')
      .bind(commentId)
      .first() as any;

    if (!comment) {
      return new Response(JSON.stringify({ error: 'Bình luận không tồn tại.' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (comment.user_id !== authUser.sub && authUser.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Bạn không có quyền xóa bình luận này.' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Check if it has replies: if yes, soft-delete to preserve reply chain; if no, hard delete
    const replyCountRow = await env.DB.prepare('SELECT COUNT(*) as count FROM comments WHERE parent_id = ?')
      .bind(commentId)
      .first() as any;

    const hasReplies = (replyCountRow?.count || 0) > 0;

    if (hasReplies) {
      await env.DB.prepare('UPDATE comments SET is_deleted = 1 WHERE id = ?')
        .bind(commentId)
        .run();
    } else {
      await env.DB.prepare('DELETE FROM comments WHERE id = ?')
        .bind(commentId)
        .run();
    }

    return new Response(JSON.stringify({ success: true, softDeleted: hasReplies }), {
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
