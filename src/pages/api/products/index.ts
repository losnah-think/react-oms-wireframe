import { NextApiRequest, NextApiResponse } from 'next'
import { listProducts, createProduct } from '../../../../src/lib/productStore'
import { requireAdmin } from '../../../../src/lib/serverAuth'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  return requireAdmin(req, res).then(async (session) => {
    if (!session) return null

    if (req.method === 'GET') {
      const items = await listProducts()
      return res.status(200).json(items)
    }

    if (req.method === 'POST') {
      const payload = req.body
      const created = await createProduct(payload)
      return res.status(201).json(created)
    }

    res.setHeader('Allow', ['GET','POST'])
    return res.status(405).end('Method Not Allowed')
  })
}
