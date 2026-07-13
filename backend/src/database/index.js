const { runMigrations } = require('./migrations/index');

let provider = null;
let initPromise = null;

function pickProvider() {
  if (process.env.SUPABASE_URL && (process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY)) {
    return require('./providers/supabase');
  }
  if (process.env.DATABASE_URL) {
    return require('./providers/postgresql');
  }
  return require('./providers/sqlite');
}

async function ensureInit() {
  if (provider) return;
  if (initPromise) return initPromise;
  initPromise = (async () => {
    provider = pickProvider();
    await provider.init();
    if (provider.query) {
      await runMigrations(
        (sql, params) => provider.query(sql, params),
        provider.name
      );
    }
  })();
  await initPromise;
}

async function initDatabase() {
  await ensureInit();
}

async function getHistory() {
  await ensureInit();
  return provider.getHistory();
}

async function addHistory(entry) {
  await ensureInit();
  return provider.addHistory(entry);
}

async function clearHistory() {
  await ensureInit();
  return provider.clearHistory();
}

async function trackAnalysis(deviceId) {
  await ensureInit();
  return provider.trackAnalysis(deviceId);
}

async function trackDownload(deviceId, type) {
  await ensureInit();
  return provider.trackDownload(deviceId, type);
}

async function getStats() {
  await ensureInit();
  return provider.getStats();
}

function closeDb() {
  if (provider) provider.close();
}

function getProviderName() {
  return provider ? provider.name : 'none';
}

module.exports = {
  initDatabase,
  getHistory,
  addHistory,
  clearHistory,
  trackAnalysis,
  trackDownload,
  getStats,
  closeDb,
  getProviderName,
};
