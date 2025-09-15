import { NextApiRequest, NextApiResponse } from 'next'
import { getProduct, updateProduct, deleteProduct } from '../../../../src/lib/productStore'
import { requireAdmin } from '../../../../src/lib/serverAuth'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query as { id: string }

  return requireAdmin(req, res).then(async (session) => {
    if (!session) return null

    if (req.method === 'GET') {
      const p = await getProduct(id)
      if (!p) return res.status(404).end('Not found')
      return res.status(200).json(p)
    }

    if (req.method === 'PUT') {
      const patched = await updateProduct(id, req.body)
      if (!patched) return res.status(404).end('Not found')
      return res.status(200).json(patched)
    }

    if (req.method === 'DELETE') {
      await deleteProduct(id)
      return res.status(204).end()
    }

    res.setHeader('Allow', ['GET','PUT','DELETE'])
    return res.status(405).end('Method Not Allowed')
  })
}
