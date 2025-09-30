import React, { useEffect, useState } from 'react'

type Props = {
  mallId: string
  productId: string
  onClose: () => void
  onSaved?: (overridesForMall: Record<string, any>) => void
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

export default function EditProductModal({ mallId, productId, onClose, onSaved }: Props) {
  type DraftType = { productId: string; name?: string; mallProductName?: string; mallPrice?: number; mallStock?: number }
  const [draft, setDraft] = useState<DraftType | null>(null)

  useEffect(() => {
    const all = readOverrides()
    const mall = all[mallId] || {}
    const existing = mall[productId] || null
    setDraft(existing || { productId, name: '', mallProductName: '', mallPrice: 0, mallStock: 0 })
  }, [mallId, productId])

  const handleSave = () => {
    if (!draft) return
    const all = readOverrides()
    all[mallId] = all[mallId] || {}
    all[mallId][productId] = draft
    writeOverrides(all)
    onSaved && onSaved(all[mallId])
    onClose()
  }

  if (!draft) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="w-full max-w-2xl bg-white rounded shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{mallId} - 상품 편집</h3>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-3 py-1 border rounded">취소</button>
            <button onClick={handleSave} className="px-3 py-1 bg-blue-600 text-white rounded">저장</button>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-sm text-gray-700">상품 코드</label>
            <div className="text-sm text-gray-900">{draft.productId}</div>
          </div>
          <div>
            <label className="block text-sm text-gray-700">상품명(기준)</label>
            <input className="w-full px-2 py-1 border" value={draft.name||''} onChange={(e)=>setDraft((d:DraftType|null)=>d?{...d,name:e.target.value}:d)} />
          </div>
          <div>
            <label className="block text-sm text-gray-700">판매처 상품명</label>
            <input className="w-full px-2 py-1 border" value={draft.mallProductName||''} onChange={(e)=>setDraft((d:DraftType|null)=>d?{...d,mallProductName:e.target.value}:d)} />
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-sm text-gray-700">판매처 가격</label>
              <input type="number" className="w-full px-2 py-1 border" value={draft.mallPrice||0} onChange={(e)=>setDraft((d:DraftType|null)=>d?{...d,mallPrice:parseInt(e.target.value||'0')}:d)} />
            </div>
            <div className="flex-1">
              <label className="block text-sm text-gray-700">판매처 재고</label>
              <input type="number" className="w-full px-2 py-1 border" value={draft.mallStock||0} onChange={(e)=>setDraft((d:DraftType|null)=>d?{...d,mallStock:parseInt(e.target.value||'0')}:d)} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
