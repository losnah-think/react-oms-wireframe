import React from 'react';
import { useLayoutEffect, useRef, useState, useEffect } from 'react';
import { Container, Card } from '../../design-system';
import HierarchicalSelect, { TreeNode as HNode } from '../../components/common/HierarchicalSelect';

// fetch classifications from API with fallback
function loadTreeFromApi(): Promise<any[]> {
  return fetch('/api/meta/classifications').then(r => r.ok ? r.json().then(b => b.classifications || []) : Promise.resolve([])).catch(() => Promise.resolve([]))
}

type TreeNode = { id: string; name: string; slug?: string; children?: TreeNode[] };

const STORAGE_KEY = 'productClassificationsTree'
const MAX_DEPTH = 4 // maximum allowed levels (root = level 1)

function loadTree(): TreeNode[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch (e) {}
  // when localStorage is empty, return empty array — we prefer API as source-of-truth
  return []
}

function saveTree(tree: TreeNode[]) {
  try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tree)) } catch (e) {}
}

function findAndUpdate(nodes: TreeNode[], id: string, updater: (n: TreeNode) => TreeNode | null): TreeNode[] {
  return nodes.map((n) => {
    if (n.id === id) {
      const res = updater(n)
      return res === null ? null as any : res
    }
    if (n.children) {
      const nextChildren = findAndUpdate(n.children, id, updater).filter(Boolean) as TreeNode[]
      return { ...n, children: nextChildren }
    }
    return n
  }).filter(Boolean) as TreeNode[]
}

function appendChild(nodes: TreeNode[], parentId: string | null, child: TreeNode): TreeNode[] {
  if (!parentId) return [...nodes, child]
  return nodes.map(n => {
    if (n.id === parentId) {
      const children = n.children ? [...n.children, child] : [child]
      return { ...n, children }
    }
    if (n.children) return { ...n, children: appendChild(n.children, parentId, child) }
    return n
  })
}

// returns depth as 1-based level (root = 1), -1 when not found
function getNodeDepth(nodes: TreeNode[], id: string, currentDepth = 1): number {
  for (const n of nodes) {
    if (n.id === id) return currentDepth
    if (n.children) {
      const d = getNodeDepth(n.children, id, currentDepth + 1)
      if (d !== -1) return d
    }
  }
  return -1
}

function renderNodes(
  nodes: TreeNode[],
  depth = 1,
  onEdit: (n: TreeNode) => void,
  onAddChild: (n: TreeNode) => void,
  onRemove: (id: string) => void,
  parentPath: string[] = [],
  expanded: Record<string, boolean> = {},
  setExpanded?: (updater: (prev: Record<string, boolean>) => Record<string, boolean>) => void,
  selectedId?: string | null,
  setSelected?: (id: string | null) => void
) {
  const out: React.ReactNode[] = []
  nodes.forEach(n => {
    const thisPath = [...parentPath, n.name]
    const accentColors = ['#cfe6ff', '#dfe9ff', '#eef1ff', '#f6f8ff']
    const accent = accentColors[Math.max(0, Math.min(accentColors.length - 1, depth - 1))]
    const hasChildren = !!(n.children && n.children.length > 0)
    const isExpanded = expanded[n.id] ?? true
    out.push(
      <div
        key={n.id}
        onClick={() => { setSelected && setSelected(n.id); }}
        className={`relative bg-white shadow-sm rounded-md p-4 flex items-start justify-between ${selectedId === n.id ? 'ring-2 ring-primary-200' : ''}`}
        style={{ marginLeft: (depth - 1) * 16, borderLeft: `4px solid ${accent}` }}
      >
        <div className="flex items-start gap-3 min-w-0">
          {hasChildren && (
            <button
              aria-label={isExpanded ? 'collapse' : 'expand'}
              onClick={(e) => { e.stopPropagation(); setExpanded && setExpanded((s) => ({ ...s, [n.id]: !isExpanded })) }}
              className="mr-2 text-gray-400 hover:text-gray-600"
              style={{ marginTop: 6 }}
            >
              <svg className={`w-4 h-4 transform ${isExpanded ? '' : '-rotate-90'}`} viewBox="0 0 20 20" fill="none" stroke="currentColor"><path d="M6 8l4 4 4-4" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          )}
          <div className="min-w-0">
            <div className="font-medium text-gray-800 truncate">{n.name}</div>
            <div className="text-xs text-gray-500">{n.slug ?? '-'}</div>
            <div className="text-xs text-gray-400 mt-1 truncate">{thisPath.join(' > ')}</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {(() => {
            const allowAdd = depth < MAX_DEPTH
            return (
              <button
                title="하위 추가"
                className={`text-sm px-2 py-1 border rounded ${!allowAdd ? 'opacity-40 cursor-not-allowed' : 'hover:bg-primary-50'}`}
                onClick={(e) => { e.stopPropagation(); allowAdd && onAddChild(n) }}
                disabled={!allowAdd}
              >
                <svg className="w-4 h-4 inline-block mr-1" viewBox="0 0 20 20" fill="currentColor"><path d="M10 5v10m5-5H5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                하위
              </button>
            )
          })()}
          <button title="편집" className="text-sm px-2 py-1 border rounded hover:bg-gray-50" onClick={(e) => { e.stopPropagation(); onEdit(n) }}>
            <svg className="w-4 h-4 inline-block mr-1" viewBox="0 0 20 20" fill="none" stroke="currentColor"><path d="M4 13v3h3l8-8-3-3-8 8z" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            편집
          </button>
          <button title="삭제" className="text-sm px-2 py-1 border rounded text-red-600 hover:bg-red-50" onClick={(e) => { e.stopPropagation(); onRemove(n.id) }}>
            <svg className="w-4 h-4 inline-block mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 6h18M8 6v12a2 2 0 002 2h4a2 2 0 002-2V6M10 6V4a2 2 0 012-2h0a2 2 0 012 2v2" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            삭제
          </button>
        </div>
      </div>
    )

    if (n.children && n.children.length > 0) {
      out.push(
        <AnimatedCollapse key={`${n.id}_children`} isOpen={isExpanded}>
          {renderNodes(n.children, depth + 1, onEdit, onAddChild, onRemove, thisPath, expanded, setExpanded, selectedId, setSelected)}
        </AnimatedCollapse>
      )
    }
  })
  return out
}

