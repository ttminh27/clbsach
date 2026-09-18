import { getAuthUser } from '../../utils/crypto';

interface Env {
  DB: D1Database;
  JWT_SECRET?: string;
}

interface HighlightPayload {
  id: string;
  bookId: string;
  chapterId: string;
  chapterTitle?: string;
  text: string;
  color?: string;
  prefix?: string;
  suffix?: string;
  paragraphIndex?: number;
  note?: string;
  createdAt?: number;
  updatedAt?: number;
}

// GET /api/highlights?bookId=...&chapterId=...
export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  try {
    const authUser = await getAuthUser(request, env.JWT_SECRET);
    if (!authUser) {
      return new Response(JSON.stringify({ error: 'Chưa đăng nhập.' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const url = new URL(request.url);
    const bookId = url.searchParams.get('bookId');
    const chapterId = url.searchParams.get('chapterId');

    let query = `SELECT * FROM highlights WHERE user_id = ?`;
    const params: any[] = [authUser.sub];

    if (bookId) {
      query += ` AND book_id = ?`;
      params.push(bookId);
    }
    if (chapterId) {
      query += ` AND chapter_id = ?`;
      params.push(chapterId);
    }

    query += ` ORDER BY created_at DESC`;

    const { results } = await env.DB.prepare(query).bind(...params).all();

    const highlights = (results || []).map((row: any) => ({
      id: row.id,
      bookId: row.book_id,
      chapterId: row.chapter_id,
      chapterTitle: row.chapter_title || '',
      text: row.text,
      color: row.color || 'yellow',
      prefix: row.prefix || '',
      suffix: row.suffix || '',
      paragraphIndex: Number(row.paragraph_index) >= 0 ? Number(row.paragraph_index) : undefined,
      note: row.note || '',
      createdAt: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
      updatedAt: row.updated_at ? new Date(row.updated_at).getTime() : Date.now(),
    }));

    return new Response(JSON.stringify({ highlights }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Lỗi tải danh sách highlight.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

// POST /api/highlights - Create, batch sync, or upsert highlights
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

    const body = (await request.json()) as { items?: HighlightPayload[] } & Partial<HighlightPayload>;
    const itemsToSave: HighlightPayload[] = Array.isArray(body.items)
      ? body.items
      : body.id && body.text
      ? [body as HighlightPayload]
      : [];

    if (itemsToSave.length === 0) {
      return new Response(JSON.stringify({ error: 'Dữ liệu highlight không hợp lệ.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const statements = itemsToSave.map((item) => {
      const id = item.id || `hl_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const color = item.color || 'yellow';
      const paragraphIdx = typeof item.paragraphIndex === 'number' ? item.paragraphIndex : -1;
      const createdAtStr = item.createdAt ? new Date(item.createdAt).toISOString() : new Date().toISOString();
      const updatedAtStr = new Date().toISOString();

      return env.DB.prepare(`
        INSERT INTO highlights (
          id, user_id, book_id, chapter_id, chapter_title, text, color,
          prefix, suffix, paragraph_index, note, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          color = excluded.color,
          note = excluded.note,
          updated_at = excluded.updated_at
      `).bind(
        id,
        authUser.sub,
        item.bookId,
        item.chapterId,
        item.chapterTitle || '',
        item.text,
        color,
        item.prefix || '',
        item.suffix || '',
        paragraphIdx,
        item.note || '',
        createdAtStr,
        updatedAtStr
      );
    });

    await env.DB.batch(statements);

    return new Response(JSON.stringify({ success: true, savedCount: itemsToSave.length }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Lỗi lưu highlight.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

// PATCH /api/highlights - Update an existing highlight's color or note
export const onRequestPatch: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  try {
    const authUser = await getAuthUser(request, env.JWT_SECRET);
    if (!authUser) {
      return new Response(JSON.stringify({ error: 'Chưa đăng nhập.' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = (await request.json()) as { id: string; color?: string; note?: string };
    if (!body.id) {
      return new Response(JSON.stringify({ error: 'Thiếu highlight ID.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const updatedAtStr = new Date().toISOString();
    let query = `UPDATE highlights SET updated_at = ?`;
    const params: any[] = [updatedAtStr];

    if (body.color !== undefined) {
      query += `, color = ?`;
      params.push(body.color);
    }
    if (body.note !== undefined) {
      query += `, note = ?`;
      params.push(body.note);
    }

    query += ` WHERE id = ? AND user_id = ?`;
    params.push(body.id, authUser.sub);

    await env.DB.prepare(query).bind(...params).run();

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Lỗi cập nhật highlight.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

// DELETE /api/highlights?id=... OR ?bookId=...
export const onRequestDelete: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  try {
    const authUser = await getAuthUser(request, env.JWT_SECRET);
    if (!authUser) {
      return new Response(JSON.stringify({ error: 'Chưa đăng nhập.' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    const bookId = url.searchParams.get('bookId');

    if (id) {
      await env.DB.prepare(`DELETE FROM highlights WHERE id = ? AND user_id = ?`)
        .bind(id, authUser.sub)
        .run();
    } else if (bookId) {
      await env.DB.prepare(`DELETE FROM highlights WHERE book_id = ? AND user_id = ?`)
        .bind(bookId, authUser.sub)
        .run();
    } else {
      return new Response(JSON.stringify({ error: 'Thiếu tham số id hoặc bookId cần xóa.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Lỗi xóa highlight.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
