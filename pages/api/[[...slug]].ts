import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const slug = req.query.slug || []
  const parts = Array.isArray(slug) ? slug : [String(slug)]
  const relPath = parts.length ? parts.join('/') : 'index'

  // resolve path under src/pages/api
  const target = `../../src/pages/api/${relPath}`
  try {
    const mod = await import(target)
    if (mod && typeof mod.default === 'function') {
      return mod.default(req, res)
    }
    return res.status(500).json({ error: 'handler not found' })
  } catch (err: any) {
    return res.status(404).json({ error: 'not found', message: err?.message })
  }
}
