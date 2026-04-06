import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { secureHeaders } from 'hono/secure-headers';
import { bearerAuth } from 'hono/bearer-auth';
import { getConnInfo } from 'hono/cloudflare-workers';

import { register, login, verifyToken, getProfile, updateProfile, changePassword } from './routes/auth.routes';
import { getAdminStats, getAnalytics } from './routes/admin.routes';
import { getProjects, getProject, createProject, updateProject, deleteProject } from './routes/projects.routes';
import { listPosts, getPost, createPost, updatePost, deletePost } from './routes/posts.routes';
import { listPortfolio, getPortfolioItem, createPortfolioItem, updatePortfolioItem, deletePortfolioItem } from './routes/portfolio.routes';
import { listBriefings, getBriefing, createBriefing, updateBriefingStatus } from './routes/briefings.routes';
import { getNotifications, createNotification, markAsRead, markAllAsRead } from './routes/notifications.routes';
import { listContactMessages, updateContactMessage, submitContact } from './routes/contact.routes';
import { listTransactions, getTransaction, createTransaction, webhookTransaction } from './routes/transactions.routes';
// import { uploadFile, downloadFile, listUserUploads } from './routes/upload.routes'; // disabled until R2 bucket created
import { getContract, generateContract, updateContract, revokeContract } from './routes/contract.routes';
import { getClientProjects, getClientProject, getClientMessages, sendClientMessage } from './routes/client.routes';
import { getSettings, updateSettings } from './routes/settings.routes';
import { trackAnalytics } from './routes/analytics.routes';
import { submitChatMessage, listChatMessages, replyToChatMessage, getPublicMessages, getUnreadCount, getChatStats } from './routes/chat.routes';
import { authMiddleware, requireAdmin, setAuthContext, verifyToken as middlewareVerifyToken, authRateLimiter } from './middleware';
import { Env, Variables } from './app';

const app = new Hono<{
  Bindings: Env;
  Variables: Variables;
}>();

// ============================================================
// SECURE HEADERS
// ============================================================
app.use('*', secureHeaders());

// ============================================================
// CORS
// ============================================================
app.use('/api/*', cors({
  origin: (origin, c) => {
    const dynamicAllowed = c.env.CORS_ORIGIN ? c.env.CORS_ORIGIN.split(',') : ['https://phstatic.com.br'];
    const allowed = [...dynamicAllowed];
    return origin && allowed.includes(origin) ? origin : allowed[0];
  },
  credentials: true,
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400,
}));

// ============================================================
// GLOBAL RATE LIMITER (CF-compatible - no setInterval)
// ============================================================
const RATE_WINDOWS = new Map<string, { count: number; resetAt: number }>();

app.use('/api/*', async (c, next) => {
  const ip = c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown';
  const now = Date.now();
  const windowMs = 60 * 1000;
  const maxRequests = 300;
  const record = RATE_WINDOWS.get(ip);

  if (record && now < record.resetAt) {
    if (record.count >= maxRequests) {
      return c.json({ success: false, message: 'Too many requests. Try again later.' }, 429);
    }
    record.count++;
  } else {
    RATE_WINDOWS.set(ip, { count: 1, resetAt: now + windowMs });
  }

  if (RATE_WINDOWS.size > 10000) {
    for (const [key, val] of RATE_WINDOWS) {
      if (val.resetAt < now) RATE_WINDOWS.delete(key);
    }
  }

  await next();
});

// ============================================================
// REQUEST LOGGER
// ============================================================
app.use('/api/*', async (c, next) => {
  const info = getConnInfo(c);
  const ip = info.remote.address || 'unknown';
  console.log(`[${new Date().toISOString()}] ${c.req.method} ${c.req.url}`, { ip, userAgent: c.req.header('user-agent') });
  await next();
});

// ============================================================
// HEALTH CHECK
// ============================================================
app.get('/api/health', (c) => c.json({ success: true, message: 'PH.dev API is running', timestamp: new Date().toISOString(), uptime: performance.now(), version: '2.1.0' }));

