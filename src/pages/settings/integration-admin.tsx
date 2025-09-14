import { getServerSession } from 'next-auth'
import { authOptions } from '../api/auth/[...nextauth]'
import React from 'react'

export default function IntegrationAdminPage({}) {
  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Integration Admin</h2>
      <p>관리자 전용 페이지입니다. 여기에서 clientSecret을 안전하게 저장할 수 있습니다.</p>
      <div className="mt-4">
        <form id="secretForm" onSubmit={async (e) => {
          e.preventDefault()
          const shopId = (document.getElementById('shopId') as HTMLInputElement).value
          const secret = (document.getElementById('secret') as HTMLInputElement).value
          const resp = await fetch('/api/integrations/cafe24/set-secret', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ shopId, clientSecret: secret }) })
          const data = await resp.json()
          if (data?.ok) alert('saved')
          else alert('failed')
        }}>
          <div className="grid grid-cols-2 gap-2">
            <input id="shopId" placeholder="shopId" />
            <input id="secret" placeholder="Client Secret" />
          </div>
          <div className="mt-2"><button className="px-3 py-1 bg-indigo-600 text-white rounded">저장</button></div>
        </form>
      </div>
    </div>
  )
}

export async function getServerSideProps(ctx: any) {
  const session = await getServerSession(ctx.req, ctx.res, authOptions as any)
  if (!session) return { redirect: { destination: '/settings/integration-admin/login', permanent: false } }
  return { props: {} }
}
