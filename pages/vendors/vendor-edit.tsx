import React from "react";
import Layout from "@/components/layout/Layout";
import { Container, Card, Button, Input } from "@/design-system";
import { VENDORS } from "@/data/vendorsMock";

export default function VendorEditPage() {
  return (
    <Layout>
      <Container maxWidth="6xl" padding="lg">
        <h1 className="text-2xl font-bold mb-4">판매처 수정</h1>
        <Card padding="lg">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">판매처 사이트</label>
              <Input value={VENDORS[2].name} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">로그인 아이디</label>
                <Input value="techtaka" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">로그인 비밀번호</label>
                <Input type="password" />
              </div>
            </div>
            <div className="pt-4 flex justify-end">
              <Button variant="danger">삭제</Button>
              <Button variant="primary" className="ml-2">수정</Button>
            </div>
          </div>
        </Card>
      </Container>
    </Layout>
  );
}
