import React from "react";
import Container from "../../design-system/components/Container";
import Card from "../../design-system/components/Card";
import ConnectorTable from "../../components/integrations/ConnectorTable";
import ConnectorsManager from "../../components/integrations/ConnectorsManager";
import AdminIntegrationLink from "src/components/AdminIntegrationLink";

export default function IntegrationPage() {
  return (
    <Container maxWidth="full">
      <Card className="mb-6">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <div>
            <h1 className="text-2xl font-bold mb-2">
              외부 연동 관리 (Integration)
            </h1>
            <p className="text-gray-600">
              채널 커넥터 관리 및 연동 테스트를 제공합니다.
            </p>
          </div>
          {/* '새 샵 등록' moved to IntegrationsPage component to centralize controls */}
        </div>
      </Card>
      <Card className="mb-6">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <ConnectorsManager />
        </div>
        <AdminIntegrationLink />
      </Card>
      <Card>
        <ConnectorTable />
      </Card>
    </Container>
  );
}
