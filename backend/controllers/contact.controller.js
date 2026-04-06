const { dbRun, dbGet, dbAll } = require('../db');
const config = require('../config');
const logger = require('../utils/logger');

exports.submitContact = async (req, res) => {
  try {
    const { name, email, phone, subject, message, service_interest } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Nome, email, assunto e mensagem sao obrigatorios',
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Email invalido',
      });
    }

    const result = await dbRun(
      req.app.locals.db,
      `INSERT INTO contact_messages (name, email, phone, subject, message, service_interest)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, email, phone || '', subject, message, service_interest || '']
    );

    logger.info('Contact message received:', { name, email, subject });

    // Try to send via Formspree if configured
    if (config.formspree.endpoint && config.formspree.endpoint !== 'https://formspree.io/f/seu-id') {
      try {
        await fetch(config.formspree.endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({ name, email, subject, message, phone, service_interest }),
        });
      } catch (err) {
        logger.warn('Formspree integration failed (not critical):', err.message);
      }
    }

    const messageRecord = await dbGet(
      req.app.locals.db,
      'SELECT * FROM contact_messages WHERE id = ?',
      [result.id]
    );

    res.status(201).json({
      success: true,
      message: 'Mensagem enviada com sucesso',
      data: { message: messageRecord },
    });
  } catch (err) {
    logger.error('Contact submit error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Erro ao enviar mensagem de contato',
    });
  }
};

exports.listMessages = async (req, res) => {
  try {
    const { status, page = 1, limit = 20, search } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let sql = 'SELECT * FROM contact_messages WHERE 1=1';
    const params = [];

    if (status) {
      sql += ' AND status = ?';
      params.push(status);
    }

    if (search) {
      sql += ' AND (name LIKE ? OR email LIKE ? OR subject LIKE ? OR message LIKE ?)';
      const likeSearch = `%${search}%`;
      params.push(likeSearch, likeSearch, likeSearch, likeSearch);
    }

    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const messages = await dbAll(req.app.locals.db, sql, params);

    res.json({
      success: true,
      data: { messages, total: messages.length, page: parseInt(page), limit: parseInt(limit) },
    });
  } catch (err) {
    logger.error('List contact messages error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Erro ao listar mensagens',
    });
  }
};

exports.updateMessageStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const existing = await dbGet(req.app.locals.db, 'SELECT id FROM contact_messages WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Mensagem nao encontrada',
      });
    }

    await dbRun(
      req.app.locals.db,
      'UPDATE contact_messages SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [status, id]
    );

    res.json({
      success: true,
      message: 'Status atualizado com sucesso',
    });
  } catch (err) {
    logger.error('Update message status error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar status',
    });
  }
};
