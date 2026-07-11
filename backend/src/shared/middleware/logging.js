const { randomUUID } = require('crypto');
const logger = require('../utils/logger');

function requestId(req, res, next) {
  const id = req.headers['x-request-id'] || randomUUID();
  res.locals.requestId = id;
  res.setHeader('X-Request-Id', id);
  next();
}

function requestLogger(req, res, next) {
  const start = Date.now();
  const { method, url } = req;

  res.on('finish', () => {
    const duration = Date.now() - start;
    const meta = {
      method,
      url,
      status: res.statusCode,
      duration,
      requestId: res.locals.requestId,
    };
    if (res.statusCode >= 500) logger.error(`${method} ${url} ${res.statusCode}`, meta);
    else if (res.statusCode >= 400) logger.warn(`${method} ${url} ${res.statusCode}`, meta);
    else logger.info(`${method} ${url} ${res.statusCode}`, meta);
  });

  next();
}

module.exports = { requestId, requestLogger };
