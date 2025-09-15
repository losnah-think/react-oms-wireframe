import React from 'react'
import { BarcodeTemplate } from './TemplateList'

interface Props {
  template?: BarcodeTemplate | null
  onChange: (t: Partial<BarcodeTemplate>) => void
}

const barcodeTypes = [
  { value: 'code128', label: 'Code 128' },
  { value: 'ean13', label: 'EAN-13' },
  { value: 'upca', label: 'UPC-A' },
  { value: 'qrcode', label: 'QR Code' },
]

const TemplateEditor: React.FC<Props> = ({ template, onChange }) => {
  if (!template) return (
    <div>
      <h3 className="font-medium mb-2">Template Editor</h3>
      <div className="text-sm text-gray-600">No template selected</div>
    </div>
  )

  const set = (patch: Partial<BarcodeTemplate>) => onChange(patch)

  return (
    <div>
      <h3 className="font-medium mb-2">Template Editor</h3>
      <div className="space-y-3 text-sm">
        <label className="block">
          <div className="text-xs text-gray-500">Name</div>
          <input value={template.name} onChange={(e) => set({ name: e.target.value })} className="w-full border px-2 py-1 rounded" />
        </label>

        <label className="block">
          <div className="text-xs text-gray-500">Barcode Type</div>
          <select value={template.barcodeType || 'code128'} onChange={(e) => set({ barcodeType: e.target.value })} className="w-full border px-2 py-1 rounded">
            {barcodeTypes.map(bt => <option key={bt.value} value={bt.value}>{bt.label}</option>)}
          </select>
        </label>

        <label className="block">
          <div className="text-xs text-gray-500">Value (barcode content)</div>
          <input value={template.value} onChange={(e) => set({ value: e.target.value })} className="w-full border px-2 py-1 rounded" />
        </label>

        <div className="grid grid-cols-3 gap-2">
          <label>
            <div className="text-xs text-gray-500">Scale</div>
            <input type="number" value={template.scale ?? 3} onChange={e => set({ scale: Number(e.target.value) || 1 })} className="w-full border px-2 py-1 rounded" />
          </label>
          <label>
            <div className="text-xs text-gray-500">Height</div>
            <input type="number" value={template.height ?? 10} onChange={e => set({ height: Number(e.target.value) || 1 })} className="w-full border px-2 py-1 rounded" />
          </label>
          <label>
            <div className="text-xs text-gray-500">Quantity</div>
            <input type="number" value={template.quantity ?? 1} onChange={e => set({ quantity: Number(e.target.value) || 1 })} className="w-full border px-2 py-1 rounded" />
          </label>
        </div>

        <label className="flex items-center space-x-2">
          <input type="checkbox" checked={!!template.includetext} onChange={e => set({ includetext: e.target.checked })} />
          <div className="text-xs text-gray-500">Include text below barcode</div>
        </label>

        <div>
          <div className="text-xs text-gray-500 mb-1">Label Content (use placeholders)</div>
          <div className="text-xs text-gray-500 mb-2">Placeholders: {"{barcode}"}, {"{qrcode}"}, {"{seq}"}, {"{name}"}, {"{supplier}"}, {"{cost}"}, {"{price}"}, {"{unitPrice}"}, {"{warehouse}"}, {"{vendor}"}, {"{option}"}</div>
          <textarea value={template.content || ''} onChange={(e) => set({ content: e.target.value })} rows={5} className="w-full border px-2 py-1 rounded text-sm" />
        </div>
      </div>
    </div>
  )
}

export default TemplateEditor
