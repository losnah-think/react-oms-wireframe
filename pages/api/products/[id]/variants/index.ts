import { NextApiRequest, NextApiResponse } from 'next'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const useMocks = process.env.NEXT_PUBLIC_USE_MOCKS === '1' || process.env.NODE_ENV !== 'production'
  if (!useMocks) return res.status(404).json({ error: 'Not found' })
  const { id } = req.query
  const pid = Array.isArray(id) ? id[0] : id || '0'
  const variants = [
    { id: `${pid}-v-1`, sku: `${pid}-SKU-1`, stock: 10, attributes: { color: 'red', size: 'M' } },
    { id: `${pid}-v-2`, sku: `${pid}-SKU-2`, stock: 3, attributes: { color: 'blue', size: 'L' } }
  ]
  res.status(200).json(variants)
}
