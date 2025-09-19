import React from 'react'
import EntityToolbar from '../../common/entity/EntityToolbar'

export default function SuppliersToolbar({ total = 0, q = '', onChangeQ = () => {}, onAdd = () => {}, onExport = () => {} }:{ total?:number, q?:string, onChangeQ?: (v:string)=>void, onAdd?: ()=>void, onExport?: ()=>void }){
  return (
    <EntityToolbar title="공급처 관리" total={total} q={q} onChangeQ={onChangeQ} onAdd={onAdd} onExport={onExport} />
  )
}
