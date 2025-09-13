import React from 'react';
import Container from '../../design-system/components/Container';
import Card from '../../design-system/components/Card';
import ConnectorTable from '../../components/integrations/ConnectorTable';
import TestPreview from '../../components/integrations/TestPreview';
import AuthForm from '../../components/integrations/AuthForm';
import SecretForm from '../../components/integrations/SecretForm';

export default function IntegrationsPage() {
	const handleAuth = (data: { clientId: string; clientSecret: string }) => {
		console.log('Auth saved', data);
		alert('인증 정보가 저장되었습니다. (mock)');
	};

	const handleSecretSave = (data: { key: string; value: string }) => {
		console.log('Secret saved', data);
		alert('시크릿이 저장되었습니다. (mock)');
	};

	const handleRunCafe24Test = async () => {
		// mock: 실제로는 API 호출을 여기서 수행
		alert('Cafe24 주문 수집 테스트를 실행합니다. (mock)');
	};

	return (
		<Container maxWidth="full">
			<Card className="mb-6">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-2xl font-bold mb-1">외부 연동 관리</h1>
						<p className="text-gray-600">채널 커넥터 등록, 자격증명 관리 및 연동 테스트</p>
					</div>
					<div className="space-x-2">
						<button className="btn" onClick={handleRunCafe24Test}>Cafe24 주문 수집 테스트</button>
					</div>
				</div>
			</Card>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<div className="md:col-span-2">
							<Card className="mb-4 p-4">
								<ConnectorTable />
							</Card>
						</div>

						<div>
							<Card className="mb-4 p-4">
								<h2 className="text-lg font-medium mb-3">인증 정보</h2>
								<AuthForm onAuth={handleAuth} />
							</Card>

							<Card className="p-4">
								<h2 className="text-lg font-medium mb-3">시크릿 관리</h2>
								<SecretForm onSave={handleSecretSave} />
							</Card>
						</div>
					</div>

			<Card className="mt-6">
				<h2 className="text-lg font-medium mb-3">연동 테스트 프리뷰</h2>
				<TestPreview />
			</Card>
		</Container>
	);
}
