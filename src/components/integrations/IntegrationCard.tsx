"use client";
import React from "react";
import { Integration } from "../../data/mockIntegrations";

export default function IntegrationCard({
  integration,
  onOpenSecret,
  onOpenDetail,
  onOpenIntervals,
}: {
  integration: Integration;
  onOpenSecret?: (s: { key: string; value: string }[]) => void;
  onOpenDetail?: (integration: Integration) => void;
  onOpenIntervals?: (integration: Integration) => void;
}) {
  const statusColor = {
    connected: "text-green-600 bg-green-50",
    disconnected: "text-gray-600 bg-gray-50",
    error: "text-red-600 bg-red-50",
    syncing: "text-yellow-600 bg-yellow-50",
  }[integration.status];

  return (
    <div className="p-4 bg-white rounded shadow-sm border">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded bg-gray-100 flex items-center justify-center text-sm font-semibold">
            {integration.platform.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="font-medium">{integration.storeName}</div>
            <div className="text-xs text-gray-500">
              {integration.storeDomain || integration.platform}
            </div>
            <div className="text-xs text-gray-400">
              Last sync: {integration.lastSync ?? "-"}
            </div>
          </div>
        </div>

        <div className="text-right">
          <div
            className={`inline-flex px-2 py-1 text-xs rounded ${statusColor}`}
          >
            {integration.status}
          </div>
          <div className="text-sm mt-2">주문 {integration.ordersCount}</div>
          <div className="text-xs text-gray-500">
            품목 {integration.itemsCount}
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="flex space-x-2">
          <button
            className="px-3 py-1 border rounded text-sm"
            onClick={() => onOpenDetail?.(integration)}
            aria-label={`open-detail-${integration.id}`}
          >
            상세
          </button>
          {integration.secrets && integration.secrets.length > 0 && (
            <button
              className="px-3 py-1 border rounded text-sm"
              onClick={() => onOpenSecret?.(integration.secrets ?? [])}
              aria-label={`open-secret-${integration.id}`}
            >
              시크릿 보기
            </button>
          )}
          <button
            className="px-3 py-1 border rounded text-sm"
            onClick={() => onOpenIntervals?.(integration)}
            aria-label={`open-intervals-${integration.id}`}
          >
            수집 주기
          </button>
        </div>
        <div>
          <button className="px-3 py-1 bg-primary-600 text-white rounded text-sm">
            동기화
          </button>
        </div>
      </div>
    </div>
  );
}
