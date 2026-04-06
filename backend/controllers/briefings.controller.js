const { dbRun, dbGet, dbAll } = require('../db');
const logger = require('../utils/logger');

exports.createBriefing = async (req, res) => {
  try {
    const { name, email, phone, company, project_type, description, budget_range, deadline, project_references, references, features } = req.body;
    const refs = project_references || references || '';

    if (!name || !email || !description) {
      return res.status(400).json({
        success: false,
        message: 'Nome, email e descricao sao obrigatorios',
      });
    }

    const result = await dbRun(
      req.app.locals.db,
      `INSERT INTO briefings (user_id, name, email, phone, company, project_type, description, budget_range, deadline, project_references, features)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.userId || null,
        name,
        email,
        phone || '',
        company || '',
        project_type || '',
        description,
        budget_range || '',
        deadline || '',
        Array.isArray(refs) ? JSON.stringify(refs) : refs,
        Array.isArray(features) ? JSON.stringify(features) : features || '',
      ]
    );

    const briefing = await dbGet(
      req.app.locals.db,
      'SELECT * FROM briefings WHERE id = ?',
      [result.id]
    );

    logger.info('Briefing submitted:', { name, email, project_type });

    res.status(201).json({
      success: true,
      message: 'Briefing enviado com sucesso',
      data: { briefing },
    });
  } catch (err) {
    logger.error('Create briefing error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Erro ao enviar briefing',
    });
  }
};

exports.listBriefings = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let sql = 'SELECT * FROM briefings WHERE 1=1';
    const params = [];

    if (status) {
      sql += ' AND status = ?';
      params.push(status);
    }

    // If not admin, only show user's own briefings
    if (req.userRole !== 'admin') {
      sql += ' AND user_id = ?';
      params.push(req.userId);
    }

    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const briefings = await dbAll(req.app.locals.db, sql, params);

    res.json({
      success: true,
      data: { briefings, total: briefings.length, page: parseInt(page), limit: parseInt(limit) },
    });
  } catch (err) {
    logger.error('List briefings error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Erro ao listar briefings',
    });
  }
};

exports.getBriefing = async (req, res) => {
  try {
    const { id } = req.params;
    let briefing;

    if (req.userRole === 'admin') {
      briefing = await dbGet(req.app.locals.db, 'SELECT * FROM briefings WHERE id = ?', [id]);
    } else {
      briefing = await dbGet(req.app.locals.db, 'SELECT * FROM briefings WHERE id = ? AND user_id = ?', [id, req.userId]);
    }

    if (!briefing) {
      return res.status(404).json({
        success: false,
        message: 'Briefing nao encontrado',
      });
    }

    res.json({
      success: true,
      data: { briefing },
    });
  } catch (err) {
    logger.error('Get briefing error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar briefing',
    });
  }
};

exports.updateBriefingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const existing = await dbGet(req.app.locals.db, 'SELECT * FROM briefings WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Briefing nao encontrado',
      });
    }

    await dbRun(
      req.app.locals.db,
      'UPDATE briefings SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [status, id]
    );

    // Notify the user who submitted the briefing
    if (existing.user_id) {
      await dbRun(
        req.app.locals.db,
        `INSERT INTO notifications (user_id, title, message, type, link)
         VALUES (?, ?, ?, ?, ?)`,
        [
          existing.user_id,
          'Briefing Atualizado',
          `O status do seu briefing foi atualizado para: ${status}`,
          'info',
          `/briefings/${id}`,
        ]
      );
    }

    logger.info('Briefing status updated:', { id, status });

    res.json({
      success: true,
      message: 'Status do briefing atualizado',
    });
  } catch (err) {
    logger.error('Update briefing status error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar status do briefing',
    });
  }
};
