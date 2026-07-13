const express = require('express');
const router = express.Router();
const { getStats, trackDownload } = require('../../database');
const { sendSuccess, sendError } = require('../../shared/middleware/response');
const logger = require('../../shared/utils/logger');

router.get('/', async (req, res) => {
  try {
    const stats = await getStats();
    sendSuccess(res, {
      totalUsers: stats.totalUsers,
      totalSchemasProcessed: stats.totalSchemasProcessed,
      totalDownloads: stats.totalDownloads,
      recentAnalyses: stats.recentAnalyses.map(({ deviceId: _, ...rest }) => rest),
    });
  } catch (err) {
    logger.error('Stats error', { err: err.message, requestId: res.locals.requestId });
    sendError(res, 500, 'STATS_FETCH_FAILED', 'Failed to retrieve statistics');
  }
});

router.post('/download', async (req, res) => {
  try {
    const deviceId = typeof req.body?.deviceId === 'string' ? req.body.deviceId : null;
    const type = typeof req.body?.type === 'string' ? req.body.type : 'sql';
    trackDownload(deviceId, type).catch((err) => logger.warn('Download track failed', { err: err.message }));
    sendSuccess(res, { tracked: true }, 201);
  } catch (err) {
    logger.error('Download tracking error', { err: err.message, requestId: res.locals.requestId });
    sendError(res, 500, 'DOWNLOAD_TRACK_FAILED', 'Failed to track download');
  }
});

module.exports = router;
