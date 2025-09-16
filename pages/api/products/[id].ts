import { NextApiRequest, NextApiResponse } from 'next'
import { getProduct, makePlaceholderProduct } from 'src/lib/products'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end('Method not allowed')
  const { id } = req.query
  const pid = Array.isArray(id) ? id[0] : id || '0'
  try {
    console.debug('[pages/api/products/[id]] request id=', pid)
    const p = await getProduct(pid)
    if (!p) {
      console.debug('[pages/api/products/[id]] product not found — returning placeholder for id=', pid)
      const placeholder = makePlaceholderProduct(pid)
      return res.status(200).json({ product: placeholder })
    }
    return res.status(200).json({ product: p })
  } catch (e: any) {
    console.error(e)
    return res.status(500).json({ error: e?.message || 'unknown' })
  }
}
