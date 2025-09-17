import React from 'react'

export default function SupplierDrawer({ open=false, supplier=null, onClose=()=>{}, onSave=(v:any)=>{} }:{ open?:boolean, supplier?:any, onClose?: ()=>void, onSave?: (v:any)=>void }){
  const [local, setLocal] = React.useState<any>(supplier)
  React.useEffect(()=> setLocal(supplier), [supplier])
  if (!open) return null
  return (
    <div className="fixed inset-0 z-40 flex">
      <div className="flex-1" onClick={onClose} />
      <div className="w-full max-w-md bg-white shadow-xl p-4 overflow-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold">{supplier?.name ?? '새 공급처'}</h3>
          <button onClick={onClose} aria-label="닫기">✕</button>
        </div>
        <form onSubmit={(e)=>{ e.preventDefault(); onSave(local) }}>
          <div className="space-y-3">
            <label className="block text-sm">공급처명</label>
            <input className="w-full px-3 py-2 border rounded" value={local?.name||''} onChange={(e)=>setLocal({...local, name: e.target.value})} />
            <label className="block text-sm">담당자</label>
            <input className="w-full px-3 py-2 border rounded" value={local?.contact?.person||''} onChange={(e)=>setLocal({...local, contact: {...(local.contact||{}), person: e.target.value}})} />
            <label className="block text-sm">연락처</label>
            <input className="w-full px-3 py-2 border rounded" value={local?.contact?.phone||''} onChange={(e)=>setLocal({...local, contact: {...(local.contact||{}), phone: e.target.value}})} />
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-3 py-1 border rounded">취소</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">저장</button>
          </div>
        </form>
      </div>
    </div>
  )
}
