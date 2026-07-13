const { Pool } = require('pg');
const logger = require('../../shared/utils/logger');

let pool = null;

async function init() {
  pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();
  try {
    await client.query('SELECT 1');
    logger.info('PostgreSQL database connected');
  } finally {
    client.release();
  }
}

async function query(sql, params = []) {
  const result = await pool.query(sql, params);
  return { rows: result.rows };
}

async function getHistory() {
  const { rows } = await pool.query('SELECT * FROM history ORDER BY timestamp DESC');
  return rows.map(row => {
    if (row.fullResult && typeof row.fullResult === 'string') {
      try { row.fullResult = JSON.parse(row.fullResult); } catch { /* ignore */ }
    }
    return row;
  });
}

async function addHistory(entry) {
  await pool.query(
    `INSERT INTO history (id, timestamp, "healthScore", "tablesFound", "issuesCount", "recommendationsCount", "sqlPreview", dialect, "fullResult", "deviceId")
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
    [
      entry.id, entry.timestamp, entry.healthScore ?? null, entry.tablesFound ?? null,
      entry.issuesCount ?? null, entry.recommendationsCount ?? null, entry.sqlPreview ?? null,
      entry.dialect ?? null, entry.fullResult ? JSON.stringify(entry.fullResult) : null,
      entry.deviceId ?? null,
    ]
  );
}

async function clearHistory() {
  await pool.query('DELETE FROM history');
}

async function trackAnalysis(deviceId) {
  const { v4: uuidv4 } = require('uuid');
  const analysesId = uuidv4();
  const clean = deviceId && typeof deviceId === 'string' && deviceId.length > 5 ? deviceId : null;
  await pool.query(
    'INSERT INTO analyses (analyses_id, device_id, created_at) VALUES ($1, $2, NOW())',
    [analysesId, clean]
  );
  return analysesId;
}

async function trackDownload(deviceId, type = 'sql') {
  const clean = deviceId && typeof deviceId === 'string' && deviceId.length > 5 ? deviceId : null;
  await pool.query(
    'INSERT INTO downloads (device_id, type, created_at) VALUES ($1, $2, NOW())',
    [clean, type]
  );
}

async function getStats() {
  const [usersResult, totalResult, downloadsResult, recentResult] = await Promise.all([
    pool.query('SELECT COUNT(DISTINCT device_id) AS count FROM analyses WHERE device_id IS NOT NULL'),
    pool.query('SELECT COUNT(*) AS count FROM analyses'),
    pool.query("SELECT COUNT(*) AS count FROM downloads WHERE type = 'desktop-app'"),
    pool.query('SELECT analyses_id, device_id, created_at FROM analyses ORDER BY created_at DESC'),
  ]);

  return {
    totalUsers: parseInt(usersResult.rows[0]?.count) || 0,
    totalSchemasProcessed: parseInt(totalResult.rows[0]?.count) || 0,
    totalDownloads: parseInt(downloadsResult.rows[0]?.count) || 0,
    recentAnalyses: recentResult.rows.map(row => ({
      analysesId: row.analyses_id,
      deviceId: row.device_id,
      createdAt: row.created_at,
    })),
  };
}

function close() {
  if (pool) pool.end().catch(() => {});
}

module.exports = { name: 'postgresql', init, query, getHistory, addHistory, clearHistory, trackAnalysis, trackDownload, getStats, close };
