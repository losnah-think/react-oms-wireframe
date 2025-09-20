import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/server/api/auth/[...nextauth]'

export async function requireRole(req: NextApiRequest, res: NextApiResponse, roles: string[] = []) : Promise<{ ok: boolean, status: number, body: any, session?: any }> {
  // Dev-only bypass: if NODE_ENV !== 'production' and header `x-dev-user` is present,
  // resolve a lightweight session from Supabase REST (service role key) so local
  // testing doesn't require a full NextAuth login flow.
  if (process.env.NODE_ENV !== 'production') {
    const devHeader = req.headers['x-dev-user'] as string | undefined
    // Special dev bootstrap token: if client sends `x-dev-user: __dev__`,
    // treat the request as an admin session for local-only testing.
    if (devHeader === '__dev__') {
      return { ok: true, status: 200, body: { ok: true }, session: { user: { email: 'dev@local', name: 'Dev', role: 'admin' } } }
    }
    const devEmail = devHeader
    if (devEmail) {
      try {
        const sbUrl = process.env.SUPABASE_URL
        const sbKey = process.env.SUPABASE_SERVICE_ROLE_KEY
        if (sbUrl && sbKey) {
          const fetch = (await import('node-fetch')).default
          const url = `${sbUrl}/rest/v1/users?email=eq.${encodeURIComponent(devEmail)}&select=*`
          const resp = await fetch(url, { headers: { apikey: sbKey, Authorization: `Bearer ${sbKey}`, Accept: 'application/json' } })
          if (resp.ok) {
            const rows: any = await resp.json()
            const u = Array.isArray(rows) && rows[0]
            if (u) {
              const session = { user: { email: u.email, name: u.name, role: u.role } }
              if (roles.length > 0 && !roles.includes(u.role)) return { ok: false, status: 403, body: { error: 'forbidden' } }
              return { ok: true, status: 200, body: { ok: true }, session }
            }
          }
        }
      } catch (e) {
        // fallthrough to normal path
      }
    }
  }
  const session = await getServerSession(req, res, authOptions as any)
  const role = session && (session as any).user && (session as any).user.role
  if (!session || !role) return { ok: false, status: 401, body: { error: 'unauthenticated' } }
  if (roles.length > 0 && !roles.includes(role)) return { ok: false, status: 403, body: { error: 'forbidden' } }
  return { ok: true, status: 200, body: { ok: true }, session }
}

export function hasRole(role: string | null, allowed: string[]) {
  if (!role) return false
  return allowed.includes(role)
}
