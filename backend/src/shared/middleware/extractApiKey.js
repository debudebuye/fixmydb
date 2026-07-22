/**
 * Extract AI API key from the X-AI-API-Key header and merge into req.body.aiConfig.
 * This keeps the key out of request bodies (which proxies may log).
 * Backward-compatible: body-based keys still work.
 */
function extractApiKeyFromHeader(req, _res, next) {
  const headerKey = req.headers['x-ai-api-key'];
  if (headerKey && typeof headerKey === 'string') {
    if (!req.body) req.body = {};
    if (!req.body.aiConfig) req.body.aiConfig = {};
    req.body.aiConfig.apiKey = headerKey;
  }
  next();
}

module.exports = { extractApiKeyFromHeader };
