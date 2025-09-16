import { NextApiRequest, NextApiResponse } from 'next'
import { getProduct } from 'src/lib/products'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query as { id: string }
  if (req.method !== 'GET') return res.status(405).end('Method not allowed')
  try {
    const p = await getProduct(id)
    if (!p) return res.status(404).json({ error: 'not found' })
    res.status(200).json({ product: p })
  } catch (e: any) {
    console.error(e)
    res.status(500).json({ error: e.message || 'unknown' })
  }
}
