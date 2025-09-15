import { NextApiRequest, NextApiResponse } from 'next'
import { requireAdmin } from '../../../../src/lib/serverAuth'

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb'
    }
  }
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  return requireAdmin(req, res).then(async (session) => {
    if (!session) return null

    if (req.method !== 'POST') {
      res.setHeader('Allow', ['POST'])
      return res.status(405).end('Method Not Allowed')
    }

    const { value = '', bcid = 'code128', scale = 3, height = 10 } = req.body || {}

    try {
      const bwip = require('bwip-js')
      // Render to a PNG buffer
      const png = await new Promise<Buffer>((resolve, reject) => {
        bwip.toBuffer({ bcid, text: String(value), scale, height, includetext: true, textxalign: 'center' }, function (err: any, pngBuf: Buffer) {
          if (err) return reject(err)
          resolve(pngBuf)
        })
      })

      res.setHeader('Content-Type', 'image/png')
      res.setHeader('Content-Length', String(png.length))
      return res.status(200).send(png)
    } catch (err) {
      console.error('generate.png error', err)
      return res.status(500).json({ error: 'generate failed', detail: String(err) })
    }
  })
}
