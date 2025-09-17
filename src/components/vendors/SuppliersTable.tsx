import React from 'react'

export default function SuppliersTable({ items = [], onOpen = (id:string)=>{}, onDelete = (id:string)=>{} }:{ items?: any[], onOpen?: (id:string)=>void, onDelete?: (id:string)=>void }){
  return (
    <div className="overflow-auto bg-white border rounded">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="px-4 py-3 text-left">공급처</th>
            <th className="px-4 py-3 text-left">담당자</th>
            <th className="px-4 py-3 text-left">연락처</th>
            <th className="px-4 py-3 text-left">상태</th>
            <th className="px-4 py-3 text-right">액션</th>
          </tr>
        </thead>
        <tbody>
          {(items||[]).map((s:any) => (
            <tr key={s.id} className="hover:bg-gray-50 border-b">
              <td className="px-4 py-3">{s.name} <div className="text-xs text-gray-500">{s.code}</div></td>
              <td className="px-4 py-3">{s.contact?.person || '-'}</td>
              <td className="px-4 py-3">{s.contact?.phone || '-'}</td>
              <td className="px-4 py-3">{s.status}</td>
              <td className="px-4 py-3 text-right">
                <button className="px-2 py-1 mr-2" onClick={()=>onOpen(s.id)}>보기</button>
                <button className="px-2 py-1 text-red-600" onClick={()=>onDelete(s.id)}>삭제</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