function AnimatedCollapse({ isOpen, children }: { isOpen: boolean; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [height, setHeight] = useState<number | 'auto'>(0)

  useLayoutEffect(() => {
    if (!ref.current) return
    const el = ref.current
    // measure scrollHeight
    const measured = el.scrollHeight
    if (isOpen) {
      // expand: set to measured then auto after transition
      setHeight(measured)
      const t = setTimeout(() => setHeight('auto'), 220)
      return () => clearTimeout(t)
    } else {
      // collapse: from auto -> measured -> 0 to animate
      if (height === 'auto') {
        // force measured then collapse
        setHeight(el.scrollHeight)
        requestAnimationFrame(() => setHeight(0))
      } else {
        setHeight(0)
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  return (
    <div
      ref={ref}
      style={{ maxHeight: height === 'auto' ? undefined : height, transition: 'max-height 200ms ease', overflow: 'hidden' }}
      className={`pl-0`}
    >
      {children}
    </div>
  )
}

export default function ProductCategoryPage() {
  const [tree, setTree] = React.useState<TreeNode[]>([])
  const [showModal, setShowModal] = React.useState(false)
  const [editing, setEditing] = React.useState<{ node: TreeNode | null; parentId: string | null } | null>(null)
  const [modalClass, setModalClass] = React.useState('max-w-2xl')
  const [name, setName] = React.useState('')
  const [slug, setSlug] = React.useState('')
  const [parentPath, setParentPath] = React.useState<string[] | null>(null)
  const [expanded, setExpanded] = React.useState<Record<string, boolean>>({})
  const [selectedId, setSelectedId] = React.useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = React.useState<{ id: string; name: string; paths: string[] } | null>(null)

  React.useEffect(() => {
    let mounted = true
    loadTreeFromApi().then((apiTree) => {
      if (!mounted) return
      if (apiTree && apiTree.length > 0) {
        setTree(apiTree as TreeNode[])
        try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(apiTree)) } catch (e) {}
      } else {
        const t = loadTree()
        setTree(t)
      }
    }).catch(() => { const t = loadTree(); setTree(t) })
    return () => { mounted = false }
  }, [])

  const persist = (next: TreeNode[]) => { setTree(next); saveTree(next) }

  const openAddRoot = () => { setEditing({ node: null, parentId: null }); setParentPath(null); setName(''); setSlug(''); setModalClass('max-w-3xl'); setShowModal(true) }
  const openAddChild = (parent: TreeNode) => { setEditing({ node: null, parentId: parent.id }); setParentPath(null); setName(''); setSlug(''); setModalClass('max-w-2xl'); setShowModal(true) }
  const openEdit = (node: TreeNode) => { setEditing({ node, parentId: null }); setParentPath(null); setName(node.name); setSlug(node.slug ?? ''); setModalClass('max-w-xl'); setShowModal(true) }

  const save = () => {
    if (!name.trim()) return alert('이름을 입력하세요')
    if (!editing) return
    if (editing.node) {
      // edit existing
      const next = findAndUpdate(tree, editing.node.id, (n) => ({ ...n, name: name.trim(), slug: slug.trim() || undefined }))
      persist(next)
    } else {
      const nb: TreeNode = { id: `c_${Date.now()}`, name: name.trim(), slug: slug.trim() || undefined }
      // determine target parent id: prefer explicit editing.parentId, else use parentPath selected by user
      let targetParent = editing.parentId || null
      if (!targetParent && parentPath && parentPath.length > 0) {
        // resolve parentPath to id by walking tree
        let curList = tree
        let resolvedId: string | null = null
        for (const seg of parentPath) {
          const found = curList.find(x => x.name === seg)
          if (!found) { resolvedId = null; break }
          resolvedId = found.id
          curList = found.children ?? []
        }
        if (resolvedId) targetParent = resolvedId
      }

      // check depth limit: if parent exists, compute its depth (1-based)
      if (targetParent) {
        const parentDepth = getNodeDepth(tree, targetParent, 1)
        if (parentDepth === -1) return alert('부모 분류를 찾을 수 없습니다')
        if (parentDepth + 1 > MAX_DEPTH) return alert(`최대 ${MAX_DEPTH}뎁스까지만 생성할 수 있습니다`)
      }
      const next = appendChild(tree, targetParent, nb)
      persist(next)
    }
    setShowModal(false)
  }

  const remove = (id: string) => {
    // prepare delete-preview modal: collect paths of descendants
    const paths: string[] = []
    const collect = (ns: TreeNode[], curPath: string[]) => {
      for (const n of ns) {
        const p = [...curPath, n.name]
        paths.push(p.join(' > '))
        if (n.children) collect(n.children, p)
      }
    }

    // find the node and collect its descendant paths
    const findNode = (ns: TreeNode[], targetId: string, curPath: string[]): boolean => {
      for (const n of ns) {
        if (n.id === targetId) {
          if (n.children) collect(n.children, [...curPath, n.name])
          setDeleteTarget({ id: n.id, name: n.name, paths })
          return true
        }
        if (n.children) {
          if (findNode(n.children, targetId, [...curPath, n.name])) return true
        }
      }
      return false
    }

    findNode(tree, id, [])
  }

  const confirmDelete = () => {
    if (!deleteTarget) return
    const next = findAndUpdate(tree, deleteTarget.id, () => null as any)
    persist(next)
    setDeleteTarget(null)
  }

  const cancelDelete = () => setDeleteTarget(null)

  return (
    <Container>
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">상품 카테고리 관리</h1>
            <p className="text-gray-600">상품 카테고리를 추가, 편집 및 삭제합니다. 트리 구조를 지원합니다.</p>
          </div>
          <div>
            <button className="px-3 py-2 bg-primary-600 text-white rounded" onClick={openAddRoot}>루트 카테고리 추가</button>
          </div>
        </div>

        <div className="relative">
          <div className="mb-4 flex items-center gap-2">
            <input
              aria-label="quick-add-category"
              placeholder="새 카테고리 이름을 입력하고 Enter로 추가"
              className="flex-1 px-3 py-2 border rounded"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const v = (e.target as HTMLInputElement).value.trim()
                  if (!v) return
                  // create root category quickly
                  const nb: TreeNode = { id: `c_${Date.now()}`, name: v }
                  const next = appendChild(tree, null, nb)
                  persist(next)
                  ;(e.target as HTMLInputElement).value = ''
                }
              }}
            />
            <button className="px-3 py-2 border rounded" onClick={() => openAddRoot()}>루트 추가</button>
          </div>
          {/* multi-level vertical guides to show depth columns */}
          {Array.from({ length: MAX_DEPTH }).map((_, idx) => (
            <div
              key={idx}
              style={{ left: `${8 + idx * 16}px` }}
              className="absolute top-2 bottom-2 w-px"
            >
              <div style={{ width: 1, height: '100%', background: idx === 0 ? '#e6eefc' : '#eef3fb', opacity: 0.9 - idx * 0.12 }} />
            </div>
          ))}

          <div className="space-y-3 pl-8">
            {tree.length === 0 && <div className="text-sm text-gray-500">카테고리가 없습니다.</div>}
              {renderNodes(tree, 1, (n) => openEdit(n), (n) => openAddChild(n), (id) => remove(id), [], expanded, setExpanded, selectedId, setSelectedId)}
          </div>
        </div>
      </Card>

      {showModal && (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className={`bg-white rounded-lg shadow-lg w-full ${modalClass}`} style={{ maxHeight: '80vh', overflow: 'auto' }}>
            <div className="flex items-center justify-between p-4 border-b">
              <div>
                <h3 className="text-lg font-semibold">{editing && editing.node ? '카테고리 편집' : '카테고리 추가'}</h3>
                <div className="text-sm text-gray-500">최대 {MAX_DEPTH}뎁스까지 생성할 수 있습니다.</div>
              </div>
              <button className="text-gray-500 hover:text-gray-700" onClick={() => setShowModal(false)} aria-label="close modal">
                <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" stroke="currentColor"><path d="M6 6l8 8M14 6l-8 8" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-gray-700">이름</label>
                <input value={name} onChange={(e) => setName(e.target.value)} className="mt-2 block w-full border px-3 py-2 rounded" />

                <label className="block text-sm text-gray-700 mt-4">슬러그 (선택)</label>
                <input value={slug} onChange={(e) => setSlug(e.target.value)} className="mt-2 block w-full border px-3 py-2 rounded" />
              </div>

              <div>
                {!editing?.node ? (
                  <>
                    <label className="block text-sm text-gray-700">부모 카테고리 선택 (선택)</label>
                    <div className="mt-2">
                      <HierarchicalSelect
                        data={tree as unknown as HNode[]}
                        value={parentPath ? parentPath.join(' > ') : undefined}
                        placeholder="부모를 선택하지 않으면 루트에 추가됩니다"
                        onChange={(sel, path) => setParentPath(path ?? null)}
                      />
                    </div>
                  </>
                ) : (
                  <div className="text-sm text-gray-600">편집 모드입니다. 위치 변경은 카테고리 삭제 후 재생성으로 처리하세요.</div>
                )}
              </div>
            </div>

            <div className="p-4 border-t flex justify-end gap-3">
              <button className="px-3 py-2 border rounded text-sm" onClick={() => setShowModal(false)}>취소</button>
              <button className="px-3 py-2 bg-primary-600 text-white rounded text-sm" onClick={save}>저장</button>
            </div>
          </div>
        </div>
      )}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg" style={{ maxHeight: '80vh', overflow: 'auto' }}>
            <div className="flex items-center justify-between p-4 border-b">
              <div>
                <h3 className="text-lg font-semibold">삭제 미리보기</h3>
                <div className="text-sm text-gray-500">다음 항목이 삭제됩니다. 되돌릴 수 없습니다.</div>
              </div>
              <button className="text-gray-500 hover:text-gray-700" onClick={cancelDelete} aria-label="close modal">
                <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" stroke="currentColor"><path d="M6 6l8 8M14 6l-8 8" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            </div>

            <div className="p-4">
              <div className="text-sm font-medium mb-2">삭제 대상: {deleteTarget.name}</div>
              <div className="text-xs text-gray-600 mb-4">하위 항목 {deleteTarget.paths.length}개 포함</div>
              <div className="max-h-64 overflow-auto border rounded p-2">
                {deleteTarget.paths.length === 0 && <div className="text-sm text-gray-500">하위 항목이 없습니다.</div>}
                <ul className="text-sm space-y-1">
                  {deleteTarget.paths.map((p, idx) => <li key={idx} className="truncate">{p}</li>)}
                </ul>
              </div>
            </div>

            <div className="p-4 border-t flex justify-end gap-3">
              <button className="px-3 py-2 border rounded text-sm" onClick={cancelDelete}>취소</button>
              <button className="px-3 py-2 bg-red-600 text-white rounded text-sm" onClick={confirmDelete}>삭제</button>
            </div>
          </div>
        </div>
      )}
    </Container>
  )
}
