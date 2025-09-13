
import Container from '../../design-system/components/Container';
import Card from '../../design-system/components/Card';
import ConnectorTable from '../../components/integrations/ConnectorTable';

export default function IntegrationPage() {
  return (
    <Container maxWidth="full">
      <Card className="mb-6">
        <h1 className="text-2xl font-bold mb-4">외부 연동 관리 (Integration)</h1>
        <p className="text-gray-600">채널 커넥터 관리 및 연동 테스트를 제공합니다.</p>
      </Card>
      <Card>
        <ConnectorTable />
      </Card>
    </Container>
  );
}
