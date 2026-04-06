const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config');
const { dbRun, dbGet } = require('../db');
const logger = require('../utils/logger');

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Nome, email e senha sao obrigatorios',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'A senha deve ter no minimo 6 caracteres',
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Email invalido',
      });
    }

    const existing = await dbGet(req.app.locals.db, 'SELECT id FROM users WHERE email = ?', [email]);
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'Este email ja esta em uso',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const result = await dbRun(
      req.app.locals.db,
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, 'client']
    );

    const user = await dbGet(req.app.locals.db, 'SELECT id, name, email, role, created_at FROM users WHERE id = ?', [result.id]);

    logger.info('New user registered:', email);

    res.status(201).json({
      success: true,
      message: 'Usuario criado com sucesso',
      data: { user },
    });
  } catch (err) {
    logger.error('Register error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Erro ao criar usuario',
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email e senha sao obrigatorios',
      });
    }

    const user = await dbGet(req.app.locals.db, 'SELECT * FROM users WHERE email = ?', [email]);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email ou senha incorretos',
      });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({
        success: false,
        message: 'Email ou senha incorretos',
      });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    logger.info('User logged in:', email);

    res.json({
      success: true,
      message: 'Login realizado com sucesso',
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
        },
      },
    });
  } catch (err) {
    logger.error('Login error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Erro ao fazer login',
    });
  }
};

exports.verifyToken = async (req, res) => {
  try {
    const user = await dbGet(
      req.app.locals.db,
      'SELECT id, name, email, role, avatar, created_at FROM users WHERE id = ?',
      [req.userId]
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Usuario nao encontrado',
      });
    }

    res.json({
      success: true,
      data: { user },
    });
  } catch (err) {
    logger.error('Verify token error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Erro ao verificar token',
    });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await dbGet(
      req.app.locals.db,
      'SELECT id, name, email, role, avatar, created_at FROM users WHERE id = ?',
      [req.userId]
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario nao encontrado',
      });
    }

    res.json({
      success: true,
      data: { user },
    });
  } catch (err) {
    logger.error('Get profile error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar perfil',
    });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Senha atual e nova senha sao obrigatorios',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'A nova senha deve ter no minimo 6 caracteres',
      });
    }

    const user = await dbGet(req.app.locals.db, 'SELECT * FROM users WHERE id = ?', [req.userId]);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario nao encontrado',
      });
    }

    const validPassword = await bcrypt.compare(currentPassword, user.password);
    if (!validPassword) {
      return res.status(401).json({
        success: false,
        message: 'Senha atual incorreta',
      });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 12);
    await dbRun(
      req.app.locals.db,
      'UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [hashedNewPassword, req.userId]
    );

    logger.info('User changed password:', user.email);

    res.json({
      success: true,
      message: 'Senha alterada com sucesso',
    });
  } catch (err) {
    logger.error('Change password error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Erro ao alterar senha',
    });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, avatar } = req.body;
    const updates = [];
    const params = [];

    if (name !== undefined) {
      updates.push('name = ?');
      params.push(name);
    }
    if (avatar !== undefined) {
      updates.push('avatar = ?');
      params.push(avatar);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Nenhum campo para atualizar',
      });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(req.userId);

    await dbRun(
      req.app.locals.db,
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    const user = await dbGet(
      req.app.locals.db,
      'SELECT id, name, email, role, avatar, created_at FROM users WHERE id = ?',
      [req.userId]
    );

    res.json({
      success: true,
      message: 'Perfil atualizado com sucesso',
      data: { user },
    });
  } catch (err) {
    logger.error('Update profile error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar perfil',
    });
  }
};
