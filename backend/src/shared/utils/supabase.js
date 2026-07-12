const { createClient } = require('@supabase/supabase-js');
const WebSocket = require('ws');
const logger = require('./logger');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

let supabase = null;
let enabled = false;

if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false },
    realtime: { transport: WebSocket },
  });
  enabled = true;
}

async function initSchema() {
  if (!enabled) return;

  const tables = [
    { name: 'history', createSql: `
      CREATE TABLE IF NOT EXISTS history (
        id TEXT PRIMARY KEY,
        timestamp TEXT NOT NULL,
        "healthScore" REAL,
        "tablesFound" INTEGER,
        "issuesCount" INTEGER,
        "recommendationsCount" INTEGER,
        "sqlPreview" TEXT,
        dialect TEXT,
        "fullResult" TEXT,
        "deviceId" TEXT
      );
      CREATE INDEX IF NOT EXISTS idx_history_timestamp ON history("timestamp" DESC);
    `},
    { name: 'analyses', createSql: `
      CREATE TABLE IF NOT EXISTS analyses (
        id SERIAL PRIMARY KEY,
        analyses_id TEXT NOT NULL UNIQUE,
        device_id TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `},
  ];

  for (const { name } of tables) {
    const { error } = await supabase.from(name).select('id').limit(1);
    if (error && error.code === '42P01') {
      logger.error(`Table "${name}" does not exist in Supabase — run the migration`, {
        file: 'backend/src/database/supabase-migration.sql',
      });
    } else if (error) {
      logger.error(`Supabase table "${name}" check failed`, { err: error.message });
    }
  }
}

async function ensureTables() {
  if (!enabled) return;
  const { error } = await supabase.from('history').select('id').limit(1);
  if (error && error.code === '42P01') {
    await initSchema();
  }
}

module.exports = { supabase, enabled, initSchema, ensureTables };
