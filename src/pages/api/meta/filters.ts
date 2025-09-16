import { NextApiRequest, NextApiResponse } from 'next'

// Lightweight meta endpoint returning filter options. For now return a small
// selection; later can be backed by DB tables like brands/categories/suppliers.
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end('Method not allowed')
  const payload = {
    categories: Array.from({ length: 50 }, (_, i) => ({ id: `cat-${i + 1}`, name: `카테고리${i + 1}` })),
    brands: Array.from({ length: 50 }, (_, i) => ({ id: `brand-${i + 1}`, name: `브랜드${i + 1}` })),
    suppliers: Array.from({ length: 20 }, (_, i) => ({ id: `supplier-${i + 1}`, name: `공급사${i + 1}` })),
    status: ['판매중', '판매중지', '품절', '비활성', '신상품', '베스트', '할인'],
    classifications: Array.from({ length: 10 }, (_, i) => ({ id: `class-${i + 1}`, name: `분류${i + 1}` })),
    years: Array.from({ length: 5 }, (_, i) => `202${i}`),
    seasons: ['SS', 'FW', 'ALL'],
    priceRange: [0, 10000, 30000, 50000, 100000, 500000],
    stockRange: [0, 10, 50, 100, 500, 1000],
  }
  res.status(200).json(payload)
}
