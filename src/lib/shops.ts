import { randomUUID } from 'crypto'
import supabaseAdmin from './supabaseClient'

export type Shop = {
  id: string
  name: string
  platform: string
  credentials?: Record<string, any>
}

export async function listShops(): Promise<Shop[]> {
  const { data, error } = await supabaseAdmin.from('shops').select('id, name, platform, credentials')
  if (error) throw error
  return (data || []).map((row: any) => ({ ...row, credentials: row.credentials ?? undefined }))
}

export async function getShop(id: string): Promise<Shop | undefined> {
  const { data, error } = await supabaseAdmin.from('shops').select('id, name, platform, credentials').eq('id', id).limit(1).maybeSingle()
  if (error) throw error
  if (!data) return undefined
  return { ...data, credentials: data.credentials ?? undefined }
}

export async function setShopCredentials(id: string, creds: Record<string, any>) {
  const existing = (await getShop(id)) || { id, name: id, platform: 'unknown', credentials: {} }
  const merged = { ...(existing.credentials || {}), ...creds }
  const payload = { id: existing.id, name: existing.name, platform: existing.platform, credentials: merged }
  const { error } = await supabaseAdmin.from('shops').upsert(payload)
  if (error) throw error
  return getShop(id)
}

export async function addShop(s: Omit<Shop, 'id'> & { id?: string }): Promise<Shop> {
  const id = s.id || randomUUID()
  const payload = { id, name: s.name, platform: s.platform, credentials: s.credentials || {} }
  const { error } = await supabaseAdmin.from('shops').insert(payload).select()
  if (error) throw error
  return getShop(id) as Promise<Shop>
}
