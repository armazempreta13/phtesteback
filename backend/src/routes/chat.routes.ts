import { Hono } from 'hono';
import { Ctx } from '../app';

type ChatVars = {
  Bindings: { DB: D1Database };
  Variables: { userId?: number; userRole?: string; userEmail?: string };
};

type ChatCtx = Hono<ChatVars>['$'];

export async function submitChatMessage(c: Ctx) {
  try {
    const body = await c.req.json();
    const { name, email, message } = body;
    const budget_data = body.budget_data ? { ...body.budget_data, session_id: body.session_id || null } : { session_id: body.session_id || null };

    if (!message) {
      return c.json({ success: false, message: 'Message is required' }, 400);
    }

    const result = await c.env.DB.prepare(
      `INSERT INTO chat_messages (name, email, budget_data, message, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, 'unread', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`
    ).bind(name || null, email || null, JSON.stringify(budget_data), message).run();

    return c.json({
      success: true,
      message: 'Message saved successfully',
      id: result.meta?.last_row_id,
    }, 201);
  } catch (error: any) {
    console.error('Error saving chat message:', error);
    return c.json({ success: false, message: 'Failed to save message' }, 500);
  }
}

export async function listChatMessages(c: Ctx) {
  try {
    const { page = 1, limit = 20, status, email } = c.req.query();
    const offset = (Number(page) - 1) * Number(limit);

    let query = 'SELECT * FROM chat_messages';
    let countQuery = 'SELECT COUNT(*) as total FROM chat_messages';
    const params: string[] = [];
    const countParams: string[] = [];

    const conditions: string[] = [];
    if (status) {
      conditions.push('status = ?');
      params.push(status);
      countParams.push(status);
    }
    if (email) {
      conditions.push('email = ?');
      params.push(email.toLowerCase());
      countParams.push(email.toLowerCase());
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
      countQuery += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(String(limit), String(offset));

    const [messages, countResult] = await Promise.all([
      c.env.DB.prepare(query).bind(...params).all(),
      c.env.DB.prepare(countQuery).bind(...countParams).first<{ total: number }>(),
    ]);

    return c.json({
      success: true,
      messages: messages.results,
      total: countResult?.total || 0,
      page: Number(page),
      limit: Number(limit),
    });
  } catch (error: any) {
    console.error('Error listing chat messages:', error);
    return c.json({ success: false, message: 'Failed to fetch messages' }, 500);
  }
}

export async function replyToChatMessage(c: Ctx) {
  try {
    const id = c.req.param('id');
    const { admin_reply } = await c.req.json();

    if (!admin_reply) {
      return c.json({ success: false, message: 'Reply is required' }, 400);
    }

    await c.env.DB.prepare(
      `UPDATE chat_messages SET admin_reply = ?, status = 'replied', updated_at = CURRENT_TIMESTAMP WHERE id = ?`
    ).bind(admin_reply, id).run();

    const updated = await c.env.DB.prepare(
      'SELECT * FROM chat_messages WHERE id = ?'
    ).bind(id).first();

    return c.json({ success: true, message: updated });
  } catch (error: any) {
    console.error('Error replying to chat message:', error);
    return c.json({ success: false, message: 'Failed to send reply' }, 500);
  }
}

// ============================================================
// GET PUBLIC MESSAGES — session_id or email lookup
// Used by frontend to show admin replies to the user
// Accepts: session_id, email, or name (any combination, at least one required)
// ============================================================
export async function getPublicMessages(c: Ctx['$']) {
  try {
    const session_id = c.req.query('session_id');
    const email = c.req.query('email');
    const name = c.req.query('name');

    // Need at least one identifier
    if (!session_id && !email && !name) {
      return c.json({ success: false, message: 'At least one identifier is required (session_id, email, or name)' }, 400);
    }

    const conditions: string[] = [];
    const params: string[] = [];

    // Since session_id is stored inside budget_data JSON,
    // we match by email, name, or session_id inside budget_data
    if (session_id && !email && !name) {
      // Anonymous user: check budget_data for session_id
      conditions.push('json_extract(budget_data, "$.session_id") = ?');
      params.push(session_id);
    } else if (session_id) {
      // Session + email/name: match any identifier
      conditions.push(`((email = ?) OR (name = ?) OR (json_extract(budget_data, "$.session_id") = ?))`);
      params.push(email?.toLowerCase() || '', name || '', session_id);
      if (email && name) {
        // When we have both, the OR still works
      }
    } else {
      // No session_id: match by email or name
      if (email && name) {
        conditions.push('(email = ? OR name = ?)');
        params.push(email.toLowerCase(), name);
      } else if (email) {
        conditions.push('(email = ? OR name = ?)');
        params.push(email.toLowerCase(), email.toLowerCase());
      } else {
        conditions.push('name = ?');
        params.push(name);
      }
    }

    // Only return messages that have admin replies
    conditions.push('admin_reply IS NOT NULL AND admin_reply != ""');

    const messages = await c.env.DB.prepare(
      `SELECT id, name, email, message, admin_reply, status, created_at
       FROM chat_messages
       WHERE ${conditions.join(' AND ')}
       ORDER BY created_at DESC
       LIMIT 20`
    ).bind(...params).all();

    return c.json({
      success: true,
      messages: messages.results || [],
      total: messages.results?.length || 0,
    });
  } catch (error: any) {
    console.error('Error getting public messages:', error);
    return c.json({ success: false, message: 'Failed to fetch messages' }, 500);
  }
}

// ============================================================
// GET UNREAD COUNT — by session_id or email
// ============================================================
export async function getUnreadCount(c: Ctx['$']) {
  try {
    const email = c.req.query('email');
    const session_id = c.req.query('session_id');

    let query = `SELECT COUNT(*) as total FROM chat_messages WHERE admin_reply IS NOT NULL AND admin_reply != ''`;
    const params: string[] = [];

    if (session_id) {
      query += ' AND json_extract(budget_data, "$.session_id") = ?';
      params.push(session_id);
    } else if (email) {
      query += ' AND (email = ? OR name = ?)';
      params.push(email.toLowerCase(), email.toLowerCase());
    } else {
      return c.json({ success: false, message: 'Email or session_id required' }, 400);
    }

    const result = await c.env.DB.prepare(query).bind(...params).first<{ total: number }>();

    return c.json({
      success: true,
      data: { unread: result?.total || 0 },
    });
  } catch (error: any) {
    console.error('Error getting unread count:', error);
    return c.json({ success: false, message: 'Failed to get unread count', count: 0 }, 200);
  }
}

// ============================================================
// GET CHAT STATISTICS — for admin dashboard
// ============================================================
export async function getChatStats(c: Ctx) {
  try {
    const stats = await c.env.DB.prepare(
      `SELECT
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'unread' THEN 1 END) as unread,
        COUNT(CASE WHEN status = 'read' THEN 1 END) as read,
        COUNT(CASE WHEN status = 'replied' THEN 1 END) as replied,
        COUNT(CASE WHEN created_at >= date('now', '-7 days') THEN 1 END) as this_week,
        COUNT(CASE WHEN created_at >= date('now', '-30 days') THEN 1 END) as this_month
       FROM chat_messages`
    ).first();

    return c.json({ success: true, data: stats });
  } catch (error: any) {
    console.error('Error getting chat stats:', error);
    return c.json({ success: false, message: 'Failed to get chat stats' }, 500);
  }
}
