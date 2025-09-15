import type { NextApiRequest, NextApiResponse } from 'next'
import { getCafe24Token } from 'src/lib/adapters/cafe24Auth'
import { setShopCredentials } from 'src/lib/shops'
import { requireRole } from 'src/lib/permissions'

// POST { shopId, code } -> 교환된 토큰을 shop credentials에 저장
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()
  const { shopId, code } = req.body || {}
  const check = await requireRole(req as any, res as any, ['admin'])
  if (!check.ok) return res.status(check.status).json(check.body)
  if (!shopId || !code) return res.status(400).json({ error: 'shopId and code required' })
  try {
    const token = await getCafe24Token({
      code,
      clientId: process.env.CAFE24_CLIENT_ID || 'mock_client',
      clientSecret: process.env.CAFE24_CLIENT_SECRET || 'mock_secret',
      redirectUri: process.env.CAFE24_REDIRECT_URI || 'https://example.com/callback',
    } as any)
  await setShopCredentials(shopId, { accessToken: token.accessToken, refreshToken: token.refreshToken })
    return res.status(200).json({ ok: true })
  } catch (e) {
    console.error(e)
    return res.status(500).json({ error: 'token exchange failed' })
  }
}
