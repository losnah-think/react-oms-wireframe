import { v4 as uuidv4 } from 'uuid'

export type Product = {
  id: string
  code: string
  name: string
  selling_price: number
  stock?: number
  brand?: string
  created_at?: string
}

let products: Product[] = [
  { id: 'p-1', code: 'P001', name: '샘플 상품 1', selling_price: 10000, stock: 50, brand: '브랜드A', created_at: new Date().toISOString() },
  { id: 'p-2', code: 'P002', name: '샘플 상품 2', selling_price: 25000, stock: 20, brand: '브랜드B', created_at: new Date().toISOString() }
]

const isProd = (process.env.NODE_ENV || '').toLowerCase() === 'production'
const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

async function supaFetch(path: string, opts: any = {}) {
  if (!SUPABASE_URL || !SUPABASE_KEY) throw new Error('supabase not configured')
  const fetch = (await import('node-fetch')).default
  const url = `${SUPABASE_URL.replace(/\/$/, '')}${path}`
  const res = await fetch(url, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      ...(opts.headers || {})
    }
  })
  return res
}

export async function listProducts() {
  if (isProd) {
    try {
      const resp = await supaFetch('/rest/v1/products?select=*')
      if (!resp.ok) throw new Error('supa list failed')
      return await resp.json()
    } catch (e) {
      console.warn('supabase products list failed, falling back', e)
    }
  }
  return products
}

export async function getProduct(id: string) {
  if (isProd) {
    try {
      const resp = await supaFetch(`/rest/v1/products?id=eq.${encodeURIComponent(id)}&select=*`)
      if (!resp.ok) throw new Error('supa get failed')
      const rows = await resp.json()
      return Array.isArray(rows) && rows[0] || null
    } catch (e) {
      console.warn('supabase product get failed, falling back', e)
    }
  }
  return products.find(p => p.id === id) || null
}

export async function createProduct(payload: Partial<Product>) {
  if (isProd) {
    try {
      const resp = await supaFetch('/rest/v1/products', { method: 'POST', body: JSON.stringify(payload) })
      if (!resp.ok) throw new Error('supa create failed')
      const rows = await resp.json()
      return Array.isArray(rows) ? rows[0] : rows
    } catch (e) {
      console.warn('supabase create product failed, falling back', e)
    }
  }
  const p: Product = { id: uuidv4(), code: payload.code || `P${Math.floor(Math.random()*10000)}`, name: payload.name || 'New Product', selling_price: payload.selling_price || 0, stock: payload.stock || 0, brand: payload.brand, created_at: new Date().toISOString() }
  products = [p, ...products]
  return p
}

export async function updateProduct(id: string, patch: Partial<Product>) {
  if (isProd) {
    try {
      const resp = await supaFetch(`/rest/v1/products?id=eq.${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(patch) })
      if (!resp.ok) throw new Error('supa update failed')
      const rows = await resp.json()
      return Array.isArray(rows) ? rows[0] : rows
    } catch (e) {
      console.warn('supabase update product failed, falling back', e)
    }
  }
  products = products.map(p => p.id === id ? { ...p, ...patch } : p)
  return products.find(p => p.id === id) || null
}

export async function deleteProduct(id: string) {
  if (isProd) {
    try {
      const resp = await supaFetch(`/rest/v1/products?id=eq.${encodeURIComponent(id)}`, { method: 'DELETE' })
      if (!resp.ok) throw new Error('supa delete failed')
      return true
    } catch (e) {
      console.warn('supabase delete product failed, falling back', e)
    }
  }
  products = products.filter(p => p.id !== id)
  return true
}
