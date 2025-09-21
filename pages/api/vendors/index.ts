import type { NextApiRequest, NextApiResponse } from 'next'
import { readVendors, writeVendors } from '@/data/vendorsMock'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const vendors = readVendors();
    return res.status(200).json({ vendors });
  }

  if (req.method === 'POST') {
    const payload = req.body;
    if (!payload || !payload.name) return res.status(400).json({ error: 'name required' });
    const vendors = readVendors();
    const next = [...vendors, { ...payload, id: Date.now() }];
    writeVendors(next as any);
    return res.status(201).json({ vendor: payload });
  }

  res.setHeader('Allow', 'GET,POST')
  res.status(405).end('Method Not Allowed')
}
