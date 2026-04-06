const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');
const config = require('./config');
const logger = require('./utils/logger');
const { initDatabase, createTables, seedAdmin, seedPortfolio, seedPosts } = require('./db');

// ============================================================
// INIT EXPRESS APP
// ============================================================
const app = express();

// ============================================================
// SECURITY MIDDLEWARES
// ============================================================
app.use(helmet());

app.use(cors({
  origin: config.cors.origin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ============================================================
// RATE LIMITING
// ============================================================
const globalLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: {
    success: false,
    message: 'Muitas requisicoes. Tente novamente em alguns minutos.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', globalLimiter);

// Stricter limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    success: false,
    message: 'Muitas tentativas de autenticacao. Aguarde 15 minutos.',
  },
});
app.use('/api/auth/', authLimiter);

// ============================================================
// STATIC FILES - uploads
// ============================================================
app.use('/uploads', express.static(path.join(__dirname, config.upload.dir)));

// ============================================================
// STATIC FILES - Frontend (SPA)
// ============================================================
const frontendDist = path.join(__dirname, '..', 'site', 'dist');
app.use(express.static(frontendDist));

// ============================================================
// HEALTH CHECK
// ============================================================
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'PH.dev API is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: require('./package.json').version,
  });
});

// ============================================================
// REQUEST LOGGER MIDDLEWARE
// ============================================================
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  });
  next();
});

// ============================================================
// INITIALIZE DATABASE & SEED
// ============================================================
async function bootstrap() {
  try {
    logger.info('Starting PH.dev Backend...');

    // Initialize database
    const db = await initDatabase();
    app.locals.db = db;

    // Create tables
    await createTables(db);

    // Seed admin user
    await seedAdmin(db);

    // Seed sample data
    await seedPortfolio(db);
    await seedPosts(db);

    logger.info('Database initialized and seeded successfully');

    // ============================================================
    // ROUTES
    // ============================================================
    app.use('/api/auth', require('./routes/auth.routes'));
    app.use('/api/projects', require('./routes/projects.routes'));
    app.use('/api/transactions', require('./routes/transactions.routes'));
    app.use('/api/contact', require('./routes/contact.routes'));
    app.use('/api/posts', require('./routes/posts.routes'));
    app.use('/api/portfolio', require('./routes/portfolio.routes'));
    app.use('/api/briefings', require('./routes/briefings.routes'));
    app.use('/api/notifications', require('./routes/notifications.routes'));
    app.use('/api/upload', require('./routes/upload.routes'));
    app.use('/api/admin', require('./routes/admin.routes'));
    app.use('/api/ai', require('./routes/ai.routes'));
    app.use('/api/settings', require('./routes/settings.routes'));
    app.use('/api/client', require('./routes/client.routes'));
    app.use('/api/contract', require('./routes/contract.routes'));
    app.use('/api/analytics', require('./routes/analytics.routes'));

    // ============================================================
    // SPA FALLBACK - serve index.html for non-API routes
    // ============================================================
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api/') || req.path.startsWith('/uploads/')) return next();
      res.sendFile(path.join(frontendDist, 'index.html'));
    });

    // ============================================================
    // 404 HANDLER
    // ============================================================
    app.use((req, res) => {
      res.status(404).json({
        success: false,
        message: `Rota nao encontrada: ${req.method} ${req.path}`,
      });
    });

    // ============================================================
    // GLOBAL ERROR HANDLER
    // ============================================================
    app.use((err, req, res, next) => {
      logger.error('Unhandled error:', err.message, err.stack);

      if (err.name === 'ValidationError') {
        return res.status(400).json({
          success: false,
          message: 'Erro de validacao',
        });
      }

      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({
          success: false,
          message: `Arquivo muito grande. Tamanho maximo: ${config.upload.maxFileSize / (1024 * 1024)}MB`,
        });
      }

      if (err.code === 'LIMIT_FILE_COUNT' || err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({
          success: false,
          message: 'Erro no envio de arquivos',
        });
      }

      // Never leak internal error details to clients in production
      const isDev = config.nodeEnv === 'development';
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        ...(isDev && { details: err.message }),
      });
    });

    // ============================================================
    // START SERVER
    // ============================================================
    app.listen(config.port, () => {
      logger.info(`Server running on port ${config.port}`);
      logger.info(`Environment: ${config.nodeEnv}`);
      logger.info(`API docs: http://localhost:${config.port}/api/health`);
    });
  } catch (err) {
    logger.error('Failed to start server:', err.message, err.stack);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.info('SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err.message, err.stack);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Start
bootstrap();
