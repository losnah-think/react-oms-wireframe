import { NextApiRequest, NextApiResponse } from 'next'

const sample = {
  classifications: [
    { id: 'mens', name: 'Men', description: 'Men clothing and accessories' },
    { id: 'womens', name: 'Women', description: 'Women clothing and accessories' },
    { id: 'kids', name: 'Kids', description: 'Children products' }
  ]
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const useMocks = process.env.NEXT_PUBLIC_USE_MOCKS === '1' || process.env.NODE_ENV !== 'production'
  if (!useMocks) return res.status(404).json({ error: 'Not found' })
  res.setHeader('Cache-Control', 'no-store')
  res.setHeader('Pragma', 'no-cache')
  res.setHeader('Expires', '0')
  res.status(200).json(sample)
}
