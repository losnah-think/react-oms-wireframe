"use client";
import React, { useState } from 'react';
import { mockCafe24Orders } from '../../data/mockCafe24Orders';

function normalizeCafe24(orders: any[]) {
  // 간단한 normalize 예시
  return orders.map(o => ({
    id: o.orderId,
    code: o.orderCode,
    customer: o.memberId,
    total: o.payment?.amount || 0,
    items: o.items?.map((it: any) => ({ sku: it.productNo, name: it.productName, qty: it.quantity })) || [],
    shipping: o.shipping?.receiverName
  }));
}

export default function TestPreview() {
  const [raw, setRaw] = useState<any[] | null>(null);
  const [normalized, setNormalized] = useState<any[] | null>(null);

  const runTest = () => {
    setRaw(mockCafe24Orders);
    setNormalized(normalizeCafe24(mockCafe24Orders));
  };

  return (
    <div data-testid="ingest-test" className="max-w-3xl mx-auto p-4 border rounded">
      <h2 className="text-lg font-semibold mb-4">주문 수집 테스트</h2>
      <div className="mb-4">
        <label htmlFor="channel" className="block font-medium mb-1">채널 선택</label>
        <select id="channel" name="channel" className="select select-bordered w-full">
          <option>cafe24</option>
        </select>
      </div>
      <div className="mb-4">
        <button className="btn btn-primary" onClick={runTest}>테스트 실행</button>
      </div>
      <div className="flex gap-4 mt-4">
        <div className="w-1/2">
          <h3 className="font-bold mb-2">Raw JSON</h3>
          <pre className="bg-gray-100 p-2 rounded text-xs">{raw ? JSON.stringify(raw, null, 2) : '테스트를 실행하세요.'}</pre>
        </div>
        <div className="w-1/2">
          <h3 className="font-bold mb-2">Normalized JSON</h3>
          <pre className="bg-gray-100 p-2 rounded text-xs">{normalized ? JSON.stringify(normalized, null, 2) : '테스트를 실행하세요.'}</pre>
        </div>
      </div>
    </div>
  );
}
