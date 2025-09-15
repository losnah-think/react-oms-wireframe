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

CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT,
  sku TEXT,
  price INTEGER,
  stock INTEGER,
  shop_id TEXT,
  meta JSONB
);

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  shop_id TEXT,
  created_at TIMESTAMPTZ,
  total INTEGER,
  status TEXT,
  payment_method TEXT,
  meta JSONB
);

CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id TEXT,
  product_id TEXT,
  qty INTEGER,
  price INTEGER
);

CREATE TABLE IF NOT EXISTS warehouses (
  id TEXT PRIMARY KEY,
  name TEXT,
  location TEXT
);

CREATE TABLE IF NOT EXISTS stocks (
  id TEXT PRIMARY KEY,
  product_id TEXT,
  warehouse_id TEXT,
  qty INTEGER
);

CREATE TABLE IF NOT EXISTS brands (
  id TEXT PRIMARY KEY,
  name TEXT
);

CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT
);

CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY,
  name TEXT,
  email TEXT,
  phone TEXT
);

CREATE TABLE IF NOT EXISTS suppliers (
  id TEXT PRIMARY KEY,
  name TEXT,
  contact TEXT
);
