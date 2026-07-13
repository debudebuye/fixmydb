const logger = require('../../shared/utils/logger');

const MIGRATION_TABLE_SQL = `CREATE TABLE IF NOT EXISTS _migrations (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  applied_at TEXT NOT NULL
)`;

async function runMigrations(queryFn, providerName) {
  await queryFn(MIGRATION_TABLE_SQL, []);

  const { rows } = await queryFn('SELECT name FROM _migrations ORDER BY id', []);
  const applied = new Set(rows.map(r => r.name));

  const migrations = [
    require('./001_initial'),
  ];

  let count = 0;
  for (const migration of migrations) {
    if (applied.has(migration.name)) continue;

    logger.info(`Running migration: ${migration.name} (${providerName})`);
    await migration.up(queryFn);
    await queryFn(
      'INSERT INTO _migrations (id, name, applied_at) VALUES (?, ?, ?)',
      [migration.id, migration.name, new Date().toISOString()]
    );
    count++;
  }

  if (count > 0) {
    logger.info(`Applied ${count} migration(s) on ${providerName}`);
  }
}

module.exports = { runMigrations };
