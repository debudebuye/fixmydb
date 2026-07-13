const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../../database');
const { schemas, validate } = require('../../shared/middleware/validate');
const { sendSuccess, sendError, sendPaginated } = require('../../shared/middleware/response');
const logger = require('../../shared/utils/logger');

const isProduction = process.env.NODE_ENV === 'production';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const offset = (page - 1) * limit;

    const all = await db.getHistory();
    const total = all.length;
    const summary = all
      .map(({ fullResult: _fullResult, ...rest }) => rest)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(offset, offset + limit);

    sendPaginated(res, summary, { page, limit, total });
  } catch (err) {
    logger.error('History list error', { err: err.message, requestId: res.locals.requestId });
    sendError(res, 500, 'HISTORY_FETCH_FAILED', 'Failed to retrieve history');
  }
});

router.get('/:id', validate(schemas.historyId, 'params'), async (req, res) => {
  try {
    const all = await db.getHistory();
    const entry = all.find(e => e.id === req.params.id);
    if (!entry) return sendError(res, 404, 'NOT_FOUND', 'History entry not found');
    sendSuccess(res, entry);
  } catch (err) {
    logger.error('History get error', { err: err.message, requestId: res.locals.requestId });
    sendError(res, 500, 'HISTORY_FETCH_FAILED', 'Failed to retrieve history entry');
  }
});

router.post('/', validate(schemas.historyEntry), async (req, res) => {
  try {
    const { healthScore, tablesFound, issuesCount, recommendationsCount, sqlPreview, dialect, fullResult, deviceId } = req.body;
    const entry = {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      healthScore,
      tablesFound,
      issuesCount,
      recommendationsCount,
      sqlPreview,
      dialect,
      fullResult,
      deviceId,
    };
    await db.addHistory(entry);
    sendSuccess(res, entry, 201);
  } catch (err) {
    logger.error('History save error', { err: err.message, requestId: res.locals.requestId });
    sendError(res, 500, 'HISTORY_SAVE_FAILED', 'Failed to save history');
  }
});

router.delete('/', (req, res) => {
  if (isProduction) {
    return sendError(res, 403, 'FORBIDDEN', 'History deletion is disabled in production');
  }

  db.clearHistory()
    .then(() => sendSuccess(res, { cleared: true }))
    .catch(err => {
      logger.error('History clear error', { err: err.message, requestId: res.locals.requestId });
      sendError(res, 500, 'HISTORY_CLEAR_FAILED', 'Failed to clear history');
    });
});

module.exports = router;
