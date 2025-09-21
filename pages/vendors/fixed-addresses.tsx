import React, { useEffect, useState } from 'react'

type FixedAddress = {
  id: string | number
  vendor_id?: number
  label: string
  address: string
  receiver?: string
  phone?: string
  zip?: string
  is_default?: boolean
}

export default function VendorsFixedAddressesPage() {
  const [list, setList] = useState<FixedAddress[]>([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState<Partial<FixedAddress>>({ label: '', address: '', vendor_id: undefined })

  const fetchList = async () => {
    setLoading(true)
    try {
      const r = await fetch('/api/vendors/fixed-addresses')
      const j = await r.json()
      setList(j.list || [])
    } catch (e) {
      console.error(e)
      setList([])
    }
    setLoading(false)
  }

  useEffect(() => { fetchList() }, [])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await fetch('/api/vendors/fixed-addresses', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      setForm({ label: '', address: '', vendor_id: undefined })
      await fetchList()
    } catch (err) {
      console.error(err)
      alert('저장 중 오류')
    }
  }

  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold">고정배송지 관리</h2>
      <div className="mt-4">
        {loading ? <div>로딩 중...</div> : (
          <ul className="space-y-2">
            {list.map((a) => (
              <li key={String(a.id)} className="border p-2 rounded">
                <div className="font-medium">{a.label} {a.is_default ? <span className="text-xs text-blue-600">(기본)</span> : null}</div>
                <div className="text-sm text-gray-600">{a.address}</div>
              </li>
            ))}
            {list.length === 0 && <li className="text-sm text-gray-500">등록된 고정배송지가 없습니다.</li>}
          </ul>
        )}
      </div>

      <form onSubmit={submit} className="mt-6 space-y-2">
        <div>
          <label className="block text-sm">판매처 ID</label>
          <input value={form.vendor_id ?? ''} onChange={e => setForm({ ...form, vendor_id: e.target.value ? Number(e.target.value) : undefined })} className="border p-1 w-48" />
        </div>
        <div>
          <label className="block text-sm">제목</label>
          <input value={form.label ?? ''} onChange={e => setForm({ ...form, label: e.target.value })} className="border p-1 w-96" />
        </div>
        <div>
          <label className="block text-sm">주소</label>
          <input value={form.address ?? ''} onChange={e => setForm({ ...form, address: e.target.value })} className="border p-1 w-96" />
        </div>
        <div>
          <button type="submit" className="px-3 py-1 bg-blue-600 text-white rounded">저장</button>
        </div>
      </form>
    </div>
  )
}
