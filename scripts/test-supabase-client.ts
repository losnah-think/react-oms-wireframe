// Use require() to avoid ESM import resolution issues when running via ts-node
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { supabaseAdmin } = require('../src/lib/supabaseClient')

async function main(){
  try{
    const res = await supabaseAdmin.from('shops').select('*').limit(1)
    console.log('ok', Array.isArray(res.data) ? res.data.length : 'no-data')
  }catch(e:any){
    console.error('supabase error', e && e.message ? e.message : e)
  }
}

main()
