#!/usr/bin/env node
const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in environment')
  process.exit(1)
}

async function upsert(table, rows) {
  const url = `${SUPABASE_URL.replace(/\/$/, '')}/rest/v1/${table}`
  for (const row of rows) {
    const r = await fetch(url, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      },
      body: JSON.stringify(row),
    })
    if (!r.ok) {
      const text = await r.text()
      throw new Error(`Failed to insert into ${table}: ${r.status} ${text}`)
    }
    const body = await r.json()
    console.log(`Inserted into ${table}:`, body[0])
  }
}

;(async () => {
  try {
    await upsert('users', [
      { id: 'dev-admin', email: 'admin@example.com', name: 'Dev Admin', role: 'admin', password_hash: '' }
    ])

    await upsert('shops', [
      { id: 'shop_demo_1', name: 'Demo Shop', platform: 'supabase', credentials: { clientId: 'demo', clientSecret: 'demo' } }
    ])

    console.log('Seeding complete')
  } catch (e) {
    console.error(e)
    process.exit(1)
  }
})()
