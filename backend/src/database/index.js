const path = require('path');
const fs = require('fs');
const initSqlJs = require('sql.js');
const { supabase, enabled: supabaseEnabled } = require('../shared/utils/supabase');
const logger = require('../shared/utils/logger');

const useSupabase = supabaseEnabled;

// ── SQLite provider (local/desktop) ──────────────────────────
let db = null;
let dbPath = null;
let saveTimer = null;

function getDataDir() {
  if (process.env.FIXMYDB_DATA_PATH) return process.env.FIXMYDB_DATA_PATH;
  return path.join(__dirname, '..', '..', 'data');
}

async function initSqlite() {
  const dataDir = getDataDir();
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  dbPath = path.join(dataDir, 'fixmydb.db');
  const SQL = await initSqlJs();
  if (fs.existsSync(dbPath)) {
    db = new SQL.Database(fs.readFileSync(dbPath));
  } else {
    db = new SQL.Database();
  }
  db.run(`CREATE TABLE IF NOT EXISTS history (
    id TEXT PRIMARY KEY,
    timestamp TEXT NOT NULL,
    healthScore REAL,
    tablesFound INTEGER,
    issuesCount INTEGER,
    recommendationsCount INTEGER,
    sqlPreview TEXT,
    dialect TEXT,
    fullResult TEXT,
    deviceId TEXT
  )`);
  db.run('CREATE INDEX IF NOT EXISTS idx_history_timestamp ON history(timestamp DESC)');
  saveSqliteImmediate();
}

function scheduleSave() {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    if (!db) return;
    try {
      fs.writeFileSync(dbPath, Buffer.from(db.export()));
    } catch (err) {
      logger.error('SQLite save failed', { err: err.message });
    }
  }, 200);
}

function saveSqliteImmediate() {
  if (saveTimer) clearTimeout(saveTimer);
  if (!db) return;
  try {
    fs.writeFileSync(dbPath, Buffer.from(db.export()));
  } catch (err) {
    logger.error('SQLite save failed', { err: err.message });
  }
}

// ── Supabase provider (production) ───────────────────────────
async function getHistorySupabase() {
  const { data, error } = await supabase
    .from('history')
    .select('*')
    .order('timestamp', { ascending: false });

  if (error) {
    logger.error('Supabase history fetch error', { err: error.message });
    return [];
  }

  return (data || []).map(row => {
    if (row.fullResult && typeof row.fullResult === 'string') {
      try { row.fullResult = JSON.parse(row.fullResult); } catch { /* ignore malformed JSON */ }
    }
    return row;
  });
}

async function addHistorySupabase(entry) {
  const payload = {
    ...entry,
    fullResult: entry.fullResult ? JSON.stringify(entry.fullResult) : null,
  };

  const { error } = await supabase.from('history').insert([payload]);
  if (error) {
    logger.error('Supabase history insert error', { err: error.message });
  }
}

async function clearHistorySupabase() {
  const { error } = await supabase.from('history').delete().neq('id', '');
  if (error) {
    logger.error('Supabase history clear error', { err: error.message });
  }
}

// ── Unified API (always async) ───────────────────────────────
async function initDatabase() {
  if (useSupabase) {
    logger.info('Using Supabase as database provider');
    return;
  }
  await initSqlite();
  logger.info('SQLite database initialized');
}

async function getHistory() {
  if (useSupabase) {
    return getHistorySupabase();
  }
  if (!db) return [];
  const result = db.exec('SELECT * FROM history ORDER BY timestamp DESC');
  if (!result.length) return [];
  const cols = result[0].columns;
  return result[0].values.map(row => {
    const obj = {};
    cols.forEach((c, i) => {
      obj[c] = row[i];
      if (c === 'fullResult' && row[i]) {
        try { obj[c] = JSON.parse(row[i]); } catch { /* ignore malformed JSON */ }
      }
    });
    return obj;
  });
}

async function addHistory(entry) {
  if (useSupabase) {
    return addHistorySupabase(entry);
  }
  if (!db) return;
  const stmt = db.prepare(`INSERT INTO history (id, timestamp, healthScore, tablesFound, issuesCount, recommendationsCount, sqlPreview, dialect, fullResult, deviceId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  stmt.run([entry.id, entry.timestamp, entry.healthScore ?? null, entry.tablesFound ?? null, entry.issuesCount ?? null, entry.recommendationsCount ?? null, entry.sqlPreview ?? null, entry.dialect ?? null, entry.fullResult ? JSON.stringify(entry.fullResult) : null, entry.deviceId ?? null]);
  stmt.free();
  scheduleSave();
}

async function clearHistory() {
  if (useSupabase) {
    return clearHistorySupabase();
  }
  if (!db) return;
  db.run('DELETE FROM history');
  scheduleSave();
}

function closeDb() {
  if (!useSupabase) {
    if (db) { saveSqliteImmediate(); db.close(); db = null; }
  }
}

module.exports = { initDatabase, getHistory, addHistory, clearHistory, closeDb, provider: useSupabase ? 'supabase' : 'sqlite' };
