import type { NextApiRequest, NextApiResponse } from 'next'
import {
  listVendors,
  upsertVendor,
  removeVendor,
} from '@/data/mockVendors'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query
  if (!id || Array.isArray(id)) {
    return res.status(400).json({ error: 'invalid id' })
  }

  const vendors = listVendors()
  const current = vendors.find((vendor) => String(vendor.id) === String(id))

  if (req.method === 'GET') {
    if (!current) return res.status(404).json({ error: 'not_found' })
    return res.status(200).json({ vendor: current })
  }

  if (req.method === 'PUT') {
    if (!current) return res.status(404).json({ error: 'not_found' })
    const payload = req.body ?? {}
    if (payload.code) {
      const duplicate = vendors.some(
        (vendor) => vendor.id !== current.id && vendor.code.toLowerCase() === String(payload.code).toLowerCase(),
      )
      if (duplicate) {
        return res.status(409).json({ error: 'code already exists' })
      }
    }
    const updated = {
      ...current,
      ...payload,
      updated_at: new Date().toISOString(),
    }
    upsertVendor(updated)
    return res.status(200).json({ vendor: updated })
  }

  if (req.method === 'DELETE') {
    if (!current) return res.status(404).json({ error: 'not_found' })
    removeVendor(current.id)
    return res.status(204).end()
  }

  res.setHeader('Allow', 'GET,PUT,DELETE')
  return res.status(405).end('Method Not Allowed')
}
