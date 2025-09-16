import { NextApiRequest, NextApiResponse } from 'next'

const sampleProduct = (id: string | number) => ({
  id: String(id),
  name: `Demo Product ${id}`,
  sku: `SKU-${id}`,
  price: 19900,
  description: 'This is a demo product used when backend is mocked.',
  variants: [
    { id: `v-${id}-1`, sku: `SKU-${id}-1`, stock: 10, price: 19900 },
    { id: `v-${id}-2`, sku: `SKU-${id}-2`, stock: 5, price: 18900 }
  ]
})

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const useMocks = process.env.NEXT_PUBLIC_USE_MOCKS === '1' || process.env.NODE_ENV !== 'production'
  if (!useMocks) return res.status(404).json({ error: 'Not found' })
  const { id } = req.query
  const pid = Array.isArray(id) ? id[0] : id || '0'
  res.status(200).json(sampleProduct(pid))
}
