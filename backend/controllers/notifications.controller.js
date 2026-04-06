const { dbRun, dbGet, dbAll } = require('../db');
const logger = require('../utils/logger');

exports.listNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20, unread_only } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let sql = 'SELECT * FROM notifications WHERE user_id = ?';
    const params = [req.userId];

    if (unread_only === 'true') {
      sql += ' AND read = 0';
    }

    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const notifications = await dbAll(req.app.locals.db, sql, params);

    const countRow = await dbGet(
      req.app.locals.db,
      unread_only === 'true'
        ? 'SELECT COUNT(*) as total FROM notifications WHERE user_id = ? AND read = 0'
        : 'SELECT COUNT(*) as total FROM notifications WHERE user_id = ?',
      [req.userId]
    );

    res.json({
      success: true,
      data: {
        notifications,
        total: countRow?.total || 0,
        page: parseInt(page),
        limit: parseInt(limit),
      },
    });
  } catch (err) {
    logger.error('List notifications error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Erro ao listar notificacoes',
    });
  }
};

exports.getUnreadCount = async (req, res) => {
  try {
    const count = await dbGet(
      req.app.locals.db,
      'SELECT COUNT(*) as total FROM notifications WHERE user_id = ? AND read = 0',
      [req.userId]
    );

    res.json({
      success: true,
      data: { unread_count: count?.total || 0 },
    });
  } catch (err) {
    logger.error('Get unread count error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Erro ao contar notificacoes',
    });
  }
};

exports.createNotification = async (req, res) => {
  try {
    const { title, message, type, link } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: 'Titulo e mensagem sao obrigatorios',
      });
    }

    // Only admins can specify a target user_id; others can only notify themselves
    const isAdmin = req.userRole === 'admin';
    const targetUserId = isAdmin ? req.body.user_id : req.userId;

    if (!targetUserId) {
      return res.status(400).json({
        success: false,
        message: 'Usuario de destino nao especificado',
      });
    }

    const result = await dbRun(
      req.app.locals.db,
      `INSERT INTO notifications (user_id, title, message, type, link)
       VALUES (?, ?, ?, ?, ?)`,
      [targetUserId, title, message, type || 'info', link || '']
    );

    const notification = await dbGet(
      req.app.locals.db,
      'SELECT * FROM notifications WHERE id = ?',
      [result.id]
    );

    res.status(201).json({
      success: true,
      message: 'Notificacao criada com sucesso',
      data: { notification },
    });
  } catch (err) {
    logger.error('Create notification error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Erro ao criar notificacao',
    });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    // Ensure user can only mark their own notifications
    const notification = await dbGet(
      req.app.locals.db,
      'SELECT * FROM notifications WHERE id = ? AND user_id = ?',
      [id, req.userId]
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notificacao nao encontrada',
      });
    }

    await dbRun(req.app.locals.db, 'UPDATE notifications SET read = 1 WHERE id = ? AND user_id = ?', [id, req.userId]);

    res.json({
      success: true,
      message: 'Notificacao marcada como lida',
    });
  } catch (err) {
    logger.error('Mark as read error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Erro ao marcar notificao como lida',
    });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    await dbRun(
      req.app.locals.db,
      'UPDATE notifications SET read = 1 WHERE user_id = ? AND read = 0',
      [req.userId]
    );

    res.json({
      success: true,
      message: 'Todas as notificacoes marcadas como lidas',
    });
  } catch (err) {
    logger.error('Mark all as read error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Erro ao marcar todas como lidas',
    });
  }
};
