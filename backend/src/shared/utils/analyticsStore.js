const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/fixmydb',
});

async function init() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS analyses (
        id SERIAL PRIMARY KEY,
        analyses_id TEXT NOT NULL UNIQUE,
        device_id TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    console.log('✅ Database connected and schema ensured');
  } finally {
    client.release();
  }
}

async function trackAnalysis(deviceId) {
  const analysesId = uuidv4();
  const cleanDeviceId = deviceId && typeof deviceId === 'string' && deviceId.length > 5 ? deviceId : null;
  await pool.query(
    'INSERT INTO analyses (analyses_id, device_id, created_at) VALUES ($1, $2, NOW())',
    [analysesId, cleanDeviceId]
  );
  return analysesId;
}

async function getStats() {
  const usersResult = await pool.query('SELECT COUNT(DISTINCT device_id) AS count FROM analyses WHERE device_id IS NOT NULL');
  const totalResult = await pool.query('SELECT COUNT(*) AS count FROM analyses');
  const recentResult = await pool.query(
    'SELECT analyses_id, device_id, created_at FROM analyses ORDER BY created_at DESC'
  );

  return {
    totalUsers: parseInt(usersResult.rows[0]?.count) || 0,
    totalSchemasProcessed: parseInt(totalResult.rows[0]?.count) || 0,
    recentAnalyses: recentResult.rows.map(row => ({
      analysesId: row.analyses_id,
      deviceId: row.device_id,
      createdAt: row.created_at,
    })),
  };
}

init().catch(err => {
  console.error('❌ Database connection failed:', err.message);
});

module.exports = { trackAnalysis, getStats };