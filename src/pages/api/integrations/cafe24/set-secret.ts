import type { NextApiRequest, NextApiResponse } from 'next'
import { setShopCredentials } from 'src/lib/shops'
import { requireRole } from 'src/lib/permissions'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()
  const check = await requireRole(req, res, ['admin'])
  if (!check.ok) return res.status(check.status).json(check.body)

  const { shopId, clientSecret } = req.body || {}
  if (!shopId || !clientSecret) return res.status(400).json({ error: 'shopId and clientSecret required' })

  setShopCredentials(shopId, { clientSecret })
  return res.status(200).json({ ok: true })
}
