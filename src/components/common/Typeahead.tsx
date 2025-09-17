import React, { useState, useRef, useEffect } from 'react'

interface TypeaheadProps {
  id?: string
  items: Array<{ id: string; name: string }>
  value: string
  placeholder?: string
  onChange: (v: string) => void
  onSelect?: (item: { id: string; name: string }) => void
}

const Typeahead: React.FC<TypeaheadProps> = ({ id, items, value, placeholder, onChange, onSelect }) => {
  const [open, setOpen] = useState(false)
  const [highlight, setHighlight] = useState(0)
  const ref = useRef<HTMLDivElement | null>(null)

  const filtered = (items || []).filter(i => i.name.toLowerCase().includes((value || '').toLowerCase()))

  useEffect(() => {
    const onDoc = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('click', onDoc)
    return () => document.removeEventListener('click', onDoc)
  }, [])

  useEffect(() => { setHighlight(0) }, [value])

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open) return
    if (e.key === 'ArrowDown') { e.preventDefault(); setHighlight((h) => Math.min(h + 1, filtered.length - 1)) }
    if (e.key === 'ArrowUp') { e.preventDefault(); setHighlight((h) => Math.max(h - 1, 0)) }
    if (e.key === 'Enter') { e.preventDefault(); const sel = filtered[highlight]; if (sel) { onChange(sel.name); onSelect?.(sel); setOpen(false) } }
    if (e.key === 'Escape') { setOpen(false) }
  }

  return (
    <div ref={ref} className="relative w-full">
      <input
        id={id}
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => { onChange(e.target.value); setOpen(true) }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        className="px-3 py-1.5 border border-gray-300 rounded-md text-sm w-full"
        autoComplete="off"
      />
      {open && filtered.length > 0 && (
        <ul role="listbox" className="absolute z-40 mt-1 w-full bg-white border rounded shadow max-h-48 overflow-auto">
          {filtered.map((it, idx) => (
            <li
              key={it.id}
              role="option"
              aria-selected={idx === highlight}
              onMouseDown={(e) => { e.preventDefault(); onChange(it.name); onSelect?.(it); setOpen(false) }}
              onMouseEnter={() => setHighlight(idx)}
              className={`px-3 py-2 cursor-pointer ${idx === highlight ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
              {it.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default Typeahead
