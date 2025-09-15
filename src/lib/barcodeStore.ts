import { v4 as uuidv4 } from 'uuid'

export type BarcodeTemplate = {
  id: string
  name: string
  value: string
}

let templates: BarcodeTemplate[] = [
  { id: 't-default', name: 'Default - 1up', value: '012345678901' },
  { id: 't-small', name: 'Small Label', value: 'ABC-0001' }
]

export function listTemplates() {
  return templates
}

export function getTemplate(id: string) {
  return templates.find(t => t.id === id) || null
}

export function createTemplate(payload: Partial<BarcodeTemplate>) {
  const t: BarcodeTemplate = { id: uuidv4(), name: payload.name || 'Untitled', value: payload.value || '' }
  templates = [t, ...templates]
  return t
}

export function updateTemplate(id: string, patch: Partial<BarcodeTemplate>) {
  templates = templates.map(t => t.id === id ? { ...t, ...patch } : t)
  return getTemplate(id)
}

export function deleteTemplate(id: string) {
  templates = templates.filter(t => t.id !== id)
  return true
}
