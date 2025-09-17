import type { NextApiRequest, NextApiResponse } from 'next'
import mockProductDetails from '../../../src/data/mockProductDetails'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Cache-Control', 'no-store')
  res.setHeader('Pragma', 'no-cache')
  res.setHeader('Expires', '0')
  res.status(200).json({ products: mockProductDetails })
}
