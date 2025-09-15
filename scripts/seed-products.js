const fetch = require('node-fetch')

async function main() {
  const SUPABASE_URL = process.env.SUPABASE_URL
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
  }

  const url = `${SUPABASE_URL.replace(/\/$/, '')}/rest/v1/products`

  const rows = [
    { code: 'P001', name: '샘플 상품 1', selling_price: 10000, stock: 50, brand: '브랜드A' },
    { code: 'P002', name: '샘플 상품 2', selling_price: 25000, stock: 20, brand: '브랜드B' }
  ]

  for (const r of rows) {
    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      },
      body: JSON.stringify(r)
    })
    const json = await resp.text()
    console.log(resp.status, json)
  }
}

main().catch(e => { console.error(e); process.exit(1) })
