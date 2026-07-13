const { createClient } = require('@supabase/supabase-js');
const WebSocket = require('ws');
const logger = require('../../shared/utils/logger');

let client = null;

async function init() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('SUPABASE_URL and SUPABASE key are required');

  client = createClient(url, key, {
    auth: { persistSession: false },
    realtime: { transport: WebSocket },
  });

  const { error } = await client.from('history').select('id').limit(1);
  if (error && error.code === '42P01') {
    logger.error('Supabase tables missing — run the migration in Supabase SQL Editor', {
      file: 'backend/src/database/supabase-migration.sql',
    });
  } else if (error) {
    logger.error('Supabase connection check failed', { err: error.message });
  } else {
    logger.info('Supabase connected and tables verified');
  }
}

async function query(_sql, _params = []) {
  logger.warn('Supabase provider does not support raw SQL queries');
  return { rows: [] };
}

async function getHistory() {
  const { data, error } = await client
    .from('history')
    .select('*')
    .order('timestamp', { ascending: false });

  if (error) {
    logger.error('Supabase history fetch error', { err: error.message });
    return [];
  }

  return (data || []).map(row => {
    if (row.fullResult && typeof row.fullResult === 'string') {
      try { row.fullResult = JSON.parse(row.fullResult); } catch { /* ignore */ }
    }
    return row;
  });
}

async function addHistory(entry) {
  const payload = {
    ...entry,
    fullResult: entry.fullResult ? JSON.stringify(entry.fullResult) : null,
  };
  const { error } = await client.from('history').insert([payload]);
  if (error) logger.error('Supabase history insert error', { err: error.message });
}

async function clearHistory() {
  const { error } = await client.from('history').delete().neq('id', '');
  if (error) logger.error('Supabase history clear error', { err: error.message });
}

async function trackAnalysis(deviceId) {
  const { v4: uuidv4 } = require('uuid');
  const analysesId = uuidv4();
  const clean = deviceId && typeof deviceId === 'string' && deviceId.length > 5 ? deviceId : null;
  const { error } = await client.from('analyses').insert([{
    analyses_id: analysesId,
    device_id: clean,
    created_at: new Date().toISOString(),
  }]);
  if (error) logger.error('Supabase analytics track error', { err: error.message });
  return analysesId;
}

async function trackDownload(deviceId, type = 'sql') {
  const clean = deviceId && typeof deviceId === 'string' && deviceId.length > 5 ? deviceId : null;
  const { error } = await client.from('downloads').insert([{
    device_id: clean,
    type,
    created_at: new Date().toISOString(),
  }]);
  if (error) {
    logger.error('Supabase download track error', { err: error.message, code: error.code });
    throw new Error(`Download track failed: ${error.message}`);
  }
}

async function getStats() {
  const [analysesResult, downloadsResult] = await Promise.all([
    client.from('analyses').select('analyses_id, device_id, created_at').order('created_at', { ascending: false }),
    client.from('downloads').select('id', { count: 'exact', head: true }),
  ]);

  if (analysesResult.error) {
    logger.error('Supabase stats fetch error (analyses)', { err: analysesResult.error.message, code: analysesResult.error.code });
    return { totalUsers: 0, totalSchemasProcessed: 0, totalDownloads: 0, recentAnalyses: [] };
  }

  if (downloadsResult.error) {
    logger.error('Supabase stats fetch error (downloads) — table may be missing. Run supabase-migration.sql', {
      err: downloadsResult.error.message,
      code: downloadsResult.error.code,
      file: 'backend/src/database/supabase-migration.sql',
    });
  }

  const data = analysesResult.data || [];
  const uniqueDevices = new Set(data.filter(r => r.device_id).map(r => r.device_id));
  return {
    totalUsers: uniqueDevices.size,
    totalSchemasProcessed: data.length,
    totalDownloads: downloadsResult.count || 0,
    recentAnalyses: data.map(row => ({
      analysesId: row.analyses_id,
      deviceId: row.device_id,
      createdAt: row.created_at,
    })),
  };
}

function close() { /* Supabase has no local resources to close */ }

module.exports = { name: 'supabase', init, query, getHistory, addHistory, clearHistory, trackAnalysis, trackDownload, getStats, close };
