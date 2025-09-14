// Persist all demo/mock datasets into data/app.db
// Run: node scripts/persist-all-mocks-to-db.js

const path = require('path')
const fs = require('fs')
const Database = require('better-sqlite3')

const DB_DIR = path.resolve(process.cwd(), 'data')
if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true })
const DB_PATH = path.join(DB_DIR, 'app.db')
const db = new Database(DB_PATH)

// create tables
db.exec(`
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT,
  sku TEXT,
  price INTEGER,
  stock INTEGER,
  shop_id TEXT,
  meta TEXT
);
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  shop_id TEXT,
  created_at TEXT,
  total INTEGER,
  status TEXT,
  payment_method TEXT,
  meta TEXT
);
CREATE TABLE IF NOT EXISTS order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
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
`)

// Demo data (kept small — extend as needed)
const shops = [
  { id: 'shop_cafe24_1', name: 'Cafe24 Demo Shop', platform: 'cafe24' },
  { id: 'shop_makeshop_1', name: 'Makeshop Demo', platform: 'makeshop' },
  { id: 'shop_mock_oms', name: 'OMS Mock Shop', platform: 'oms-mock' },
]

const products = [
  { id: 'p_demo_001', name: 'Demo T-Shirt', sku: 'TSHIRT-001', price: 25000, stock: 20, shop_id: 'shop_cafe24_1' },
  { id: 'p_demo_002', name: 'Demo Mug', sku: 'MUG-001', price: 8000, stock: 50, shop_id: 'shop_makeshop_1' },
  { id: 'p_demo_003', name: 'Sample Sneakers', sku: 'SNKR-001', price: 75000, stock: 10, shop_id: 'shop_mock_oms' },
]

const orders = [
  { id: 'o_1001', shop_id: 'shop_cafe24_1', created_at: '2025-09-10T10:00:00Z', total: 35000, status: '결제완료', payment_method: '카드' },
  { id: 'o_1002', shop_id: 'shop_makeshop_1', created_at: '2025-09-11T11:30:00Z', total: 8000, status: '배송준비중', payment_method: '무통장' },
]

const orderItems = [
  { order_id: 'o_1001', product_id: 'p_demo_001', qty: 1, price: 25000 },
  { order_id: 'o_1001', product_id: 'p_demo_002', qty: 1, price: 10000 },
  { order_id: 'o_1002', product_id: 'p_demo_002', qty: 1, price: 8000 },
]

const warehouses = [
  { id: 'w_1', name: '본사 창고', location: '서울' },
  { id: 'w_2', name: '물류센터', location: '경기' },
]

const stocks = [
  { id: 'stk_1', product_id: 'p_demo_001', warehouse_id: 'w_1', qty: 20 },
  { id: 'stk_2', product_id: 'p_demo_002', warehouse_id: 'w_1', qty: 50 },
]

const brands = [
  { id: 'brand_1', name: 'DemoBrand' },
  { id: 'brand_2', name: 'SampleCo' },
]

const categories = [
  { id: 'cat_1', name: '의류 > 남성 > 셔츠' },
  { id: 'cat_2', name: '생활용품 > 주방' },
]

const customers = [
  { id: 'c_001', name: '홍길동', email: 'hong@example.com', phone: '010-1234-5678' },
  { id: 'c_002', name: '김철수', email: 'kim@example.com', phone: '010-2345-6789' },
]

const suppliers = [
  { id: 'sup_1', name: '공급사 A', contact: '010-0000-0001' },
  { id: 'sup_2', name: '공급사 B', contact: '010-0000-0002' },
]

// insert helpers
const upsertShop = db.prepare('INSERT OR REPLACE INTO shops (id, name, platform, credentials) VALUES (@id, @name, @platform, @credentials)')
const insertProduct = db.prepare('INSERT OR REPLACE INTO products (id, name, sku, price, stock, shop_id, meta) VALUES (@id, @name, @sku, @price, @stock, @shop_id, @meta)')
const insertOrder = db.prepare('INSERT OR REPLACE INTO orders (id, shop_id, created_at, total, status, payment_method, meta) VALUES (@id, @shop_id, @created_at, @total, @status, @payment_method, @meta)')
const insertOrderItem = db.prepare('INSERT INTO order_items (order_id, product_id, qty, price) VALUES (@order_id, @product_id, @qty, @price)')
const insertWarehouse = db.prepare('INSERT OR REPLACE INTO warehouses (id, name, location) VALUES (@id, @name, @location)')
const insertStock = db.prepare('INSERT OR REPLACE INTO stocks (id, product_id, warehouse_id, qty) VALUES (@id, @product_id, @warehouse_id, @qty)')
const insertBrand = db.prepare('INSERT OR REPLACE INTO brands (id, name) VALUES (@id, @name)')
const insertCategory = db.prepare('INSERT OR REPLACE INTO categories (id, name) VALUES (@id, @name)')
const insertCustomer = db.prepare('INSERT OR REPLACE INTO customers (id, name, email, phone) VALUES (@id, @name, @email, @phone)')
const insertSupplier = db.prepare('INSERT OR REPLACE INTO suppliers (id, name, contact) VALUES (@id, @name, @contact)')

try {
  const insertUser = db.prepare('INSERT OR REPLACE INTO users (id, email, name, role, password_hash) VALUES (@id, @email, @name, @role, @password_hash)')
  insertUser.run({ id: 'user_dev_admin', email: 'ui-admin@local', name: 'Dev Admin', role: 'admin', password_hash: '$2a$10$abcdefghijklmnopqrstuv' })

  const shopCreds = JSON.stringify({ clientId: 'demo_client', clientSecret: 'demo_secret' })
  shops.forEach(s => upsertShop.run({ ...s, credentials: shopCreds }))

  products.forEach(p => insertProduct.run({ ...p, meta: '{}' }))
  orders.forEach(o => insertOrder.run({ ...o, meta: '{}' }))
  orderItems.forEach(i => insertOrderItem.run(i))
  warehouses.forEach(w => insertWarehouse.run(w))
  stocks.forEach(s => insertStock.run(s))
  brands.forEach(b => insertBrand.run(b))
  categories.forEach(c => insertCategory.run(c))
  customers.forEach(cu => insertCustomer.run(cu))
  suppliers.forEach(su => insertSupplier.run(su))

  console.log('Inserted mock data into', DB_PATH)
} catch (e) {
  console.error('failed to persist mock data', e)
  process.exit(1)
}

// print counts
const counts = db.prepare(`SELECT 
  (SELECT COUNT(*) FROM shops) as shops,
  (SELECT COUNT(*) FROM products) as products,
  (SELECT COUNT(*) FROM orders) as orders,
  (SELECT COUNT(*) FROM order_items) as order_items,
  (SELECT COUNT(*) FROM warehouses) as warehouses,
  (SELECT COUNT(*) FROM stocks) as stocks,
  (SELECT COUNT(*) FROM brands) as brands,
  (SELECT COUNT(*) FROM categories) as categories,
  (SELECT COUNT(*) FROM customers) as customers,
  (SELECT COUNT(*) FROM suppliers) as suppliers
`).get()

console.log('DB counts:', counts)

process.exit(0)
