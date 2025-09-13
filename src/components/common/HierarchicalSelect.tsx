import React, { useState, useMemo, useRef, useEffect } from 'react';

export interface TreeNode {
  id: string;
  name: string;
  children?: TreeNode[];
}

interface Props {
  data: TreeNode[];
  value?: string | null;
  placeholder?: string;
  onChange: (selected: TreeNode | null) => void;
}

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

  const selected = useMemo(() => flat.find(f => f.node.name === value)?.node || null, [flat, value]);

  const filtered = useMemo(() => {
    if (!query) return flat;
    const q = query.toLowerCase();
    return flat.filter(f => f.path.join(' > ').toLowerCase().includes(q));
  }, [flat, query]);

  const roots = data;

  const handleSelectNode = (node: TreeNode, path: string[]) => {
    onChange(node);
    setActivePath(path);
    setOpen(false);
  };

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
        <div className="absolute z-50 mt-2 w-96 bg-white border border-gray-200 rounded shadow-lg">
          <div className="p-3">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="검색 (경로로 검색 가능, 예: 의류 > 남성)"
              className="w-full px-3 py-2 border border-gray-200 rounded focus:outline-none"
              aria-label="Filter classifications"
            />
          </div>

          <div className="grid grid-cols-3 gap-0 divide-x" style={{ minHeight: 220 }}>
            <div className="p-2 overflow-auto">
              {roots.map((r) => (
                <div
                  key={r.id}
                  className={`px-2 py-2 rounded cursor-pointer hover:bg-gray-100 ${activePath[0] === r.name ? 'bg-gray-100 font-semibold' : ''}`}
                  onMouseEnter={() => setActivePath([r.name])}
                  onClick={() => r.children ? setActivePath([r.name]) : handleSelectNode(r, [r.name])}
                >
                  {r.name}
                </div>
              ))}
            </div>

            <div className="p-2 overflow-auto">
              {(() => {
                const level1 = roots.find(x => x.name === activePath[0]);
                if (!level1 || !level1.children) return <div className="text-sm text-gray-500">하위 없음</div>;
                return level1.children.map((c) => (
                  <div
                    key={c.id}
                    className={`px-2 py-2 rounded cursor-pointer hover:bg-gray-100 ${activePath[1] === c.name ? 'bg-gray-100 font-semibold' : ''}`}
                    onMouseEnter={() => setActivePath([level1.name, c.name])}
                    onClick={() => c.children ? setActivePath([level1.name, c.name]) : handleSelectNode(c, [level1.name, c.name])}
                  >
                    {c.name}
                  </div>
                ));
              })()}
            </div>

            <div className="p-2 overflow-auto">
              {(() => {
                const level1 = roots.find(x => x.name === activePath[0]);
                const level2 = level1?.children?.find(x => x.name === activePath[1]);
                if (!level2 || !level2.children) return <div className="text-sm text-gray-500">하위 없음</div>;
                return level2.children.map((c) => (
                  <div
                    key={c.id}
                    className={`px-2 py-2 rounded cursor-pointer hover:bg-gray-100`}
                    onClick={() => handleSelectNode(c, [level1!.name, level2.name, c.name])}
                  >
                    {c.name}
                  </div>
                ));
              })()}
            </div>
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
        </div>
      )}
    </div>
  );
};

export default HierarchicalSelect;
