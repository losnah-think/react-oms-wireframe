import type { NextApiRequest, NextApiResponse } from 'next'
import { mockProducts } from '@/data/mockProducts'

type Product = any

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { q, category, supplier, limit = 20, offset = 0 } = req.query as any
    let items: Product[] = mockProducts.slice()
    if (q) items = items.filter((p) => String(p.name).includes(String(q)) || String(p.code || '').includes(String(q)))
    if (category) items = items.filter((p) => String(p.category_id) === String(category))
    if (supplier) items = items.filter((p) => String(p.supplier_id) === String(supplier))
    const total = items.length
    const sliced = items.slice(Number(offset), Number(offset) + Number(limit))
    return res.status(200).json({ items: sliced, total })
  }

  if (req.method === 'POST') {
    const payload = req.body
    const id = `p-${Date.now()}`
    const newItem = { id, ...payload }
    // push to mock array (in-memory only)
    mockProducts.unshift(newItem)
    return res.status(201).json(newItem)
  }

  res.setHeader('Allow', 'GET,POST')
  res.status(405).end('Method Not Allowed')
}
