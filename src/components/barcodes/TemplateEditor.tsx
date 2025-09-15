import React from 'react'
import { BarcodeTemplate } from './TemplateList'

interface Props {
  template?: BarcodeTemplate | null
  onChange: (t: Partial<BarcodeTemplate>) => void
}

const TemplateEditor: React.FC<Props> = ({ template, onChange }) => {
  if (!template) return (
    <div>
      <h3 className="font-medium mb-2">Template Editor</h3>
      <div className="text-sm text-gray-600">No template selected</div>
    </div>
  )

  return (
    <div>
      <h3 className="font-medium mb-2">Template Editor</h3>
      <div className="space-y-2 text-sm">
        <label className="block">
          <div className="text-xs text-gray-500">Name</div>
          <input value={template.name} onChange={(e) => onChange({ name: e.target.value })} className="w-full border px-2 py-1 rounded" />
        </label>
        <label className="block">
          <div className="text-xs text-gray-500">Value (barcode content)</div>
          <input value={template.value} onChange={(e) => onChange({ value: e.target.value })} className="w-full border px-2 py-1 rounded" />
        </label>
      </div>
    </div>
  )
}

export default TemplateEditor
