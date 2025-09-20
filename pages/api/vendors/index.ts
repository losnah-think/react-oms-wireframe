import type { NextApiRequest, NextApiResponse } from 'next'
import { listVendors, stampVendor, upsertVendor } from '@/data/mockVendors'

function applyFilters(list: ReturnType<typeof listVendors>, query: NextApiRequest['query']) {
  const { q, is_active, platform } = query as Record<string, string | undefined>
  let items = list.slice()
  if (q) {
    if (q.startsWith('code:')) {
      const code = q.slice(5).toLowerCase()
      items = items.filter((vendor) => vendor.code.toLowerCase() === code)
    } else {
      const lower = q.toLowerCase()
      items = items.filter((vendor) =>
        [vendor.name, vendor.code, vendor.platform]
          .some((field) => String(field).toLowerCase().includes(lower)))
    }
  }
  if (is_active && is_active !== 'all') {
    const bool = is_active === 'true' || is_active === '1'
    items = items.filter((vendor) => vendor.is_active === bool)
  }
  if (platform && platform !== 'all') {
    items = items.filter((vendor) => vendor.platform === platform)
  }
  return items
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const limit = Number(req.query.limit ?? 20)
    const offset = Number(req.query.offset ?? 0)
    const filtered = applyFilters(listVendors(), req.query)
    const items = filtered.slice(offset, offset + limit)
    return res.status(200).json({ vendors: items, meta: { total: filtered.length, limit, offset } })
  }

  if (req.method === 'POST') {
    const payload = req.body ?? {}
    if (!payload.name) {
      return res.status(400).json({ error: 'name is required' })
    }
    if (!payload.code) {
      return res.status(400).json({ error: 'code is required' })
    }
    const exists = listVendors().some((vendor) => vendor.code.toLowerCase() === String(payload.code).toLowerCase())
    if (exists) {
      return res.status(409).json({ error: 'code already exists' })
    }
    const stamped = stampVendor({ ...payload, id: String(Date.now()) })
    upsertVendor(stamped)
    return res.status(201).json({ vendor: stamped })
  }

  res.setHeader('Allow', 'GET,POST')
  return res.status(405).end('Method Not Allowed')
}
