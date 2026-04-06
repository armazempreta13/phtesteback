const { dbRun, dbGet, dbAll } = require('../db');
const logger = require('../utils/logger');

/**
 * Get all settings grouped by category
 */
exports.getSettings = async (req, res) => {
  try {
    const db = req.app.locals.db;
    const rows = await dbAll(db, 'SELECT key, value, category FROM site_settings ORDER BY category, key');

    // Group by category
    const grouped = {};
    for (const row of rows) {
      if (!grouped[row.category]) grouped[row.category] = {};
      try {
        grouped[row.category][row.key] = JSON.parse(row.value);
      } catch {
        grouped[row.category][row.key] = row.value;
      }
    }

    res.json({
      success: true,
      data: grouped,
    });
  } catch (err) {
    logger.error('Get settings error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar configuracoes do site',
    });
  }
};

/**
 * Update multiple settings at once
 * Expected body: { site: { TITLE: '...', SUBTITLE: '...' }, contact: { ... }, performance: { ... }, ... }
 */
exports.updateSettings = async (req, res) => {
  try {
    const db = req.app.locals.db;
    const data = req.body;

    if (!data || typeof data !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Dados invalidos',
      });
    }

    const queries = [];

    for (const [category, fields] of Object.entries(data)) {
      if (typeof fields !== 'object' || fields && Array.isArray(fields)) continue;
      for (const [key, value] of Object.entries(fields)) {
        const serialized = typeof value === 'string' ? value : JSON.stringify(value);
        queries.push(
          dbRun(
            db,
            `INSERT INTO site_settings (key, value, category) VALUES (?, ?, ?)
             ON CONFLICT(key) DO UPDATE SET value = ?, category = ?`,
            [key, serialized, category, serialized, category]
          )
        );
      }
    }

    await Promise.all(queries);
    logger.info('Settings updated:', Object.keys(data).join(', '));

    // Return updated data
    const rows = await dbAll(db, 'SELECT key, value, category FROM site_settings ORDER BY category, key');
    const grouped = {};
    for (const row of rows) {
      if (!grouped[row.category]) grouped[row.category] = {};
      try {
        grouped[row.category][row.key] = JSON.parse(row.value);
      } catch {
        grouped[row.category][row.key] = row.value;
      }
    }

    res.json({
      success: true,
      message: 'Configuracoes atualizadas com sucesso',
      data: grouped,
    });
  } catch (err) {
    logger.error('Update settings error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar configuracoes do site',
    });
  }
};
