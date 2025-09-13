import React from 'react';
import { Container, Card } from '../../design-system';
import mockClassifications from '../../data/mockClassifications';

type Classification = { id: string; name: string; slug?: string; path?: string };

function flattenTree(tree: any[], parents: string[] = []) {
  const out: Classification[] = [];
  tree.forEach((n: any) => {
    const path = parents.concat(n.name);
    out.push({ id: n.id, name: n.name, path: path.join(' > ') });
    if (n.children) out.push(...flattenTree(n.children, path));
  });
  return out;
}

export default function ProductClassificationsPage() {
  const [items, setItems] = React.useState<Classification[]>([]);
  const [showModal, setShowModal] = React.useState(false);
  const [editing, setEditing] = React.useState<Classification | null>(null);
  const [name, setName] = React.useState('');
  const [slug, setSlug] = React.useState('');

  React.useEffect(() => {
    try {
      const raw = window.localStorage.getItem('productClassifications');
      if (raw) setItems(JSON.parse(raw));
      else {
        const seed = flattenTree(mockClassifications);
        setItems(seed);
        window.localStorage.setItem('productClassifications', JSON.stringify(seed));
      }
    } catch (e) {}
  }, []);

  const persist = (next: Classification[]) => {
    setItems(next);
    try { window.localStorage.setItem('productClassifications', JSON.stringify(next)); } catch (e) {}
  };

  const openAdd = () => { setEditing(null); setName(''); setSlug(''); setShowModal(true); };
  const openEdit = (b: Classification) => { setEditing(b); setName(b.name); setSlug(b.slug ?? ''); setShowModal(true); };

  const save = () => {
    if (!name.trim()) return alert('이름을 입력하세요');
    if (editing) {
      const next = items.map(i => i.id === editing.id ? { ...i, name: name.trim(), slug: slug.trim() || undefined } : i);
      persist(next);
    } else {
      const nb: Classification = { id: `c_${Date.now()}`, name: name.trim(), slug: slug.trim() || undefined };
      persist([...items, nb]);
    }
    setShowModal(false);
  };

  const remove = (id: string) => {
    if (!confirm('삭제하시겠습니까?')) return;
    persist(items.filter(b => b.id !== id));
  };

  return (
    <Container>
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">상품 분류 관리</h1>
            <p className="text-gray-600">상품 분류를 추가, 편집 및 삭제합니다.</p>
          </div>
          <div>
            <button className="px-3 py-2 bg-primary-600 text-white rounded" onClick={openAdd}>분류 추가</button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {items.map(i => (
            <div key={i.id} className="border rounded p-3 flex items-center justify-between">
              <div>
                <div className="font-medium">{i.name}</div>
                <div className="text-xs text-gray-500">{i.slug ?? '-'}</div>
              </div>
              <div className="flex items-center gap-2">
                <button className="text-sm px-2 py-1 border rounded" onClick={() => openEdit(i)}>편집</button>
                <button className="text-sm px-2 py-1 border rounded text-red-600" onClick={() => remove(i.id)}>삭제</button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium mb-3">{editing ? '분류 편집' : '분류 추가'}</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-700">이름</label>
                <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full border px-3 py-2 rounded" />
              </div>
              <div>
                <label className="block text-sm text-gray-700">슬러그 (선택)</label>
                <input value={slug} onChange={(e) => setSlug(e.target.value)} className="mt-1 block w-full border px-3 py-2 rounded" />
              </div>
            </div>

            <div className="mt-4 text-right">
              <button className="px-3 py-1 border rounded mr-2" onClick={() => setShowModal(false)}>취소</button>
              <button className="px-3 py-1 bg-primary-600 text-white rounded" onClick={save}>저장</button>
            </div>
          </div>
        </div>
      )}
    </Container>
  );
}
