import React from 'react'
import UsersPage from '../../src/pages/settings/users'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../api/auth/[...nextauth]'

export default function UsersWrapper(props: any) {
  return <UsersPage {...props} />
}

export async function getServerSideProps(ctx: any) {
  const session = await getServerSession(ctx.req, ctx.res, authOptions as any)
  if (!session || (session as any).user?.role !== 'admin') return { redirect: { destination: '/settings/integration-admin/login', permanent: false } }
  const { listUsers } = await import('src/lib/users')
  return { props: { users: listUsers() } }
}
