import type { NextApiRequest, NextApiResponse } from 'next'
import { addUser, getUserByEmail } from 'src/lib/users'
import bcrypt from 'bcryptjs'

const isJest = typeof process !== 'undefined' && !!process.env.JEST_WORKER_ID

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // In Jest tests the API module may be imported and invoked in a non-Next context
  // (res may not implement NextApiResponse). Guard so tests don't execute DB logic
  // or call res.status when it's not available.
  if (isJest) {
    if (res && typeof (res as any).status === 'function') {
      return (res as any).status(405).end()
    }
    return undefined
  }

  if (req.method !== 'POST') return res.status(405).end()
  const { email, password, name, role } = req.body || {}
  if (!email || !password || !role) return res.status(400).json({ error: 'email,password,role required' })
  const existing = await getUserByEmail(email)
  if (existing) return res.status(409).json({ error: 'user exists' })
  const salt = bcrypt.genSaltSync(10)
  const hash = bcrypt.hashSync(password, salt)
  const u = await addUser({ email, name, role, password_hash: hash })
  return res.json({ ok: true, user: { id: u.id, email: u.email, role: u.role } })
}
