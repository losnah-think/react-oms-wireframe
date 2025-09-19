import React from 'react'

type Props = {
  title?: string
  total?: number
  q?: string
  onChangeQ?: (v:string)=>void
  onAdd?: ()=>void
  onExport?: ()=>void
}

export default function EntityToolbar({ title='항목 관리', total=0, q='', onChangeQ=()=>{}, onAdd=()=>{}, onExport=()=>{} }:Props){
  return (
    <div className="flex items-center justify-between gap-4 mb-4">
      <div>
        <h2 className="text-xl font-semibold">{title}</h2>
        <div className="text-sm text-gray-500">총 <span className="font-medium text-blue-600">{total}</span>개</div>
      </div>
      <div className="flex items-center gap-2">
        <input value={q} onChange={(e)=>onChangeQ(e.target.value)} placeholder="검색" className="px-3 py-2 border rounded-md w-64" aria-label="검색" />
        <button className="px-3 py-2 bg-white border rounded" onClick={onExport}>CSV</button>
        <button className="px-3 py-2 bg-blue-600 text-white rounded" onClick={onAdd}>+ 추가</button>
      </div>
    </div>
  )
}
