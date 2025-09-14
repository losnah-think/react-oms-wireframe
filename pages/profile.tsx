import React from 'react'
import { getServerSession } from 'next-auth/next'
import { authOptions } from './api/auth/[...nextauth]'
import { signOut } from 'next-auth/react'

export default function ProfilePage({ user }: { user: any }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="w-full max-w-2xl">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold mb-4">My Page</h1>
          <div className="mb-4">이름: {user?.name || '—'}</div>
          <div className="mb-4">이메일: {user?.email}</div>
          <div className="mt-6">
            <button onClick={() => signOut({ callbackUrl: '/settings/integration-admin/login' })} className="px-4 py-2 bg-red-600 text-white rounded">Sign out</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export async function getServerSideProps(ctx: any) {
  const session = await getServerSession(ctx.req, ctx.res, authOptions as any)
  if (!session) {
    return {
      redirect: {
        destination: '/settings/integration-admin/login',
        permanent: false,
      }
    }
  }
  return {
    props: {
      user: (session as any).user
    }
  }
}
