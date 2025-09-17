import React, { useState } from 'react'
import { Container } from '../../design-system'

interface ProductGroup {
  id: string
  name: string
  description?: string
  active: boolean
  createdAt: string
}

export default function ProductGroupPage() {
  const [search, setSearch] = useState('')
  const [selectedActive, setSelectedActive] = useState<'all' | 'active' | 'inactive'>('all')
  const [groups, setGroups] = useState<ProductGroup[]>(() => {
    return [
      { id: 'g-1', name: '베스트셀러', description: '주요 판매 상품 그룹', active: true, createdAt: '2024-01-05' },
      { id: 'g-2', name: '할인상품', description: '할인 대상 그룹', active: true, createdAt: '2024-02-12' },
      { id: 'g-3', name: '단종예정', description: '단종 예정 상품', active: false, createdAt: '2024-03-03' },
    ]
  })

  const [selectedGroup, setSelectedGroup] = useState<ProductGroup | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const filtered = groups.filter((g) => {
    const matchesSearch = g.name.toLowerCase().includes(search.toLowerCase()) || (g.description || '').toLowerCase().includes(search.toLowerCase())
    const matchesActive = selectedActive === 'all' || (selectedActive === 'active' ? g.active : !g.active)
    return matchesSearch && matchesActive
  })

  const openNew = () => {
    setSelectedGroup(null)
    setIsModalOpen(true)
  }

  const openEdit = (g: ProductGroup) => {
    setSelectedGroup(g)
    setIsModalOpen(true)
  }

  const handleSave = (payload: Partial<ProductGroup> & { id?: string }) => {
    if (payload.id) {
      setGroups((prev) => prev.map((p) => (p.id === payload.id ? { ...p, ...payload } as ProductGroup : p)))
    } else {
      const id = `g-${Math.random().toString(36).slice(2, 9)}`
      const createdAt = new Date().toISOString().slice(0, 10)
      setGroups((prev) => [{ id, name: payload.name || '신규 그룹', description: payload.description || '', active: payload.active ?? true, createdAt }, ...prev])
    }
    setIsModalOpen(false)
  }

  const handleDelete = (id: string) => {
    if (!confirm('정말로 그룹을 삭제하시겠습니까?')) return
    setGroups((prev) => prev.filter((p) => p.id !== id))
  }

  return (
    <Container maxWidth="full">
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">상품 그룹</h1>
          <p className="text-gray-600">상품 그룹을 생성/수정/관리합니다. (프론트엔드 모의 데이터)</p>
        </div>

        <div className="bg-white border rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">검색</label>
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="그룹명, 설명으로 검색" className="w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">활성 상태</label>
              <select value={selectedActive} onChange={(e) => setSelectedActive(e.target.value as any)} className="w-full px-3 py-2 border border-gray-300 rounded-md">
                <option value="all">전체</option>
                <option value="active">활성</option>
                <option value="inactive">비활성</option>
              </select>
            </div>
            <div />
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">총 {filtered.length}개의 그룹</span>
              <button onClick={openNew} className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">신규 그룹 등록</button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filtered.map((g) => (
            <div key={g.id} className="bg-white border rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="text-sm text-gray-500">그룹명</div>
                  <div className="font-medium text-gray-900 text-lg">{g.name}</div>
                  {g.description && <div className="text-sm text-gray-600 mt-2">{g.description}</div>}
                </div>
                <div className="flex space-x-2">
                  <button onClick={() => openEdit(g)} className="text-blue-600 hover:text-blue-800 text-sm">수정</button>
                  <button onClick={() => handleDelete(g.id)} className="text-red-600 hover:text-red-800 text-sm">삭제</button>
                </div>
              </div>

              <div className="text-xs text-gray-500 mt-4 pt-3 border-t border-gray-100">등록일: {g.createdAt} · {g.active ? <span className="inline-flex px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">활성</span> : <span className="inline-flex px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">비활성</span>}</div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="bg-white border rounded-lg p-12 text-center">
            <div className="text-gray-400 text-4xl mb-4">📦</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">등록된 상품 그룹이 없습니다</h3>
            <p className="text-gray-600 mb-4">상품 그룹을 생성하여 상품 분류에 활용하세요.</p>
            <button onClick={openNew} className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">신규 그룹 등록</button>
          </div>
        )}

        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">{selectedGroup ? '그룹 수정' : '신규 그룹 등록'}</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>

              <GroupForm initial={selectedGroup} onSave={handleSave} onCancel={() => setIsModalOpen(false)} />
            </div>
          </div>
        )}
      </div>
    </Container>
  )
}

function GroupForm({ initial, onSave, onCancel }: { initial: ProductGroup | null; onSave: (p: Partial<ProductGroup> & { id?: string }) => void; onCancel: () => void }) {
  const [name, setName] = useState(initial?.name || '')
  const [description, setDescription] = useState(initial?.description || '')
  const [active, setActive] = useState<boolean>(initial?.active ?? true)

  const handleSubmit = () => {
    if (!name.trim()) { alert('그룹명을 입력하세요'); return }
    onSave({ id: initial?.id, name: name.trim(), description: description.trim(), active })
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">그룹명 *</label>
        <input value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">설명</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md" rows={3} />
      </div>

      <div className="flex items-center gap-4">
        <label className="flex items-center">
          <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="w-4 h-4" />
          <span className="ml-2 text-sm text-gray-700">활성</span>
        </label>
      </div>

      <div className="flex justify-end space-x-2 mt-6">
        <button onClick={onCancel} className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50">취소</button>
        <button onClick={handleSubmit} className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">저장</button>
      </div>
    </div>
  )
}
