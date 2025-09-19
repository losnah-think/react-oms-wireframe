// Minimal localStorage-backed mock API for suppliers (front-end demo)
export const SUPPLIERS_KEY = 'vendors_suppliers_v1'

const sample = [
  { id: 's-1', code: 'SUP-001', name: '테크 공급', status: 'active', contact: { person: '홍길동', phone: '010-1111-1111' }, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 's-2', code: 'SUP-002', name: '패션 공급', status: 'inactive', contact: { person: '김영희', phone: '010-2222-2222' }, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
]

function readAll() {
  try {
    const raw = localStorage.getItem(SUPPLIERS_KEY)
    if (!raw) {
      localStorage.setItem(SUPPLIERS_KEY, JSON.stringify(sample))
      return sample.slice()
    }
    return JSON.parse(raw)
  } catch (e) {
    return []
  }
}

function writeAll(list: any[]) {
  try { localStorage.setItem(SUPPLIERS_KEY, JSON.stringify(list)) } catch (e) {}
}

export async function listSuppliers({ q = '', status, limit = 1000 }: { q?: string, status?: string, limit?: number } = {}) {
  const all = readAll()
  const lower = (q || '').toString().toLowerCase()
  const items = all.filter((s: any) => {
    if (status && String(s.status) !== String(status)) return false
    if (!lower) return true
    return (String(s.name || '') + ' ' + String(s.code || '') + ' ' + String(s.contact?.person || '')).toLowerCase().includes(lower)
  })
  return { items, total: items.length }
}

export async function getSupplier(id: string) {
  const all = readAll()
  return all.find((s: any) => String(s.id) === String(id)) || null
}

export async function createSupplier(payload: any) {
  const all = readAll()
  const id = `s-${Date.now()}`
  const item = { id, ...payload, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
  all.unshift(item)
  writeAll(all)
  try { window.dispatchEvent(new CustomEvent('supplier:updated')) } catch (e) {}
  return item
}

export async function updateSupplier(id: string, payload: any) {
  const all = readAll()
  const idx = all.findIndex((s: any) => String(s.id) === String(id))
  if (idx === -1) return null
  const updated = { ...all[idx], ...payload, updated_at: new Date().toISOString() }
  all[idx] = updated
  writeAll(all)
  try { window.dispatchEvent(new CustomEvent('supplier:updated')) } catch (e) {}
  return updated
}

export async function softDeleteSupplier(id: string) {
  // move to trashed_suppliers_v1 and remove from main list
  try {
    const all = readAll()
    const idx = all.findIndex((s: any) => String(s.id) === String(id))
    if (idx === -1) return false
    const [removed] = all.splice(idx, 1)
    writeAll(all)

    // append to trashed list
    try {
      const raw = localStorage.getItem('trashed_suppliers_v1')
      const arr = raw ? JSON.parse(raw) : []
      arr.unshift({ ...removed, deleted_at: new Date().toISOString() })
      localStorage.setItem('trashed_suppliers_v1', JSON.stringify(arr))
    } catch (e) {
      // ignore localStorage write errors
    }

    try { window.dispatchEvent(new CustomEvent('supplier:deleted')) } catch (e) {}
    try { window.dispatchEvent(new CustomEvent('trashed:updated')) } catch (e) {}
    return true
  } catch (e) {
    return false
  }
}

const mockSuppliersApi = { listSuppliers, getSupplier, createSupplier, updateSupplier, softDeleteSupplier };

export default mockSuppliersApi;
