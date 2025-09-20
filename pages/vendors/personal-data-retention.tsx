import React from "react";
import { Container, Card, Button, Input } from "@/design-system";
import Layout from "@/components/layout/Layout";
import { VENDORS } from "@/data/vendorsMock";

export default function PersonalDataRetentionPage() {
  return (
    <Layout>
      <Container maxWidth="4xl" padding="lg">
        <h1 className="text-2xl font-bold mb-4">개인정보보관기간 설정</h1>
        <Card padding="lg">
          <div className="space-y-4">
            <p className="text-sm text-gray-600">판매처별로 개인정보 파기 기준과 기간을 설정합니다.</p>
            <table className="w-full table-auto text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left">사이트 코드</th>
                  <th className="px-3 py-2 text-left">판매처 사이트</th>
                  <th className="px-3 py-2 text-left">기간(년)</th>
                </tr>
              </thead>
              <tbody>
                {VENDORS.map((v, idx) => (
                  <tr key={v.id} className="border-t">
                    <td className="px-3 py-2">{1000 + idx * 10}</td>
                    <td className="px-3 py-2">{v.name}</td>
                    <td className="px-3 py-2"><Input value="5" /></td>
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
