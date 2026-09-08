import { getAuthUser } from '../../utils/crypto';

interface Env {
  DB: D1Database;
  JWT_SECRET?: string;
}

// GET /api/comments?targetType=...&targetId=...
export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  try {
    const url = new URL(request.url);
    const targetType = url.searchParams.get('targetType');
    const targetId = url.searchParams.get('targetId');

    if (!targetType || !targetId) {
      return new Response(JSON.stringify({ error: 'Thiếu targetType hoặc targetId.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Check optional authenticated viewer for reaction highlights
    const authUser = await getAuthUser(request, env.JWT_SECRET);
    const viewerId = authUser?.sub || null;

    // Fetch all comments for this target with user info
    const query = `
      SELECT 
        c.id, c.target_type, c.target_id, c.book_id, c.chapter_id, c.question_id,
        c.parent_id, c.user_id, c.content, c.is_pinned, c.is_deleted,
        c.created_at, c.updated_at,
        u.name as user_name, u.avatar as user_avatar, u.role as user_role
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.target_type = ? AND c.target_id = ?
      ORDER BY c.is_pinned DESC, c.created_at ASC
    `;

    const { results } = await env.DB.prepare(query)
      .bind(targetType, targetId)
      .all();

    const commentsList = (results || []) as any[];

    // Fetch all reactions for these comments in batch
    const commentIds = commentsList.map((c) => c.id);
    let reactionsMap: Record<string, { counts: Record<string, number>; userReaction: string | null }> = {};

    if (commentIds.length > 0) {
      // In SQLite/D1, query reactions where target_type = 'comment'
      const placeholders = commentIds.map(() => '?').join(',');
      const reactionsQuery = `
        SELECT target_id, reaction_type, user_id
        FROM reactions
        WHERE target_type = 'comment' AND target_id IN (${placeholders})
      `;

      const { results: rxResults } = await env.DB.prepare(reactionsQuery)
        .bind(...commentIds)
        .all();

      const rxList = (rxResults || []) as any[];
      for (const rx of rxList) {
        if (!reactionsMap[rx.target_id]) {
          reactionsMap[rx.target_id] = { counts: {}, userReaction: null };
        }
        reactionsMap[rx.target_id].counts[rx.reaction_type] =
          (reactionsMap[rx.target_id].counts[rx.reaction_type] || 0) + 1;

        if (viewerId && rx.user_id === viewerId) {
          reactionsMap[rx.target_id].userReaction = rx.reaction_type;
        }
      }
    }

    // Build comment items
    const allItems = commentsList.map((c) => ({
      id: c.id,
      targetType: c.target_type,
      targetId: c.target_id,
      bookId: c.book_id,
      chapterId: c.chapter_id,
      questionId: c.question_id,
      parentId: c.parent_id,
      userId: c.user_id,
      userName: c.user_name,
      userAvatar: c.user_avatar,
      userRole: c.user_role,
      content: c.is_deleted ? 'Bình luận này đã bị xóa.' : c.content,
      isPinned: Boolean(c.is_pinned),
      isDeleted: Boolean(c.is_deleted),
      createdAt: c.created_at,
      updatedAt: c.updated_at,
      reactions: reactionsMap[c.id]?.counts || {},
      userReaction: reactionsMap[c.id]?.userReaction || null,
      replies: [] as any[],
    }));

    // Organize into threaded tree (top-level vs replies)
    const map = new Map<string, any>();
    allItems.forEach((c) => map.set(c.id, c));

    const topLevel: any[] = [];
    allItems.forEach((c) => {
      if (c.parentId && map.has(c.parentId)) {
        map.get(c.parentId).replies.push(c);
      } else {
        topLevel.push(c);
      }
    });

    return new Response(JSON.stringify({ comments: topLevel, total: allItems.length }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    console.error('Fetch comments error:', err);
    return new Response(JSON.stringify({ error: err.message || 'Lỗi tải danh sách bình luận.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

// POST /api/comments (Create comment or reply)
export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  try {
    const authUser = await getAuthUser(request, env.JWT_SECRET);
    if (!authUser) {
      return new Response(JSON.stringify({ error: 'Vui lòng đăng nhập để bình luận.' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = await request.json() as any;
    const { targetType, targetId, bookId, chapterId, questionId, parentId, content } = body || {};

    if (!targetType || !targetId || !bookId || !chapterId) {
      return new Response(JSON.stringify({ error: 'Thiếu thông tin vị trí sách/chương.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return new Response(JSON.stringify({ error: 'Nội dung bình luận không được để trống.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (content.length > 2000) {
      return new Response(JSON.stringify({ error: 'Nội dung bình luận tối đa 2000 ký tự.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Verify parentId if it's a reply
    if (parentId) {
      const parent = await env.DB.prepare('SELECT id FROM comments WHERE id = ?')
        .bind(parentId)
        .first();
      if (!parent) {
        return new Response(JSON.stringify({ error: 'Bình luận gốc không tồn tại.' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    const commentId = crypto.randomUUID();
    const now = new Date().toISOString();
    const cleanContent = content.trim();

    await env.DB.prepare(
      `INSERT INTO comments (
        id, target_type, target_id, book_id, chapter_id, question_id,
        parent_id, user_id, content, is_pinned, is_deleted, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, ?, ?)`
    )
      .bind(
        commentId,
        targetType,
        targetId,
        bookId,
        chapterId,
        questionId || null,
        parentId || null,
        authUser.sub,
        cleanContent,
        now,
        now
      )
      .run();

    const createdComment = {
      id: commentId,
      targetType,
      targetId,
      bookId,
      chapterId,
      questionId: questionId || null,
      parentId: parentId || null,
      userId: authUser.sub,
      userName: authUser.name,
      userAvatar: authUser.avatar,
      userRole: authUser.role,
      content: cleanContent,
      isPinned: false,
      isDeleted: false,
      createdAt: now,
      updatedAt: now,
      reactions: {},
      userReaction: null,
      replies: [],
    };

    return new Response(JSON.stringify({ success: true, comment: createdComment }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    console.error('Create comment error:', err);
    return new Response(JSON.stringify({ error: err.message || 'Lỗi gửi bình luận.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
