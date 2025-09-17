import React from 'react'

export type BarcodeTemplate = {
  id: string
  name: string
  value: string
  content?: string
  barcodeType?: string
  scale?: number
  height?: number
  includetext?: boolean
  quantity?: number
}

interface Props {
  templates: BarcodeTemplate[]
  selectedId?: string | null
  onSelect: (id: string) => void
  onCreate: () => void
  onDelete: (id: string) => void
  onDuplicate?: (id: string) => void
}

const TemplateList: React.FC<Props> = ({ templates, selectedId, onSelect, onCreate, onDelete, onDuplicate }) => {
  const [q, setQ] = React.useState('')
  const list = (templates || []).filter(t => t.name.toLowerCase().includes(q.toLowerCase()))

  return (
    <div>
      <div className="flex items-center justify-between">
        <h3 className="font-medium mb-2">템플릿</h3>
        <div className="flex items-center gap-2">
          <button onClick={onCreate} className="text-sm text-primary-600 px-2 py-1 border rounded">새 템플릿</button>
        </div>
      </div>

      <div className="mb-2">
        <input placeholder="템플릿 검색" value={q} onChange={(e) => setQ(e.target.value)} className="w-full px-2 py-1 border rounded text-sm" />
      </div>

      <ul className="space-y-2 text-sm">
        {list.map(t => (
          <li key={t.id} className={`p-2 rounded flex items-center justify-between ${selectedId === t.id ? 'bg-primary-50 border border-primary-200' : 'bg-gray-50'}`}>
            <button className="text-left flex-1 text-sm text-left flex items-center gap-2" onClick={() => onSelect(t.id)}>
              <svg className="w-5 h-5 text-gray-500" viewBox="0 0 24 24" fill="none"><path d="M3 7h18M3 12h18M3 17h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <span>{t.name}</span>
            </button>
            <div className="ml-2 flex items-center space-x-2">
              <button onClick={() => onSelect(t.id)} title="열기" className="text-xs px-2 py-1 border rounded">열기</button>
              {onDuplicate && <button onClick={() => onDuplicate(t.id)} title="복제" className="text-xs px-2 py-1 border rounded">복제</button>}
              <button onClick={() => onDelete(t.id)} title="삭제" className="text-xs px-2 py-1 text-red-600">삭제</button>
            </div>
          </li>
        ))}
        {list.length === 0 && <li className="text-sm text-gray-500 p-2">일치하는 템플릿이 없습니다.</li>}
      </ul>
    </div>
  )
}

export default TemplateList
