import React, { useState, useMemo, useRef, useEffect, useLayoutEffect } from 'react';
import ReactDOM from 'react-dom';

export interface TreeNode {
  id: string;
  name: string;
  children?: TreeNode[];
}

interface Props {
  data: TreeNode[];
  // value is the full path string like '의류 > 남성 > 셔츠'
  value?: string | null;
  placeholder?: string;
  onChange: (selected: TreeNode | null, path?: string[]) => void;
}

const MAX_DEPTH = 4

const flatten = (nodes: TreeNode[], parents: string[] = []) => {
  const out: Array<{ node: TreeNode; path: string[] }> = [];
  nodes.forEach((n) => {
    out.push({ node: n, path: parents.concat(n.name) });
    if (n.children) {
      out.push(...flatten(n.children, parents.concat(n.name)));
    }
  });
  return out;
};

const HierarchicalSelect: React.FC<Props> = ({ data, value, placeholder, onChange }) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activePath, setActivePath] = useState<string[]>([]);
  const ref = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const [panelStyle, setPanelStyle] = useState<React.CSSProperties | null>(null);
  const colWidth = 220 // per-column width in px

  const flat = useMemo(() => flatten(data), [data]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current) {
        const tgt = e.target;
        if (tgt && typeof Node !== 'undefined' && tgt instanceof Node && !ref.current.contains(tgt as Node)) {
          setOpen(false);
        }
      }
    }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  useLayoutEffect(() => {
    if (!open || !ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const totalWidth = Math.max(320, rect.width, colWidth * MAX_DEPTH)
    const offset = 8
    // Open below the button, left-aligned; clamp to viewport
    let left = rect.left + window.scrollX
    if (left + totalWidth + 8 > window.innerWidth) left = Math.max(8, window.innerWidth - totalWidth - 8)
    const top = rect.bottom + window.scrollY + offset
    const style: React.CSSProperties = {
      position: 'absolute',
      top,
      left,
      width: totalWidth,
      zIndex: 1000,
    }
    setPanelStyle(style)
  }, [open])

  const selected = useMemo(() => flat.find(f => f.path.join(' > ') === value)?.node || null, [flat, value]);

  const filtered = useMemo(() => {
    if (!query) return flat;
    const q = query.toLowerCase();
    return flat.filter(f => f.path.join(' > ').toLowerCase().includes(q));
  }, [flat, query]);

  const roots = data;

  const handleSelectNode = (node: TreeNode, path: string[]) => {
    onChange(node, path);
    setActivePath(path);
    setOpen(false);
  };

  // get nodes for a given level based on activePath prefix
  const getNodesAtLevel = (level: number) => {
    if (level === 0) return roots
    let cur: TreeNode | undefined = undefined
    for (let i = 0; i < level; i++) {
      const name = activePath[i]
      if (!name) return []
  const list: TreeNode[] = i === 0 ? roots : (cur && cur.children ? cur.children : [])
  cur = list.find((x: TreeNode) => x.name === name)
      if (!cur) return []
    }
    return cur && cur.children ? cur.children : []
  }

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((s) => !s)}
        className="w-full text-left px-3 py-3 border border-gray-300 rounded-lg bg-white flex items-center justify-between"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="truncate">
          {selected ? selected.name : (placeholder || '선택')}
        </span>
        <svg className="w-4 h-4 ml-2 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.06z" clipRule="evenodd" />
        </svg>
      </button>

      {open && (
        (panelStyle && ReactDOM.createPortal(
          <div ref={panelRef} className="bg-white border border-gray-200 rounded shadow-lg" style={{ ...panelStyle, minWidth: 320 }}>
          <div className="p-3">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="검색 (경로로 검색 가능, 예: 의류 > 남성)"
              className="w-full px-3 py-2 border border-gray-200 rounded focus:outline-none"
              aria-label="Filter classifications"
            />
          </div>

          <div style={{ minHeight: 220, display: 'grid', gridTemplateColumns: `repeat(${MAX_DEPTH}, ${colWidth}px)`, gap: 0 }}>
            {Array.from({ length: MAX_DEPTH }).map((_, level) => (
              <div key={level} className="p-2 overflow-auto" style={{ borderLeft: level === 0 ? 'none' : '1px solid #eef2f7' }}>
                {(() => {
                  const list = getNodesAtLevel(level)
                  if (!list || list.length === 0) return <div className="text-sm text-gray-500">하위 없음</div>
                  return list.map((c) => (
                    <div
                      key={c.id}
                      className={`px-2 py-2 rounded cursor-pointer hover:bg-gray-100 ${activePath[level] === c.name ? 'bg-gray-100 font-semibold' : ''}`}
                      onMouseEnter={() => setActivePath((p) => {
                        const next = p.slice(0, level)
                        next[level] = c.name
                        return next
                      })}
                      onClick={() => {
                        const path = [...activePath.slice(0, level), c.name].filter(Boolean)
                        if (c.children && level < (MAX_DEPTH - 1)) {
                          setActivePath(path)
                        } else {
                          handleSelectNode(c, path)
                        }
                      }}
                    >
                      {c.name}
                    </div>
                  ))
                })()}
              </div>
            ))}
          </div>

          {query && (
            <div className="p-2 border-t">
              <div className="text-sm text-gray-600 mb-2">검색 결과</div>
              <div className="max-h-48 overflow-auto">
                {filtered.length === 0 && <div className="text-sm text-gray-500">검색 결과가 없습니다</div>}
                {filtered.map(f => (
                  <div key={f.node.id} className="px-2 py-2 hover:bg-gray-50 cursor-pointer" onClick={() => handleSelectNode(f.node, f.path)}>
                    {f.path.join(' > ')}
                  </div>
                ))}
              </div>
            </div>
          )}
          </div>, document.body)) || null
      )}
    </div>
  );
};

export default HierarchicalSelect;
