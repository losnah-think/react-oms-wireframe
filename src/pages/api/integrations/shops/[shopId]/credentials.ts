import { NextApiRequest, NextApiResponse } from 'next'
import { getShop, setShopCredentials, addShop } from 'src/lib/shops'
import { requireRole } from 'src/lib/permissions'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { shopId } = req.query as { shopId: string }

  if (req.method === 'GET') {
    const s = await getShop(shopId)
    if (!s) return res.status(404).json({ error: 'not found' })
    return res.json(s)
  }

  if (req.method === 'POST') {
    const check = await requireRole(req, res, ['admin'])
    if (!check.ok) return res.status(check.status).json(check.body)
    const creds = req.body || {}
    // ensure shop exists
    const existing = await getShop(shopId)
    if (!existing) {
      await addShop({ id: shopId, name: shopId, platform: creds.platform || 'unknown', credentials: creds })
      return res.json({ ok: true })
    }
    await setShopCredentials(shopId, creds)
    return res.json({ ok: true })
  }

  res.setHeader('Allow', 'GET,POST')
  res.status(405).end('Method not allowed')
}
