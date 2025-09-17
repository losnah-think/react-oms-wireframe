"use client";
import React, { useState } from 'react';

export default function RegisterIntegrationForm({ onClose, onRegistered }: { onClose?: () => void, onRegistered?: (integration: any) => void }) {
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

  // platform-specific field configuration
  const platformFields: Record<string, { key: string; label: string; placeholder?: string; required?: boolean; type?: string }[]> = {
    cafe24: [
      { key: 'shopId', label: '상점 ID', required: true, placeholder: 'shop_cafe24_123' },
      { key: 'clientId', label: 'Client ID', required: true },
      { key: 'clientSecret', label: 'Client Secret', required: true },
    ],
    godomall: [
      { key: 'storeName', label: '상점명', required: true },
      { key: 'domain', label: '도메인' },
      { key: 'apiBaseUrl', label: 'API Base URL' },
      { key: 'accessToken', label: 'Access Token' },
    ],
    sabangnet: [
      { key: 'storeName', label: '상점명', required: true },
      { key: 'apiBaseUrl', label: 'API Base URL' },
      { key: 'clientId', label: 'Client ID' },
      { key: 'clientSecret', label: 'Client Secret' },
    ],
    makeshop: [
      { key: 'storeName', label: '상점명', required: true },
      { key: 'apiBaseUrl', label: 'API Base URL' },
      { key: 'accessToken', label: 'Access Token' },
    ],
    custom: [
      { key: 'storeName', label: '상점명', required: true },
      { key: 'apiBaseUrl', label: 'API Base URL', required: true, placeholder: 'https://api.example.com' },
      { key: 'redirectUri', label: 'Redirect URI' },
      { key: 'clientId', label: 'Client ID' },
      { key: 'clientSecret', label: 'Client Secret' },
      { key: 'accessToken', label: 'Access Token (optional)' },
    ],
  };

  const activeFields = platformFields[platform] || platformFields['custom'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // validate only active fields
    for (const f of activeFields) {
      if (f.required) {
        const val = (() => {
          switch (f.key) {
            case 'storeName': return storeName
            case 'domain': return domain
            case 'apiBaseUrl': return apiBaseUrl
            case 'redirectUri': return redirectUri
            case 'clientId': return clientId
            case 'clientSecret': return clientSecret
            case 'accessToken': return accessToken
            case 'shopId': return shopId
            default: return ''
          }
        })();
        if (!val || String(val).trim() === '') return alert(`${f.label}을(를) 입력하세요`);
      }
    }

    const id = shopId || `shop_${Date.now()}`;
    const payload: any = { platform };
    // include only visible fields
    for (const f of activeFields) {
      const key = f.key;
      switch (key) {
        case 'storeName': if (storeName) payload.name = storeName; break;
        case 'domain': if (domain) payload.storeDomain = domain; break;
        case 'apiBaseUrl': if (apiBaseUrl) payload.apiBaseUrl = apiBaseUrl; break;
        case 'redirectUri': if (redirectUri) payload.redirectUri = redirectUri; break;
        case 'clientId': if (clientId) payload.clientId = clientId; break;
        case 'clientSecret': if (clientSecret) payload.clientSecret = clientSecret; break;
        case 'accessToken': if (accessToken) payload.accessToken = accessToken; break;
        case 'shopId': if (shopId) payload.shopId = shopId; break;
        default: break;
      }
    }

    try {
      const resp = await fetch(`/api/integrations/shops/${id}/credentials`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await resp.json();
      if (data?.ok) {
        alert('연결이 등록되었습니다.');
        try { onRegistered?.({ id, platform, ...payload }) } catch (e) {}
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

            {/* shopId is rendered as part of activeFields when required (e.g. cafe24) */}

            {/* render platform-specific fields */}
            {activeFields.map((f) => (
              <div key={f.key}>
                <label className="block text-sm text-gray-700">{f.label}</label>
                <input
                  value={(() => {
                    switch (f.key) {
                      case 'storeName': return storeName
                      case 'shopId': return shopId
                      case 'domain': return domain
                      case 'apiBaseUrl': return apiBaseUrl
                      case 'redirectUri': return redirectUri
                      case 'clientId': return clientId
                      case 'clientSecret': return clientSecret
                      case 'accessToken': return accessToken
                      default: return ''
                    }
                  })()}
                  onChange={(e) => {
                    const v = e.target.value
                    switch (f.key) {
                      case 'shopId': return setShopId(v)
                      case 'storeName': return setStoreName(v)
                      case 'domain': return setDomain(v)
                      case 'apiBaseUrl': return setApiBaseUrl(v)
                      case 'redirectUri': return setRedirectUri(v)
                      case 'clientId': return setClientId(v)
                      case 'clientSecret': return setClientSecret(v)
                      case 'accessToken': return setAccessToken(v)
                      default: return
                    }
                  }}
                  placeholder={f.placeholder || ''}
                  className="mt-1 block w-full border px-3 py-2 rounded"
                />
              </div>
            ))}
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
