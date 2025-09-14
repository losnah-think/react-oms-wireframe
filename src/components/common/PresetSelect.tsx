import React, { useState, useEffect } from 'react'

interface Props {
  value?: string
  onChange: (val: string) => void
  presets?: string[]
}

const PresetSelect: React.FC<Props> = ({ value, onChange, presets = [] }) => {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState(value || '')

  useEffect(() => setInput(value || ''), [value])

  const apply = (v: string) => {
    setInput(v)
    onChange(v)
    setOpen(false)
  }

  return (
    <div className="relative">
      <div className="flex">
        <input className="w-full px-2 py-1 border" value={input} onChange={(e) => { setInput(e.target.value); onChange(e.target.value) }} />
        <button onClick={() => setOpen((s) => !s)} className="px-3 border-l">▼</button>
      </div>
      {open && (
        <div className="absolute right-0 mt-1 w-64 bg-white border rounded shadow">
          <div className="p-2 text-sm text-gray-600">프리셋</div>
          <div className="max-h-48 overflow-auto">
            {presets.length === 0 && <div className="p-2 text-sm text-gray-500">프리셋이 없습니다</div>}
            {presets.map((p, i) => (
              <div key={i} className="px-3 py-2 hover:bg-gray-100 cursor-pointer" onClick={() => apply(p)}>{p}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default PresetSelect
