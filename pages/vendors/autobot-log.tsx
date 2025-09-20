import React from "react";
import Layout from "@/components/layout/Layout";
import { Container, Card, Button } from "@/design-system";
import { VENDORS } from "@/data/vendorsMock";

export default function AutobotLogPage() {
  return (
    <Layout>
      <Container maxWidth="6xl" padding="lg">
        <h1 className="text-2xl font-bold mb-4">Autobot Log</h1>
        <Card padding="lg">
          <p className="text-sm text-gray-600">자동 동기화/로그 기록을 확인합니다.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button variant="outline">주문입력로그</Button>
            <Button variant="outline">취소주문로그</Button>
            <Button variant="outline">자동발송로그</Button>
            <div className="ml-4 text-sm text-gray-600">판매처: {VENDORS.map((v) => v.name).join(', ')}</div>
          </div>
          <div className="mt-6 text-sm text-gray-500">로그 항목이 없습니다.</div>
        </Card>
      </Container>
    </Layout>
  );
}
