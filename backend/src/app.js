require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const logger = require('./shared/utils/logger');
const { requestId, requestLogger } = require('./shared/middleware/logging');
const { sendError } = require('./shared/middleware/response');

// ── Validate required env vars at startup ──
const requiredEnvVars = ['FRONTEND_URL'];
const missing = requiredEnvVars.filter(v => !process.env[v]);
if (missing.length) {
  logger.error('Missing required environment variables', { vars: missing });
  process.exit(1);
}

const analyzeRoutes = require('./features/analyze/routes');
const schemaRoutes = require('./features/schema/routes');
const uploadRoutes = require('./features/upload/routes');
const statsRoutes = require('./features/stats/routes');
const historyRoutes = require('./features/history/routes');

const app = express();
const isProduction = process.env.NODE_ENV === 'production';

// ── Trust proxy (rate limiter + logging need real IP) ──
app.set('trust proxy', 1);

// ── HTTPS enforcement (production only, behind reverse proxy) ──
if (isProduction) {
  app.use(require('./shared/middleware/httpsEnforcement'));
}

// ── Security ──
app.use(helmet(isProduction ? {
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://cdn.jsdelivr.net"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
      imgSrc: ["'self'", "data:", "blob:"],
      fontSrc: ["'self'", "data:"],
      connectSrc: ["'self'", "https://api.fixmydb.dev", "https://api.openai.com", "https://api.groq.com", "https://openrouter.ai", "https://generativelanguage.googleapis.com"],
      workerSrc: ["'self'", "blob:", "https://cdn.jsdelivr.net"],
      frameSrc: ["'self'"],
      frameAncestors: ["'self'"],
    },
  },
} : { contentSecurityPolicy: false }));

// ── Request ID (every request gets a unique ID) ──
app.use(requestId);

// ── Request logging ──
app.use(requestLogger);

// ── Allowed origins (shared by origin check + CORS) ──
const allowedOrigins = (process.env.FRONTEND_URL || '')
  .split(',')
  .map(s => s.trim().replace(/\/+$/, ''))
  .filter(Boolean);

// ── Origin check (API-only, skips /health) ──
app.use('/api/', (req, res, next) => {
  if (req.path === '/health' || req.path.includes('/health')) return next();

  const origin = req.headers.origin;
  if (!origin) {
    return sendError(res, 403, 'FORBIDDEN', 'Direct API access is not allowed. Use the web interface.');
  }
  const normalized = origin.replace(/\/+$/, '');
  if (!allowedOrigins.includes(normalized)) {
    return sendError(res, 403, 'FORBIDDEN', 'Origin not allowed');
  }
  next();
});

// ── Rate limiting ──
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => sendError(res, 429, 'RATE_LIMITED', 'Too many requests, please try again later.'),
});
app.use('/api/', apiLimiter);

const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => sendError(res, 429, 'RATE_LIMITED', 'Too many requests, please try again later.'),
});
app.use('/', generalLimiter);

// ── CORS ──
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin.replace(/\/+$/, ''))) {
      cb(null, true);
    } else {
      cb(new Error('Not allowed by CORS'));
    }
  },
}));

// ── Body parsing ──
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Swagger docs (dev only) ──
if (!isProduction) {
  const swaggerUi = require('swagger-ui-express');
  const swaggerSpec = require('./swagger');
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'FixMyDB API Docs',
  }));
}

// ── Static files ──
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

if (isProduction) {
  const distPath = path.join(__dirname, '../../frontend/dist');
  app.use(express.static(distPath));
}

// ── API v1 routes ──
app.use('/api/v1/analyze', analyzeRoutes);
app.use('/api/v1/schema', schemaRoutes);
app.use('/api/v1/upload', uploadRoutes);
app.use('/api/v1/stats', statsRoutes);
app.use('/api/v1/history', historyRoutes);

// ── Backward-compatible /api/* aliases (redirect to v1) ──
app.use('/api/analyze', (req, res) => res.redirect(301, `/api/v1/analyze${req.url}`));
app.use('/api/schema', (req, res) => res.redirect(301, `/api/v1/schema${req.url}`));
app.use('/api/upload', (req, res) => res.redirect(301, `/api/v1/upload${req.url}`));
app.use('/api/stats', (req, res) => res.redirect(301, `/api/v1/stats${req.url}`));
app.use('/api/history', (req, res) => res.redirect(301, `/api/v1/history${req.url}`));

// ── Root + health ──
app.get('/', (req, res) => {
  res.json({
    service: 'FixMyDB API',
    version: '1.0.0',
    description: 'AI-powered database schema reviewer',
    documentation: '/api/docs',
    health: '/api/health',
    source: 'https://github.com/debudebuye/fixmydb',
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', version: '1.0.0', service: 'FixMyDB API', uptime: process.uptime() });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', version: '1.0.0', service: 'FixMyDB API', uptime: process.uptime() });
});

// ── SPA fallback (production) ──
if (isProduction) {
  const distPath = path.join(__dirname, '../../frontend/dist');
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// ── 404 ──
app.use((req, res) => {
  sendError(res, 404, 'NOT_FOUND', 'Route not found');
});

// ── Global error handler ──
app.use((err, req, res, _next) => {
  logger.error('Unhandled error', { err: err.message, stack: err.stack, requestId: res.locals.requestId });
  sendError(res, 500, 'INTERNAL_ERROR', isProduction ? 'Internal server error' : err.message);
});

module.exports = app;
