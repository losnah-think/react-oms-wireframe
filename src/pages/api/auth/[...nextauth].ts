import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials: any) {
        const email = credentials?.email
        const password = credentials?.password
        if (!email || !password) return null
        try {
          const { getUserByEmail } = await import('src/lib/users')
          const bcrypt = await import('bcryptjs')
          const u = await getUserByEmail(email)
          if (!u) return null
          const hash = (u as any).password_hash
          if (!hash) return null
          const ok = await bcrypt.compare(password, hash)
          if (!ok) return null
          return { id: u.id, name: u.name || u.email, email: u.email }
        } catch (e) {
          // fallback to env admin creds for bootstrapping
          if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
            return { id: 'admin', name: 'Admin', email }
          }
          return null
        }
      }
    })
  ],
  callbacks: {
  async jwt({ token, user }: any) {
      if (user && (user as any).email) {
        // lookup role from users store
        try {
          const { getUserByEmail } = await import('src/lib/users')
          const u = await getUserByEmail((user as any).email)
          token.role = u?.role || 'operator'
        } catch (e) {
          token.role = 'operator'
        }
      }
      return token
    },
    async session({ session, token }: any) {
      (session as any).user = { ...(session as any).user, role: (token as any).role }
      return session
    }
  },
  session: { strategy: 'jwt' },
  pages: { signIn: '/settings/integration-admin/login' }
}

export default NextAuth(authOptions as any)
