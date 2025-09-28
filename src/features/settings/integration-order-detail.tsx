import React, { useEffect, useState } from "react";
import { mockCafe24Orders } from "../../data/mockCafe24Orders";
import Container from "../../design-system/components/Container";
import Card from "../../design-system/components/Card";

export default function IntegrationOrderDetail({
  orderId: propOrderId,
}: {
  orderId?: string;
}) {
  const [orderId, setOrderId] = useState<string | null>(propOrderId || null);
  const [order, setOrder] = useState<any | null>(null);

  useEffect(() => {
    if (propOrderId) {
      setOrderId(propOrderId);
    } else {
      const params = new URLSearchParams(window.location.search);
      const id = params.get("orderId");
      setOrderId(id);
    }
  }, [propOrderId]);

  useEffect(() => {
    if (orderId) {
      const found = mockCafe24Orders.find((o) => o.orderId === orderId);
      setOrder(found || null);
    }
  }, [orderId]);

  return (
    <Container maxWidth="md">
      <Card className="p-4">
        <h1 className="text-xl font-bold mb-3">주문 상세</h1>
        {!orderId && <div>orderId 쿼리 파라미터가 필요합니다.</div>}
        {orderId && !order && (
          <div>해당 주문을 찾을 수 없습니다: {orderId}</div>
        )}
        {order && (
          <div className="space-y-3">
            <div>
              <strong>주문번호:</strong> {order.orderId}
            </div>
            <div>
              <strong>주문코드:</strong> {order.orderCode}
            </div>
            <div>
              <strong>회원:</strong> {order.memberId}
            </div>
            <div>
              <strong>상태:</strong> {order.orderStatus}
            </div>
            <div>
              <strong>주문일:</strong> {order.orderDate}
            </div>
            <div>
              <strong>수령인:</strong> {order.shipping.receiverName}
            </div>
            <div>
              <strong>결제금액:</strong> {order.payment.amount.toLocaleString()}
              원
            </div>
            <div>
              <strong>아이템:</strong>
              <ul className="list-disc ml-6">
                {order.items.map((it: any) => (
                  <li key={it.productNo}>
                    {it.productName} x {it.quantity} ({it.price}원)
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </Card>
    </Container>
  );
}
