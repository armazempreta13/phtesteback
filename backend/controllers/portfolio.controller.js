const { dbRun, dbGet, dbAll } = require('../db');
const logger = require('../utils/logger');

exports.listPortfolio = async (req, res) => {
  try {
    const { page = 1, limit = 20, category, featured } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let sql = 'SELECT * FROM portfolio WHERE 1=1';
    const params = [];

    if (category) {
      sql += ' AND category = ?';
      params.push(category);
    }

    if (featured !== undefined) {
      sql += ' AND featured = ?';
      params.push(parseInt(featured));
    }

    sql += ' ORDER BY featured DESC, created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const items = await dbAll(req.app.locals.db, sql, params);

    const countRow = await dbGet(
      req.app.locals.db,
      `SELECT COUNT(*) as total FROM portfolio WHERE 1=1${category ? ' AND category = ?' : ''}${featured !== undefined ? ' AND featured = ?' : ''}`,
      params.slice(0, -2)
    );

    res.json({
      success: true,
      data: { items, total: countRow?.total || items.length, page: parseInt(page), limit: parseInt(limit) },
    });
  } catch (err) {
    logger.error('List portfolio error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Erro ao listar portfolio',
    });
  }
};

exports.getPortfolioItem = async (req, res) => {
  try {
    const { id } = req.params;

    const item = await dbGet(req.app.locals.db, 'SELECT * FROM portfolio WHERE id = ?', [id]);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Projeto nao encontrado no portfolio',
      });
    }

    res.json({
      success: true,
      data: { item },
    });
  } catch (err) {
    logger.error('Get portfolio item error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar item do portfolio',
    });
  }
};

exports.createPortfolioItem = async (req, res) => {
  try {
    const { title, description, image_url, gallery, tech_stack, live_url, github_url, category, featured, client_name, year } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Titulo e obrigatorio',
      });
    }

    const result = await dbRun(
      req.app.locals.db,
      `INSERT INTO portfolio (title, description, image_url, gallery, tech_stack, live_url, github_url, category, featured, client_name, year)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        description || '',
        image_url || '',
        Array.isArray(gallery) ? JSON.stringify(gallery) : gallery || '',
        Array.isArray(tech_stack) ? JSON.stringify(tech_stack) : tech_stack || '',
        live_url || '',
        github_url || '',
        category || '',
        featured ? 1 : 0,
        client_name || '',
        year || '',
      ]
    );

    const item = await dbGet(req.app.locals.db, 'SELECT * FROM portfolio WHERE id = ?', [result.id]);

    logger.info('Portfolio item created:', title);

    res.status(201).json({
      success: true,
      message: 'Projeto adicionado ao portfolio',
      data: { item },
    });
  } catch (err) {
    logger.error('Create portfolio item error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Erro ao criar item do portfolio',
    });
  }
};

exports.updatePortfolioItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, image_url, gallery, tech_stack, live_url, github_url, category, featured, client_name, year } = req.body;

    const existing = await dbGet(req.app.locals.db, 'SELECT * FROM portfolio WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Projecto nao encontrado',
      });
    }

    const updates = ['updated_at = CURRENT_TIMESTAMP'];
    const params = [];

    if (title !== undefined) { updates.push('title = ?'); params.push(title); }
    if (description !== undefined) { updates.push('description = ?'); params.push(description); }
    if (image_url !== undefined) { updates.push('image_url = ?'); params.push(image_url); }
    if (gallery !== undefined) { updates.push('gallery = ?'); params.push(Array.isArray(gallery) ? JSON.stringify(gallery) : gallery); }
    if (tech_stack !== undefined) { updates.push('tech_stack = ?'); params.push(Array.isArray(tech_stack) ? JSON.stringify(tech_stack) : tech_stack); }
    if (live_url !== undefined) { updates.push('live_url = ?'); params.push(live_url); }
    if (github_url !== undefined) { updates.push('github_url = ?'); params.push(github_url); }
    if (category !== undefined) { updates.push('category = ?'); params.push(category); }
    if (featured !== undefined) { updates.push('featured = ?'); params.push(featured ? 1 : 0); }
    if (client_name !== undefined) { updates.push('client_name = ?'); params.push(client_name); }
    if (year !== undefined) { updates.push('year = ?'); params.push(year); }

    if (updates.length === 1) {
      return res.status(400).json({
        success: false,
        message: 'Nenhum campo para atualizar',
      });
    }

    params.push(id);

    await dbRun(
      req.app.locals.db,
      `UPDATE portfolio SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    const item = await dbGet(req.app.locals.db, 'SELECT * FROM portfolio WHERE id = ?', [id]);

    logger.info('Portfolio item updated:', id);

    res.json({
      success: true,
      message: 'Projeto atualizado com sucesso',
      data: { item },
    });
  } catch (err) {
    logger.error('Update portfolio item error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar item do portfolio',
    });
  }
};

exports.deletePortfolioItem = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await dbGet(req.app.locals.db, 'SELECT * FROM portfolio WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Projeto nao encontrado',
      });
    }

    await dbRun(req.app.locals.db, 'DELETE FROM portfolio WHERE id = ?', [id]);

    logger.info('Portfolio item deleted:', id);

    res.json({
      success: true,
      message: 'Projeto removido do portfolio',
    });
  } catch (err) {
    logger.error('Delete portfolio item error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Erro ao deletar item do portfolio',
    });
  }
};
