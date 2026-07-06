CREATE TABLE IF NOT EXISTS analyses (
  id SERIAL PRIMARY KEY,
  analyses_id TEXT NOT NULL UNIQUE,
  device_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_analyses_device_id ON analyses (device_id);
CREATE INDEX IF NOT EXISTS idx_analyses_created_at ON analyses (created_at DESC);
