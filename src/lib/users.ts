import db from './db'
import { randomUUID } from 'crypto'

export type User = {
  id: string
  email: string
  name?: string
  role?: 'admin' | 'operator' | 'client' | 'engineer'
  password_hash?: string
}

const insertUser = db.prepare(`INSERT OR REPLACE INTO users (id, email, name, role, password_hash) VALUES (@id, @email, @name, @role, @password_hash)`)
const selectAll = db.prepare(`SELECT id, email, name, role FROM users`)
const selectByEmail = db.prepare(`SELECT id, email, name, role, password_hash FROM users WHERE email = ?`)

export function listUsers(): User[] {
  return selectAll.all()
}

export function getUserByEmail(email: string): User | undefined {
  const r = selectByEmail.get(email)
  if (!r) return undefined
  return r
}

export function addUser(u: Omit<User, 'id'> & { id?: string, password_hash?: string }): User {
  const id = u.id || randomUUID()
  const user: User = { id, email: u.email, name: u.name, role: u.role, password_hash: u.password_hash }
  insertUser.run({ id: user.id, email: user.email, name: user.name, role: user.role, password_hash: user.password_hash })
  return user
}
