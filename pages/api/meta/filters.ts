import { NextApiRequest, NextApiResponse } from 'next'

const sample = {
  filters: [
    { id: 'size', name: 'Size', options: ['S','M','L','XL'] },
    { id: 'color', name: 'Color', options: ['red','green','blue','black'] },
    { id: 'material', name: 'Material', options: ['cotton','polyester','wool'] }
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
