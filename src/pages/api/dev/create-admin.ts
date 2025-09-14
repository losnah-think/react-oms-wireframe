import type { NextApiRequest, NextApiResponse } from 'next'
import { addUser, getUserByEmail } from 'src/lib/users'
import * as bcrypt from 'bcryptjs'

// Dev-only: create an admin user with provided email/password
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (process.env.NODE_ENV === 'production') return res.status(403).json({ error: 'disabled' })
  if (req.method !== 'POST') return res.status(405).end()
  const { email, password, name } = req.body || {}
  if (!email || !password) return res.status(400).json({ error: 'email and password required' })
  const existing = getUserByEmail(email)
  if (existing) return res.status(200).json({ ok: true, user: existing })
  const hash = await bcrypt.hash(password, 10)
  const user = addUser({ email, name: name || 'Admin', role: 'admin', password_hash: hash })
  return res.status(201).json({ ok: true, user })
}
