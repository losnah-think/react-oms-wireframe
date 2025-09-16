"use client";
import React, { useEffect, useState } from 'react';
import { Cafe24Order } from '../../lib/types/cafe24';

type ConnectorTableProps = {
  onDetail?: (orderId: string) => void;
  channel?: string;
};
export default function ConnectorTable({ onDetail, channel }: ConnectorTableProps) {
  const [orders, setOrders] = useState<Cafe24Order[]>([]);
  useEffect(() => {
    let mounted = true
    fetch('/api/integrations/cafe24/orders')
      .then((r) => r.json())
      .then((body) => {
        if (!mounted) return
        setOrders(body.orders || [])
      })
      .catch(() => {
        // leave empty
      })
    return () => { mounted = false }
  }, []);
  // compute summary stats
  const orderCount = orders.length;
  const totalItems = orders.reduce((sum, o) => sum + o.items.reduce((s, it) => s + (it.quantity || 0), 0), 0);
  const uniqueProducts = new Set(orders.flatMap(o => o.items.map(i => i.productNo))).size;

  return (
    <div>
      <div className="mb-3">
        <h3 className="text-md font-semibold">연동 요약 {channel ? `- ${channel}` : ''}</h3>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded shadow-sm">
          <div className="text-sm text-gray-500">수집된 주문</div>
          <div className="text-2xl font-bold">{orderCount}</div>
        </div>
        <div className="p-4 bg-white rounded shadow-sm">
          <div className="text-sm text-gray-500">수집된 상품 수량</div>
          <div className="text-2xl font-bold">{totalItems}</div>
        </div>
        <div className="p-4 bg-white rounded shadow-sm">
          <div className="text-sm text-gray-500">고유 상품 종류</div>
          <div className="text-2xl font-bold">{uniqueProducts}</div>
        </div>
      </div>
    </div>
  );
}
