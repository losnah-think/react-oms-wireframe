import { NextApiRequest, NextApiResponse } from 'next';
import { getAdapter } from 'src/lib/adapters';
import { getShop } from 'src/lib/shops';

const mockExternalProducts = [
  {
    id: 'shop_demo_001',
    externalName: '[DEMO] 샘플 상품 1',
    externalCode: 'DEMO-001',
    price: 10000,
    category: '카테고리 > 소분류',
    brand: 'DemoBrand',
    hasBarcode: true,
    externalUrl: '',
    selected: false,
    displayStatus: 'Y',
    sellStatus: 'Y',
    productStatus: 'sale',
    registDate: '2025-01-01',
    modifyDate: '2025-01-02',
    stockQty: 10,
    categoryCode: '000000001',
  },
];

// In-memory shop registry for demo; in prod this should come from DB/secure store
const MOCK_SHOPS = [
  { id: 'shop_makeshop_1', name: '메이크샵 - FULGO', platform: 'makeshop' },
  { id: 'shop_cafe24_1', name: '카페24 - fulgo-shop', platform: 'cafe24' },
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { shopId } = req.query as { shopId: string };

  const shop = await getShop(shopId)
  if (!shop) {
    return res.status(404).json({ error: 'Shop not found' });
  }

  const adapter = getAdapter(shop.platform as string);
  if (!adapter) {
    // No adapter for platform — return mock
    return res.status(200).json({ products: mockExternalProducts });
  }

  try {
    const body = req.body || {};
    const products = await adapter(shopId, body);
    return res.status(200).json({ products });
  } catch (err) {
    console.error('adapter error', err);
    return res.status(500).json({ error: 'adapter_error', message: String(err) });
  }
}
