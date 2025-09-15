const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args))
const bcrypt = (...args) => import('bcryptjs').then(m => (m && m.default) ? m.default : m)

async function main(){
  const email = process.argv[2] || 'admin@example.com'
  const password = process.argv[3] || 'admin-pass-123'
  const sbUrl = process.env.SUPABASE_URL
  const sbKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!sbUrl || !sbKey) {
    console.error('Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in env')
    process.exit(2)
  }
  const bcryptMod = await bcrypt()
  const hash = await bcryptMod.hash(password, 10)
  const body = { password_hash: hash }
  const url = `${sbUrl.replace(/\/$/, '')}/rest/v1/users?email=eq.${encodeURIComponent(email)}`
  const resp = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'apikey': sbKey, 'Authorization': `Bearer ${sbKey}`, 'Prefer': 'return=representation' },
    body: JSON.stringify(body)
  })
  const text = await resp.text()
  console.log('status=', resp.status)
  try { console.log(JSON.parse(text)) } catch(e) { console.log(text) }
}
main().catch(err=>{ console.error(err); process.exit(1) })
