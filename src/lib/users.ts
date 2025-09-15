import { randomUUID } from 'crypto'
import { query } from './pgClient'

export type User = {
  id: string
  email: string
  name?: string
  role?: 'admin' | 'operator' | 'client' | 'engineer'
  password_hash?: string
}

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL must be set for Postgres-only mode')

export async function listUsers(): Promise<User[]> {
  const r = await query('SELECT id, email, name, role FROM users')
  return r.rows
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  const r = await query('SELECT id, email, name, role, password_hash FROM users WHERE email = $1', [email])
  return r.rows[0]
}

export async function addUser(u: Omit<User, 'id'> & { id?: string, password_hash?: string }): Promise<User> {
  const id = u.id || randomUUID()
  const user: User = { id, email: u.email, name: u.name, role: u.role, password_hash: u.password_hash }
  await query('INSERT INTO users (id, email, name, role, password_hash) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, role = EXCLUDED.role, password_hash = EXCLUDED.password_hash', [user.id, user.email, user.name, user.role, user.password_hash])
  return user
}
