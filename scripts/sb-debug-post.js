const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args))
async function main(){
  const sbUrl = process.env.SUPABASE_URL
  const sbKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!sbUrl || !sbKey) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
    process.exit(2)
  }
  const body = { id: 'script-' + Date.now(), email: `script+${Date.now()}@example.com`, name: 'Script', role: 'admin', password_hash: 'noop' }
  const resp = await fetch(`${sbUrl.replace(/\/$/, '')}/rest/v1/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'apikey': sbKey, 'Authorization': `Bearer ${sbKey}`, 'Prefer': 'return=representation' },
    body: JSON.stringify(body)
  })
  const text = await resp.text()
  console.log('status=', resp.status, 'ok=', resp.ok)
  console.log('text=', text)
}
main().catch(err => { console.error(err); process.exit(1) })
