const path = require('path');
const fs = require('fs');
const initSqlJs = require('sql.js');

let db = null;
let dbPath = null;

function getDataDir() {
  if (process.env.FIXMYDB_DATA_PATH) return process.env.FIXMYDB_DATA_PATH;
  return path.join(__dirname, '..', '..', '..', 'data');
}

async function initDatabase() {
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
  save();
}

function save() {
  if (!db) return;
  fs.writeFileSync(dbPath, Buffer.from(db.export()));
}

function getHistory() {
  if (!db) return [];
  const result = db.exec('SELECT * FROM history ORDER BY timestamp DESC');
  if (!result.length) return [];
  const cols = result[0].columns;
  return result[0].values.map(row => {
    const obj = {};
    cols.forEach((c, i) => {
      obj[c] = row[i];
      if (c === 'fullResult' && row[i]) {
        try { obj[c] = JSON.parse(row[i]); } catch {}
      }
    });
    return obj;
  });
}

function addHistory(entry) {
  if (!db) return;
  const stmt = db.prepare(`INSERT INTO history (id, timestamp, healthScore, tablesFound, issuesCount, recommendationsCount, sqlPreview, dialect, fullResult, deviceId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  stmt.run([entry.id, entry.timestamp, entry.healthScore ?? null, entry.tablesFound ?? null, entry.issuesCount ?? null, entry.recommendationsCount ?? null, entry.sqlPreview ?? null, entry.dialect ?? null, entry.fullResult ? JSON.stringify(entry.fullResult) : null, entry.deviceId ?? null]);
  stmt.free();
  save();
}

function clearHistory() {
  if (!db) return;
  db.run('DELETE FROM history');
  save();
}

function closeDb() {
  if (db) { save(); db.close(); db = null; }
}

module.exports = { initDatabase, getHistory, addHistory, clearHistory, closeDb };
