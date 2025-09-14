"use client";
import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react'

export default function ConnectorsManager() {
  const [shops, setShops] = useState<any[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ shopId: '', clientId: '', clientSecret: '', redirectUri: '', accessToken: '' });
  const [adding, setAdding] = useState(false);
  const [addForm, setAddForm] = useState({ shopId: '', name: '', platform: 'cafe24', clientId: '', accessToken: '' });
  const { data: session } = useSession()
  const role = (session as any)?.user?.role || 'operator'

  useEffect(() => {
    (async () => {
      try {
        const resp = await fetch('/api/integrations/connected-shops')
        const data = await resp.json()
        setShops(data || [])
      } catch (err) {
        console.error(err)
      }
    })()
  }, []);

  const startEdit = async (id: string) => {
    setEditing(id);
    try {
      const resp = await fetch(`/api/integrations/shops/${id}/credentials`)
      const s = await resp.json()
      setForm({ shopId: id, clientId: s.credentials?.clientId || '', clientSecret: s.credentials?.clientSecret || '', redirectUri: s.credentials?.redirectUri || '', accessToken: s.credentials?.accessToken || '' })
    } catch (err) {
      console.error(err)
      setForm({ shopId: id, clientId: '', clientSecret: '', redirectUri: '', accessToken: '' })
    }
  }

  const startAdd = () => {
    setAdding(true)
    setAddForm({ shopId: '', name: '', platform: 'cafe24', clientId: '', accessToken: '' })
  }

  const saveNewShop = async () => {
    if (!addForm.shopId) return alert('shopId required')
    try {
      const resp = await fetch(`/api/integrations/shops/${addForm.shopId}/credentials`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ platform: addForm.platform, name: addForm.name, clientId: addForm.clientId, accessToken: addForm.accessToken }) })
      const data = await resp.json()
      if (data?.ok) {
        const listResp = await fetch('/api/integrations/connected-shops')
        setShops(await listResp.json())
        setAdding(false)
      } else {
        alert('failed to add shop')
      }
    } catch (err) {
      console.error(err)
      alert('failed to add shop')
    }
  }

  const saveCreds = async () => {
    if (!form.shopId) return alert('shopId required')
    try {
      const resp = await fetch(`/api/integrations/shops/${form.shopId}/credentials`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ accessToken: form.accessToken, clientId: form.clientId, clientSecret: form.clientSecret, redirectUri: form.redirectUri }) })
      const data = await resp.json()
      if (data?.ok) {
        const listResp = await fetch('/api/integrations/connected-shops')
        setShops(await listResp.json())
        setEditing(null)
      } else {
        alert('failed to save')
      }
    } catch (err) {
      console.error(err)
      alert('failed to save')
    }
  }

  return (
    <div>
      <h3 className="text-lg font-medium mb-3">연결된 샵</h3>
      <div className="space-y-2">
        {/* top-right fixed button now handles adding new shops */}
        {shops.map(s => (
          <div key={s.id} className="p-3 bg-white rounded shadow-sm flex items-center justify-between">
            <div>
              <div className="font-semibold">{s.name}</div>
              <div className="text-sm text-gray-500">Platform: {s.platform} {s.credentials?.accessToken ? '(connected)' : '(not connected)'}</div>
            </div>
            <div className="flex items-center gap-2">
              {role === 'admin' && <button className="px-3 py-1 bg-blue-600 text-white rounded" onClick={() => startEdit(s.id)}>연결/편집</button>}
              <button className="px-3 py-1 bg-indigo-500 text-white rounded" onClick={async () => {
                try {
                  const clientId = s.credentials?.clientId || ''
                  const resp = await fetch('/api/integrations/cafe24/start', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ shopId: s.id, clientId }) })
                  const data = await resp.json()
                  if (data?.authUrl) window.location.href = data.authUrl
                  else alert('authUrl not returned')
                } catch (err) { console.error(err); alert('failed to start oauth') }
              }}>Connect</button>
            </div>
          </div>
        ))}
      </div>
      
      {adding && (
        <div className="mt-4 p-4 bg-white rounded shadow-sm">
          <h4 className="font-semibold mb-2">새 샵 등록</h4>
          <div className="grid grid-cols-2 gap-2">
            <input placeholder="Shop ID (예: shop_cafe24_1)" value={addForm.shopId} onChange={e => setAddForm(f => ({ ...f, shopId: e.target.value }))} />
            <input placeholder="샵 이름" value={addForm.name} onChange={e => setAddForm(f => ({ ...f, name: e.target.value }))} />
            <select value={addForm.platform} onChange={e => setAddForm(f => ({ ...f, platform: e.target.value }))}>
              <option value="cafe24">Cafe24</option>
              <option value="makeshop">MakeShop</option>
              <option value="smartstore">SmartStore</option>
              <option value="wisa">Wisa</option>
              <option value="godomall">GodoMall</option>
            </select>
            <input placeholder="Client ID (optional)" value={addForm.clientId} onChange={e => setAddForm(f => ({ ...f, clientId: e.target.value }))} />
            <input placeholder="Access Token (optional)" value={addForm.accessToken} onChange={e => setAddForm(f => ({ ...f, accessToken: e.target.value }))} />
          </div>
          <div className="mt-3 flex gap-2">
            <button className="px-3 py-1 bg-green-600 text-white rounded" onClick={saveNewShop}>등록</button>
            <button className="px-3 py-1 bg-red-200 rounded" onClick={() => setAdding(false)}>취소</button>
          </div>
        </div>
      )}
      {editing && (
        <div className="mt-4 p-4 bg-white rounded shadow-sm">
          <h4 className="font-semibold mb-2">{`샾 연결: ${editing}`}</h4>

          <div className="grid grid-cols-2 gap-2">
            <input placeholder="Client ID" value={form.clientId} onChange={e => setForm(f => ({ ...f, clientId: e.target.value }))} />
            <input placeholder="Access Token (optional)" value={form.accessToken} onChange={e => setForm(f => ({ ...f, accessToken: e.target.value }))} />
          </div>

          <div className="mt-3 flex gap-2">
            <button className="px-3 py-1 bg-green-600 text-white rounded" onClick={saveCreds}>저장 (수동 토큰)</button>
            <a
              className="px-3 py-1 bg-gray-200 rounded"
              href="#"
              onClick={async (e) => {
                e.preventDefault();
                if (!form.clientId) return alert('Client ID를 입력하세요')
                try {
                  const resp = await fetch('/api/integrations/cafe24/start', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ shopId: form.shopId, clientId: form.clientId }) })
                  const data = await resp.json()
                  if (data?.authUrl) {
                    window.location.href = data.authUrl
                  } else {
                    alert('authUrl not returned')
                  }
                } catch (err) {
                  console.error(err)
                  alert('failed to start oauth')
                }
              }}
            >OAuth 시작</a>
            <button className="px-3 py-1 bg-red-200 rounded" onClick={() => setEditing(null)}>취소</button>
          </div>

          {/* Admin clientSecret setting moved to /settings/integration-admin */}
        </div>
      )}
    </div>
  )
}
