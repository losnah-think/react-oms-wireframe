import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'

const DB_DIR = path.resolve(process.cwd(), 'data')
if (!fs.existsSync(DB_DIR)) {
  try {
    fs.mkdirSync(DB_DIR, { recursive: true })
  } catch (e) {
    // ignore - fallback to memory DB below
  }
}
const DB_PATH = path.join(DB_DIR, 'app.db')

let db: any
try {
  db = new Database(DB_PATH)
} catch (e) {
  // In environments where filesystem is read-only (e.g., some serverless hosts),
  // fall back to an in-memory DB so the app doesn't crash with a 500.
  // This means data won't persist across restarts, but it keeps the UI functional.
  console.warn('warning: falling back to in-memory SQLite DB due to filesystem error', String(e))
  db = new Database(':memory:')
}

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
