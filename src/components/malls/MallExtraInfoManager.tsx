import React, { useEffect, useState } from 'react'

type ExtraInfo = Record<string, string>

const STORAGE_KEY = 'mallExtraInfo'

function readExtra() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch (e) {
    return {}
  }
}

function writeExtra(val: any) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(val))
}

export default function MallExtraInfoManager({ mallId, onClose, onApply }: { mallId: string; onClose: () => void; onApply?: (val: ExtraInfo) => void }) {
  const [info, setInfo] = useState<ExtraInfo>({})
  const [keyName, setKeyName] = useState('')
  const [keyValue, setKeyValue] = useState('')

  useEffect(() => {
    const all = readExtra()
    setInfo(all[mallId] || {})
  }, [mallId])

  const handleAdd = () => {
    if (!keyName) return alert('키를 입력하세요')
    setInfo((s) => ({ ...s, [keyName]: keyValue }))
    setKeyName('')
    setKeyValue('')
  }

  const handleDelete = (k: string) => {
    if (!confirm('삭제하시겠습니까?')) return
    setInfo((s) => {
      const copy = { ...s }
      delete copy[k]
      return copy
    })
  }

  const handleSave = () => {
    const all = readExtra()
    all[mallId] = info
    writeExtra(all)
    onApply && onApply(info)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="w-full max-w-2xl bg-white rounded shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{mallId} - 부가 정보 관리</h3>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-3 py-1 border rounded">취소</button>
            <button onClick={handleSave} className="px-3 py-1 bg-blue-600 text-white rounded">저장</button>
          </div>
        </div>

        <div className="mb-4 flex gap-2">
          <input placeholder="키" value={keyName} onChange={(e)=>setKeyName(e.target.value)} className="px-2 py-1 border" />
          <input placeholder="값" value={keyValue} onChange={(e)=>setKeyValue(e.target.value)} className="px-2 py-1 border" />
          <button onClick={handleAdd} className="px-3 py-1 border rounded">추가</button>
        </div>

        <div className="space-y-2 max-h-64 overflow-auto">
          {Object.keys(info).length === 0 && <div className="text-sm text-gray-500">등록된 부가 정보가 없습니다.</div>}
          {Object.entries(info).map(([k,v]) => (
            <div key={k} className="flex items-center justify-between p-2 border rounded">
              <div>
                <div className="text-sm font-medium">{k}</div>
                <div className="text-xs text-gray-600">{v}</div>
              </div>
              <button onClick={()=>handleDelete(k)} className="text-sm text-red-600 border px-2 py-1 rounded">삭제</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
