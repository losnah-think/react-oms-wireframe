import type { NextApiRequest, NextApiResponse } from 'next'
import { readFixedAddresses, writeFixedAddresses } from '@/data/vendorsMock'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const list = readFixedAddresses();
    return res.status(200).json({ list });
  }
  if (req.method === 'POST') {
    const body = req.body;
    const list = readFixedAddresses();
    const next = [...list, body];
    writeFixedAddresses(next);
    return res.status(201).json({ ok: true, item: body });
  }
  res.status(405).end();
}
