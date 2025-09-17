import React, { useState } from 'react'
import { Container, Card, Button } from '../../design-system'
import * as XLSX from 'xlsx'

type Row = Record<string, any>

const guessHeaders = (rows: Row[]) => (rows && rows.length ? Object.keys(rows[0]) : [])

const OptionBulkEditPage: React.FC = () => {
  const [fileName, setFileName] = useState<string | null>(null)
  const [headers, setHeaders] = useState<string[]>([])
  const [rows, setRows] = useState<Row[]>([])
  const [previewChanges, setPreviewChanges] = useState<Row[]>([])

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
  }

  const handleApply = () => {
    // mock apply locally
    setRows((prev) => prev.map(r => {
      const match = previewChanges.find(p => p['option_id'] && r['option_id'] && String(p['option_id']) === String(r['option_id']))
      return match ? { ...r, ...match } : r
    }))
    alert('미리보기 변경이 로컬에 적용되었습니다. (모의 적용)')
  }

  const handleDownload = () => {
    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'options')
    const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([buf], { type: 'application/octet-stream' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `options-updated-${Date.now()}.xlsx`
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
      <h1 className="text-2xl font-bold mb-4">옵션 일괄수정</h1>

      <Card padding="lg" className="mb-6">
        <div className="flex items-center gap-4">
          <input type="file" accept=".csv,.xlsx,.xls" onChange={(e) => onFile(e.target.files && e.target.files[0] ? e.target.files[0] : null)} />
          <div className="text-sm text-gray-600">옵션 수정용 CSV/Excel 파일 업로드. 첫 시트를 사용합니다.</div>
        </div>
      </Card>

      <Card padding="lg" className="mb-6">
        <div className="mb-3">
          <strong>필드 미리보기</strong>
          <div className="text-sm text-gray-600">파일: {fileName || '없음'} · 행 수: {rows.length}</div>
        </div>

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
        <strong>옵션 업로드 가이드</strong>
        <div className="text-sm text-gray-600 mt-2">첨부된 예시 파일 형식을 따르세요. 권장 컬럼(예):</div>
        <ul className="text-sm list-disc ml-6 mt-2">
          <li><strong>option_id</strong> 또는 <strong>variant_id</strong>: 옵션 식별자 (필수, 업데이트 매칭용)</li>
          <li><strong>product_id</strong> 또는 <strong>id</strong>: 부모 상품 식별자</li>
          <li><strong>option_name</strong>, <strong>option_value</strong>: 옵션 텍스트</li>
          <li><strong>price</strong> 또는 <strong>selling_price</strong>: 옵션별 가격</li>
          <li><strong>stock</strong> 또는 <strong>variant_stock</strong>: 옵션별 재고</li>
        </ul>

        <div className="mt-3 text-sm text-gray-700">주의: CSV 인코딩(UTF-8)과 쉼표 분리, 날짜 포맷 등을 확인하세요. 실제 반영은 서버 API와 매핑 규칙 도입 후 동작합니다.</div>
      </Card>
    </Container>
  )
}

export default OptionBulkEditPage
