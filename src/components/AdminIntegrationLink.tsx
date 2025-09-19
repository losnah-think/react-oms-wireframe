"use client"
import React from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

export default function AdminIntegrationLink() {
  const { data: session } = useSession();
  if (!session || (session as any)?.user?.role !== 'admin') return null;
  return (
    <div className="mt-3">
      <Link href="/settings/integration-admin" className="px-3 py-1 bg-black text-white rounded">Open Admin Integration</Link>
    </div>
  );
}
