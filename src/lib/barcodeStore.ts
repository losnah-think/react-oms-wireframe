
import { v4 as uuidv4 } from 'uuid'

export type BarcodeTemplate = {
  id: string
  name: string
  value: string
}

let templates: BarcodeTemplate[] = [
  { id: 't-default', name: 'Default - 1up', value: '012345678901' },
  { id: 't-small', name: 'Small Label', value: 'ABC-0001' }
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

export async function listTemplates() {
  if (isProd) {
    try {
      const resp = await supaFetch(`/rest/v1/barcode_templates?select=*`)
      if (!resp.ok) throw new Error('supa list failed')
      return await resp.json()
    } catch (e) {
      console.warn('supabase list failed, falling back to memory', e)
    }
  }
  return templates
}

export async function getTemplate(id: string) {
  if (isProd) {
    try {
      const resp = await supaFetch(`/rest/v1/barcode_templates?id=eq.${encodeURIComponent(id)}&select=*`)
      if (!resp.ok) throw new Error('supa get failed')
      const rows = await resp.json()
      return Array.isArray(rows) && rows[0] || null
    } catch (e) {
      console.warn('supabase get failed, falling back', e)
    }
  }
  return templates.find(t => t.id === id) || null
}

export async function createTemplate(payload: Partial<BarcodeTemplate>) {
  if (isProd) {
    try {
      const resp = await supaFetch(`/rest/v1/barcode_templates`, {
        method: 'POST',
        body: JSON.stringify({ name: payload.name || 'Untitled', value: payload.value || '' })
      })
      if (!resp.ok) throw new Error('supa create failed')
      const rows = await resp.json()
      return Array.isArray(rows) ? rows[0] : rows
    } catch (e) {
      console.warn('supabase create failed, falling back', e)
    }
  }
  const t: BarcodeTemplate = { id: uuidv4(), name: payload.name || 'Untitled', value: payload.value || '' }
  templates = [t, ...templates]
  return t
}

export async function updateTemplate(id: string, patch: Partial<BarcodeTemplate>) {
  if (isProd) {
    try {
      const resp = await supaFetch(`/rest/v1/barcode_templates?id=eq.${encodeURIComponent(id)}`, {
        method: 'PATCH',
        body: JSON.stringify(patch)
      })
      if (!resp.ok) throw new Error('supa update failed')
      const rows = await resp.json()
      return Array.isArray(rows) ? rows[0] : rows
    } catch (e) {
      console.warn('supabase update failed, falling back', e)
    }
  }
  templates = templates.map(t => t.id === id ? { ...t, ...patch } : t)
  return templates.find(t => t.id === id) || null
}

export async function deleteTemplate(id: string) {
  if (isProd) {
    try {
      const resp = await supaFetch(`/rest/v1/barcode_templates?id=eq.${encodeURIComponent(id)}`, { method: 'DELETE' })
      if (!resp.ok) throw new Error('supa delete failed')
      return true
    } catch (e) {
      console.warn('supabase delete failed, falling back', e)
    }
  }
  templates = templates.filter(t => t.id !== id)
  return true
}
