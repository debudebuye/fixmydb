const LOG_LEVELS = { debug: 0, info: 1, warn: 2, error: 3 };
const level = LOG_LEVELS[process.env.LOG_LEVEL || 'info'] ?? LOG_LEVELS.info;

function emit(levelName, message, meta = {}) {
  if (LOG_LEVELS[levelName] < level) return;
  const entry = {
    ts: new Date().toISOString(),
    level: levelName,
    msg: message,
    pid: process.pid,
    ...meta,
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
