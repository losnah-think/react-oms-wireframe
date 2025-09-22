import React from "react";
import { mockProducts } from "../../data/mockProducts";
import { clientBarcodeStore } from "../../lib/clientBarcodeStore";

type Row = { id: number; code: string; created_at: string };

const SAMPLE: Row[] = [
  { id: 2, code: "location-2", created_at: "2025-06-23 10:46:05" },
  { id: 1, code: "test1", created_at: "2025-06-22 19:17:02" },
];

const LocationBarcodesPage: React.FC = () => {
  const [tab, setTab] = React.useState<'list' | 'upload'>('list');
  const [query, setQuery] = React.useState("");
  const [rows, setRows] = React.useState<Row[]>(SAMPLE);
  const [clientProducts, setClientProducts] = React.useState<any[]>([]);
  const [selected, setSelected] = React.useState<Record<number, boolean>>({});
  const [editingId, setEditingId] = React.useState<number | null>(null);
  const [editingValue, setEditingValue] = React.useState<string>("");

  // upload state
  const [fileName, setFileName] = React.useState<string | null>(null);
  const [parsed, setParsed] = React.useState<Row[] | null>(null);

  const toggle = (id: number) =>
    setSelected((s) => ({ ...s, [id]: !s[id] }));

  const startEdit = (r: Row) => {
    setEditingId(r.id);
    setEditingValue(r.code);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingValue("");
  };

  const saveEdit = async () => {
    if (editingId == null) return;
    const res = clientBarcodeStore.updateLocationBarcode(editingId, { code: editingValue });
    if (!res.ok) {
      alert("저장 실패: " + String(res.error || ""));
      return;
    }
    cancelEdit();
    alert("수정 저장 완료");
  };

  const doDelete = async (id: number) => {
    if (!confirm("정말로 삭제하시겠습니까?")) return;
    const res = clientBarcodeStore.deleteLocationBarcode(id);
    if (!res.ok) {
      alert("삭제 실패: " + String(res.error || ""));
      return;
    }
    alert("삭제 완료");
  };

  const downloadTemplate = () => {
    const csv = 'code,created_at\nlocation-001,2025-01-01 00:00:00\nlocation-002,2025-01-02 00:00:00\n';
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'location-barcodes-template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const parseCSV = async (text: string) => {
    // very small CSV parser (no quoting handling)
    const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) return [];
    const header = lines[0].split(',').map(h => h.trim().toLowerCase());
    const rowsOut: Row[] = [];
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',').map(c => c.trim());
      const code = cols[0] || `location-${Date.now()}-${i}`;
      const created_at = cols[1] || new Date().toISOString().slice(0,19).replace('T',' ');
      rowsOut.push({ id: Date.now() + i, code, created_at });
    }
    return rowsOut;
  };

  const onFile = async (file?: File | null) => {
    if (!file) return;
    setFileName(file.name);
    const text = await file.text();
    const p = await parseCSV(text);
    setParsed(p);
  };

  const doUpload = () => {
    if (!parsed || parsed.length === 0) {
      alert('업로드할 데이터가 없습니다');
      return;
    }
    // persist into client store so other pages see the upload
    clientBarcodeStore.addLocationBarcodes(parsed);
    setParsed(null);
    setFileName(null);
    setTab('list');
    alert(`${parsed.length}건 업로드 완료`);
  };

  React.useEffect(() => {
    clientBarcodeStore.initIfNeeded();
    const next = clientBarcodeStore.getLocationBarcodes();
    if (Array.isArray(next) && next.length > 0) setRows(next);
    const cp = clientBarcodeStore.getProducts() || [];
    setClientProducts(cp);
    const handler = (e: any) => {
      const d = clientBarcodeStore.getLocationBarcodes();
      setRows(d || []);
      const cp2 = clientBarcodeStore.getProducts() || [];
      setClientProducts(cp2);
    };
    window.addEventListener("clientBarcodesChanged", handler);
    return () => window.removeEventListener("clientBarcodesChanged", handler);
  }, []);

  const productCountForBarcode = React.useMemo(() => {
    const map: Record<string, Set<string>> = {};
    mockProducts.forEach((mp: any) => {
      const prodId = String(mp.id);
      if (Array.isArray(mp.variants) && mp.variants.length) {
        mp.variants.forEach((v: any) => {
          const code = v.barcode1 || v.barcode2 || v.barcode3;
          if (!code) return;
          map[code] = map[code] || new Set();
          map[code].add(prodId);
        });
      } else {
        const code = mp.barcode || (mp.variants && mp.variants[0] && (mp.variants[0].barcode1 || mp.variants[0].barcode2));
        if (code) {
          map[code] = map[code] || new Set();
          map[code].add(prodId);
        }
      }
    });
    // include client-side assignments: some products may be assigned to a location code
    try {
      (clientProducts || []).forEach((p: any) => {
        const code = p.barcode;
        if (!code) return;
        const prodId = String(p.productId ?? p.id ?? '');
        if (!prodId) return;
        map[code] = map[code] || new Set();
        map[code].add(prodId);
      });
    } catch (e) {}
    const out: Record<string, number> = {};
    Object.keys(map).forEach((k) => (out[k] = map[k].size));
    return out;
  }, [clientProducts]);


  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">위치 바코드 관리</h1>

      <div className="mb-4">
        <div className="inline-flex rounded bg-gray-100 p-1">
          <button
            onClick={() => setTab('list')}
            className={`px-4 py-2 ${tab === 'list' ? 'bg-white shadow' : ''}`}
          >
            목록
          </button>
          <button
            onClick={() => setTab('upload')}
            className={`px-4 py-2 ${tab === 'upload' ? 'bg-white shadow' : ''}`}
          >
            엑셀 업로드
          </button>
        </div>
      </div>

      {tab === 'list' ? (
        <div className="bg-white border p-4 rounded mb-4">
          <div className="flex gap-3 mb-3">
            <div className="flex-1">
              <input
                type="text"
                placeholder="위치 바코드 검색"
                className="w-full border px-3 py-2 rounded"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <div className="w-48">
              <input
                type="text"
                placeholder="위치바코드 입력"
                className="w-full border px-3 py-2 rounded"
              />
            </div>
            <div className="flex items-center gap-2">
              <button className="bg-blue-600 text-white px-3 py-2 rounded">검색</button>
              <button className="bg-gray-100 px-3 py-2 rounded">초기화</button>
            </div>
          </div>

          <div className="flex items-center justify-between mb-3">
            <div className="flex gap-2">
              <button className="px-3 py-2 border rounded">위치코드 그룹</button>
              <button className="px-3 py-2 border rounded" onClick={() => setTab('upload')}>엑셀 업로드</button>
              <button className="px-3 py-2 border rounded">엑셀 내보내기</button>
              <button className="px-3 py-2 border rounded text-red-600">선택 삭제</button>
            </div>
            <div className="text-sm text-gray-600">총 {rows.length}건</div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full table-fixed text-sm border-collapse min-w-[900px]">
              <thead className="bg-gray-50 sticky top-0">
                <tr className="text-left text-gray-600 border-b">
                  <th className="p-2" style={{ width: '6%' }}>No</th>
                  <th className="p-2" style={{ width: '6%' }}>
                    <input type="checkbox" />
                  </th>
                  <th className="p-2" style={{ width: '60%' }}>위치 바코드</th>
                  <th className="p-2 text-center" style={{ width: '18%' }}>등록일자</th>
                  <th className="p-2 text-center" style={{ width: '10%' }}>기능</th>
                </tr>
              </thead>
              <tbody>
                {rows.filter(r => r.code.includes(query)).map((r, idx) => (
                  <tr key={r.id} className="border-t hover:bg-gray-50 align-top">
                    <td className="p-2">{r.id}</td>
                    <td className="p-2 text-center">
                      <input
                        type="checkbox"
                        checked={!!selected[r.id]}
                        onChange={() => toggle(r.id)}
                      />
                    </td>
                    <td className="p-2 font-mono">
                      <div>{r.code}</div>
                      <div className="text-xs text-gray-500 mt-1">{productCountForBarcode[r.code] ?? 0}개 상품</div>
                    </td>
                    <td className="p-2 text-center">{r.created_at}</td>
                    <td className="p-2 text-center">
                      <button className="px-2 py-1 text-sm border rounded" onClick={() => startEdit(r)}>수정</button>
                      <button className="px-2 py-1 text-sm border rounded ml-2 text-red-600" onClick={() => doDelete(r.id)}>삭제</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex justify-center">
            <div className="inline-flex items-center gap-2">
              <button className="px-3 py-1 border rounded">◀</button>
              <button className="px-3 py-1 border rounded bg-blue-600 text-white">1</button>
              <button className="px-3 py-1 border rounded">2</button>
              <button className="px-3 py-1 border rounded">▶</button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white border p-4 rounded mb-4">
          <div className="mb-3 text-sm text-gray-700">
            템플릿을 다운로드하여 샘플 형식에 맞춰 업로드하세요. CSV 형식을 지원합니다.
          </div>
          <div className="flex gap-3 items-center mb-4">
            <button className="px-3 py-2 bg-white border rounded" onClick={downloadTemplate}>템플릿 다운로드</button>
            <label className="px-3 py-2 bg-gray-100 border rounded cursor-pointer">
              파일 선택
              <input type="file" accept=".csv,text/csv" className="hidden" onChange={(e) => onFile(e.target.files?.[0] ?? null)} />
            </label>
            <div className="text-sm text-gray-600">{fileName ?? '선택된 파일 없음'}</div>
          </div>

          <div className="mb-3">
            <strong className="block mb-2">미리보기</strong>
            {parsed && parsed.length > 0 ? (
              <div className="overflow-x-auto border p-2">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-600">
                      <th className="p-2">위치 바코드</th>
                      <th className="p-2">등록일자</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsed.map((p) => (
                      <tr key={p.id} className="border-t">
                        <td className="p-2 font-mono">{p.code}</td>
                        <td className="p-2">{p.created_at}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-sm text-gray-500">업로드할 CSV 파일을 선택하면 미리보기가 여기에 표시됩니다.</div>
            )}
          </div>

          <div className="flex gap-2 justify-end">
            <button className="px-3 py-2 border rounded" onClick={() => { setParsed(null); setFileName(null); }}>취소</button>
            <button className="px-3 py-2 bg-blue-600 text-white rounded" onClick={doUpload}>업로드</button>
          </div>
        </div>
      )}

      {/* Edit modal for location code */}
      {editingId != null && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded w-[480px]">
            <h3 className="text-lg font-semibold mb-2">위치 바코드 수정</h3>
            <input className="border w-full p-2 mb-3 font-mono" value={editingValue} onChange={(e) => setEditingValue(e.target.value)} />
            <div className="flex justify-end gap-2">
              <button className="px-3 py-2 border rounded" onClick={cancelEdit}>취소</button>
              <button className="px-3 py-2 bg-blue-600 text-white rounded" onClick={saveEdit}>저장</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationBarcodesPage;
