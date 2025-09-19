import React from 'react'

type Column<T> = {
  key: string
  label: string
  render?: (item:T)=>React.ReactNode
}

type Props<T> = {
  items?: T[]
  columns: Column<T>[]
  onOpen?: (id:string)=>void
  onDelete?: (id:string)=>void
}

export default function EntityTable<T extends {id?: string}>({ items = [], columns, onOpen = ()=>{}, onDelete = ()=>{} }:Props<T>){
  return (
    <div className="overflow-auto bg-white border rounded">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50 border-b">
          <tr>
            {columns.map(c=> (
              <th key={c.key} className="px-4 py-3 text-left">{c.label}</th>
            ))}
            <th className="px-4 py-3 text-right">액션</th>
          </tr>
        </thead>
        <tbody>
          {(items||[]).map((it:any) => (
            <tr key={it.id} className="hover:bg-gray-50 border-b">
              {columns.map(c => (
                <td key={c.key} className="px-4 py-3">{c.render ? c.render(it) : (it[c.key] ?? '-')}</td>
              ))}
              <td className="px-4 py-3 text-right">
                <button className="px-2 py-1 mr-2" onClick={()=>onOpen(it.id)}>보기</button>
                <button className="px-2 py-1 text-red-600" onClick={()=>onDelete(it.id)}>삭제</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
