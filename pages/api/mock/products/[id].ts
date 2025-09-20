import type { NextApiRequest, NextApiResponse } from 'next'
import { mockProducts } from '@/data/mockProducts'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query as any
  const idx = mockProducts.findIndex((p) => String(p.id) === String(id))

  if (req.method === 'GET') {
    if (idx === -1) return res.status(404).end('Not found')
    return res.status(200).json(mockProducts[idx])
  }

  if (req.method === 'PUT') {
    if (idx === -1) return res.status(404).end('Not found')
    mockProducts[idx] = { ...mockProducts[idx], ...req.body }
    return res.status(200).json(mockProducts[idx])
  }

  if (req.method === 'DELETE') {
    if (idx === -1) return res.status(404).end('Not found')
    mockProducts.splice(idx, 1)
    return res.status(204).end()
  }

  res.setHeader('Allow', 'GET,PUT,DELETE')
  res.status(405).end('Method Not Allowed')
}
