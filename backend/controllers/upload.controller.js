const path = require('path');
const { dbRun, dbGet } = require('../db');
const config = require('../config');
const logger = require('../utils/logger');

exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Nenhum arquivo enviado',
      });
    }

    const uploadPath = path.join(config.upload.dir, req.file.filename);

    const result = await dbRun(
      req.app.locals.db,
      `INSERT INTO uploads (user_id, filename, originalname, mimetype, size, path)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        req.userId || null,
        req.file.filename,
        req.file.originalname,
        req.file.mimetype,
        req.file.size,
        uploadPath,
      ]
    );

    logger.info('File uploaded:', req.file.originalname, 'by user', req.userId);

    res.status(201).json({
      success: true,
      message: 'Arquivo enviado com sucesso',
      data: {
        file: {
          id: result.id,
          filename: req.file.filename,
          originalname: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size,
          url: `/api/uploads/${req.file.filename}`,
        },
      },
    });
  } catch (err) {
    logger.error('Upload file error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Erro ao enviar arquivo',
    });
  }
};

exports.downloadFile = async (req, res) => {
  try {
    const { filename } = req.params;

    const upload = await dbGet(
      req.app.locals.db,
      'SELECT * FROM uploads WHERE filename = ?',
      [filename]
    );

    if (!upload) {
      return res.status(404).json({
        success: false,
        message: 'Arquivo nao encontrado',
      });
    }

    res.sendFile(upload.path, { root: '.' });
  } catch (err) {
    logger.error('Download file error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar arquivo',
    });
  }
};

exports.listUploads = async (req, res) => {
  try {
    const uploads = await dbAll(
      req.app.locals.db,
      'SELECT * FROM uploads WHERE user_id = ? ORDER BY created_at DESC',
      [req.userId]
    );

    res.json({
      success: true,
      data: { uploads },
    });
  } catch (err) {
    logger.error('List uploads error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Erro ao listar uploads',
    });
  }
};
