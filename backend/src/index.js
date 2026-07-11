const app = require('./app');
const { exec } = require('child_process');
const logger = require('./shared/utils/logger');

const PORT = process.env.PORT || 5000;
const isProduction = process.env.NODE_ENV === 'production';

const { initDatabase, closeDb, provider } = require('./database');
const { initSchema, enabled: supabaseEnabled } = require('./shared/utils/supabase');

async function start() {
  try {
    await initDatabase();
    if (supabaseEnabled) {
      await initSchema();
      logger.info('Supabase schema initialized');
    }
  } catch (err) {
    logger.error('Database init failed', { err: err.message });
  }

  const server = app.listen(PORT, () => {
    logger.info('Server started', {
      provider,
      url: process.env.BACKEND_URL,
      env: process.env.NODE_ENV,
    });
    if (isProduction && process.env.AUTO_OPEN === 'true') {
      const url = process.env.BACKEND_URL;
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
    logger.error('Server error', { err: err.message, code: err.code });
    if (err.code === 'EADDRINUSE') {
      logger.error(`Port ${PORT} is already in use`);
    }
    process.exit(1);
  });

  function shutdown(signal) {
    logger.info(`Received ${signal}, shutting down gracefully...`);
    server.close(() => {
      closeDb();
      logger.info('Server stopped');
      process.exit(0);
    });
    setTimeout(() => {
      logger.error('Forced shutdown after 10s timeout');
      process.exit(1);
    }, 10000);
  }

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

start();
