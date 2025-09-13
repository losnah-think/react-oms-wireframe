import React, { useEffect, useState } from 'react'

type MallOverride = {
  productId: string
  name?: string
  mallProductName?: string
  mallPrice?: number
  mallStock?: number
}

type OverridesByMall = Record<string, Record<string, MallOverride>>

const STORAGE_KEY = 'mallProductOverrides'

function readOverrides(): OverridesByMall {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch (e) {
    return {}
  }
}

function writeOverrides(val: OverridesByMall) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(val))
}

export default function MallProductManager({
  mallId,
  onClose,
  onApply,
  availableProducts = [],
}: {
  mallId: string
  onClose: () => void
  onApply?: (overrides: Record<string, MallOverride>) => void
  availableProducts?: Array<{ productId: string; name: string; mallProductName?: string; mallPrice?: number; mallStock?: number }>
}) {
  const [overrides, setOverrides] = useState<Record<string, MallOverride>>({})
  const [editing, setEditing] = useState<string | null>(null)
  const [draft, setDraft] = useState<MallOverride | null>(null)
  const [importFilter, setImportFilter] = useState<string>('')

  useEffect(() => {
    const all = readOverrides()
    setOverrides(all[mallId] || {})
  }, [mallId])

  const handleSave = () => {
    const all = readOverrides()
    all[mallId] = overrides
    writeOverrides(all)
    onApply && onApply(overrides)
    onClose()
  }

  const handleAdd = () => {
    const id = `new-${Date.now()}`
    const newItem: MallOverride = { productId: id, name: '', mallProductName: '', mallPrice: 0, mallStock: 0 }
    setOverrides((s) => ({ ...s, [id]: newItem }))
    setEditing(id)
    setDraft(newItem)
  }

  const handleExport = () => {
    const blob = new Blob([JSON.stringify({ [mallId]: overrides }, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `mall-overrides-${mallId}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = (file: File | null) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result || '{}')) as OverridesByMall
        const imported = parsed[mallId] || Object.values(parsed)[0] || {}
        setOverrides((s) => ({ ...s, ...imported }))
      } catch (e) {
        alert('파일을 읽을 수 없습니다. 올바른 JSON 파일을 선택하세요.')
      }
    }
    reader.readAsText(file)
  }

  const handleClearAll = () => {
    if (!window.confirm('이 쇼핑몰의 모든 오버라이드를 삭제하시겠습니까?')) return
    setOverrides({})
  }

  const handleImportFromProducts = () => {
    const filtered = availableProducts.filter((p) => p.name.toLowerCase().includes(importFilter.toLowerCase()) || (p.mallProductName || '').toLowerCase().includes(importFilter.toLowerCase()))
    if (filtered.length === 0) {
      alert('조건에 맞는 상품이 없습니다.')
      return
    }
    const toAdd: Record<string, MallOverride> = {}
    filtered.forEach((p) => {
      toAdd[p.productId] = { productId: p.productId, name: p.name, mallProductName: p.mallProductName || '', mallPrice: p.mallPrice || 0, mallStock: p.mallStock || 0 }
    })
    setOverrides((s) => ({ ...s, ...toAdd }))
  }

  const handleEdit = (id: string) => {
    setEditing(id)
    setDraft({ ...overrides[id] })
  }

  const handleDelete = (id: string) => {
    if (!window.confirm('이 항목을 삭제하시겠습니까?')) return
    setOverrides((s) => {
      const copy = { ...s }
      delete copy[id]
      return copy
    })
  }

  const saveDraft = () => {
    if (!editing || !draft) return
    setOverrides((s) => ({ ...s, [editing]: draft }))
    setEditing(null)
    setDraft(null)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="w-full max-w-3xl bg-white rounded shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{mallId} - 쇼핑몰별 상품명/정보 관리</h3>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-3 py-1 border rounded">취소</button>
            <button onClick={handleSave} className="px-3 py-1 bg-blue-600 text-white rounded">저장</button>
          </div>
        </div>

        <div className="mb-4 flex items-center gap-2">
          <button onClick={handleAdd} className="px-3 py-1 border rounded text-sm">새 항목 추가</button>
          <button onClick={handleExport} className="px-3 py-1 border rounded text-sm">내보내기</button>
          <label className="px-3 py-1 border rounded text-sm cursor-pointer inline-block">
            가져오기
            <input type="file" accept="application/json" onChange={(e) => handleImport(e.target.files ? e.target.files[0] : null)} className="hidden" />
          </label>
          <button onClick={handleClearAll} className="px-3 py-1 border rounded text-sm text-red-600">전체 삭제</button>
        </div>

        <div className="mb-4 flex items-center gap-2">
          <input value={importFilter} onChange={(e)=>setImportFilter(e.target.value)} placeholder="상품명/쇼핑몰명으로 필터" className="px-2 py-1 border rounded flex-1" />
          <button onClick={handleImportFromProducts} className="px-3 py-1 border rounded text-sm">상품에서 가져오기</button>
        </div>

        <div className="space-y-3 max-h-72 overflow-auto">
          {Object.keys(overrides).length === 0 && (
            <div className="text-sm text-gray-500">등록된 오버라이드가 없습니다.</div>
          )}

          {Object.entries(overrides).map(([id, o]) => (
            <div key={id} className="p-3 border rounded flex items-start justify-between">
              <div className="flex-1">
                {editing === id ? (
                  <div className="space-y-2">
                    <input className="w-full px-2 py-1 border" value={draft?.productId || ''} onChange={(e)=>setDraft(d=>d?{...d,productId:e.target.value}:null)} placeholder="상품코드" />
                    <input className="w-full px-2 py-1 border" value={draft?.name||''} onChange={(e)=>setDraft(d=>d?{...d,name:e.target.value}:null)} placeholder="상품명(기준)" />
                    <input className="w-full px-2 py-1 border" value={draft?.mallProductName||''} onChange={(e)=>setDraft(d=>d?{...d,mallProductName:e.target.value}:null)} placeholder="쇼핑몰 상품명" />
                    <div className="flex gap-2">
                      <input type="number" className="px-2 py-1 border" value={draft?.mallPrice||0} onChange={(e)=>setDraft(d=>d?{...d,mallPrice:parseInt(e.target.value||'0')}:null)} placeholder="쇼핑몰 가격" />
                      <input type="number" className="px-2 py-1 border" value={draft?.mallStock||0} onChange={(e)=>setDraft(d=>d?{...d,mallStock:parseInt(e.target.value||'0')}:null)} placeholder="쇼핑몰 재고" />
                    </div>
                    <div className="flex gap-2">
                      <button onClick={saveDraft} className="px-2 py-1 bg-green-600 text-white rounded text-sm">저장</button>
                      <button onClick={()=>{setEditing(null);setDraft(null)}} className="px-2 py-1 border rounded text-sm">취소</button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="text-sm font-medium">{o.mallProductName || o.name || o.productId}</div>
                    <div className="text-xs text-gray-500">코드: {o.productId}</div>
                    <div className="text-xs text-gray-500">가격: ₩{(o.mallPrice||0).toLocaleString()} 재고: {o.mallStock||0}개</div>
                  </div>
                )}
              </div>

              <div className="ml-4 flex-shrink-0 flex flex-col gap-2">
                <button onClick={()=>handleEdit(id)} className="px-2 py-1 border rounded text-sm">편집</button>
                <button onClick={()=>handleDelete(id)} className="px-2 py-1 border text-red-600 rounded text-sm">삭제</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
