import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'

const envPath = process.env.SQLITE_DB_PATH
const dataPath = path.join(process.cwd(), 'data', 'app.db')
const tmpPath = path.join('/tmp', 'app.db')

const candidates = [envPath, dataPath, tmpPath].filter((c): c is string => Boolean(c))

let db: any
let usedPath: string | null = null
let lastError: any = null

for (const candidate of candidates) {
  try {
    const dir = path.dirname(candidate as string)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    db = new Database(candidate as string)
    usedPath = candidate as string
    break
  } catch (e) {
    lastError = e
    // try next candidate
    console.warn(`warning: failed to open sqlite at ${candidate}: ${String(e)}`)
  }
}

if (!db) {
  // In environments where filesystem is read-only (e.g., some serverless hosts),
  // fall back to an in-memory DB so the app doesn't crash with a 500.
  // This means data won't persist across restarts, but it keeps the UI functional.
  console.warn('warning: falling back to in-memory SQLite DB; all file candidates failed', String(lastError))
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
