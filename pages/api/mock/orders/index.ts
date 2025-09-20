import type { NextApiRequest, NextApiResponse } from 'next'
import { mockOrders } from '@/data/mockOrders'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { q, status, limit = 20, offset = 0 } = req.query as any
    let items = mockOrders.slice()
    if (q) items = items.filter((o) => String(o.order_code).includes(String(q)) || String(o.product_name).includes(String(q)))
    if (status) items = items.filter((o) => String(o.status) === String(status))
    const total = items.length
    const sliced = items.slice(Number(offset), Number(offset) + Number(limit))
    return res.status(200).json({ items: sliced, total })
  }

  if (req.method === 'POST') {
    const payload = req.body
    const id = mockOrders.length + 1
    const newItem = { id, ...payload }
    mockOrders.unshift(newItem)
    return res.status(201).json(newItem)
  }

  res.setHeader('Allow', 'GET,POST')
  res.status(405).end('Method Not Allowed')
}
