const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args))
const bcrypt = (...args) => import('bcryptjs').then(m => (m && m.default) ? m.default : m)

async function main(){
  const email = process.argv[2] || 'resttest+3@example.com'
  const password = process.argv[3] || 'pass1234'
  const sbUrl = process.env.SUPABASE_URL
  const sbKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!sbUrl || !sbKey) {
    console.error('Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in env')
    process.exit(2)
  }
  const url = `${sbUrl.replace(/\/$/, '')}/rest/v1/users?email=eq.${encodeURIComponent(email)}&select=*`
  const resp = await fetch(url, { method: 'GET', headers: { 'apikey': sbKey, 'Authorization': `Bearer ${sbKey}`, 'Accept': 'application/json' } })
  const text = await resp.text()
  console.log('status=', resp.status)
  try {
    const rows = JSON.parse(text)
    const u = Array.isArray(rows) && rows[0]
    if (!u) { console.log('user not found'); process.exit(3) }
    if (!u.password_hash) { console.log('no password_hash'); process.exit(4) }
    const bcryptMod = await bcrypt()
    const ok = await bcryptMod.compare(password, u.password_hash)
    console.log('password match:', ok)
    console.log('user id:', u.id, 'role:', u.role)
  } catch (e) {
    console.error('failed to parse response:', text)
    process.exit(1)
  }
}
main().catch(err => { console.error(err); process.exit(1) })
