"use client";
import React, { useState } from 'react';
import { Integration } from '../../data/mockIntegrations';

export default function RegisterIntegrationForm({ onClose }: { onClose?: () => void }) {
  const [platform, setPlatform] = useState('cafe24');
  const [storeName, setStoreName] = useState('');
  const [domain, setDomain] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newIntegration: Integration = {
      id: `int-${Date.now()}`,
      platform,
      storeName: storeName || `${platform} store`,
      storeDomain: domain || undefined,
      status: 'disconnected',
      ordersCount: 0,
      itemsCount: 0,
    };
    console.log('Registering (mock):', newIntegration);
    alert('연결이 등록되었습니다. (mock)');
    onClose?.();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">연결 추가</h3>
          <button onClick={() => onClose?.()} className="text-gray-500">닫기</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm text-gray-700">플랫폼</label>
            <select value={platform} onChange={(e) => setPlatform(e.target.value)} className="mt-1 block w-full border px-3 py-2 rounded">
              <option value="cafe24">Cafe24</option>
              <option value="godomall">GodoMall</option>
              <option value="sabangnet">SabangNet</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-700">상점명</label>
            <input value={storeName} onChange={(e) => setStoreName(e.target.value)} className="mt-1 block w-full border px-3 py-2 rounded" />
          </div>

          <div>
            <label className="block text-sm text-gray-700">도메인</label>
            <input value={domain} onChange={(e) => setDomain(e.target.value)} className="mt-1 block w-full border px-3 py-2 rounded" />
          </div>

          <div className="text-right">
            <button type="submit" className="px-3 py-1 bg-primary-600 text-white rounded">등록</button>
          </div>
        </form>
      </div>
    </div>
  );
}