// ============================================================
// PUBLIC ROUTES
// ============================================================
app.post('/api/analytics/track', trackAnalytics);
app.get('/api/portfolio', listPortfolio);
app.get('/api/portfolio/:id', getPortfolioItem);
app.get('/api/posts', listPosts);
app.get('/api/posts/:id', getPost);
app.post('/api/contact', submitContact);
app.post('/api/briefings', createBriefing);
app.post('/api/transactions/:id/webhook', webhookTransaction);

// Chat messages (direct conversation with admin)
app.post('/api/chat/messages', submitChatMessage);
app.get('/api/chat/messages/public', getPublicMessages);
app.get('/api/chat/messages', setAuthContext, authMiddleware, requireAdmin, listChatMessages);
app.put('/api/chat/messages/:id/reply', setAuthContext, authMiddleware, requireAdmin, replyToChatMessage);

// Chat stats & unread count (public for badge)
app.get('/api/chat/unread/:email', getUnreadCount);
app.get('/api/chat/stats', setAuthContext, authMiddleware, requireAdmin, getChatStats);

// ============================================================
// AUTH ROUTES
// ============================================================
app.post('/api/auth/register', register);
app.post('/api/auth/login', authRateLimiter(15 * 60 * 1000, 10), login);
app.post('/api/auth/verify', bearerAuth({
  verifyToken: async (token, c) => {
    const res = await middlewareVerifyToken(c.env.JWT_SECRET, token, c.env);
    return res !== false;
  },
}), verifyToken);

// ============================================================
// PROTECTED ROUTES (JWT required)
// ============================================================
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
app.get('/api/briefings', setAuthContext, authMiddleware, listBriefings);
app.get('/api/briefings/:id', setAuthContext, authMiddleware, getBriefing);
app.put('/api/briefings/:id/status', setAuthContext, authMiddleware, requireAdmin, updateBriefingStatus);

// Notifications
app.get('/api/notifications', setAuthContext, authMiddleware, getNotifications);
app.get('/api/notifications/unread/count', setAuthContext, authMiddleware, getNotifications);
app.post('/api/notifications', setAuthContext, authMiddleware, requireAdmin, createNotification);
app.put('/api/notifications/:id/read', setAuthContext, authMiddleware, markAsRead);
app.put('/api/notifications/mark-all-read', setAuthContext, authMiddleware, markAllAsRead);

// Contact Messages (admin)
app.get('/api/contact', setAuthContext, authMiddleware, requireAdmin, listContactMessages);
app.put('/api/contact/:id', setAuthContext, authMiddleware, requireAdmin, updateContactMessage);

// Transactions
app.get('/api/transactions', setAuthContext, authMiddleware, listTransactions);
app.get('/api/transactions/:id', setAuthContext, authMiddleware, getTransaction);
app.post('/api/transactions', setAuthContext, authMiddleware, createTransaction);

// Uploads (disabled until R2 bucket "phdev-uploads" is created on Cloudflare Dashboard)
// app.post('/api/upload', setAuthContext, authMiddleware, uploadFile);
// app.get('/api/upload/:filename', setAuthContext, authMiddleware, downloadFile);
// app.get('/api/upload', setAuthContext, authMiddleware, listUserUploads);

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
app.get('/api/settings', setAuthContext, authMiddleware, requireAdmin, getSettings);
app.put('/api/settings', setAuthContext, authMiddleware, requireAdmin, updateSettings);

// ============================================================
// 404 FALLBACK
// ============================================================
app.notFound((c) => {
  return c.json({ success: false, message: `Route not found: ${c.req.method} ${c.req.url}` }, 404);
});

// ============================================================
// GLOBAL ERROR HANDLER
// ============================================================
app.onError((err, c) => {
  console.error('Unhandled error:', err.message, err.stack);
  if (err.message?.includes('ValidationError') || err.message?.includes('validation'))
    return c.json({ success: false, message: 'Erro de validacao', details: err.message }, 400);
  return c.json({ success: false, message: 'Erro interno do servidor' }, 500);
});

export default app;
