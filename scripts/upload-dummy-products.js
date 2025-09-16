#!/usr/bin/env node
const path = require('path')
const fs = require('fs')

// Load project env
require('dotenv').config({ path: path.join(process.cwd(), '.env.local') })

console.log('NODE version', process.version)
console.log('cwd', process.cwd())

const { createClient } = (() => {
  try { return require('@supabase/supabase-js') } catch (e) { return {} }
})()

let supabaseAdmin = null
const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
if (SUPABASE_URL && SUPABASE_KEY && createClient) {
  supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } })
} else {
  console.log('SUPABASE env not fully present; will attempt to use DATABASE_URL via pg')
}

const usePg = !supabaseAdmin
let pgClient = null
if (usePg) {
  const { Pool } = require('pg')
  const dbUrl = process.env.DATABASE_URL
  if (!dbUrl) {
    console.error('No SUPABASE_URL/SERVICE_ROLE_KEY or DATABASE_URL found in env. Cannot proceed.')
    process.exit(1)
  }
  pgClient = new Pool({ connectionString: dbUrl })
}

const COUNT = parseInt(process.env.DUMMY_COUNT || '20', 10)

function randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min }
function sample(arr) { return arr[Math.floor(Math.random()*arr.length)] }

const brands = [{id:'b1', name:'Brand A'},{id:'b2',name:'Brand B'}]
const categories = [{id:'c1', name:'Shirts'},{id:'c2', name:'Pants'}]
const suppliers = [{id:'s1', name:'Supplier X'},{id:'s2', name:'Supplier Y'}]

async function createOne(i) {
  const name = `Demo Product ${i}`
  const sku = `DEM-${Date.now().toString().slice(-6)}-${i}`
  const brand = sample(brands)
  const category = sample(categories)
  const supplier = sample(suppliers)
  const price = randomInt(10000, 50000)
  const stock = randomInt(0, 200)
  // Insert using the columns we observed in the DB: name, sku, price, stock, shop_id, meta, external_sku
  const product = {
    name: name,
    sku: sku,
    price: price,
    stock: stock,
    shop_id: 'local',
    meta: JSON.stringify({ demo: true, description: `Demo product ${i}` }),
    external_sku: `EXT-${i}`,
  }
  if (supabaseAdmin) {
    const id = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : require('uuid').v4()
    const insertObj = { id, ...product }
    const { data, error } = await supabaseAdmin.from('products').insert(insertObj).select('id').limit(1).single()
    if (error) {
      console.error('insert error', error)
      return null
    }
    const variantCount = randomInt(1,3)
    for (let v = 0; v < variantCount; v++) {
      const vid = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : require('uuid').v4()
      const variant = { id: vid, product_id: id, sku: `${sku}-V${v+1}`, price: price + v*1000, stock: Math.max(0, stock - v*5) }
      const { error: verr } = await supabaseAdmin.from('product_variants').insert(variant)
      if (verr) console.error('variant insert error', verr)
    }
    return id
  } else {
    const { v4: uuidv4 } = require('uuid')
    const id = uuidv4()
    try {
      const res = await pgClient.query(
        'INSERT INTO products(id, name, sku, price, stock, shop_id, meta, external_sku) VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id',
        [id, product.name, product.sku, product.price, product.stock, product.shop_id, product.meta, product.external_sku]
      )
      const variantCount = randomInt(1,3)
      for (let v = 0; v < variantCount; v++) {
        const vid = uuidv4()
        await pgClient.query('INSERT INTO product_variants(id, product_id, sku, price, stock) VALUES($1,$2,$3,$4,$5)', [vid, id, `${sku}-V${v+1}`, price + v*1000, Math.max(0, stock - v*5)])
      }
      return res.rows && res.rows[0] && res.rows[0].id
    } catch (e) {
      console.error('pg insert error', e && e.message)
      return null
    }
  }
}

async function main() {
  console.log('Creating', COUNT, 'dummy products')
  // diagnostic: fetch one row to inspect keys
  try {
    if (supabaseAdmin) {
      const { data: sample, error: sampleErr } = await supabaseAdmin.from('products').select('*').limit(1)
      if (sampleErr) console.error('Schema diagnostic failed:', sampleErr)
      else console.log('Sample product row keys:', sample && sample[0] ? Object.keys(sample[0]) : 'table empty or no sample')
    } else {
      const r = await pgClient.query('SELECT * FROM products LIMIT 1')
      console.log('Sample product row keys:', r.rows[0] ? Object.keys(r.rows[0]) : 'table empty or no sample')
    }
  } catch (e) {
    console.error('Schema diagnostic exception', e && e.message)
  }
  // inspect product_variants
  try {
    if (supabaseAdmin) {
      const { data: vs, error: vErr } = await supabaseAdmin.from('product_variants').select('*').limit(1)
      if (vErr) console.error('product_variants diagnostic failed:', vErr)
      else console.log('Sample product_variants keys:', vs && vs[0] ? Object.keys(vs[0]) : 'variants table empty or no sample')
    } else {
      const r = await pgClient.query('SELECT * FROM product_variants LIMIT 1')
      console.log('Sample product_variants keys:', r.rows[0] ? Object.keys(r.rows[0]) : 'variants table empty or no sample')
    }
  } catch (e) {
    console.error('product_variants diagnostic exception', e && e.message)
  }
  const ids = []
  for (let i = 1; i <= COUNT; i++) {
    try {
      const id = await createOne(i)
      if (id) ids.push(id)
      console.log(`[${i}/${COUNT}] created id=${id}`)
    } catch (e) {
      console.error('failed creating', i, e)
    }
  }
  console.log('Done. Created', ids.length, 'products')
}

main().catch((e)=>{ console.error(e); process.exit(1) })
