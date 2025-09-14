// Small node script to persist demo shops and a dev admin user into data/app.db
// Run with: node scripts/persist-mocks-to-db.js

const path = require('path')
// require the compiled ts via ts-node isn't available; import the JS by requiring project's ts via ts-node/register is complex.
// Instead, require the project's src using Node's ESM or CommonJS with ts-node/register. Simpler: use the same DB file with better-sqlite3 directly here.

const Database = require('better-sqlite3')
const fs = require('fs')

const DB_DIR = path.resolve(process.cwd(), 'data')
if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true })
const DB_PATH = path.join(DB_DIR, 'app.db')

const db = new Database(DB_PATH)

// create tables if not exists (same schema as src/lib/db.ts)
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

function insertOrReplaceUser(user) {
  const stmt = db.prepare('INSERT OR REPLACE INTO users (id, email, name, role, password_hash) VALUES (@id, @email, @name, @role, @password_hash)')
  return stmt.run(user)
}

function insertOrReplaceShop(shop) {
  const stmt = db.prepare('INSERT OR REPLACE INTO shops (id, name, platform, credentials) VALUES (@id, @name, @platform, @credentials)')
  return stmt.run({ ...shop, credentials: JSON.stringify(shop.credentials || {}) })
}

// Demo entries
const devAdmin = { id: 'user_dev_admin', email: 'ui-admin@local', name: 'Dev Admin', role: 'admin', password_hash: '$2a$10$abcdefghijklmnopqrstuv' }
const shops = [
  { id: 'shop_cafe24_1', name: 'Cafe24 Demo Shop', platform: 'cafe24', credentials: { clientId: 'demo_client', clientSecret: 'demo_secret' } },
  { id: 'shop_makeshop_1', name: 'Makeshop Demo', platform: 'makeshop', credentials: {} },
  { id: 'shop_mock_oms', name: 'OMS Mock Shop', platform: 'oms-mock', credentials: {} },
]

try {
  insertOrReplaceUser(devAdmin)
  shops.forEach(insertOrReplaceShop)
  console.log('Persisted demo user and shops to', DB_PATH)
} catch (e) {
  console.error('error writing to DB', e)
  process.exit(1)
}

process.exit(0)
