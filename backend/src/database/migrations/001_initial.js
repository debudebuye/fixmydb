module.exports = {
  id: 1,
  name: '001_initial',
  async up(query) {
    await query(`CREATE TABLE IF NOT EXISTS history (
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
    )`, []);

    await query(`CREATE INDEX IF NOT EXISTS idx_history_timestamp ON history(timestamp DESC)`, []);

    await query(`CREATE TABLE IF NOT EXISTS analyses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      analyses_id TEXT NOT NULL UNIQUE,
      device_id TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`, []);

    await query(`CREATE TABLE IF NOT EXISTS downloads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      device_id TEXT,
      type TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`, []);
  },
};
