import type { NextApiRequest, NextApiResponse } from 'next';
import { fetchCafe24Products } from '../../../../lib/adapters/cafe24';

type ExternalProduct = {
  product_no?: string;
  name: string;
  price: number;
  inventory: number;
  selling: boolean;
  last_update?: string;
  options?: Record<string,string>;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // For demo purposes we read token and shop id from env vars
  const accessToken = process.env.CAFE24_ACCESS_TOKEN || '';
  const shopId = process.env.CAFE24_SHOP_ID || '1';

  if (!accessToken) {
    return res.status(400).json({ error: 'CAFE24_ACCESS_TOKEN not configured on server.' });
  }

  try {
    const raw = await fetchCafe24Products(accessToken, shopId);
    // Map raw products to ExternalProduct
    const mapped: ExternalProduct[] = raw.map((r: any) => ({
      product_no: r.product_no || r.id || r.product_no,
      name: r.product_name || r.name || 'Unknown',
      price: Number(r.price || r.sale_price || 0),
      inventory: Number(r.inventory || r.stock || 0),
      selling: r.selling ?? true,
      last_update: r.updated_at || r.last_update || undefined,
      options: r.options || undefined,
    }));
    return res.status(200).json({ products: mapped });
  } catch (err: any) {
    return res.status(502).json({ error: err.message || 'Adapter error' });
  }
}
