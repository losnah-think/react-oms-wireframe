import React, { useMemo, useRef, useState } from 'react'
import Head from 'next/head'
import BarcodeBuilder from '../../../components/barcodes/BarcodeBuilder'
import TemplateList from '../../../components/barcodes/TemplateList'
import TemplateEditor from '../../../components/barcodes/TemplateEditor'
import BarcodePreview from '../../../components/barcodes/BarcodePreview'
import { useSession } from 'next-auth/react'
import { shouldSkipAuth } from '../../../lib/devAuth'

export default function BarcodeSettingsPage() {
  const sess = useSession()
  const skip = shouldSkipAuth()

  // local template state/hook
  const { templates, create, update, remove } = useLocalTemplates()
  const [selectedId, setSelectedId] = useState<string | null>(templates[0]?.id ?? null)

  const selectedTemplate = useMemo(() => templates.find(t => t.id === selectedId) ?? null, [templates, selectedId])

  const handleCreate = () => {
    const id = create()
    setSelectedId(id)
  }

  const handleDelete = (id: string) => {
    remove(id)
    setSelectedId(prev => (prev === id ? (templates[0]?.id ?? null) : prev))
  }

  const handleChange = (patch: Partial<any>) => {
    if (!selectedId) return
    update(selectedId, patch)
  }

  if (!skip && sess.status !== 'authenticated') {
    return (
      <div className="min-h-screen p-6 bg-gray-50 text-center">
        <Head>
          <title>Barcode Management · Settings</title>
        </Head>
        <div className="max-w-md mx-auto mt-20 bg-white p-6 rounded shadow">
          <h2 className="text-lg font-medium">로그인이 필요합니다</h2>
          <p className="text-sm text-gray-600 mt-2">이 페이지는 관리자 전용입니다. 로그인 후 접근하세요.</p>
        </div>
      </div>
    )
  }
  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <Head>
        <title>Barcode Management · Settings</title>
      </Head>

        <div className="max-w-screen-xl mx-auto">
        <h1 className="text-2xl font-semibold mb-4">Barcode Management</h1>
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-3 bg-white p-4 rounded shadow">
            <BarcodeBuilder.Sidebar />
            <div className="mt-4">
              <TemplateList
                templates={templates}
                selectedId={selectedId}
                onSelect={(id) => setSelectedId(id)}
                onCreate={() => handleCreate()}
                onDelete={(id) => handleDelete(id)}
              />
            </div>
          </div>
          <div className="col-span-6 bg-white p-4 rounded shadow">
            <BarcodePreview template={selectedTemplate} />
          </div>
          <div className="col-span-3 bg-white p-4 rounded shadow">
            <TemplateEditor template={selectedTemplate} onChange={handleChange} />
            <div className="mt-4">
              <h4 className="font-medium">Actions</h4>
              <div className="mt-2 space-y-2">
                <button onClick={() => handleGeneratePdf()} className="px-3 py-2 bg-primary-600 text-white rounded">Generate PDF</button>
                <button onClick={() => handleExportPng()} className="px-3 py-2 border rounded">Export PNG</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// --- Helpers and local state (below component because page is default export) ---
function useLocalTemplates() {
  const [templates, setTemplates] = useState(() => {
    // seed sample templates
    return [
      { id: 't-default', name: 'Default - 1up', value: '012345678901' },
      { id: 't-small', name: 'Small Label', value: 'ABC-0001' }
    ]
  })

  const create = () => {
    const id = 't-' + Math.random().toString(36).slice(2, 9)
    const t = { id, name: 'New Template', value: '' }
    setTemplates(s => [t, ...s])
    return id
  }

  const update = (id: string, patch: Partial<any>) => {
    setTemplates(s => s.map(t => t.id === id ? { ...t, ...patch } : t))
  }

  const remove = (id: string) => {
    setTemplates(s => s.filter(t => t.id !== id))
  }

  return { templates, create, update, remove }
}

// The following functions are used in the page via closures; we define them here to keep the top component small
function handleGeneratePdf() {
  // Simplified: use window.print flow — a proper server-side PDF generator will be added later
  window.print()
}

function handleExportPng() {
  // find first canvas on page and open as PNG in new tab
  const canvas = document.querySelector('canvas') as HTMLCanvasElement | null
  if (!canvas) {
    alert('No barcode to export')
    return
  }
  const url = canvas.toDataURL('image/png')
  const w = window.open('about:blank')
  if (w) w.document.write(`<img src="${url}" alt="barcode"/>`)
}

