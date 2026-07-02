const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../../../data/analytics.db');
let db = null;
let ready = null;

async function init() {
  const initSqlJs = require('sql.js');
  const SQL = await initSqlJs();

  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  if (fs.existsSync(DB_PATH)) {
    const buffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  db.run(`CREATE TABLE IF NOT EXISTS analyses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    device_id TEXT,
    created_at TEXT NOT NULL
  )`);

  save();
}

function save() {
  if (!db) return;
  const data = db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

ready = init();

async function trackAnalysis(deviceId) {
  await ready;
  const now = new Date().toISOString();
  db.run('INSERT INTO analyses (device_id, created_at) VALUES (?, ?)', [
    deviceId && typeof deviceId === 'string' && deviceId.length > 5 ? deviceId : null,
    now,
  ]);
  save();
}

async function getStats() {
  await ready;
  const usersResult = db.exec('SELECT COUNT(DISTINCT device_id) AS count FROM analyses WHERE device_id IS NOT NULL');
  const totalResult = db.exec('SELECT COUNT(*) AS count FROM analyses');

  const totalUsers = usersResult[0]?.values[0]?.[0] || 0;
  const totalSchemasProcessed = totalResult[0]?.values[0]?.[0] || 0;

  return { totalUsers, totalSchemasProcessed };
}

module.exports = { trackAnalysis, getStats };
