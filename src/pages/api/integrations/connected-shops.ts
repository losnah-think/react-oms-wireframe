import { NextApiRequest, NextApiResponse } from 'next';
import { listShops } from 'src/lib/shops';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end('Method not allowed')
  const shops = listShops();
  res.status(200).json(shops);
}
