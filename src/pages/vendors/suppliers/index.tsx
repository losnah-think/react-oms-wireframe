import React from 'react'
import { useRouter } from 'next/router'
import Layout from '@/components/layout/Layout'
import { Container, Card } from '@/design-system'
import SuppliersToolbar from '@/components/vendors/SuppliersToolbar'
import SuppliersTable from '@/components/vendors/SuppliersTable'
import * as mockSuppliers from '@/lib/mockSuppliers'

export default function SupplierOrdersIndex() {
  const router = useRouter()
  const [q, setQ] = React.useState('')
  const [items, setItems] = React.useState<any[]>([])
  const [total, setTotal] = React.useState(0)

  const load = React.useCallback(async () => {
    const res = await mockSuppliers.listSuppliers({ q })
    setItems(res.items || [])
    setTotal(res.total || (res.items || []).length)
  }, [q])

  React.useEffect(() => { load() }, [load])

  return (
    <Layout>
      <Container maxWidth="6xl" padding="lg">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">공급처 관리</h1>
        </div>

        <SuppliersToolbar total={total} q={q} onChangeQ={(v:string)=>setQ(v)} onAdd={()=>router.push('/vendors/suppliers/new')} />

        <Card padding="lg" className="mt-4">
          <SuppliersTable items={items} onOpen={(id:string)=>router.push(`/vendors/suppliers/${id}`)} onDelete={async (id:string)=>{ await mockSuppliers.softDeleteSupplier(id); load() }} />
        </Card>
      </Container>
    </Layout>
  )
}
