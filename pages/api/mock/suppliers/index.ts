import type { NextApiRequest, NextApiResponse } from 'next'
import * as mock from '@/lib/mockSuppliers'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      const { q, status, limit } = req.query
      const data = await mock.listSuppliers({ q: typeof q === 'string' ? q : '', status: typeof status === 'string' ? status : undefined, limit: Number(limit) || 1000 })
      return res.status(200).json(data)
    }

    if (req.method === 'POST') {
      const payload = req.body
      const created = await mock.createSupplier(payload)
      return res.status(201).json(created)
    }

    res.setHeader('Allow', 'GET,POST')
    return res.status(405).end('Method Not Allowed')
  } catch (err: any) {
    console.error(err)
    return res.status(500).json({ error: err?.message || String(err) })
  }
}
