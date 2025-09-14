import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'

const DB_DIR = path.resolve(process.cwd(), 'data')
if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true })
const DB_PATH = path.join(DB_DIR, 'app.db')

const db = new Database(DB_PATH)

// initialize tables
db.exec(`
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
  credentials TEXT
);
CREATE TABLE IF NOT EXISTS integration_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  shop_id TEXT,
  adapter TEXT,
  level TEXT,
  message TEXT,
  meta TEXT
);
`)

export default db
