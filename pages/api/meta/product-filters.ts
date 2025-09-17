import { NextApiRequest, NextApiResponse } from 'next'

const sample = {
  categories: [
    { id: 'clothing', name: 'Clothing' },
    { id: 'electronics', name: 'Electronics' },
    { id: 'home', name: 'Home' }
  ],
  brands: [
    { id: 'acme', name: 'Acme' },
    { id: 'globex', name: 'Globex' },
    { id: 'initech', name: 'Initech' }
  ],
  statuses: ['active', 'draft', 'archived'],
  colors: ['red','blue','green','black']
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const useMocks = process.env.NEXT_PUBLIC_USE_MOCKS === '1' || process.env.NODE_ENV !== 'production'
  if (!useMocks) return res.status(404).json({ error: 'Not found' })
  res.setHeader('Cache-Control', 'no-store')
  res.setHeader('Pragma', 'no-cache')
  res.setHeader('Expires', '0')
  res.status(200).json(sample)
}
