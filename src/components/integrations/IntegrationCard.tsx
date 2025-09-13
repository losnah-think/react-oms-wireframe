"use client";
import React from 'react';
import { Integration } from '../../data/mockIntegrations';

export default function IntegrationCard({ integration, onOpen }: { integration: Integration; onOpen?: (id: string) => void }) {
  const statusColor = {
    connected: 'text-green-600 bg-green-50',
    disconnected: 'text-gray-600 bg-gray-50',
    error: 'text-red-600 bg-red-50',
    syncing: 'text-yellow-600 bg-yellow-50',
  }[integration.status];

  return (
    <div className="flex items-center justify-between p-4 bg-white rounded shadow-sm">
      <div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center text-sm font-semibold">{integration.platform.slice(0,2).toUpperCase()}</div>
          <div>
            <div className="font-medium">{integration.storeName}</div>
            <div className="text-xs text-gray-500">{integration.storeDomain || integration.platform}</div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className={`px-2 py-1 text-xs rounded ${statusColor}`}>{integration.status}</div>
        <div className="text-right text-sm">
          <div>주문 {integration.ordersCount}</div>
          <div className="text-xs text-gray-500">품목 {integration.itemsCount}</div>
        </div>
        <div>
          <button className="px-3 py-1 border rounded text-sm" onClick={() => onOpen?.(integration.id)}>상세</button>
        </div>
      </div>
    </div>
  );
}
