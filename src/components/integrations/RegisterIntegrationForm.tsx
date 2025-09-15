"use client";
import React, { useState } from 'react';
import { mockShops } from '../../data/mockShops';

type Props = { onClose?: () => void };

export default function RegisterIntegrationForm({ onClose }: Props) {
  const [platform, setPlatform] = useState('cafe24');
  const [shopId, setShopId] = useState('');
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = shopId?.trim();
    if (!id) return alert('상점 ID를 입력해주세요');
    if (!clientId.trim()) return alert('Client ID를 입력해주세요');

    try {
      const resp = await fetch(`/api/integrations/shops/${encodeURIComponent(id)}/credentials`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform, clientId: clientId.trim(), clientSecret: clientSecret.trim() }),
      });
      const body = await resp.json();
      if (body?.ok) {
        alert('샵이 등록되었습니다');
        onClose?.();
      } else alert('등록에 실패했습니다');
    } catch (err) {
      console.error(err);
      alert('등록 중 오류가 발생했습니다');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">새 샵 등록</h3>
          <button onClick={() => onClose?.()} className="text-gray-500">닫기</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-700">플랫폼</label>
            <select value={platform} onChange={(e) => setPlatform(e.target.value)} className="mt-1 block w-full border px-3 py-2 rounded">
              <option value="cafe24">Cafe24</option>
              <option value="makeshop">MakeShop</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-700">상점 ID</label>
            <input value={shopId} onChange={(e) => setShopId(e.target.value)} className="mt-1 block w-full border px-3 py-2 rounded" placeholder="상점 ID 입력" />
          </div>

          <div>
            <label className="block text-sm text-gray-700">Client ID</label>
            <input value={clientId} onChange={(e) => setClientId(e.target.value)} className="mt-1 block w-full border px-3 py-2 rounded" />
          </div>

          <div>
            <label className="block text-sm text-gray-700">Client Secret</label>
            <input value={clientSecret} onChange={(e) => setClientSecret(e.target.value)} className="mt-1 block w-full border px-3 py-2 rounded" />
          </div>

          <div className="flex justify-end gap-2">
            <button type="submit" className="px-3 py-1 bg-primary-600 text-white rounded">등록</button>
            <button type="button" className="px-3 py-1 bg-red-200 rounded" onClick={() => onClose?.()}>취소</button>
          </div>
        </form>
      </div>
    </div>
  );
}
