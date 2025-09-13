import React from 'react'
let XLSX: any
try { XLSX = require('xlsx') } catch (e) { XLSX = null }

export default function TableExportButton({ data, fileName = 'export.xlsx', sheetName = 'Sheet1' }: { data: any[]; fileName?: string; sheetName?: string }) {
  const handleExport = () => {
    if (!XLSX) return alert('xlsx 라이브러리가 설치되어 있지 않습니다. npm install xlsx 필요')
    try {
      const ws = XLSX.utils.json_to_sheet(data || [])
      const wb = { SheetNames: [sheetName], Sheets: { [sheetName]: ws } }
      XLSX.writeFile(wb, fileName)
    } catch (e) {
      console.error(e)
      alert('내보내기 중 오류가 발생했습니다.')
    }
  }

  return (
    <button onClick={handleExport} className="px-3 py-1 border rounded text-sm">내보내기</button>
  )
}
