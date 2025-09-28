"use client";
import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react'
import { mockVendors } from '../../data/mockVendors';

export default function ConnectorsManager() {
  const [shops, setShops] = useState<any[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ shopId: '', clientId: '', clientSecret: '', redirectUri: '', accessToken: '' });
  const [adding, setAdding] = useState(false);
  const [addForm, setAddForm] = useState({ vendorId: '', shopId: '', name: '', platform: 'cafe24', clientId: '', accessToken: '' });
  const [revealSecret, setRevealSecret] = useState<{[k:string]: boolean}>({});
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
    setAddForm({ vendorId: '', shopId: '', name: '', platform: 'cafe24', clientId: '', accessToken: '' })
  }

  const saveNewShop = async () => {
    if (!addForm.vendorId && !addForm.shopId) return alert('거래처를 선택하거나 Shop ID를 입력하세요')
    
    // 거래처가 선택된 경우 해당 거래처 정보를 사용
    let shopData = { ...addForm };
    if (addForm.vendorId) {
      const selectedVendor = mockVendors.find(v => v.id === addForm.vendorId);
      if (selectedVendor) {
        shopData.shopId = addForm.shopId || `${selectedVendor.platform.toLowerCase()}_${selectedVendor.id}`;
        shopData.name = addForm.name || selectedVendor.name;
        shopData.platform = addForm.platform || selectedVendor.platform.toLowerCase();
      }
    }
    
    if (!shopData.shopId) return alert('Shop ID가 필요합니다')
    
    try {
      const resp = await fetch(`/api/integrations/shops/${shopData.shopId}/credentials`, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ 
          platform: shopData.platform, 
          name: shopData.name, 
          clientId: shopData.clientId, 
          accessToken: shopData.accessToken 
        }) 
      })
      const data = await resp.json()
      if (data?.ok) {
        const listResp = await fetch('/api/integrations/connected-shops')
        setShops(await listResp.json())
        setAdding(false)
      } else {
        alert('샵 등록에 실패했습니다')
      }
    } catch (err) {
      console.error(err)
      alert('샵 등록에 실패했습니다')
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
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-medium">연결된 샵</h3>
        <button 
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={startAdd}
        >
          새 샵 등록
        </button>
      </div>
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
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">거래처 선택 (선택사항)</label>
              <select 
                value={addForm.vendorId} 
                onChange={e => {
                  const vendorId = e.target.value;
                  setAddForm(f => ({ ...f, vendorId }));
                  
                  // 거래처 선택 시 자동으로 정보 채우기
                  if (vendorId) {
                    const selectedVendor = mockVendors.find(v => v.id === vendorId);
                    if (selectedVendor) {
                      setAddForm(f => ({
                        ...f,
                        vendorId,
                        shopId: `${selectedVendor.platform.toLowerCase()}_${selectedVendor.id}`,
                        name: selectedVendor.name,
                        platform: selectedVendor.platform.toLowerCase()
                      }));
                    }
                  } else {
                    // 거래처 선택 해제 시 초기화
                    setAddForm(f => ({
                      ...f,
                      vendorId: '',
                      shopId: '',
                      name: '',
                      platform: 'cafe24'
                    }));
                  }
                }}
                className="w-full border px-3 py-2 rounded"
              >
                <option value="">직접 입력</option>
                {mockVendors.map(vendor => (
                  <option key={vendor.id} value={vendor.id}>
                    {vendor.name} ({vendor.platform})
                  </option>
                ))}
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Shop ID</label>
                <input 
                  placeholder="Shop ID (예: shop_cafe24_1)" 
                  value={addForm.shopId} 
                  onChange={e => setAddForm(f => ({ ...f, shopId: e.target.value }))} 
                  className="w-full border px-3 py-2 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">샵 이름</label>
                <input 
                  placeholder="샵 이름" 
                  value={addForm.name} 
                  onChange={e => setAddForm(f => ({ ...f, name: e.target.value }))} 
                  className="w-full border px-3 py-2 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">플랫폼</label>
                <select 
                  value={addForm.platform} 
                  onChange={e => setAddForm(f => ({ ...f, platform: e.target.value }))}
                  className="w-full border px-3 py-2 rounded"
                >
                  <option value="cafe24">Cafe24</option>
                  <option value="makeshop">MakeShop</option>
                  <option value="smartstore">SmartStore</option>
                  <option value="wisa">Wisa</option>
                  <option value="godomall">GodoMall</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Client ID (선택)</label>
                <input 
                  placeholder="Client ID" 
                  value={addForm.clientId} 
                  onChange={e => setAddForm(f => ({ ...f, clientId: e.target.value }))} 
                  className="w-full border px-3 py-2 rounded"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Access Token (선택)</label>
              <input 
                placeholder="Access Token" 
                value={addForm.accessToken} 
                onChange={e => setAddForm(f => ({ ...f, accessToken: e.target.value }))} 
                className="w-full border px-3 py-2 rounded"
              />
            </div>
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

          <div className="mt-2">
            <label className="block text-sm text-gray-700">Client Secret</label>
            <div className="flex gap-2 mt-1">
              <input className="flex-1 border px-3 py-2 rounded" value={revealSecret[form.shopId || 'current'] ? form.clientSecret : (form.clientSecret ? '••••••••' : '')} onChange={e => setForm(f => ({ ...f, clientSecret: e.target.value }))} />
              <button className="px-3 py-1 bg-gray-100 rounded" onClick={() => setRevealSecret(s => ({ ...s, [form.shopId || 'current']: !s[form.shopId || 'current'] }))}>{revealSecret[form.shopId || 'current'] ? '숨기기' : '보기'}</button>
            </div>
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
            <button className="px-3 py-1 bg-gray-200 rounded" onClick={async () => {
              try {
                const apiBase = form.redirectUri || form.accessToken || ''
                const resp = await fetch('/api/integrations/test-connection', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ apiBaseUrl: apiBase, accessToken: form.accessToken }) })
                const data = await resp.json()
                if (data?.ok) alert('테스트 연결 성공')
                else alert('테스트 연결 실패')
              } catch (err) { console.error(err); alert('테스트 실패') }
            }}>테스트 연결</button>
            <button className="px-3 py-1 bg-red-200 rounded" onClick={() => setEditing(null)}>취소</button>
          </div>

          {/* Admin clientSecret setting moved to /settings/integration-admin */}
        </div>
      )}
    </div>
  )
}
