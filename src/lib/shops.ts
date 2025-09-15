import { randomUUID } from 'crypto'
import { query } from './pgClient'

export type Shop = {
  id: string
  name: string
  platform: string
  credentials?: Record<string, any>
}

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL must be set for Postgres-only mode')

export async function listShops(): Promise<Shop[]> {
  const r = await query('SELECT id, name, platform, credentials FROM shops')
  return r.rows.map((row: any) => ({ ...row, credentials: row.credentials ?? undefined }))
}

export async function getShop(id: string): Promise<Shop | undefined> {
  const r = await query('SELECT id, name, platform, credentials FROM shops WHERE id = $1', [id])
  const row = r.rows[0]
  if (!row) return undefined
  return { ...row, credentials: row.credentials ?? undefined }
}

export async function setShopCredentials(id: string, creds: Record<string, any>) {
  const existing = (await getShop(id)) || { id, name: id, platform: 'unknown', credentials: {} }
  const merged = { ...(existing.credentials || {}), ...creds }
  await query('INSERT INTO shops (id, name, platform, credentials) VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, platform = EXCLUDED.platform, credentials = EXCLUDED.credentials', [existing.id, existing.name, existing.platform, JSON.stringify(merged)])
  return getShop(id)
}

export async function addShop(s: Omit<Shop, 'id'> & { id?: string }): Promise<Shop> {
  const id = s.id || randomUUID()
  await query('INSERT INTO shops (id, name, platform, credentials) VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO NOTHING', [id, s.name, s.platform, JSON.stringify(s.credentials || {})])
  return getShop(id) as Promise<Shop>
}
