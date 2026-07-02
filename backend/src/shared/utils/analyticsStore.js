const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '../../../data/analytics.json');

function ensureDir() {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function read() {
  try {
    ensureDir();
    if (!fs.existsSync(DATA_FILE)) return { devices: {}, totalAnalyses: 0 };
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
  } catch {
    return { devices: {}, totalAnalyses: 0 };
  }
}

function write(data) {
  ensureDir();
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

function trackAnalysis(deviceId) {
  const data = read();
  if (deviceId && typeof deviceId === 'string' && deviceId.length > 5) {
    const existing = data.devices[deviceId];
    data.devices[deviceId] = {
      firstSeen: existing?.firstSeen || new Date().toISOString(),
      lastSeen: new Date().toISOString(),
      count: (existing?.count || 0) + 1,
    };
  }
  data.totalAnalyses = (data.totalAnalyses || 0) + 1;
  write(data);
}

function getStats() {
  const data = read();
  return {
    totalUsers: Object.keys(data.devices).length,
    totalSchemasProcessed: data.totalAnalyses || 0,
  };
}

module.exports = { trackAnalysis, getStats };
