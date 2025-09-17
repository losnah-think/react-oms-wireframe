import React, { useState, useEffect } from 'react'
import { Container, Card } from '../../src/design-system'

const copyDescription = `분류는 화주사가 직접 분류체계를 등록하고 관리하는 항목입니다. 예: '안나앤모드', '안나앤플러스', '동일등록상품A/P'. 이 페이지에서 분류를 추가, 수정, 삭제할 수 있습니다.`

const ProductGroupsPage: React.FC = () => {
  const [items, setItems] = useState<any[]>([])
  const [newName, setNewName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')

  useEffect(() => {
    try {
      const raw = localStorage.getItem('product_groups')
      if (raw) setItems(JSON.parse(raw))
      else setItems([{ id: 'g-1', name: '안나앤모드' }, { id: 'g-2', name: '안나앤플러스' }])
    } catch {
      setItems([{ id: 'g-1', name: '안나앤모드' }, { id: 'g-2', name: '안나앤플러스' }])
    }
  }, [])

  useEffect(() => {
    try { localStorage.setItem('product_groups', JSON.stringify(items)) } catch {}
  }, [items])

  const add = () => {
    if (!newName.trim()) return
    const id = `g-${Date.now()}`
    setItems((prev) => [...prev, { id, name: newName.trim() }])
    setNewName('')
  }

  return (
    <Container maxWidth="lg" padding="md">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">상품 분류 관리</h1>
        <div className="text-sm text-gray-500">{copyDescription}</div>
      </div>

      <Card padding="lg">
        <div className="mb-4 flex gap-2">
          <input className="flex-1 px-3 py-2 border rounded" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="새 분류명" />
          <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={add}>추가</button>
        </div>

        <div className="overflow-auto max-h-96 border rounded">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left">#</th>
                <th className="px-4 py-2 text-left">분류명</th>
                <th className="px-4 py-2 text-left">액션</th>
              </tr>
            </thead>
            <tbody>
              {items.map((c, i) => (
                <tr key={c.id} className="border-t">
                  <td className="px-4 py-2">{i+1}</td>
                  <td className="px-4 py-2">{editingId === c.id ? (
                    <input className="w-full px-2 py-1 border rounded" value={editingName} onChange={(e) => setEditingName(e.target.value)} />
                  ) : c.name}</td>
                  <td className="px-4 py-2">
                    {editingId === c.id ? (
                      <div className="flex gap-2">
                        <button className="px-3 py-1 bg-green-600 text-white rounded" onClick={() => {
                          if (!editingName.trim()) return
                          setItems((prev) => prev.map(x => x.id === c.id ? { ...x, name: editingName.trim() } : x))
                          setEditingId(null)
                          setEditingName('')
                        }}>저장</button>
                        <button className="px-3 py-1 border rounded" onClick={() => { setEditingId(null); setEditingName('') }}>취소</button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button className="px-3 py-1 border rounded" onClick={() => { setEditingId(c.id); setEditingName(c.name) }}>수정</button>
                        <button className="px-3 py-1 bg-red-50 border border-red-300 text-red-700 rounded" onClick={() => { if (!confirm('정말 삭제하시겠습니까?')) return; setItems((prev) => prev.filter(x => x.id !== c.id)) }}>삭제</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </Container>
  )
}

export default ProductGroupsPage
