import React, { useState, useEffect } from 'react'
import { Container, Card, Button } from '../../design-system'
import * as XLSX from 'xlsx'

type Row = Record<string, any>

const guessHeaders = (rows: Row[]) => {
  if (!rows || rows.length === 0) return []
  return Object.keys(rows[0])
}

const BulkEditPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'product'|'option'>('product')
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search)
      const t = params.get('tab')
      if (t === 'option') setActiveTab('option')
      else setActiveTab('product')
    } catch (e) {}
  }, [])
  const [fileName, setFileName] = useState<string | null>(null)
  const [headers, setHeaders] = useState<string[]>([])
  const [rows, setRows] = useState<Row[]>([])
  const [selectedField, setSelectedField] = useState<string | null>(null)
  const [previewChanges, setPreviewChanges] = useState<Row[]>([])
  const [errors, setErrors] = useState<string[]>([])

  const onFile = async (f: File | null) => {
    if (!f) return
    setFileName(f.name)
    const buf = await f.arrayBuffer()
    const wb = XLSX.read(buf, { type: 'array' })
    const sheetName = wb.SheetNames[0]
    const sheet = wb.Sheets[sheetName]
    const json = XLSX.utils.sheet_to_json<Row>(sheet, { defval: '' })
    setRows(json)
    setHeaders(guessHeaders(json))
    setPreviewChanges(json.slice(0, 50))
    setErrors([])
  }

  const handleApply = () => {
    // For now: apply preview changes to rows (mock) and present a success message
    setRows((prev) => {
      // In a real implementation we'd send mapped updates to the API
      return prev.map((r) => {
        const match = previewChanges.find((p) => p.id && r.id && String(p.id) === String(r.id))
        return match ? { ...r, ...match } : r
      })
    })
    alert('미리보기 변경이 로컬에 적용되었습니다. (모의 적용)')
  }

  const handleDownload = () => {
    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'products')
    const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([buf], { type: 'application/octet-stream' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `products-updated-${Date.now()}.xlsx`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleCellEdit = (idx: number, key: string, value: string) => {
    setPreviewChanges((prev) => {
      const next = prev.slice()
      next[idx] = { ...next[idx], [key]: value }
      return next
    })
  }

  return (
    <Container maxWidth="lg" padding="md">
      <h1 className="text-2xl font-bold mb-4">상품/옵션 일괄수정</h1>

      <div className="mb-4">
        <div className="flex items-center gap-2">
          <button onClick={() => setActiveTab('product')} className={`px-3 py-1 rounded ${activeTab === 'product' ? 'bg-blue-600 text-white' : 'bg-white border'}`}>상품 일괄</button>
          <button onClick={() => setActiveTab('option')} className={`px-3 py-1 rounded ${activeTab === 'option' ? 'bg-blue-600 text-white' : 'bg-white border'}`}>옵션 일괄</button>
        </div>
      </div>

      <Card padding="lg" className="mb-6">
        <div className="flex items-center gap-4">
          <input type="file" accept=".csv,.xlsx,.xls" onChange={(e) => onFile(e.target.files && e.target.files[0] ? e.target.files[0] : null)} />
          <div className="text-sm text-gray-600">업로드 가능한 파일: CSV, Excel (.xlsx/.xls). 첫 시트를 사용합니다.</div>
          <div className="ml-auto text-sm text-gray-500">모드: <strong>{activeTab === 'product' ? '상품' : '옵션'}</strong></div>
        </div>
      </Card>

      <Card padding="lg" className="mb-6">
        <div className="mb-3">
          <strong>필드 미리보기</strong>
          <div className="text-sm text-gray-600">파일: {fileName || '없음'} · 행 수: {rows.length}</div>
        </div>
        {headers.length > 0 && (
          <div className="mb-3">
            <label className="text-sm">필드 선택 (미리보기 편집)</label>
            <select className="ml-2 px-2 py-1 border rounded" value={selectedField || ''} onChange={(e) => setSelectedField(e.target.value || null)}>
              <option value="">-- 선택 없음 --</option>
              {headers.map((h) => <option key={h} value={h}>{h}</option>)}
            </select>
          </div>
        )}

        <div className="overflow-auto max-h-96 border rounded">
          <table className="w-full table-auto">
            <thead className="bg-gray-50">
              <tr>
                {headers.map((h) => <th className="px-3 py-2 text-left" key={h}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {previewChanges.map((r, ri) => (
                <tr key={ri} className="border-t">
                  {headers.map((h) => (
                    <td key={h} className="px-2 py-1">
                      <input className="w-full px-2 py-1 border rounded text-sm" value={r[h] ?? ''} onChange={(e) => handleCellEdit(ri, h, e.target.value)} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex gap-2">
          <Button variant="primary" onClick={handleApply}>미리보기 적용 (모의)</Button>
          <Button variant="outline" onClick={handleDownload}>현재 데이터 다운로드</Button>
        </div>
      </Card>

      <Card padding="lg">
        <strong>업로드 안내 및 권장 컬럼 (prd_prdLit 양식 기반)</strong>
        <div className="text-sm text-gray-600 mt-2">아래는 첨부하신 `prd_prdLit` 예시 CSV에서 자주 사용되는 컬럼들입니다. 가능한 한 헤더명을 유지하세요.</div>
        <ul className="text-sm list-disc ml-6 mt-2">
          <li><strong>상품관리번호 / id</strong>: 내부 식별자 (업데이트 매칭용 권장)</li>
          <li><strong>상품분류</strong>, <strong>상품명</strong>, <strong>상품코드</strong>(또는 SKU)</li>
          <li><strong>판매가</strong>, <strong>원가</strong>, <strong>재고</strong> (옵션이 있는 경우 variant별 컬럼 사용 권장)</li>
          <li><strong>썸네일/이미지 URL</strong>들 (여러 이미지 컬럼이 있을 수 있음)</li>
          <li><strong>상품상태</strong>, <strong>배송비정책</strong>, <strong>브랜드</strong>, <strong>공급처</strong></li>
          <li><strong>옵션 관련 컬럼</strong>: `옵션번호`, `옵션명`, `옵션가`, `옵션재고`, `variant_id` 같은 명시적 식별자 사용을 권장</li>
        </ul>

        <div className="mt-3 text-sm text-gray-700">중요 안내:</div>
        <ol className="text-sm list-decimal ml-6 mt-2">
          <li>CSV는 UTF-8로 저장하세요 (엑셀에서 저장 시 인코딩 주의).</li>
          <li>업로드 시 첫 시트를 사용합니다. 컬럼명은 대소문자 구분 없이 매핑됩니다.</li>
          <li>옵션(variant) 업데이트는 옵션 식별자(variant_id 또는 option_id)가 있어야 안전하게 매칭됩니다.</li>
          <li>날짜/통화 포맷이 일관된지 확인하세요. (예: YYYY-MM-DD, 숫자에는 쉼표 제거)</li>
          <li>실제 적용 전에 반드시 미리보기로 행 단위 결과를 확인하세요. 현재는 클라이언트 모의 적용 기능만 포함되어 있습니다.</li>
        </ol>

        <div className="mt-3 text-sm text-gray-700">도움말 이미지: 엑셀을 CSV로 저장하는 방법(첨부 이미지 참조). 서버 반영을 위해서는 별도의 API 엔드포인트와 필드 매핑 규칙이 필요합니다.</div>
      </Card>
    </Container>
  )
}

export default BulkEditPage
