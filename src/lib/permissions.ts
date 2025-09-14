import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from 'src/pages/api/auth/[...nextauth]'

export async function requireRole(req: NextApiRequest, res: NextApiResponse, roles: string[] = []) : Promise<{ ok: boolean, status: number, body: any, session?: any }> {
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
