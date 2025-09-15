import type { NextApiRequest, NextApiResponse } from 'next'

// Dev-only debug endpoint. Returns request headers and cookies back to the caller.
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({ error: 'Not available in production' })
  }

  const headers = req.headers
  // Next.js parses cookies into req.cookies when using API routes
  const cookies = (req as any).cookies || {}

  return res.status(200).json({ ok: true, headers, cookies })
}
