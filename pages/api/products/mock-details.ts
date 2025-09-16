import type { NextApiRequest, NextApiResponse } from 'next'
import mockProductDetails from '../../../src/data/mockProductDetails'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({ products: mockProductDetails })
}
