"use client";
import React, { useState } from 'react';

export default function RegisterIntegrationForm({ onClose }: { onClose?: () => void }) {
  const [platform, setPlatform] = useState('cafe24');
  const [shopId, setShopId] = useState('');
  const [storeName, setStoreName] = useState('');
  const [domain, setDomain] = useState('');
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [redirectUri, setRedirectUri] = useState('');
  const [apiBaseUrl, setApiBaseUrl] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [testing, setTesting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = shopId || `shop_${Date.now()}`;
    try {
      const resp = await fetch(`/api/integrations/shops/${id}/credentials`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform,
          name: storeName || `${platform} store`,
          storeDomain: domain || undefined,
          clientId,
          clientSecret,
          redirectUri,
          apiBaseUrl,
          accessToken,
        }),
      });
      const data = await resp.json();
      if (data?.ok) {
        alert('연결이 등록되었습니다.');
        onClose?.();
      } else {
        alert('등록에 실패했습니다');
      }
    } catch (err) {
      console.error(err);
      alert('등록 중 오류가 발생했습니다');
    }
  };

  const handleTestConnection = async () => {
    if (!apiBaseUrl) return alert('API Base URL을 입력하세요');
    setTesting(true);
    try {
      const resp = await fetch('/api/integrations/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiBaseUrl, accessToken, clientId, clientSecret }),
      });
      const data = await resp.json();
      if (data?.ok) alert(`연결 성공 (HTTP ${data.status})`);
      else alert(`연결 실패 (HTTP ${data?.status || 'unknown'})`);
    } catch (err) {
      console.error(err);
      alert('테스트 연결 중 오류가 발생했습니다');
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">새 샵 등록</h3>
          <button onClick={() => onClose?.()} className="text-gray-500">닫기</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm text-gray-700">플랫폼</label>
              <select value={platform} onChange={(e) => setPlatform(e.target.value)} className="mt-1 block w-full border px-3 py-2 rounded">
                <option value="cafe24">Cafe24</option>
                <option value="godomall">GodoMall</option>
                <option value="sabangnet">SabangNet</option>
                <option value="makeshop">MakeShop</option>
                <option value="custom">Custom</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-700">상점 ID (optional)</label>
              <input value={shopId} onChange={(e) => setShopId(e.target.value)} className="mt-1 block w-full border px-3 py-2 rounded" placeholder="shop_cafe24_123" />
            </div>

            <div>
              <label className="block text-sm text-gray-700">상점명</label>
              <input value={storeName} onChange={(e) => setStoreName(e.target.value)} className="mt-1 block w-full border px-3 py-2 rounded" />
            </div>

            <div>
              <label className="block text-sm text-gray-700">도메인</label>
              <input value={domain} onChange={(e) => setDomain(e.target.value)} className="mt-1 block w-full border px-3 py-2 rounded" />
            </div>

            <div>
              <label className="block text-sm text-gray-700">API Base URL</label>
              <input value={apiBaseUrl} onChange={(e) => setApiBaseUrl(e.target.value)} className="mt-1 block w-full border px-3 py-2 rounded" placeholder="https://api.example.com" />
            </div>

            <div>
              <label className="block text-sm text-gray-700">Redirect URI</label>
              <input value={redirectUri} onChange={(e) => setRedirectUri(e.target.value)} className="mt-1 block w-full border px-3 py-2 rounded" placeholder="https://yourapp.com/api/callback" />
            </div>

            <div>
              <label className="block text-sm text-gray-700">Client ID</label>
              <input value={clientId} onChange={(e) => setClientId(e.target.value)} className="mt-1 block w-full border px-3 py-2 rounded" />
            </div>

            <div>
              <label className="block text-sm text-gray-700">Client Secret</label>
              <input value={clientSecret} onChange={(e) => setClientSecret(e.target.value)} className="mt-1 block w-full border px-3 py-2 rounded" />
            </div>

            <div className="col-span-2">
              <label className="block text-sm text-gray-700">Access Token (optional)</label>
              <input value={accessToken} onChange={(e) => setAccessToken(e.target.value)} className="mt-1 block w-full border px-3 py-2 rounded" />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button type="button" className="px-3 py-1 bg-gray-200 rounded" onClick={handleTestConnection} disabled={testing}>{testing ? '테스트중...' : '테스트 연결'}</button>
            <button type="submit" className="px-3 py-1 bg-primary-600 text-white rounded">등록</button>
            <button type="button" className="px-3 py-1 bg-red-200 rounded" onClick={() => onClose?.()}>취소</button>
          </div>
        </form>
      </div>
    </div>
  );
}
