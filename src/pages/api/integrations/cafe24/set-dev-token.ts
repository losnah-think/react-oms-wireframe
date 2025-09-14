import type { NextApiRequest, NextApiResponse } from 'next'
import { setShopCredentials, getShop } from 'src/lib/shops'
import { requireRole } from 'src/lib/permissions'

// Dev-only helper: allows an admin to set access/refresh tokens for a shop locally.
// This is intended for local development and should NOT be enabled in production.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (process.env.NODE_ENV === 'production') return res.status(403).json({ error: 'disabled' })
  if (req.method !== 'POST') return res.status(405).end()
  const check = await requireRole(req as any, res as any, ['admin'])
  if (!check.ok) return res.status(check.status).json(check.body)

  const { shopId, accessToken, refreshToken } = req.body || {}
  if (!shopId) return res.status(400).json({ error: 'shopId required' })
  if (!accessToken && !refreshToken) return res.status(400).json({ error: 'accessToken or refreshToken required' })

  const shop = getShop(shopId)
  if (!shop) return res.status(404).json({ error: 'shop not found' })

  const creds: any = {}
  if (accessToken) creds.accessToken = accessToken
  if (refreshToken) creds.refreshToken = refreshToken

  const updated = setShopCredentials(shopId, creds)
  return res.status(200).json({ ok: true, shop: updated })
}
