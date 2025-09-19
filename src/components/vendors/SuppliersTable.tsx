import React from 'react'
import EntityTable from '../common/entity/EntityTable'

export default function SuppliersTable({ items = [], onOpen = (id:string)=>{}, onDelete = (id:string)=>{} }:{ items?: any[], onOpen?: (id:string)=>void, onDelete?: (id:string)=>void }){
  const columns = [
    { key: 'name', label: '공급처', render: (s:any) => (<div>{s.name}<div className="text-xs text-gray-500">{s.code}</div></div>) },
    { key: 'contact_person', label: '담당자', render: (s:any) => (s.contact?.person || '-') },
    { key: 'contact_phone', label: '연락처', render: (s:any) => (s.contact?.phone || '-') },
    { key: 'status', label: '상태', render: (s:any) => s.status },
  ]

  return (
    <EntityTable items={items} columns={columns} onOpen={onOpen} onDelete={onDelete} />
  )
}
