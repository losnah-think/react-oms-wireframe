-- Postgres schema for react-oms-wireframe

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE,
  name TEXT,
  role TEXT,
  password_hash TEXT
);

CREATE TABLE IF NOT EXISTS shops (
  id TEXT PRIMARY KEY,
  name TEXT,
  platform TEXT,
  credentials JSONB
);

CREATE TABLE IF NOT EXISTS integration_logs (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  shop_id TEXT,
  adapter TEXT,
  level TEXT,
  message TEXT,
  meta JSONB
);
