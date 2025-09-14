"use client"
import React from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

export default function AdminIntegrationLink() {
  const sessObj: any = (useSession && (useSession() as any)) || {}
  const session = sessObj.data
  if ((session as any)?.user?.role !== 'admin') return null
  return (
    <div className="mt-3">
      <Link href="/settings/integration-admin"><a className="px-3 py-1 bg-black text-white rounded">Open Admin Integration</a></Link>
    </div>
  )
}
