import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { secureHeaders, xContentTypeOptions, referrerPolicy, crossOriginEmbedderPolicy, crossOriginOpenerPolicy, contentSecurityPolicy } from 'hono/secure-headers';
import { bearerAuth } from 'hono/bearer-auth';
import { rateLimiter } from 'hono-rate-limiter';
import { getConnInfo } from 'hono/cloudflare-workers';

import { register, login, verifyToken, getProfile, updateProfile, changePassword } from './routes/auth.routes';
import { getAdminStats, getAnalytics } from './routes/admin.routes';
import { getProjects, getProject, createProject, updateProject, deleteProject } from './routes/projects.routes';
import { getPosts, getPost, createPost, updatePost, deletePost } from './routes/posts.routes';
import { getPortfolioItems, getPortfolioItem, createPortfolioItem, updatePortfolioItem, deletePortfolioItem } from './routes/portfolio.routes';
import { getBriefings, getBriefing, createBriefing, updateBriefingStatus } from './routes/briefings.routes';
import { getNotifications, createNotification, markAsRead, markAllAsRead } from './routes/notifications.routes';
import { getContactMessages, updateContactMessage, createContactMessage } from './routes/contact.routes';
import { getTransactions, getTransaction, createTransaction, getTransactionWebhook } from './routes/transactions.routes';
import { uploadFile, downloadFile, listUserUploads } from './routes/upload.routes';
import { getContract, generateContract, updateContract, revokeContract } from './routes/contract.routes';
import { getClientProjects, getClientProject, getClientMessages, sendClientMessage } from './routes/client.routes';
import { getSettings, updateSettings } from './routes/settings.routes';
import { trackAnalytics } from './routes/analytics.routes';
import { aiChat, aiChatStream } from './routes/ai.routes';
import { authMiddleware, requireAdmin, setAuthContext } from './middleware';

const app = new Hono<{
  Bindings: {
    DB: D1Database;
    KV: KVNamespace;
    UPLOADS: R2Bucket;
    JWT_SECRET: string;
    AI_API_KEY: string;
    AI_MODEL: string;
    CORS_ORIGIN: string;
    SMTP_HOST?: string;
    SMTP_PORT?: number;
    SMTP_SECURE?: string;
    SMTP_USER?: string;
    SMTP_PASS?: string;
    SMTP_PASS?: string;
    ADMIN_EMAIL: string;
    ADMIN_PASSWORD: string;
    WEBHOOK_SECRET: string;
    NODE_ENV: string;
  };
  Variables: {
    userId: number;
    userRole: string;
    userEmail: string;
  };
}>();

// ============================================================
// SECURE HEADERS
// ============================================================
app.use('*', secureHeaders({
  // Don't use `contentSecurityPolicy()` helper — we want custom policy
}));

app.use('*', xContentTypeOptions());
app.use('*', referrerPolicy({ policy: 'strict-origin-when-cross-origin' }));
app.use('*', crossOriginEmbedderPolicy({ policy: 'unsafe-none' }));
app.use('*', crossOriginOpenerPolicy({ policy: 'same-origin' }));

// ============================================================
// CORS
// ============================================================
app.use('/api/*', cors({
  origin: (origin) => {
    const allowed = (typeof origin === 'string') ? [origin] : ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:4000'];
    // In prod, restrict CORS origin
    if (allowed.includes(origin)) return origin;
    return allowed[0];
  },
  credentials: true,
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400,
}));

// ============================================================
// GLOBAL RATE LIMITER
// ============================================================
const env = process.env.NODE_ENV || 'development';

app.use('/api/*', rateLimiter({
  windowMs: 60 * 1000,
  limit: env === 'development' ? 1000 : 300,
  standardHeaders: true,
  legacyHeaders: false,
}));

// Auth-specific rate limiter is stricter at the /auth/login route

// ============================================================
// REQUEST LOGGER
// ============================================================
app.use('/api/*', async (c, next) => {
  const info = getConnInfo(c);
  console.log(`[${new Date().toISOString()}] ${c.req.method} ${c.req.url}`, {
    ip: info.address,
    userAgent: c.req.header('user-agent'),
  });
  await next();
});

// ============================================================
// HEALTH CHECK
// ============================================================
app.get('/api/health', (c) => {
  return c.json({
    success: true,
    message: 'PH.dev API is running',
    timestamp: new Date().toISOString(),
    uptime: performance.now(),
    version: '2.1.0',
  });
});

// ============================================================
// PUBLIC ROUTES (No auth required)
// ============================================================

// Analytics tracking (public)
app.post('/api/analytics/track', trackAnalytics);

// Portfolio (public read)
app.get('/api/portfolio', getPortfolioItems);
app.get('/api/portfolio/:id', getPortfolioItem);

// Posts (public read - only published)
app.get('/api/posts', getPosts);
app.get('/api/posts/:id', getPost);

// Contact form submission (public)
app.post('/api/contact', createContactMessage);

// Briefing submission (public)
app.post('/api/briefings', createBriefing);

// Transaction webhook (no auth — verified via signature)
app.post('/api/transactions/:id/webhook', getTransactionWebhook);

// ============================================================
// AUTH ROUTES
// ============================================================
app.post('/api/auth/register', register);
// Login has strict rate limiter
app.post('/api/auth/login', login);
app.post('/api/auth/verify', bearerAuth({
  verifyToken: async (token, c) => {
    return await verifyToken(c.env.JWT_SECRET, token, c.env);
  },
}), verifyToken);

