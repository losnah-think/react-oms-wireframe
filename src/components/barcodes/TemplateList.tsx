import React from 'react'

export type BarcodeTemplate = {
  id: string
  name: string
  value: string
}

interface Props {
  templates: BarcodeTemplate[]
  selectedId?: string | null
  onSelect: (id: string) => void
  onCreate: () => void
  onDelete: (id: string) => void
}

const TemplateList: React.FC<Props> = ({ templates, selectedId, onSelect, onCreate, onDelete }) => {
  return (
    <div>
      <div className="flex items-center justify-between">
        <h3 className="font-medium mb-2">Templates</h3>
        <button onClick={onCreate} className="text-sm text-primary-600">New</button>
      </div>
      <ul className="space-y-2 text-sm">
        {templates.map(t => (
          <li key={t.id} className={`p-2 rounded flex items-center justify-between ${selectedId === t.id ? 'bg-primary-50 border border-primary-200' : 'bg-gray-50'}`}>
            <button className="text-left flex-1" onClick={() => onSelect(t.id)}>{t.name}</button>
            <div className="ml-2 flex items-center space-x-2">
              <button onClick={() => onSelect(t.id)} className="text-xs px-2 py-1 border rounded">Open</button>
              <button onClick={() => onDelete(t.id)} className="text-xs px-2 py-1 text-red-600">Del</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default TemplateList
