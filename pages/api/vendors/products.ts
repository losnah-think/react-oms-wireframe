import type { NextApiRequest, NextApiResponse } from 'next'
import { readVendorProducts, writeVendorProducts } from '@/data/vendorsMock'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const items = readVendorProducts();
    return res.status(200).json({ items });
  }
  if (req.method === 'POST') {
    const payload = req.body;
    const items = readVendorProducts();
    const next = [...items, { ...payload, id: Date.now() }];
    writeVendorProducts(next as any);
    return res.status(201).json({ item: payload });
  }
  res.setHeader('Allow', 'GET,POST')
  res.status(405).end('Method Not Allowed')
}
