import type { NextApiRequest, NextApiResponse } from 'next'
import { addUser, getUserByEmail } from 'src/lib/users'
import bcrypt from 'bcryptjs'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()
  const { email, password, name, role } = req.body || {}
  if (!email || !password || !role) return res.status(400).json({ error: 'email,password,role required' })
  const existing = getUserByEmail(email)
  if (existing) return res.status(409).json({ error: 'user exists' })
  const salt = bcrypt.genSaltSync(10)
  const hash = bcrypt.hashSync(password, salt)
  const u = addUser({ email, name, role, password_hash: hash })
  return res.json({ ok: true, user: { id: u.id, email: u.email, role: u.role } })
}
