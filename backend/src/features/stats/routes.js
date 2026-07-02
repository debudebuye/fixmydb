const express = require('express');
const router = express.Router();
const { getStats } = require('../../shared/utils/analyticsStore');

/**
 * GET /api/stats
 * Returns live analytics: total unique users and total schemas processed
 */
router.get('/', async (req, res) => {
  const stats = await getStats();
  res.json(stats);
});

module.exports = router;
