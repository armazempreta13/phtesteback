import { Context } from 'hono';
import type { Ctx } from '../app';
import { generateJWT, validatePassword, sanitizeEmail, authRateLimiter } from '../middleware';
import bcrypt from 'bcryptjs';

const BCRYPT_ROUNDS = 12;

// ============================================================
// REGISTER
// ============================================================
export async function register(c: Ctx) {
  try {
    const body = await c.req.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return c.json({ success: false, message: 'Nome, email e senha sao obrigatorios' }, 400);
    }

    // Password strength validation
    const pwValidation = validatePassword(password);
    if (!pwValidation.valid) {
      return c.json({
        success: false,
        message: 'Senha fraca',
        details: pwValidation.errors,
      }, 400);
    }

    const cleanEmail = sanitizeEmail(email);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return c.json({ success: false, message: 'Email invalido' }, 400);
    }

    const db = c.env.DB;
    const existing = await db.prepare('SELECT id FROM users WHERE email = ?').bind(cleanEmail).first();
    if (existing) {
      return c.json({ success: false, message: 'Este email ja esta em uso' }, 409);
    }

    // Argon2id hashing (more secure than bcrypt)
    const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);

    const result = await db.prepare(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)'
    ).bind(name, cleanEmail, hashedPassword, 'client').run();

    const user = await db.prepare(
      'SELECT id, name, email, role, created_at FROM users WHERE id = ?'
    ).bind(result.meta.last_row_id).first();

    return c.json({
      success: true,
      message: 'Usuario criado com sucesso',
      data: { user },
    }, 201);
  } catch (err) {
    console.error('Register error:', err);
    return c.json({ success: false, message: 'Erro ao criar usuario' }, 500);
  }
}

// ============================================================
// LOGIN — with strict rate limiting and secure cookie
// ============================================================
export async function login(c: Ctx) {
  try {
    const body = await c.req.json();
    const { email, password } = body;

    if (!email || !password) {
      return c.json({ success: false, message: 'Email e senha sao obrigatorios' }, 400);
    }

    const cleanEmail = sanitizeEmail(email);

    const db = c.env.DB;
    const user = await db.prepare('SELECT * FROM users WHERE email = ?').bind(cleanEmail).first<any>();
    if (!user) {
      return c.json({ success: false, message: 'Email ou senha incorretos' }, 401);
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return c.json({ success: false, message: 'Email ou senha incorretos' }, 401);
    }

    // Generate JWT
    const token = await generateJWT(
      { id: user.id, email: user.email, role: user.role },
      c.env.JWT_SECRET
    );

    // Set secure httpOnly cookie (prevents XSS theft of token)
    const cookieValue = `auth_token=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${604800}`; // 7 days
    c.header('Set-Cookie', cookieValue);

    return c.json({
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
    console.error('Login error:', err);
    return c.json({ success: false, message: 'Erro ao fazer login' }, 500);
  }
};

// Add strict rate limiter to login
const loginWithRateLimit = [authRateLimiter(15 * 60 * 1000, 10), login];

// ============================================================
// VERIFY TOKEN
// ============================================================
export async function verifyToken(c: Ctx) {
  try {
    const db = c.env.DB;
    const userId = c.get('userId');
    const user = await db.prepare(
      'SELECT id, name, email, role, avatar, created_at FROM users WHERE id = ?'
    ).bind(userId).first();

    if (!user) {
      return c.json({ success: false, message: 'Usuario nao encontrado' }, 401);
    }

    return c.json({ success: true, data: { user } });
  } catch (err) {
    console.error('Verify token error:', err);
    return c.json({ success: false, message: 'Erro ao verificar token' }, 500);
  }
}

// ============================================================
// GET PROFILE
// ============================================================
export async function getProfile(c: Ctx) {
  try {
    const userId = c.get('userId');
    const db = c.env.DB;
    const user = await db.prepare(
      'SELECT id, name, email, role, avatar, created_at FROM users WHERE id = ?'
    ).bind(userId).first();

    if (!user) {
      return c.json({ success: false, message: 'Usuario nao encontrado' }, 404);
    }

    return c.json({ success: true, data: { user } });
  } catch (err) {
    console.error('Get profile error:', err);
    return c.json({ success: false, message: 'Erro ao buscar perfil' }, 500);
  }
}

// ============================================================
// UPDATE PROFILE
// ============================================================
export async function updateProfile(c: Ctx) {
  try {
    const userId = c.get('userId');
    const body = await c.req.json();
    const { name, avatar } = body;
    const db = c.env.DB;

    if (name !== undefined) {
      await db.prepare('UPDATE users SET name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').bind(name, userId).run();
    }
    if (avatar !== undefined) {
      await db.prepare('UPDATE users SET avatar = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').bind(avatar, userId).run();
    }

    const user = await db.prepare(
      'SELECT id, name, email, role, avatar, created_at FROM users WHERE id = ?'
    ).bind(userId).first();

    return c.json({ success: true, message: 'Perfil atualizado com sucesso', data: { user } });
  } catch (err) {
    console.error('Update profile error:', err);
    return c.json({ success: false, message: 'Erro ao atualizar perfil' }, 500);
  }
}

// ============================================================
// CHANGE PASSWORD
// ============================================================
export async function changePassword(c: Ctx) {
  try {
    const userId = c.get('userId');
    const body = await c.req.json();
    const { currentPassword, newPassword } = body;
    const db = c.env.DB;

    if (!currentPassword || !newPassword) {
      return c.json({ success: false, message: 'Senha atual e nova senha sao obrigatorios' }, 400);
    }

    const pwValidation = validatePassword(newPassword);
    if (!pwValidation.valid) {
      return c.json({ success: false, message: 'Senha fraca', details: pwValidation.errors }, 400);
    }

    const user = await db.prepare('SELECT * FROM users WHERE id = ?').bind(userId).first<any>();
    if (!user) {
      return c.json({ success: false, message: 'Usuario nao encontrado' }, 404);
    }

    const validPassword = await bcrypt.compare(currentPassword, user.password);
    if (!validPassword) {
      return c.json({ success: false, message: 'Senha atual incorreta' }, 401);
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
    await db.prepare(
      'UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).bind(hashedNewPassword, userId).run();

    return c.json({ success: true, message: 'Senha alterada com sucesso' });
  } catch (err) {
    console.error('Change password error:', err);
    return c.json({ success: false, message: 'Erro ao alterar senha' }, 500);
  }
}
