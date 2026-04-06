import { Context, MiddlewareHandler } from 'hono';
import { sign, verify } from 'hono/jwt';
import type { Env, Variables } from '../app';

// ============================================================
// JWT Helpers — secure httpOnly cookie based auth
// ============================================================

export async function generateJWT(payload: { id: number; email: string; role: string }, secret: string): Promise<string> {
  return await sign(
    {
      ...payload,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7, // 7 days
    },
    secret
  );
}

export async function verifyJWT(token: string, secret: string): Promise<{ id: number; email: string; role: string } | null> {
  try {
    const decoded = await verify(token, secret, 'HS256') as any;
    return { id: decoded.id, email: decoded.email, role: decoded.role };
  } catch {
    return null;
  }
}

// ============================================================
// Verify token helper (used by bearerAuth verifyToken)
// ============================================================
export async function verifyToken(secret: string, token: string, env: Env): Promise<Variables | false> {
  try {
    const decoded = await verify(token, secret, 'HS256') as any;
    // Check token blacklist
    if (env.KV && await env.KV.get(`blacklist:${token}`)) {
      return false;
    }
    return {
      userId: decoded.id,
      userRole: decoded.role,
      userEmail: decoded.email,
    };
  } catch {
    return false;
  }
}

// ============================================================
// Auth Middleware — validates JWT from Authorization header or Cookie
// ============================================================
export const authMiddleware: MiddlewareHandler<{ Bindings: Env; Variables: Variables }> = async (c, next) => {
  const secret = c.env.JWT_SECRET;
  if (!secret || secret === 'fallback-secret-change-me' || secret.length < 32) {
    console.error('CRITICAL: JWT_SECRET is weak or not configured!');
    return c.json({ success: false, message: 'Erro de configuracao do servidor' }, 500);
  }

  let token: string | undefined;

  // Try Authorization header first
  const authHeader = c.req.header('Authorization');
  if (authHeader) {
    const match = authHeader.match(/^Bearer\s+(.+)$/i);
    if (match) {
      token = match[1];
    }
  }

  // Fallback to cookie
  if (!token) {
    const cookie = c.req.header('Cookie');
    if (cookie) {
      const match = cookie.match(/auth_token=([^;]+)/);
      if (match) {
        token = match[1];
      }
    }
  }

  if (!token) {
    return c.json({
      success: false,
      message: 'Token de autenticacao nao fornecido',
    }, 401);
  }

  const decoded = await verifyJWT(token, secret);
  if (!decoded) {
    return c.json({
      success: false,
      message: 'Token invalido ou expirado',
    }, 401);
  }

  c.set('userId', decoded.id);
  c.set('userRole', decoded.role);
  c.set('userEmail', decoded.email);

  await next();
};

// ============================================================
// Set auth context without requiring it (for optional auth)
// ============================================================
export const setAuthContext: MiddlewareHandler<{ Bindings: Env; Variables: Variables }> = async (c, next) => {
  const secret = c.env.JWT_SECRET;
  if (!secret) {
    return next();
  }

  let token: string | undefined;
  const authHeader = c.req.header('Authorization');
  if (authHeader) {
    const match = authHeader.match(/^Bearer\s+(.+)$/i);
    if (match) token = match[1];
  }
  if (!token) {
    const cookie = c.req.header('Cookie');
    if (cookie) {
      const match = cookie.match(/auth_token=([^;]+)/);
      if (match) token = match[1];
    }
  }

  if (token) {
    const decoded = await verifyJWT(token, secret);
    if (decoded) {
      c.set('userId', decoded.id);
      c.set('userRole', decoded.role);
      c.set('userEmail', decoded.email);
    }
  }

  await next();
};

// ============================================================
// Admin Middleware
// ============================================================
export const requireAdmin: MiddlewareHandler<{ Bindings: Env; Variables: Variables }> = async (c, next) => {
  const userRole = c.get('userRole');
  if (userRole !== 'admin') {
    console.warn('Admin access denied:', { userId: c.get('userId'), role: userRole });
    return c.json({
      success: false,
      message: 'Acesso negado. Apenas administradores podem realizar esta acao.',
    }, 403);
  }
  await next();
};

// ============================================================
// Auth Rate Limiter — strict login protection
// ============================================================
const LOGIN_ATTEMPTS = new Map<string, { count: number; resetAt: number }>();

export function authRateLimiter(windowMs = 15 * 60 * 1000, maxAttempts = 10): MiddlewareHandler {
  return async (c, next) => {
    const ip = c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown';
    const now = Date.now();
    const record = LOGIN_ATTEMPTS.get(ip);

    if (record && now < record.resetAt) {
      if (record.count >= maxAttempts) {
        return c.json({
          success: false,
          message: 'Muitas tentativas de autenticacao. Aguarde 15 minutos antes de tentar novamente.',
        }, 429);
      }
      record.count++;
    } else {
      LOGIN_ATTEMPTS.set(ip, { count: 1, resetAt: now + windowMs });
    }

    // Clean old entries periodically
    if (LOGIN_ATTEMPTS.size > 10000) {
      for (const [key, val] of LOGIN_ATTEMPTS) {
        if (val.resetAt < now) LOGIN_ATTEMPTS.delete(key);
      }
    }

    await next();
  };
}

// ============================================================
// Password validation helpers
// ============================================================
export function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (password.length < 8) errors.push('A senha deve ter no minimo 8 caracteres');
  if (!/[A-Z]/.test(password)) errors.push('A senha deve conter pelo menos uma letra maiuscula');
  if (!/[a-z]/.test(password)) errors.push('A senha deve conter pelo menos uma letra minuscula');
  if (!/[0-9]/.test(password)) errors.push('A senha deve conter pelo menos um numero');
  if (!/[^A-Za-z0-9]/.test(password)) errors.push('A senha deve conter pelo menos um caractere especial');
  return { valid: errors.length === 0, errors };
}

// ============================================================
// Email sanitization
// ============================================================
export function sanitizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

// ============================================================
// XSS sanitization for text inputs
// ============================================================
export function sanitizeInput(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}
