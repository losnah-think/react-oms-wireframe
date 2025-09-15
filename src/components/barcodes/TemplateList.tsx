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
  return (
    <div>
      <div className="flex items-center justify-between">
        <h3 className="font-medium mb-2">Templates</h3>
        <button onClick={onCreate} className="text-sm text-primary-600">New</button>
      </div>
      <ul className="space-y-2 text-sm">
        {templates.map(t => (
          <li key={t.id} className={`p-2 rounded flex items-center justify-between ${selectedId === t.id ? 'bg-primary-50 border border-primary-200' : 'bg-gray-50'}`}>
            <button className="text-left flex-1 text-sm text-left" onClick={() => onSelect(t.id)}>{t.name}</button>
            <div className="ml-2 flex items-center space-x-2">
              <button onClick={() => onSelect(t.id)} className="text-xs px-2 py-1 border rounded">Open</button>
              {onDuplicate && <button onClick={() => onDuplicate(t.id)} className="text-xs px-2 py-1 border rounded">Dup</button>}
              <button onClick={() => onDelete(t.id)} className="text-xs px-2 py-1 text-red-600">Del</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default TemplateList
