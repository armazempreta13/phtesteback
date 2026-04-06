import type { Ctx } from '../app';

// ============================================================
// GET NOTIFICATIONS — user's own only
// ============================================================
export async function getNotifications(c: Ctx) {
  try {
    const db = c.env.DB;
    const userId = c.get('userId');
    const userRole = c.get('userRole');

    let rows: any[];

    // Check unread count request
    const url = new URL(c.req.url);
    if (url.pathname.endsWith('/unread/count')) {
      const result = await db.prepare(
        'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND read = 0'
      ).bind(userId).first();
      return c.json({ success: true, data: { unreadCount: result?.count || 0 } });
    }

    if (userRole === 'admin') {
      // Admin can see all if filtered by query param, otherwise own
      const query = c.req.query('user_id');
      if (query && userRole === 'admin') {
        const result = await db.prepare(
          'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 100'
        ).bind(Number(query)).all();
        rows = result.results || [];
      } else {
        const result = await db.prepare(
          'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 100'
        ).bind(userId).all();
        rows = result.results || [];
      }
    } else {
      const result = await db.prepare(
        'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 100'
      ).bind(userId).all();
      rows = result.results || [];
    }

    return c.json({ success: true, data: { notifications: rows } });
  } catch (err) {
    console.error('Get notifications error:', err);
    return c.json({ success: false, message: 'Erro ao buscar notificacoes' }, 500);
  }
}

// ============================================================
// CREATE NOTIFICATION — admin only (validated in routes)
// ============================================================
export async function createNotification(c: Ctx) {
  try {
    const db = c.env.DB;
    const body = await c.req.json();
    const { user_id, title, message, type, link } = body;

    if (!title || !message) {
      return c.json({ success: false, message: 'Titulo e mensagem sao obrigatorios' }, 400);
    }

    // target user_id must be specified and the notifier is admin (enforced by middleware)
    const targetUserId = Number(user_id);
    if (!targetUserId) {
      return c.json({ success: false, message: 'user_id e obrigatorio' }, 400);
    }

    const validTypes = ['info', 'warning', 'success', 'error'];
    const cleanType = validTypes.includes(type) ? type : 'info';

    const result = await db.prepare(
      'INSERT INTO notifications (user_id, title, message, type, link) VALUES (?, ?, ?, ?, ?)'
    ).bind(targetUserId, title.substring(0, 255), message.substring(0, 2000), cleanType, link || null).run();

    return c.json({ success: true, data: { id: result.meta.last_row_id } }, 201);
  } catch (err) {
    console.error('Create notification error:', err);
    return c.json({ success: false, message: 'Erro ao criar notificacao' }, 500);
  }
}

// ============================================================
// MARK AS READ — ownership enforced
// ============================================================
export async function markAsRead(c: Ctx) {
  try {
    const db = c.env.DB;
    const userId = c.get('userId');
    const id = Number(c.req.param('id'));

    const result = await db.prepare(
      'UPDATE notifications SET read = 1 WHERE id = ? AND user_id = ?'
    ).bind(id, userId).run();

    if (result.meta.changes === 0) {
      return c.json({ success: false, message: 'Notificacao nao encontrada' }, 404);
    }

    return c.json({ success: true, message: 'Notificacao marcada como lida' });
  } catch (err) {
    console.error('Mark as read error:', err);
    return c.json({ success: false, message: 'Erro ao marcar notificacao' }, 500);
  }
}

// ============================================================
// MARK ALL AS READ — ownership enforced
// ============================================================
export async function markAllAsRead(c: Ctx) {
  try {
    const db = c.env.DB;
    const userId = c.get('userId');

    await db.prepare(
      'UPDATE notifications SET read = 1 WHERE user_id = ? AND read = 0'
    ).bind(userId).run();

    return c.json({ success: true, message: 'Todas as notificacoes marcadas como lidas' });
  } catch (err) {
    console.error('Mark all as read error:', err);
    return c.json({ success: false, message: 'Erro ao marcar notificacoes' }, 500);
  }
}
