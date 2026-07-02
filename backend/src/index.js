require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

const analyzeRoutes = require('./features/analyze/routes');
const schemaRoutes = require('./features/schema/routes');
const uploadRoutes = require('./features/upload/routes');
const statsRoutes = require('./features/stats/routes');

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

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', version: '1.0.0', service: 'FixMyDB API' });
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

app.listen(PORT, () => {
  console.log(`🚀 FixMyDB API running on http://localhost:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  if (process.env.OPENAI_API_KEY) {
    console.log('✅ OpenAI API key configured');
  } else {
    console.log('⚠️  No OpenAI API key - using local analysis engine');
  }
});

module.exports = app;
