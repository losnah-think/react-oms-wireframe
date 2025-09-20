import React from "react";
import Layout from "@/components/layout/Layout";
import { Container, Card, Button } from "@/design-system";
import { VENDORS } from "../mock-data";

export default function RealtimeSettingsPage() {
  return (
    <Layout>
      <Container maxWidth="6xl" padding="lg">
        <h1 className="text-2xl font-bold mb-4">실시간 판매처 설정</h1>
        <Card padding="lg">
          <p className="text-sm text-gray-600">판매처별 실시간 수집/발송 등 설정을 관리합니다.</p>
          <div className="mt-4 overflow-auto">
            <table className="w-full table-auto text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2">판매처명</th>
                  <th className="px-3 py-2">주문수집</th>
                  <th className="px-3 py-2">취소주문</th>
                  <th className="px-3 py-2">발송하기</th>
                  <th className="px-3 py-2">비고</th>
                </tr>
              </thead>
              <tbody>
                {VENDORS.map((v) => (
                  <tr key={v.id} className="border-t">
                    <td className="px-3 py-2">{v.name}</td>
                    <td className="px-3 py-2">사용안함</td>
                    <td className="px-3 py-2">사용안함</td>
                    <td className="px-3 py-2">사용안함</td>
                    <td className="px-3 py-2">-</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="pt-4">
              <Button variant="primary">저장</Button>
            </div>
          </div>
        </Card>
      </Container>
    </Layout>
  );
}
