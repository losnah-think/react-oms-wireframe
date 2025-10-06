import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Container, Card, Button, Grid, GridCol } from "../../design-system";
import * as XLSX from "xlsx";

type Row = Record<string, any>;

const guessHeaders = (rows: Row[]) => {
  if (!rows || rows.length === 0) return [];
  return Object.keys(rows[0]);
};

const BulkEditPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"product" | "option">("product");
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const t = params.get("tab");
      if (t === "option") setActiveTab("option");
      else setActiveTab("product");
    } catch (e) {}
  }, []);
  const [fileName, setFileName] = useState<string | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<Row[]>([]);
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [previewChanges, setPreviewChanges] = useState<Row[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  // 자동 리디렉트: deprecated 안내 후 상품 목록으로 이동
  useEffect(() => {
    const t = setTimeout(() => {
      try {
        window.location.replace('/products');
      } catch (e) {
        // ignore
      }
    }, 5000);
    return () => clearTimeout(t);
  }, []);

  const onFile = async (f: File | null) => {
    if (!f) return;
    setFileName(f.name);
    const buf = await f.arrayBuffer();
    const name = (f.name || '').toLowerCase();
    try {
      // If CSV, try decoding with multiple encodings (utf-8, then euc-kr)
      if (name.endsWith('.csv') || f.type === 'text/csv') {
        const tryEncodings = ['utf-8', 'euc-kr'];
        let parsed: Row[] | null = null;
        for (const enc of tryEncodings) {
          try {
            // Some browsers support 'euc-kr' label in TextDecoder
            const decoder = new TextDecoder(enc as any);
            let str = decoder.decode(buf as ArrayBuffer);
            // remove BOM if present
            if (str.charCodeAt(0) === 0xfeff) str = str.slice(1);
            const wb = XLSX.read(str, { type: 'string' });
            const sheetName = wb.SheetNames[0];
            const sheet = wb.Sheets[sheetName];
            const json = XLSX.utils.sheet_to_json<Row>(sheet, { defval: '' });
            // basic heuristic: consider it parsed if we got at least one row
            if (Array.isArray(json) && json.length > 0) {
              parsed = json;
              break;
            }
          } catch (e) {
            // try next encoding
          }
        }
        if (!parsed) {
          setErrors(['CSV 파일을 읽을 수 없습니다. 인코딩을 확인하세요 (UTF-8 또는 EUC-KR 권장).']);
          setRows([]);
          setHeaders([]);
          setPreviewChanges([]);
          return;
        }
        setRows(parsed);
        setHeaders(guessHeaders(parsed));
        setPreviewChanges(parsed.slice(0, 50));
        setErrors([]);
        return;
      }

      // For Excel (.xlsx/.xls) use ArrayBuffer read
      const wb = XLSX.read(buf, { type: 'array' });
      const sheetName = wb.SheetNames[0];
      const sheet = wb.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json<Row>(sheet, { defval: '' });
      setRows(json);
      setHeaders(guessHeaders(json));
      setPreviewChanges(json.slice(0, 50));
      setErrors([]);
    } catch (err) {
      setErrors(['파일을 처리하는 도중 오류가 발생했습니다. 파일 형식과 인코딩을 확인하세요.']);
      setRows([]);
      setHeaders([]);
      setPreviewChanges([]);
    }
  };

  // 미리보기 적용 기능 제거: 사용자는 파일 업로드/편집 후 직접 '수정 송신'을 사용합니다.

  const handleDownload = () => {
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "products");
    const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([buf], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `products-updated-${Date.now()}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const loadCurrentProducts = async () => {
    try {
      // Try server API first
      const resp = await fetch('/api/products?limit=1000', { cache: 'no-store' });
      if (resp.ok) {
        const json = await resp.json();
        const list = Array.isArray(json.products) ? json.products : (Array.isArray(json) ? json : []);
        setRows(list);
        setHeaders(guessHeaders(list));
        setPreviewChanges(list.slice(0, 50));
        setFileName('server-products.json');
        setErrors([]);
        return;
      }
    } catch (e) {
      // ignore and fall back to localStorage
    }

    try {
      const raw = localStorage.getItem('products_local_v1');
      if (raw) {
        const list = JSON.parse(raw);
        setRows(list);
        setHeaders(guessHeaders(list));
        setPreviewChanges(list.slice(0, 50));
        setFileName('local-products.json');
        setErrors([]);
        return;
      }
    } catch (e) {
      setErrors(['Failed to load products from localStorage']);
    }

    setErrors(['No products available to load']);
  };

  const sendUpdates = async () => {
    // Collect changed rows (simple diff by id)
    const changed = previewChanges.filter((p) => p && p.id);
    if (changed.length === 0) {
      alert('변경된 항목이 없습니다.');
      return;
    }

    try {
      const resp = await fetch('/api/products/bulk-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: changed }),
      });
      if (resp.ok) {
        alert('상품 수정이 서버에 전송되었습니다.');
        // notify other windows
        window.dispatchEvent(new Event('products:updated'));
        return;
      }
      // fallback
    } catch (e) {
      // fallback to localStorage
    }

    try {
      // merge into localStorage products_local_v1 by id
      const raw = localStorage.getItem('products_local_v1');
      const existing = raw ? JSON.parse(raw) : [];
      const map: Record<string, any> = {};
      (existing || []).forEach((r: any) => { map[String(r.id)] = r; });
      (changed || []).forEach((r: any) => { if (r && r.id) map[String(r.id)] = { ...(map[String(r.id)] || {}), ...r }; });
      const merged = Object.values(map);
      localStorage.setItem('products_local_v1', JSON.stringify(merged));
      window.dispatchEvent(new Event('products:updated'));
      alert('변경 사항이 로컬에 저장되었습니다. (서버 전송 실패 시 대체 동작)');
    } catch (e) {
      alert('송신 실패: 저장할 수 없습니다.');
    }
  };

  const handleCellEdit = (idx: number, key: string, value: string) => {
    setPreviewChanges((prev) => {
      const next = prev.slice();
      next[idx] = { ...next[idx], [key]: value };
      return next;
    });
  };

  return (
    <Container maxWidth="full" centered={false} padding="md">
      <div className="mb-4">
        <div className="rounded-md bg-yellow-50 border border-yellow-200 p-4">
          <h2 className="text-lg font-semibold">기능 폐지 안내</h2>
          <p className="mt-2 text-sm text-gray-700">
            '상품/옵션 일괄수정' 페이지는 더 이상 메뉴에서 접근하지 않습니다.
            이 페이지는 유지보수 중이며, 곧 완전 제거되거나 대체 기능으로
            이전될 예정입니다. 5초 후 자동으로 상품 목록으로 이동합니다.
          </p>
          <div className="mt-3">
            <Link href="/products" className="text-sm text-blue-600 underline">
              지금 상품 목록으로 이동하기
            </Link>
          </div>
        </div>
      </div>
      <h1 className="text-2xl font-bold mb-4">상품/옵션 일괄수정 (Deprecated)</h1>

      <div className="mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("product")}
            className={`px-3 py-1 rounded ${activeTab === "product" ? "bg-blue-600 text-white" : "bg-white border"}`}
          >
            상품 일괄
          </button>
          <button
            onClick={() => setActiveTab("option")}
            className={`px-3 py-1 rounded ${activeTab === "option" ? "bg-blue-600 text-white" : "bg-white border"}`}
          >
            옵션 일괄
          </button>
        </div>
      </div>

      <Card padding="lg" className="mb-6">
        <div className="flex items-center gap-4">
          <input
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={(e) =>
              onFile(
                e.target.files && e.target.files[0] ? e.target.files[0] : null,
              )
            }
          />
          <div className="text-sm text-gray-600">
            업로드 가능한 파일: CSV, Excel (.xlsx/.xls). 첫 시트를 사용합니다.
          </div>
          <div className="ml-auto text-sm text-gray-500">
            모드: <strong>{activeTab === "product" ? "상품" : "옵션"}</strong>
          </div>
        </div>
      </Card>

      <Grid container gutter={16} className="mb-6">
        <GridCol span={16} className="mb-6">
          <Card padding="lg">
            <div className="mb-3">
              <strong>필드 미리보기</strong>
              <div className="text-sm text-gray-600">
                파일: {fileName || "없음"} · 행 수: {rows.length}
              </div>
            </div>
            {headers.length > 0 && (
              <div className="mb-3">
                <label className="text-sm">필드 선택 (미리보기 편집)</label>
                <select
                  className="ml-2 px-2 py-1 border rounded"
                  value={selectedField || ""}
                  onChange={(e) => setSelectedField(e.target.value || null)}
                >
                  <option value="">-- 선택 없음 --</option>
                  {headers.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="overflow-auto max-h-96 border rounded">
              <table className="w-full table-auto">
                <thead className="bg-gray-50">
                  <tr>
                    {headers.map((h) => (
                      <th className="px-3 py-2 text-left" key={h}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewChanges.map((r, ri) => (
                    <tr key={ri} className="border-t">
                      {headers.map((h) => (
                        <td key={h} className="px-2 py-1">
                          <input
                            className="w-full px-2 py-1 border rounded text-sm"
                            value={r[h] ?? ""}
                            onChange={(e) =>
                              handleCellEdit(ri, h, e.target.value)
                            }
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex gap-2">
              <Button variant="outline" onClick={handleDownload}>
                현재 데이터 다운로드
              </Button>
              <Button variant="outline" onClick={loadCurrentProducts}>
                현재 상품 불러오기
              </Button>
              <Button variant="primary" onClick={sendUpdates}>
                수정 송신
              </Button>
            </div>
          </Card>
        </GridCol>

        <GridCol span={8} className="mb-6">
          <Card padding="lg">
            <strong>업로드 안내 및 권장 컬럼 (prd_prdLit 양식 기반)</strong>
            <div className="text-sm text-gray-600 mt-2">
              아래는 첨부하신 `prd_prdLit` 예시 CSV에서 자주 사용되는
              컬럼들입니다. 가능한 한 헤더명을 유지하세요.
            </div>
            <ul className="text-sm list-disc ml-6 mt-2">
              <li>
                <strong>상품관리번호 / id</strong>: 내부 식별자 (업데이트 매칭용
                권장)
              </li>
              <li>
                <strong>상품분류</strong>, <strong>상품명</strong>,{" "}
                <strong>상품코드</strong>(또는 SKU)
              </li>
              <li>
                <strong>판매가</strong>, <strong>원가</strong>,{" "}
                <strong>재고</strong> (옵션이 있는 경우 variant별 컬럼 사용
                권장)
              </li>
              <li>
                <strong>썸네일/이미지 URL</strong>들 (여러 이미지 컬럼이 있을 수
                있음)
              </li>
              <li>
                <strong>상품상태</strong>, <strong>배송비정책</strong>,{" "}
                <strong>브랜드</strong>, <strong>공급처</strong>
              </li>
              <li>
                <strong>옵션 관련 컬럼</strong>: `옵션번호`, `옵션명`, `옵션가`,
                `옵션재고`, `variant_id` 같은 명시적 식별자 사용을 권장
              </li>
            </ul>

            <div className="mt-3 text-sm font-medium text-gray-800">📋 업로드 전 체크리스트</div>
            <ol className="text-sm list-decimal ml-6 mt-2 space-y-1">
              <li><strong>파일 인코딩:</strong> CSV를 UTF-8로 저장해주세요 (엑셀 저장 시 인코딩 주의)</li>
              <li><strong>시트 선택:</strong> 첫 번째 시트만 사용됩니다. 컬럼명은 대소문자 구분 없이 매핑됩니다</li>
              <li><strong>옵션 업데이트:</strong> 옵션 식별자(variant_id 또는 option_id)가 있어야 안전하게 매칭됩니다</li>
              <li><strong>데이터 형식:</strong> 날짜는 YYYY-MM-DD 형식, 숫자는 쉼표 없이 입력해주세요</li>
              <li><strong>미리보기 확인:</strong> 실제 적용 전에 미리보기로 결과를 확인해주세요</li>
            </ol>

            <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-gray-700">
              <strong>💡 추가 정보:</strong> 엑셀을 CSV로 저장하는 방법은 첨부 이미지를 참고해주세요. 
              실제 서버 반영을 위해서는 별도의 API 연동이 필요합니다.
            </div>
          </Card>
        </GridCol>
      </Grid>
    </Container>
  );
};

export default BulkEditPage;
