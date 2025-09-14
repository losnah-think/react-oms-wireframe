import db from './db'
import { randomUUID } from 'crypto'

export type Shop = {
  id: string
  name: string
  platform: string
  credentials?: Record<string, any>
}

const insertShop = db.prepare(`INSERT OR REPLACE INTO shops (id, name, platform, credentials) VALUES (@id, @name, @platform, @credentials)`)
const selectAll = db.prepare(`SELECT id, name, platform, credentials FROM shops`)
const selectById = db.prepare(`SELECT id, name, platform, credentials FROM shops WHERE id = ?`)

export function listShops(): Shop[] {
  return selectAll.all().map((r: any) => ({ ...r, credentials: r.credentials ? JSON.parse(r.credentials) : undefined }))
}

export function getShop(id: string): Shop | undefined {
  const r = selectById.get(id)
  if (!r) return undefined
  return { ...r, credentials: r.credentials ? JSON.parse(r.credentials) : undefined }
}

export function setShopCredentials(id: string, creds: Record<string, any>) {
  const existing = getShop(id) || { id, name: id, platform: 'unknown', credentials: {} }
  const merged = { ...(existing.credentials || {}), ...creds }
  insertShop.run({ id: existing.id, name: existing.name, platform: existing.platform, credentials: JSON.stringify(merged) })
  return getShop(id)
}

export function addShop(s: Omit<Shop, 'id'> & { id?: string }): Shop {
  const id = s.id || randomUUID()
  insertShop.run({ id, name: s.name, platform: s.platform, credentials: JSON.stringify(s.credentials || {}) })
  return getShop(id) as Shop
}
