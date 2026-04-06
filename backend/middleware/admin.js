const logger = require('../utils/logger');

/**
 * Middleware que verifica se o usuario e administrador
 * Deve ser usado apos o middleware auth
 */
function requireAdmin(req, res, next) {
  if (req.userRole !== 'admin') {
    logger.warn('Admin access denied for user:', { id: req.userId, role: req.userRole });
    return res.status(403).json({
      success: false,
      message: 'Acesso negado. Apenas administradores podem realizar esta acao.',
    });
  }
  next();
}

module.exports = requireAdmin;
