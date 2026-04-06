const jwt = require('jsonwebtoken');
const config = require('../config');
const logger = require('../utils/logger');

/**
 * Middleware de autenticacao JWT
 * Extrai e valida o token do header Authorization
 */
const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Token de autenticacao nao fornecido',
      });
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({
        success: false,
        message: 'Formato de token invalido. Use: Bearer <token>',
      });
    }

    const token = parts[1];

    try {
      const decoded = jwt.verify(token, config.jwt.secret);
      req.userId = decoded.id;
      req.userRole = decoded.role;
      req.userEmail = decoded.email;
      return next();
    } catch (err) {
      logger.warn('Token verification failed:', err.message);
      return res.status(401).json({
        success: false,
        message: 'Token invalido ou expirado',
      });
    }
  } catch (err) {
    logger.error('Auth middleware error:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Erro interno de autenticacao',
    });
  }
};

module.exports = auth;
