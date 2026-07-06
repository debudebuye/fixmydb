require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const { exec } = require('child_process');

const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');

const analyzeRoutes = require('./features/analyze/routes');
const schemaRoutes = require('./features/schema/routes');
const uploadRoutes = require('./features/upload/routes');
const statsRoutes = require('./features/stats/routes');
const historyRoutes = require('./features/history/routes');

const app = express();
const PORT = process.env.PORT || 5000;
const isProduction = process.env.NODE_ENV === 'production';

// Security headers
app.use(helmet());

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});
app.use('/api/', apiLimiter);

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API docs
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'FixMyDB API Docs',
}));

// Static uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Serve frontend in production
if (isProduction) {
  const distPath = path.join(__dirname, '../../frontend/dist');
  app.use(express.static(distPath));
}

// API routes
app.use('/api/analyze', analyzeRoutes);
app.use('/api/schema', schemaRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/history', historyRoutes);

// Root info
app.get('/', (req, res) => {
  res.json({
    name: 'FixMyDB API',
    version: '1.0.0',
    description: 'AI-powered database schema reviewer',
    docs: '/api/docs',
    health: '/api/health',
    endpoints: {
      analyze: { path: '/api/analyze', method: 'POST', description: 'Analyze a SQL schema' },
      examples: { path: '/api/schema/examples', method: 'GET', description: 'Get example schemas' },
      upload: { path: '/api/upload', method: 'POST', description: 'Upload a schema file' },
      stats: { path: '/api/stats', method: 'GET', description: 'Get live analytics' },
      history: { path: '/api/history', method: 'GET', description: 'List analysis history' },
      historyDetail: { path: '/api/history/:id', method: 'GET', description: 'Get a history entry' },
      historyCreate: { path: '/api/history', method: 'POST', description: 'Save to history' },
      historyClear: { path: '/api/history', method: 'DELETE', description: 'Clear all history' },
    },
    repository: 'https://github.com/debudebuye/fixmydb',
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', version: '1.0.0', service: 'FixMyDB API', uptime: process.uptime() });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', version: '1.0.0', service: 'FixMyDB API', uptime: process.uptime() });
});

// SPA fallback (production)
if (isProduction) {
  const distPath = path.join(__dirname, '../../frontend/dist');
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

const { initDatabase } = require('./database');

const server = app.listen(PORT, async () => {
  try {
    await initDatabase();
    console.log('📦 SQLite database initialized');
  } catch (err) {
    console.error('❌ Database init failed:', err.message);
  }
  console.log(`🚀 FixMyDB API running on http://localhost:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  if (process.env.OPENAI_API_KEY) {
    console.log('✅ OpenAI API key configured');
  } else {
    console.log('⚠️  No OpenAI API key - using local analysis engine');
  }
  if (isProduction && process.env.AUTO_OPEN === 'true') {
    const url = `http://localhost:${PORT}`;
    const plat = process.platform;
    if (plat === 'win32') {
      exec(`start ${url}`);
    } else if (plat === 'darwin') {
      exec(`open ${url}`);
    } else {
      exec(`xdg-open ${url}`);
    }
  }
});

server.on('error', (err) => {
  console.error(`❌ Server error: ${err.message}`);
  if (err.code === 'EADDRINUSE') {
    console.error(`   Port ${PORT} is already in use. Choose a different port.`);
  }
  process.exit(1);
});

module.exports = app;
