import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' })
  const { apiBaseUrl, accessToken } = req.body || {}
  if (!apiBaseUrl) return res.status(400).json({ ok: false, error: 'apiBaseUrl required' })

  try {
    const headers: any = { 'User-Agent': 'react-oms-wireframe/test-connection' }
    if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`
    const resp = await fetch(apiBaseUrl, { method: 'GET', headers })
    return res.status(200).json({ ok: resp.ok, status: resp.status })
  } catch (err: any) {
    console.error('test-connection error', err)
    return res.status(500).json({ ok: false, error: String(err) })
  }
}
