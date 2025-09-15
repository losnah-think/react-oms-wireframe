// Persist all demo/mock datasets into Supabase via REST
// Run: SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/persist-all-mocks-to-db.js

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in environment')
  process.exit(1)
}

const shops = [
  { id: 'shop_cafe24_1', name: 'Cafe24 Demo Shop', platform: 'cafe24' },
  { id: 'shop_makeshop_1', name: 'Makeshop Demo', platform: 'makeshop' },
  { id: 'shop_mock_oms', name: 'OMS Mock Shop', platform: 'oms-mock' },
]

const products = [
  { id: 'p_demo_001', name: 'Demo T-Shirt', sku: 'TSHIRT-001', price: 25000, stock: 20, shop_id: 'shop_cafe24_1', meta: {} },
  { id: 'p_demo_002', name: 'Demo Mug', sku: 'MUG-001', price: 8000, stock: 50, shop_id: 'shop_makeshop_1', meta: {} },
  { id: 'p_demo_003', name: 'Sample Sneakers', sku: 'SNKR-001', price: 75000, stock: 10, shop_id: 'shop_mock_oms', meta: {} },
]

const orders = [
  { id: 'o_1001', shop_id: 'shop_cafe24_1', created_at: '2025-09-10T10:00:00Z', total: 35000, status: '결제완료', payment_method: '카드', meta: {} },
  { id: 'o_1002', shop_id: 'shop_makeshop_1', created_at: '2025-09-11T11:30:00Z', total: 8000, status: '배송준비중', payment_method: '무통장', meta: {} },
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

async function upsert(table, rows) {
  const url = `${SUPABASE_URL.replace(/\/$/, '')}/rest/v1/${table}`
  for (const row of rows) {
    const r = await fetch(url, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation, resolution=merge-duplicates',
      },
      body: JSON.stringify(row),
    })
    if (!r.ok) {
      const text = await r.text()
      throw new Error(`Failed to insert into ${table}: ${r.status} ${text}`)
    }
    let text = await r.text()
    let body = null
    try {
      body = text ? JSON.parse(text) : null
    } catch (err) {
      body = text
    }
    console.log(`Upserted into ${table}:`, Array.isArray(body) ? body[0] : body)
  }
}

;(async () => {
  try {
    await upsert('users', [ { id: 'user_dev_admin', email: 'ui-admin@local', name: 'Dev Admin', role: 'admin', password_hash: '$2a$10$abcdefghijklmnopqrstuv' } ])
    await upsert('shops', shops.map(s => ({ ...s, credentials: {} })))
    await upsert('products', products)
    await upsert('orders', orders)
    await upsert('order_items', orderItems)
    await upsert('warehouses', warehouses)
    await upsert('stocks', stocks)
    await upsert('brands', brands)
    await upsert('categories', categories)
    await upsert('customers', customers)
    await upsert('suppliers', suppliers)

    console.log('Seeding complete')
  } catch (e) {
    console.error(e)
    process.exit(1)
  }
})()
