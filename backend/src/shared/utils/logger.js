const LOG_LEVELS = { debug: 0, info: 1, warn: 2, error: 3 };
const level = LOG_LEVELS[process.env.LOG_LEVEL || 'info'] ?? LOG_LEVELS.info;

const SENSITIVE_KEYS = new Set([
  'apikey', 'api_key', 'authorization', 'password', 'secret', 'token',
  'servicekey', 'service_key', 'supabase_service_key', 'supabase_anon_key',
  'openaikey', 'openai_key', 'groqkey', 'groq_key', 'openrouterkey', 'openrouter_key',
]);

function sanitize(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(sanitize);
  const clean = {};
  for (const [key, value] of Object.entries(obj)) {
    if (SENSITIVE_KEYS.has(key.toLowerCase())) {
      clean[key] = '[REDACTED]';
    } else if (typeof value === 'string' && /^(sk-|gsk_|sk-or-)/.test(value)) {
      clean[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      clean[key] = sanitize(value);
    } else {
      clean[key] = value;
    }
  }
  return clean;
}

function emit(levelName, message, meta = {}) {
  if (LOG_LEVELS[levelName] < level) return;
  const entry = {
    ts: new Date().toISOString(),
    level: levelName,
    msg: message,
    pid: process.pid,
    ...sanitize(meta),
  };
  const out = levelName === 'error' ? process.stderr : process.stdout;
  out.write(JSON.stringify(entry) + '\n');
}

module.exports = {
  debug: (msg, meta) => emit('debug', msg, meta),
  info:  (msg, meta) => emit('info', msg, meta),
  warn:  (msg, meta) => emit('warn', msg, meta),
  error: (msg, meta) => emit('error', msg, meta),
};
