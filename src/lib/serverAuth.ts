import { getServerSession } from 'next-auth/next'
import { authOptions } from '../pages/api/auth/[...nextauth]'

export async function requireAdmin(req: any, res: any) {
  try {
    const session = await getServerSession(req, res, authOptions as any)
    if (!session) {
      res.status(401).json({ error: 'unauthenticated' })
      return null
    }
    const role = (session as any).user?.role || 'operator'
    if (role !== 'admin') {
      res.status(403).json({ error: 'forbidden' })
      return null
    }
    return session
  } catch (e) {
    res.status(500).json({ error: 'server error', detail: String(e) })
    return null
  }
}
