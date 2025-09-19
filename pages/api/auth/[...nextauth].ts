// ...existing code...
import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { shouldSkipAuth } from 'src/lib/devAuth'

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials: any) {
  const rawEmail = credentials?.email
  const password = credentials?.password
  // Some form encoders turn '+' into space; normalize back to '+' for emails like a+tag@example.com
  const email = typeof rawEmail === 'string' ? rawEmail.replace(/\s/g, '+') : rawEmail
        if (!email || !password) {
          console.log('[nextauth] authorize: missing credentials')
          return null
        }
        try {
          // Prefer Supabase REST lookup first (avoids direct DB connection failures).
          const sbUrl = process.env.SUPABASE_URL
          const sbKey = process.env.SUPABASE_SERVICE_ROLE_KEY
          if (sbUrl && sbKey) {
            try {
              const fetch = (await import('node-fetch')).default
              const bcryptMod2 = await import('bcryptjs')
              const bcrypt2 = (bcryptMod2 && (bcryptMod2 as any).compare) ? bcryptMod2 : (bcryptMod2 && (bcryptMod2 as any).default) ? (bcryptMod2 as any).default : bcryptMod2
              const url = `${sbUrl.replace(/\/$/, '')}/rest/v1/users?email=eq.${encodeURIComponent(email)}&select=*`
              console.log('[nextauth] Supabase REST GET', url)
              const resp = await fetch(url, {
                method: 'GET',
                headers: {
                  'apikey': sbKey,
                  'Authorization': `Bearer ${sbKey}`,
                  'Accept': 'application/json'
                }
              })
              if (resp.ok) {
                const rows = await resp.json()
                const su = Array.isArray(rows) && rows[0]
                console.log('[nextauth] sb lookup found=', !!su)
                if (su && su.password_hash) {
                  const ok = await bcrypt2.compare(password, su.password_hash)
                  console.log('[nextauth] Supabase bcrypt compare', ok)
                  if (ok) return { id: su.id || 'sb-' + (su.email || ''), name: su.name || su.email, email: su.email, role: su.role || 'operator' }
                  // If bcrypt comparison fails but Supabase REST found a user, try Supabase Auth password grant
                  try {
                    const authUrl = `${sbUrl.replace(/\/$/, '')}/auth/v1/token?grant_type=password`
                    console.log('[nextauth] Attempting Supabase Auth password grant', authUrl)
                    const tokenResp = await fetch(authUrl, {
                      method: 'POST',
                      headers: {
                        'apikey': sbKey,
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                      },
                      body: JSON.stringify({ email, password })
                    })
                    if (tokenResp.ok) {
                      const tokenJson: any = await tokenResp.json()
                      console.log('[nextauth] Supabase Auth token result', !!(tokenJson && tokenJson.access_token))
                      if (tokenJson && tokenJson.access_token) {
                        // Treat as successful credential login — return basic user object
                        return { id: su.id || 'sb-' + (su.email || ''), name: su.name || su.email, email: su.email, role: su.role || 'operator' }
                      }
                    } else {
                      console.warn('[nextauth] Supabase Auth token request failed', tokenResp.status)
                    }
                  } catch (eAuth) {
                    console.error('[nextauth] Supabase Auth password grant error', String(eAuth))
                  }
                }
              } else {
                console.warn('[nextauth] Supabase REST GET failed', resp.status)
                console.log('[nextauth] sb_get_failed status=', resp.status)
              }
            } catch (e2) {
              console.error('[nextauth] Supabase REST primary lookup error', String(e2))
              console.log('[nextauth] sb_error_primary=', String(e2))
            }
          }

          // If Supabase REST didn't yield a match, fall back to local DB lookup
          console.log('[nextauth] authorize: attempting DB lookup for', email)
          const masked = { email, password: typeof password === 'string' ? '***' : undefined }
          const { getUserByEmail } = await import('src/lib/users')
          const bcryptMod = await import('bcryptjs')
          const bcrypt = (bcryptMod && (bcryptMod as any).compare) ? bcryptMod : (bcryptMod && (bcryptMod as any).default) ? (bcryptMod as any).default : bcryptMod
          const u = await getUserByEmail(email)
          console.log('[nextauth] db lookup result for', email, !!u)
          if (u) {
            const hash = (u as any).password_hash
            console.log('[nextauth] db hash present?', !!hash)
            if (hash) {
              const ok = await bcrypt.compare(password, hash)
              console.log('[nextauth] bcrypt compare result', ok)
              if (ok) return { id: u.id, name: u.name || u.email, email: u.email, role: (u as any).role || 'operator' }
            }
          }

          console.log('[nextauth] authorize: no matching credentials for', email)
          return null
        } catch (e) {
          console.error('[nextauth] DB lookup failed, trying Supabase REST fallback:', String(e))
          console.log('[nextauth] db_error=', String(e))
            // If DB access fails (e.g., local DNS issue), try Supabase REST fallback using
            // SUPABASE_SERVICE_ROLE_KEY to fetch the user row and verify password hash.
            try {
              const sbUrl2 = process.env.SUPABASE_URL
              const sbKey2 = process.env.SUPABASE_SERVICE_ROLE_KEY
              if (sbUrl2 && sbKey2) {
                const fetch = (await import('node-fetch')).default
                const bcryptMod2 = await import('bcryptjs')
                const bcrypt = (bcryptMod2 && (bcryptMod2 as any).compare) ? bcryptMod2 : (bcryptMod2 && (bcryptMod2 as any).default) ? (bcryptMod2 as any).default : bcryptMod2
                const url = `${sbUrl2.replace(/\/$/, '')}/rest/v1/users?email=eq.${encodeURIComponent(email)}&select=*`
                console.log('[nextauth] Supabase REST fallback GET', url)
                const resp = await fetch(url, {
                  method: 'GET',
                  headers: {
                    'apikey': sbKey2,
                    'Authorization': `Bearer ${sbKey2}`,
                    'Accept': 'application/json'
                  }
                })
                if (resp.ok) {
                  const rows = await resp.json()
                  const u = Array.isArray(rows) && rows[0]
                  console.log('[nextauth] sb fallback found=', !!u)
                  if (u && u.password_hash) {
                    const ok = await bcrypt.compare(password, u.password_hash)
                    console.log('[nextauth] Supabase fallback bcrypt compare', ok)
                    if (ok) return { id: u.id || 'sb-' + (u.email || ''), name: u.name || u.email, email: u.email, role: u.role || 'operator' }
                  }
                } else {
                  console.warn('[nextauth] Supabase REST fallback GET failed', resp.status)
                }
              }
            } catch (e2) {
              // ignore and fallthrough to env-admin fallback
            }
            // fallback to env admin creds for bootstrapping
            const envAdminEmail = process.env.ADMIN_EMAIL?.trim()
            const envAdminPassword = process.env.ADMIN_PASSWORD?.trim()
            if (
              envAdminEmail &&
              envAdminPassword &&
              typeof email === 'string' &&
              envAdminEmail.toLowerCase() === email.toLowerCase() &&
              password === envAdminPassword
            ) {
              console.log('[nextauth] authorize: environment admin login used for', email)
              return { id: 'admin', name: 'Admin', email, role: 'admin' }
            }
            return null
        }
      }
    })
  ],
  callbacks: {
  async jwt({ token, user }: any) {
      // If the `user` object is present (initial sign-in), prefer its role.
      if (user) {
        token.role = (user as any).role || token.role
      }
      // If role still unknown but we have an email, attempt to look it up.
      if (!token.role && user && (user as any).email) {
        try {
          const { getUserByEmail } = await import('src/lib/users')
          const u = await getUserByEmail((user as any).email)
          token.role = u?.role || 'operator'
        } catch (e) {
          token.role = 'operator'
        }
      }
      // Ensure a role is always present.
      token.role = token.role || 'operator'
      return token
    },
    async session({ session, token }: any) {
      (session as any).user = { ...(session as any).user, role: (token as any).role }
      return session
    }
  },
  session: { strategy: 'jwt' },
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production' ? '__Secure-next-auth.session-token' : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production'
      }
    }
  },
  pages: { signIn: '/login' }
}

// When developing locally we may want to skip NextAuth entirely and return a mock
// session so the app doesn't keep redirecting to the login screen. The
// `shouldSkipAuth()` helper detects localhost/dev and an explicit env flag.
let _defaultHandler: any = null
if (shouldSkipAuth()) {
  _defaultHandler = function devAuthHandler(req: any, res: any) {
    try {
      const parts = Array.isArray(req.query?.nextauth) ? req.query.nextauth : []
      const action = parts[0] || ''
      if (action === 'providers') {
        res.status(200).json({})
        return
      }
      if (action === 'csrf') {
        res.status(200).json({ csrfToken: 'dev-csrf-token' })
        return
      }
      if (action === 'session') {
        const session = {
          user: { name: 'Developer', email: process.env.DEV_ADMIN_EMAIL || 'dev@localhost', role: 'admin' },
          expires: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString()
        }
        res.status(200).json(session)
        return
      }
      // For other next-auth paths (callbacks, signout), respond OK.
      res.status(200).json({ ok: true })
    } catch (e) {
      res.status(500).json({ error: 'dev-auth-failed', details: String(e) })
    }
  }
} else {
  _defaultHandler = NextAuth(authOptions as any)
}

export default _defaultHandler
