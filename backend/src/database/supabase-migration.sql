-- FixMyDB Supabase Schema Migration
-- Run this in your Supabase SQL editor to set up tables

-- Migration tracking (must be first)
CREATE TABLE IF NOT EXISTS public._migrations (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- History table
CREATE TABLE IF NOT EXISTS public.history (
  id TEXT PRIMARY KEY,
  timestamp TEXT NOT NULL,
  "healthScore" REAL,
  "tablesFound" INTEGER,
  "issuesCount" INTEGER,
  "recommendationsCount" INTEGER,
  "sqlPreview" TEXT,
  dialect TEXT,
  "fullResult" TEXT,
  "deviceId" TEXT
);

CREATE INDEX IF NOT EXISTS idx_history_timestamp
  ON public.history("timestamp" DESC);

-- Analytics table (tracks schema analyses)
CREATE TABLE IF NOT EXISTS public.analyses (
  id SERIAL PRIMARY KEY,
  analyses_id TEXT NOT NULL UNIQUE,
  device_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Downloads table (tracks SQL and ER diagram downloads)
CREATE TABLE IF NOT EXISTS public.downloads (
  id SERIAL PRIMARY KEY,
  device_id TEXT,
  type TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
