const logger = require('../utils/logger');

function httpsEnforcement(req, res, next) {
  if (process.env.NODE_ENV !== 'production') return next();
  const proto = req.headers['x-forwarded-proto'];
  if (proto && proto !== 'https') {
    logger.warn('HTTP request redirected to HTTPS', {
      url: req.originalUrl,
      proto,
      ip: req.ip,
    });
    return res.redirect(301, `https://${req.headers.host}${req.originalUrl}`);
  }
  next();
}

module.exports = httpsEnforcement;
