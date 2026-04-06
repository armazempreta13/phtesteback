import { Hono } from 'hono';
import { Ctx } from '../app';

type ChatVars = {
  Bindings: { DB: D1Database };
  Variables: { userId?: number; userRole?: string; userEmail?: string };
};

type ChatCtx = Hono<ChatVars>['$'];

export async function submitChatMessage(c: Ctx) {
  try {
    const { name, email, budget_data, message } = await c.req.json();

    if (!message) {
      return c.json({ success: false, message: 'Message is required' }, 400);
    }

    const result = await c.env.DB.prepare(
      `INSERT INTO chat_messages (name, email, budget_data, message, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, 'unread', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`
    ).bind(name || null, email || null, budget_data ? JSON.stringify(budget_data) : null, message).run();

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
    const { page = 1, limit = 20, status } = c.req.query();
    const offset = (Number(page) - 1) * Number(limit);

    let query = 'SELECT * FROM chat_messages';
    let countQuery = 'SELECT COUNT(*) as total FROM chat_messages';
    const params: string[] = [];
    const countParams: string[] = [];

    if (status) {
      query += ' WHERE status = ?';
      countQuery += ' WHERE status = ?';
      params.push(status);
      countParams.push(status);
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
