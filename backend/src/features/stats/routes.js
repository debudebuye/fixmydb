const express = require('express');
const router = express.Router();
const { getStats, trackDownload } = require('../../shared/utils/analyticsStore');
const { sendSuccess, sendError } = require('../../shared/middleware/response');
const logger = require('../../shared/utils/logger');

router.get('/', async (req, res) => {
  try {
    const stats = await getStats();
    sendSuccess(res, stats);
  } catch (err) {
    logger.error('Stats error', { err: err.message, requestId: res.locals.requestId });
    sendError(res, 500, 'STATS_FETCH_FAILED', 'Failed to retrieve statistics');
  }
});

router.post('/download', async (req, res) => {
  const { deviceId, type } = req.body;
  trackDownload(deviceId, type || 'sql').catch(() => {});
  sendSuccess(res, { tracked: true }, 201);
});

module.exports = router;
