import type { NextApiRequest, NextApiResponse } from 'next'
import * as mock from '@/lib/mockSuppliers'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.query as { id: string }
    if (req.method === 'GET') {
      const item = await mock.getSupplier(id)
      if (!item) return res.status(404).json({ error: 'Not found' })
      return res.status(200).json(item)
    }

    if (req.method === 'PUT' || req.method === 'PATCH') {
      const payload = req.body
      const updated = await mock.updateSupplier(id, payload)
      if (!updated) return res.status(404).json({ error: 'Not found' })
      return res.status(200).json(updated)
    }

    if (req.method === 'DELETE') {
      const ok = await mock.softDeleteSupplier(id)
      if (!ok) return res.status(404).json({ error: 'Not found' })
      return res.status(204).end()
    }

    res.setHeader('Allow', 'GET,PUT,PATCH,DELETE')
    return res.status(405).end('Method Not Allowed')
  } catch (err: any) {
    console.error(err)
    return res.status(500).json({ error: err?.message || String(err) })
  }
}
