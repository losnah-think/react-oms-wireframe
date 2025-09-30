import React, { useEffect, useState } from 'react'

type Props = {
  open: boolean
  onClose: () => void
  onSave?: (payload: any) => void
  initial?: any
}

export default function GeneralSettingsModal({ open, onClose, onSave, initial }: Props) {
  const [allowExternalSend, setAllowExternalSend] = useState<boolean>(!!initial?.allowExternalSend)
  const [defaultMall, setDefaultMall] = useState<string | null>(initial?.defaultMall ?? null)

  useEffect(() => {
    if (!open) return
    setAllowExternalSend(!!initial?.allowExternalSend)
    setDefaultMall(initial?.defaultMall ?? null)
  }, [open, initial])

  if (!open) return null

  const handleSave = () => {
    const payload = { allowExternalSend, defaultMall }
    if (onSave) onSave(payload)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded shadow-lg w-[720px] p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">기초 설정</h3>
          <button onClick={onClose} className="text-sm text-gray-600">닫기</button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="flex items-center space-x-3">
              <input type="checkbox" checked={allowExternalSend} onChange={e => setAllowExternalSend(e.target.checked)} />
              <span className="text-sm">외부 전송시 단일 판매처 선택을 강제합니다</span>
            </label>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">기본 판매처 (선택)</label>
            <input className="w-full border px-2 py-1 rounded" value={defaultMall ?? ''} onChange={e => setDefaultMall(e.target.value)} placeholder="몰 ID를 입력" />
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button onClick={onClose} className="px-3 py-2 mr-2 border rounded">취소</button>
          <button onClick={handleSave} className="px-3 py-2 bg-primary-600 text-white rounded">저장</button>
        </div>
      </div>
    </div>
  )
}
