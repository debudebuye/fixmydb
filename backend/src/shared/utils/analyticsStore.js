const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');
const { supabase, enabled: supabaseEnabled } = require('./supabase');
const logger = require('./logger');

const dbUrl = process.env.DATABASE_URL;

let pool = null;
let pgEnabled = false;

if (dbUrl && !supabaseEnabled) {
  pool = new Pool({ connectionString: dbUrl });
  pgEnabled = true;
} else if (dbUrl && supabaseEnabled) {
  logger.info('Supabase configured — using it for analytics instead of direct PostgreSQL');
} else if (!dbUrl && !supabaseEnabled) {
  logger.warn('DATABASE_URL not set and Supabase not configured — analytics tracking disabled');
}

async function init() {
  if (pgEnabled) {
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
      await client.query(`
        CREATE TABLE IF NOT EXISTS downloads (
          id SERIAL PRIMARY KEY,
          device_id TEXT,
          type TEXT NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `);
      logger.info('PostgreSQL database connected and schema ensured');
    } finally {
      client.release();
    }
  } else if (supabaseEnabled) {
    const { error } = await supabase.from('analyses').select('id').limit(1);
    if (error && error.code === '42P01') {
      logger.error('Analytics tables missing in Supabase — run the migration in Supabase SQL Editor', {
        file: 'backend/src/database/supabase-migration.sql',
      });
    } else if (error) {
      logger.error('Supabase analytics table check failed', { err: error.message });
    } else {
      logger.info('Supabase analytics tables verified');
    }
  }
}

async function trackAnalysis(deviceId) {
  const analysesId = uuidv4();
  const cleanDeviceId = deviceId && typeof deviceId === 'string' && deviceId.length > 5 ? deviceId : null;

  if (supabaseEnabled) {
    const { error } = await supabase.from('analyses').insert([{
      analyses_id: analysesId,
      device_id: cleanDeviceId,
      created_at: new Date().toISOString(),
    }]);
    if (error) {
      logger.error('Supabase analytics track error', { err: error.message });
    }
    return analysesId;
  }

  if (pgEnabled) {
    await pool.query(
      'INSERT INTO analyses (analyses_id, device_id, created_at) VALUES ($1, $2, NOW())',
      [analysesId, cleanDeviceId]
    );
    return analysesId;
  }

  return null;
}

async function trackDownload(deviceId, type = 'sql') {
  const cleanDeviceId = deviceId && typeof deviceId === 'string' && deviceId.length > 5 ? deviceId : null;

  if (supabaseEnabled) {
    const { error } = await supabase.from('downloads').insert([{
      device_id: cleanDeviceId,
      type,
      created_at: new Date().toISOString(),
    }]);
    if (error) logger.error('Supabase download track error', { err: error.message });
    return;
  }

  if (pgEnabled) {
    await pool.query(
      'INSERT INTO downloads (device_id, type, created_at) VALUES ($1, $2, NOW())',
      [cleanDeviceId, type]
    );
  }
}

async function getStats() {
  if (supabaseEnabled) {
    const [analysesResult, downloadsResult] = await Promise.all([
      supabase.from('analyses').select('analyses_id, device_id, created_at').order('created_at', { ascending: false }),
      supabase.from('downloads').select('id', { count: 'exact', head: true }),
    ]);

    const { data, error } = analysesResult;
    if (error) {
      logger.error('Supabase stats fetch error', { err: error.message });
      return { totalUsers: 0, totalSchemasProcessed: 0, totalDownloads: 0, recentAnalyses: [] };
    }

    const uniqueDevices = new Set((data || []).filter(r => r.device_id).map(r => r.device_id));
    return {
      totalUsers: uniqueDevices.size,
      totalSchemasProcessed: (data || []).length,
      totalDownloads: downloadsResult.count || 0,
      recentAnalyses: (data || []).map(row => ({
        analysesId: row.analyses_id,
        deviceId: row.device_id,
        createdAt: row.created_at,
      })),
    };
  }

  if (!pgEnabled) return { totalUsers: 0, totalSchemasProcessed: 0, totalDownloads: 0, recentAnalyses: [] };

  const [usersResult, totalResult, downloadsResult, recentResult] = await Promise.all([
    pool.query('SELECT COUNT(DISTINCT device_id) AS count FROM analyses WHERE device_id IS NOT NULL'),
    pool.query('SELECT COUNT(*) AS count FROM analyses'),
    pool.query('SELECT COUNT(*) AS count FROM downloads'),
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

init().catch(err => {
  if (pgEnabled) {
    logger.error('Analytics database connection failed', { err: err.message });
  }
});

module.exports = { trackAnalysis, trackDownload, getStats };
