import { NextApiRequest, NextApiResponse } from 'next'
import { listTemplates, createTemplate } from '../../../../src/lib/barcodeStore'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    return res.status(200).json(listTemplates())
  }

  if (req.method === 'POST') {
    const payload = req.body
    const created = createTemplate(payload)
    return res.status(201).json(created)
  }

  res.setHeader('Allow', ['GET','POST'])
  res.status(405).end('Method Not Allowed')
}
