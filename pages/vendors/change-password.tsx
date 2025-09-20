import React from "react";
import Layout from "@/components/layout/Layout";
import { Container, Card, Button, Input } from "@/design-system";
import { VENDORS } from "../mock-data";

export default function ChangePasswordPage() {
  return (
    <Layout>
      <Container maxWidth="3xl" padding="lg">
        <h1 className="text-2xl font-bold mb-4">비밀번호 수정</h1>
        <Card padding="lg">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">아이디</label>
              <Input value={VENDORS[0].code.toLowerCase()} readOnly />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">비밀번호</label>
              <Input type="password" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">비밀번호 확인</label>
              <Input type="password" />
            </div>
            <div className="pt-4">
              <Button variant="primary">저장</Button>
            </div>
          </div>
        </Card>
      </Container>
    </Layout>
  );
}
