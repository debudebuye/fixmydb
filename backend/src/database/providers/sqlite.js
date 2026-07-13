const path = require('path');
const fs = require('fs');
const initSqlJs = require('sql.js');
const logger = require('../../shared/utils/logger');

let db = null;
let dbPath = null;
let saveTimer = null;

function getDataDir() {
  if (process.env.FIXMYDB_DATA_PATH) return process.env.FIXMYDB_DATA_PATH;
  return path.join(__dirname, '..', '..', '..', 'data');
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

function saveImmediate() {
  if (saveTimer) clearTimeout(saveTimer);
  if (!db) return;
  try {
    fs.writeFileSync(dbPath, Buffer.from(db.export()));
  } catch (err) {
    logger.error('SQLite save failed', { err: err.message });
  }
}

function runQuery(sql, params = []) {
  if (params.length === 0) {
    db.run(sql);
    return { rows: [] };
  }
  const stmt = db.prepare(sql);
  try {
    stmt.run(params);
    return { rows: [] };
  } finally {
    stmt.free();
  }
}

function selectAll(sql, params = []) {
  if (params.length === 0) {
    const result = db.exec(sql);
    if (!result.length) return { rows: [] };
    return {
      rows: result[0].values.map(row => {
        const obj = {};
        result[0].columns.forEach((c, i) => { obj[c] = row[i]; });
        return obj;
      }),
    };
  }
  const stmt = db.prepare(sql);
  try {
    stmt.bind(params);
    const rows = [];
    while (stmt.step()) {
      const cols = stmt.getColumnNames();
      const values = stmt.get();
      const obj = {};
      cols.forEach((c, i) => { obj[c] = values[i]; });
      rows.push(obj);
    }
    return { rows };
  } finally {
    stmt.free();
  }
}

async function init() {
  const dataDir = getDataDir();
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  dbPath = path.join(dataDir, 'fixmydb.db');
  const SQL = await initSqlJs();
  if (fs.existsSync(dbPath)) {
    db = new SQL.Database(fs.readFileSync(dbPath));
  } else {
    db = new SQL.Database();
  }
  saveImmediate();
  logger.info(`SQLite database initialized at ${dbPath}`);
}

async function query(sql, params = []) {
  const isSelect = sql.trim().toUpperCase().startsWith('SELECT') || sql.trim().toUpperCase().startsWith('PRAGMA');
  if (isSelect) return selectAll(sql, params);
  runQuery(sql, params);
  scheduleSave();
  return { rows: [] };
}

async function getHistory() {
  const { rows } = await selectAll('SELECT * FROM history ORDER BY timestamp DESC');
  return rows.map(row => {
    if (row.fullResult && typeof row.fullResult === 'string') {
      try { row.fullResult = JSON.parse(row.fullResult); } catch { /* ignore */ }
    }
    return row;
  });
}

async function addHistory(entry) {
  runQuery(
    `INSERT INTO history (id, timestamp, healthScore, tablesFound, issuesCount, recommendationsCount, sqlPreview, dialect, fullResult, deviceId)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      entry.id, entry.timestamp, entry.healthScore ?? null, entry.tablesFound ?? null,
      entry.issuesCount ?? null, entry.recommendationsCount ?? null, entry.sqlPreview ?? null,
      entry.dialect ?? null, entry.fullResult ? JSON.stringify(entry.fullResult) : null,
      entry.deviceId ?? null,
    ]
  );
  scheduleSave();
}

async function clearHistory() {
  runQuery('DELETE FROM history');
  scheduleSave();
}

async function trackAnalysis(deviceId) {
  const { v4: uuidv4 } = require('uuid');
  const analysesId = uuidv4();
  const clean = deviceId && typeof deviceId === 'string' && deviceId.length > 5 ? deviceId : null;
  runQuery(
    `INSERT INTO analyses (analyses_id, device_id, created_at) VALUES (?, ?, datetime('now'))`,
    [analysesId, clean]
  );
  scheduleSave();
  return analysesId;
}

async function trackDownload(deviceId, type = 'sql') {
  const clean = deviceId && typeof deviceId === 'string' && deviceId.length > 5 ? deviceId : null;
  try {
    runQuery(
      `INSERT INTO downloads (device_id, type, created_at) VALUES (?, ?, datetime('now'))`,
      [clean, type]
    );
    scheduleSave();
  } catch (err) {
    logger.error('SQLite download track error', { err: err.message });
    throw err;
  }
}

async function getStats() {
  const uniqueRows = selectAll('SELECT DISTINCT device_id FROM analyses WHERE device_id IS NOT NULL').rows;
  const totalRows = selectAll('SELECT COUNT(*) AS count FROM analyses').rows;
  const downloadRows = selectAll('SELECT COUNT(*) AS count FROM downloads').rows;
  const recentRows = selectAll('SELECT analyses_id, device_id, created_at FROM analyses ORDER BY created_at DESC').rows;

  return {
    totalUsers: uniqueRows.length,
    totalSchemasProcessed: parseInt(totalRows[0]?.count) || 0,
    totalDownloads: parseInt(downloadRows[0]?.count) || 0,
    recentAnalyses: recentRows.map(row => ({
      analysesId: row.analyses_id,
      deviceId: row.device_id,
      createdAt: row.created_at,
    })),
  };
}

function close() {
  saveImmediate();
  if (db) {
    try { db.close(); } catch { /* already closed */ }
    db = null;
  }
}

module.exports = { name: 'sqlite', init, query, getHistory, addHistory, clearHistory, trackAnalysis, trackDownload, getStats, close };