// ============================================================
// PROTECTED ROUTES (JWT required)
// ============================================================

// Auth: profile, update, change password
app.get('/api/auth/profile', setAuthContext, authMiddleware, getProfile);
app.put('/api/auth/profile', setAuthContext, authMiddleware, updateProfile);
app.post('/api/auth/change-password', setAuthContext, authMiddleware, changePassword);

// Projects
app.get('/api/projects', setAuthContext, authMiddleware, getProjects);
app.get('/api/projects/:id', setAuthContext, authMiddleware, getProject);
app.post('/api/projects', setAuthContext, authMiddleware, requireAdmin, createProject);
app.put('/api/projects/:id', setAuthContext, authMiddleware, requireAdmin, updateProject);
app.delete('/api/projects/:id', setAuthContext, authMiddleware, requireAdmin, deleteProject);

// Posts (admin only)
app.post('/api/posts', setAuthContext, authMiddleware, requireAdmin, createPost);
app.put('/api/posts/:id', setAuthContext, authMiddleware, requireAdmin, updatePost);
app.delete('/api/posts/:id', setAuthContext, authMiddleware, requireAdmin, deletePost);

// Portfolio (admin only)
app.post('/api/portfolio', setAuthContext, authMiddleware, requireAdmin, createPortfolioItem);
app.put('/api/portfolio/:id', setAuthContext, authMiddleware, requireAdmin, updatePortfolioItem);
app.delete('/api/portfolio/:id', setAuthContext, authMiddleware, requireAdmin, deletePortfolioItem);

// Briefings
app.get('/api/briefings', setAuthContext, authMiddleware, getBriefings);
app.get('/api/briefings/:id', setAuthContext, authMiddleware, getBriefing);
app.put('/api/briefings/:id/status', setAuthContext, authMiddleware, requireAdmin, updateBriefingStatus);

// Notifications
app.get('/api/notifications', setAuthContext, authMiddleware, getNotifications);
app.get('/api/notifications/unread/count', setAuthContext, authMiddleware, getNotifications);
app.post('/api/notifications', setAuthContext, authMiddleware, requireAdmin, createNotification);
app.put('/api/notifications/:id/read', setAuthContext, authMiddleware, markAsRead);
app.put('/api/notifications/mark-all-read', setAuthContext, authMiddleware, markAllAsRead);

// Contact Messages (admin)
app.get('/api/contact', setAuthContext, authMiddleware, requireAdmin, getContactMessages);
app.put('/api/contact/:id', setAuthContext, authMiddleware, requireAdmin, updateContactMessage);

// Transactions
app.get('/api/transactions', setAuthContext, authMiddleware, getTransactions);
app.get('/api/transactions/:id', setAuthContext, authMiddleware, getTransaction);
app.post('/api/transactions', setAuthContext, authMiddleware, createTransaction);

// Uploads
app.post('/api/upload', setAuthContext, authMiddleware, uploadFile);
app.get('/api/upload/:filename', setAuthContext, authMiddleware, downloadFile);
app.get('/api/upload', setAuthContext, authMiddleware, listUserUploads);

// Contract
app.get('/api/contract/:project_id', setAuthContext, authMiddleware, getContract);
app.post('/api/contract/generate', setAuthContext, authMiddleware, requireAdmin, generateContract);
app.patch('/api/contract/:project_id', setAuthContext, authMiddleware, requireAdmin, updateContract);
app.delete('/api/contract/:project_id/revoke', setAuthContext, authMiddleware, requireAdmin, revokeContract);

// Client routes
app.get('/api/client/projects', setAuthContext, authMiddleware, getClientProjects);
app.get('/api/client/projects/:id', setAuthContext, authMiddleware, getClientProject);
app.get('/api/client/projects/:id/messages', setAuthContext, authMiddleware, getClientMessages);
app.post('/api/client/projects/:id/messages', setAuthContext, authMiddleware, sendClientMessage);

// Admin
app.get('/api/admin/stats', setAuthContext, authMiddleware, requireAdmin, getAdminStats);
app.get('/api/analytics', setAuthContext, authMiddleware, requireAdmin, getAnalytics);

// Settings (admin)
app.get('/api/settings', setAuthContext, authMiddleware, requireAdmin, getSettings);
app.put('/api/settings', setAuthContext, authMiddleware, requireAdmin, updateSettings);

// AI (protected + rate limited)
app.post('/api/ai/chat', setAuthContext, authMiddleware, aiChat);
app.post('/api/ai/chat/stream', setAuthContext, authMiddleware, aiChatStream);

// ============================================================
// 404 FALLBACK
// ============================================================
app.notFound((c) => {
  return c.json({
    success: false,
    message: `Rota nao encontrada: ${c.req.method} ${c.req.url}`,
  }, 404);
});

// ============================================================
// GLOBAL ERROR HANDLER
// ============================================================
app.onError((err, c) => {
  console.error('Unhandled error:', err.message, err.stack);

  if (err.message?.includes('ValidationError') || err.message?.includes('validation'))
    return c.json({ success: false, message: 'Erro de validacao', details: err.message }, 400);

  return c.json({
    success: false,
    message: 'Erro interno do servidor',
  }, 500);
});

export default app;
