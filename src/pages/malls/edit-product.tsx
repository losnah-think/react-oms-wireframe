import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { Container } from '../../design-system'

type MallOverride = {
  productId: string
  name?: string
  mallProductName?: string
  mallPrice?: number
  mallStock?: number
}

const STORAGE_KEY = 'mallProductOverrides'

function readOverrides() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch (e) {
    return {}
  }
}

function writeOverrides(val: any) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(val))
}

export default function EditProductPage() {
  const router = useRouter()
  const { mallId, productId } = router.query as { mallId?: string; productId?: string }

  const [loading, setLoading] = useState(true)
  const [draft, setDraft] = useState<MallOverride | null>(null)

  useEffect(() => {
    if (!mallId || !productId) return
    try {
      const all = readOverrides()
      const mall = all[mallId] || {}
      const existing = mall[productId] || null
      setDraft(existing || { productId, name: '', mallProductName: '', mallPrice: 0, mallStock: 0 })
    } catch (e) {
      setDraft({ productId, name: '', mallProductName: '', mallPrice: 0, mallStock: 0 })
    } finally {
      setLoading(false)
    }
  }, [mallId, productId])

  const handleSave = () => {
    if (!mallId || !productId || !draft) return
    const all = readOverrides()
    all[mallId] = all[mallId] || {}
    all[mallId][productId] = draft
    writeOverrides(all)
    alert('저장되었습니다.')
    router.push('/malls')
  }

  if (!mallId || !productId) return <Container maxWidth="full"><div className="p-6 text-center">잘못된 접근입니다. mallId 및 productId가 필요합니다.</div></Container>

  return (
    <Container maxWidth="full">
      <div className="p-6 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">상품 정보 수정</h1>
        {loading ? (
          <div>로딩중...</div>
        ) : (
          draft && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-700">상품 코드</label>
                <div className="mt-1 text-sm text-gray-900">{draft.productId}</div>
              </div>

              <div>
                <label className="block text-sm text-gray-700">상품명(기준)</label>
                <input value={draft.name || ''} onChange={(e)=>setDraft(d=>d?{...d,name:e.target.value}:null)} className="w-full px-3 py-2 border rounded" />
              </div>

              <div>
                <label className="block text-sm text-gray-700">쇼핑몰 상품명</label>
                <input value={draft.mallProductName || ''} onChange={(e)=>setDraft(d=>d?{...d,mallProductName:e.target.value}:null)} className="w-full px-3 py-2 border rounded" />
              </div>

              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-sm text-gray-700">쇼핑몰 가격</label>
                  <input type="number" value={draft.mallPrice||0} onChange={(e)=>setDraft(d=>d?{...d,mallPrice:parseInt(e.target.value||'0')}:null)} className="w-full px-3 py-2 border rounded" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm text-gray-700">쇼핑몰 재고</label>
                  <input type="number" value={draft.mallStock||0} onChange={(e)=>setDraft(d=>d?{...d,mallStock:parseInt(e.target.value||'0')}:null)} className="w-full px-3 py-2 border rounded" />
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <button onClick={()=>router.push('/malls')} className="px-4 py-2 border rounded">취소</button>
                <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded">저장</button>
              </div>
            </div>
          )
        )}
      </div>
    </Container>
  )
}
