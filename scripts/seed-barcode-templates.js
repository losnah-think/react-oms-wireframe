const fetch = require('node-fetch')

async function main() {
  const SUPABASE_URL = process.env.SUPABASE_URL
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
  }

  const url = `${SUPABASE_URL.replace(/\/$/, '')}/rest/v1/barcode_templates`

  const rows = [
    { name: 'Default - 1up', value: '012345678901' },
    { name: 'Small Label', value: 'ABC-0001' }
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
