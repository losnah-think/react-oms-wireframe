import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../src/pages/api/auth/[...nextauth]'
import Container from '../../../src/design-system/components/Container'
import Card from '../../../src/design-system/components/Card'
import { useState } from 'react'

export default function AddShopPage() {
  const [shopId, setShopId] = useState('')
  const [name, setName] = useState('')
  const [platform, setPlatform] = useState('cafe24')
  const [clientId, setClientId] = useState('')
  const [clientSecret, setClientSecret] = useState('')

  const handleSubmit = async () => {
    if (!shopId) return alert('shopId required')
    try {
      const resp = await fetch(`/api/integrations/shops/${shopId}/credentials`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ platform, clientId, clientSecret }) })
      const body = await resp.json()
      if (body?.ok) {
        alert('샾 등록 성공')
        window.location.href = '/settings/integration'
      } else alert('등록 실패')
    } catch (e) {
      alert('네트워크 오류')
    }
  }

  return (
    <Container>
      <h1>새 샵 등록</h1>
      <Card>
        <div style={{ display: 'grid', gap: 8 }}>
          <input placeholder="Shop ID" value={shopId} onChange={e => setShopId(e.target.value)} />
          <input placeholder="Shop ID" value={shopId} onChange={e => setShopId(e.target.value)} />
          <input placeholder="Client ID" value={clientId} onChange={e => setClientId(e.target.value)} />
          <input placeholder="Client Secret" value={clientSecret} onChange={e => setClientSecret(e.target.value)} />
          <div>
            <button onClick={handleSubmit} className="px-3 py-1 bg-green-600 text-white rounded">등록</button>
            <a href="/settings/integration" className="ml-2 px-3 py-1 bg-gray-200 rounded">취소</a>
          </div>
        </div>
      </Card>
    </Container>
  )
}

export async function getServerSideProps(ctx: any) {
  const session = await getServerSession(ctx.req, ctx.res, authOptions as any)
  if (!session || (session as any).user?.role !== 'admin') return { redirect: { destination: '/settings/integration-admin/login', permanent: false } }
  return { props: {} }
}
