import { getAuthUser } from '../../utils/crypto';

interface Env {
  DB: D1Database;
  JWT_SECRET?: string;
}

// GET /api/reactions?targetType=...&targetId=...
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

    const authUser = await getAuthUser(request, env.JWT_SECRET);
    const viewerId = authUser?.sub || null;

    // Fetch all reactions for this target
    const { results } = await env.DB.prepare(
      'SELECT reaction_type, user_id FROM reactions WHERE target_type = ? AND target_id = ?'
    )
      .bind(targetType, targetId)
      .all();

    const rows = (results || []) as any[];
    const counts: Record<string, number> = {};
    const userReactions: string[] = [];

    for (const r of rows) {
      counts[r.reaction_type] = (counts[r.reaction_type] || 0) + 1;
      if (viewerId && r.user_id === viewerId && !userReactions.includes(r.reaction_type)) {
        userReactions.push(r.reaction_type);
      }
    }

    return new Response(
      JSON.stringify({
        targetType,
        targetId,
        counts,
        userReactions,
        total: rows.length,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (err: any) {
    console.error('Fetch reactions error:', err);
    return new Response(JSON.stringify({ error: err.message || 'Lỗi tải cảm xúc.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

// POST /api/reactions (Toggle reaction)
export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  try {
    const authUser = await getAuthUser(request, env.JWT_SECRET);
    if (!authUser) {
      return new Response(JSON.stringify({ error: 'Vui lòng đăng nhập để thả cảm xúc.' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = await request.json() as any;
    const { targetType, targetId, reactionType } = body || {};

    const validReactions = ['like', 'love', 'heart', 'haha', 'surprise', 'cry', 'angry', 'insightful', 'clap', 'mindblown'];
    if (!validReactions.includes(reactionType)) {
      return new Response(JSON.stringify({ error: 'Loại cảm xúc không hợp lệ.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!targetType || !targetId) {
      return new Response(JSON.stringify({ error: 'Thiếu thông tin đối tượng.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Check if user already reacted with this type
    const existing = await env.DB.prepare(
      'SELECT id FROM reactions WHERE target_type = ? AND target_id = ? AND user_id = ? AND reaction_type = ?'
    )
      .bind(targetType, targetId, authUser.sub, reactionType)
      .first();

    let action = 'added';
    if (existing) {
      // Remove (toggle off)
      await env.DB.prepare(
        'DELETE FROM reactions WHERE target_type = ? AND target_id = ? AND user_id = ? AND reaction_type = ?'
      )
        .bind(targetType, targetId, authUser.sub, reactionType)
        .run();
      action = 'removed';
    } else {
      // Insert new reaction
      const rxId = crypto.randomUUID();
      const now = new Date().toISOString();
      await env.DB.prepare(
        'INSERT INTO reactions (id, target_type, target_id, user_id, reaction_type, created_at) VALUES (?, ?, ?, ?, ?, ?)'
      )
        .bind(rxId, targetType, targetId, authUser.sub, reactionType, now)
        .run();
      action = 'added';
    }

    // Return updated reaction stats
    const { results } = await env.DB.prepare(
      'SELECT reaction_type, user_id FROM reactions WHERE target_type = ? AND target_id = ?'
    )
      .bind(targetType, targetId)
      .all();

    const rows = (results || []) as any[];
    const counts: Record<string, number> = {};
    const userReactions: string[] = [];

    for (const r of rows) {
      counts[r.reaction_type] = (counts[r.reaction_type] || 0) + 1;
      if (r.user_id === authUser.sub && !userReactions.includes(r.reaction_type)) {
        userReactions.push(r.reaction_type);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        action,
        reactionType,
        counts,
        userReactions,
        total: rows.length,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (err: any) {
    console.error('Toggle reaction error:', err);
    return new Response(JSON.stringify({ error: err.message || 'Lỗi xử lý cảm xúc.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
