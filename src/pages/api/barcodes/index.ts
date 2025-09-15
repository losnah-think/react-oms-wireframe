import { NextApiRequest, NextApiResponse } from 'next'
import { listTemplates, createTemplate } from '../../../../src/lib/barcodeStore'
import { requireAdmin } from '../../../../src/lib/serverAuth'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  return requireAdmin(req, res).then((session) => {
    if (!session) return null

    if (req.method === 'GET') {
      return res.status(200).json(listTemplates())
    }

    if (req.method === 'POST') {
      const payload = req.body
      const created = createTemplate(payload)
      return res.status(201).json(created)
    }

    res.setHeader('Allow', ['GET','POST'])
    return res.status(405).end('Method Not Allowed')
  })
}
