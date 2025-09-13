"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { mockCafe24Orders } from '../../data/mockCafe24Orders';
import { Cafe24Order } from '../../lib/types/cafe24';

export default function ConnectorTable() {
  const [orders, setOrders] = useState<Cafe24Order[]>([]);

  useEffect(() => {
    setOrders(mockCafe24Orders);
  }, []);

  return (
    <div data-testid="connectors-table" className="overflow-x-auto max-w-full">
      <table className="min-w-[800px] w-full table-auto border-collapse text-sm">
        <thead className="sticky top-0 bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left">주문 ID</th>
            <th className="px-4 py-2 text-left">주문 코드</th>
            <th className="px-4 py-2 text-left">회원</th>
            <th className="px-4 py-2 text-left">상태</th>
            <th className="px-4 py-2 text-left">일시</th>
            <th className="px-4 py-2 text-left">아이템</th>
            <th className="px-4 py-2 text-left">수령인</th>
            <th className="px-4 py-2 text-right">금액</th>
            <th className="px-4 py-2 text-center">액션</th>
          </tr>
        </thead>
        <tbody>
          {orders.length === 0 ? (
            <tr>
              <td colSpan={9} className="text-center py-8 text-gray-400">주문 데이터가 없습니다.</td>
            </tr>
          ) : (
            orders.map((order: Cafe24Order) => (
              <tr key={order.orderId} className="bg-white hover:bg-gray-50 border-b">
                <td className="px-4 py-3">{order.orderId}</td>
                <td className="px-4 py-3">{order.orderCode}</td>
                <td className="px-4 py-3">{order.memberId}</td>
                <td className="px-4 py-3">{order.orderStatus}</td>
                <td className="px-4 py-3">{order.orderDate}</td>
                <td className="px-4 py-3">
                  {order.items.map((item: Cafe24Order['items'][number]) => `${item.productName}(${item.quantity})`).join(', ')}
                </td>
                <td className="px-4 py-3">{order.shipping.receiverName}</td>
                <td className="px-4 py-3 text-right">{order.payment.amount.toLocaleString()}원</td>
                <td className="px-4 py-3 text-center">
                  <Link href={`/settings/integrations/orderDetail?orderId=${order.orderId}`} className="inline-block px-3 py-1 text-sm bg-primary-600 text-white rounded">상세</Link>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
