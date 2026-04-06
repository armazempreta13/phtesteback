const crypto = require('crypto');
const { dbRun, dbGet, dbAll } = require('../db');
const logger = require('../utils/logger');

exports.createTransaction = async (req, res) => {
  try {
    const { amount, type, project_id, description, payment_method } = req.body;
    const userId = req.userId;

    if (!amount || !type) {
      return res.status(400).json({
        success: false,
        message: 'Valor e tipo sao obrigatorios',
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valor deve ser positivo',
      });
    }

    // Generate PIX code and key (simulated - integrate with real PIX provider in production)
    const pixCode = 'PIX-' + crypto.randomBytes(8).toString('hex').toUpperCase();
    const pixKey = 'pix-key-' + crypto.randomBytes(6).toString('hex');

    const result = await dbRun(
      req.app.locals.db,
      `INSERT INTO transactions (user_id, project_id, amount, type, status, pix_code, pix_key, payment_method, description)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        project_id || null,
        amount,
        type,
        'pending',
        pixCode,
        pixKey,
        payment_method || 'pix',
        description || '',
      ]
    );

    const transaction = await dbGet(
      req.app.locals.db,
      'SELECT * FROM transactions WHERE id = ?',
      [result.id]
    );

    logger.info('Transaction created:', { id: result.id, userId, amount });

    res.status(201).json({
      success: true,
      message: 'Transacao criada com sucesso',
      data: { transaction },
    });
  } catch (err) {
    logger.error('Create transaction error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Erro ao criar transacao',
    });
  }
};

exports.listTransactions = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const isAdmin = req.userRole === 'admin';
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let sql = 'SELECT t.*, u.name as user_name FROM transactions t LEFT JOIN users u ON t.user_id = u.id WHERE 1=1';
    const params = [];

    if (!isAdmin) {
      sql += ' AND t.user_id = ?';
      params.push(req.userId);
    }

    if (status) {
      sql += ' AND t.status = ?';
      params.push(status);
    }

    sql += ' ORDER BY t.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const transactions = await dbAll(req.app.locals.db, sql, params);

    res.json({
      success: true,
      data: { transactions, total: transactions.length, page: parseInt(page), limit: parseInt(limit) },
    });
  } catch (err) {
    logger.error('List transactions error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Erro ao listar transacoes',
    });
  }
};

exports.getTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const isAdmin = req.userRole === 'admin';

    let sql;
    let params;
    if (isAdmin) {
      sql = 'SELECT * FROM transactions WHERE id = ?';
      params = [id];
    } else {
      sql = 'SELECT * FROM transactions WHERE id = ? AND user_id = ?';
      params = [id, req.userId];
    }

    const transaction = await dbGet(req.app.locals.db, sql, params);
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transacao nao encontrada',
      });
    }

    res.json({
      success: true,
      data: { transaction },
    });
  } catch (err) {
    logger.error('Get transaction error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar transacao',
    });
  }
};

exports.webhookPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, external_id, event_type } = req.body;

    const transaction = await dbGet(req.app.locals.db, 'SELECT * FROM transactions WHERE id = ?', [id]);
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transacao nao encontrada',
      });
    }

    const newStatus = status || 'approved';
    const validStatuses = ['pending', 'approved', 'rejected', 'refunded', 'charged_back'];

    if (!validStatuses.includes(newStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Status invalido',
      });
    }

    await dbRun(
      req.app.locals.db,
      'UPDATE transactions SET status = ?, updated_at = CURRENT_TIMESTAMP, external_id = ? WHERE id = ?',
      [newStatus, external_id || transaction.external_id, id]
    );

    logger.info('Transaction webhook - status updated:', { id, newStatus, event_type });

    // If payment approved, send notification to user
    if (newStatus === 'approved') {
      await dbRun(
        req.app.locals.db,
        `INSERT INTO notifications (user_id, title, message, type, link)
         VALUES (?, ?, ?, ?, ?)`,
        [
          transaction.user_id,
          'Pagamento Confirmado',
          `Seu pagamento de R$ ${transaction.amount.toFixed(2)} foi confirmado com sucesso.`,
          'success',
          `/transactions/${id}`,
        ]
      );
    }

    res.json({
      success: true,
      message: 'Status do webhook processado',
      data: { transaction_id: id, status: newStatus },
    });
  } catch (err) {
    logger.error('Webhook error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Erro ao processar webhook',
    });
  }
};
