const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args))
(async function(){
  const sbUrl = process.env.SUPABASE_URL
  const sbKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!sbUrl || !sbKey) { console.error('missing env'); process.exit(2) }
  const url = `${sbUrl.replace(/\/$/, '')}/rest/v1/users?select=id,email,name,role&limit=50`
  const resp = await fetch(url, { headers: { 'apikey': sbKey, 'Authorization': `Bearer ${sbKey}`, 'Accept': 'application/json' } })
  const text = await resp.text()
  console.log('status=', resp.status)
  try { const rows = JSON.parse(text); console.log(rows); } catch(e) { console.log(text) }
})().catch(e=>{ console.error(e); process.exit(1) })
