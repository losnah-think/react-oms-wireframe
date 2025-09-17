import React, { useEffect, useState } from 'react'
import { Card, Button } from '../../design-system'

type Mall = {
  id?: string
  name: string
  domain?: string
  clientId?: string
  clientSecret?: string
  active?: boolean
  defaultCategory?: string
}

export default function MallSettingsModal({
  open,
  initial,
  onClose,
  onSave
}: {
  open: boolean
  initial?: Mall | null
  onClose: () => void
  onSave: (m: Mall) => Promise<void> | void
}) {
  const [form, setForm] = useState<Mall>({ name: '', domain: '', clientId: '', clientSecret: '', active: true, defaultCategory: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (initial) setForm({ ...initial })
    else setForm({ name: '', domain: '', clientId: '', clientSecret: '', active: true, defaultCategory: '' })
  }, [initial, open])

  if (!open) return null

  const change = (k: keyof Mall, v: any) => setForm(prev => ({ ...prev, [k]: v }))

  const handleSave = async () => {
    if (!form.name.trim()) return alert('몰명을 입력하세요')
    try {
      setSaving(true)
      await onSave(form)
      onClose()
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e)
      alert('저장 중 오류가 발생했습니다')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl" style={{ maxHeight: '90vh', overflow: 'auto' }}>
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h3 className="text-lg font-semibold">{form.id ? '쇼핑몰 편집' : '쇼핑몰 추가'}</h3>
            <div className="text-sm text-gray-500">연결 정보를 입력하고 저장하세요.</div>
          </div>
          <button className="text-gray-500 hover:text-gray-700" onClick={onClose} aria-label="close modal">✕</button>
        </div>

        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-700">몰명</label>
            <input value={form.name} onChange={(e) => change('name', e.target.value)} className="mt-2 block w-full border px-3 py-2 rounded" />

            <label className="block text-sm text-gray-700 mt-4">도메인 (옵션)</label>
            <input value={form.domain} onChange={(e) => change('domain', e.target.value)} className="mt-2 block w-full border px-3 py-2 rounded" />

            <label className="block text-sm text-gray-700 mt-4">활성화</label>
            <div className="mt-2">
              <label className="inline-flex items-center gap-2">
                <input type="checkbox" checked={!!form.active} onChange={(e) => change('active', e.target.checked)} />
                <span className="text-sm text-gray-700">활성</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-700">Client ID (연동용)</label>
            <input value={form.clientId} onChange={(e) => change('clientId', e.target.value)} className="mt-2 block w-full border px-3 py-2 rounded" />

            <label className="block text-sm text-gray-700 mt-4">Client Secret (연동용)</label>
            <input value={form.clientSecret} onChange={(e) => change('clientSecret', e.target.value)} className="mt-2 block w-full border px-3 py-2 rounded" />

            <label className="block text-sm text-gray-700 mt-4">기본 카테고리 매핑 (옵션)</label>
            <input value={form.defaultCategory} onChange={(e) => change('defaultCategory', e.target.value)} className="mt-2 block w-full border px-3 py-2 rounded" />
          </div>
        </div>

        <div className="p-4 border-t flex justify-end gap-3">
          <button className="px-3 py-2 border rounded text-sm" onClick={onClose} disabled={saving}>취소</button>
          <button className="px-3 py-2 bg-primary-600 text-white rounded text-sm" onClick={handleSave} disabled={saving}>{saving ? '저장중...' : '저장'}</button>
        </div>
      </div>
    </div>
  )
}
