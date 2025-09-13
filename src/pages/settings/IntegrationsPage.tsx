import React, { useState } from 'react';
import Container from '../../design-system/components/Container';
import Card from '../../design-system/components/Card';
import TestPreview from '../../components/integrations/TestPreview';
import ConnectionsList from '../../components/integrations/ConnectionsList';
import AuthForm from '../../components/integrations/AuthForm';
import SecretForm from '../../components/integrations/SecretForm';

export default function IntegrationsPage({ onNavigate }: { onNavigate?: (page: string, id?: string) => void }) {
	const [channel, setChannel] = useState<string>('cafe24');
	const [showCredentials, setShowCredentials] = useState<boolean>(false);

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
			alert(`${channel} 주문 수집 테스트를 실행합니다. (mock)`);
		};

	return (
		<Container maxWidth="full">
					<Card className="mb-6 p-4">
						<div className="flex items-center justify-between">
							<div>
								<h1 className="text-2xl font-bold mb-1">외부 연동 관리</h1>
								<p className="text-gray-600">채널 커넥터 등록, 자격증명 관리 및 연동 테스트</p>
							</div>
							<div className="space-x-2">
								<button className="btn" onClick={handleRunCafe24Test}>{channel} 주문 수집 테스트</button>
							</div>
						</div>

						<div className="mt-4">
							<div className="flex gap-2">
								<button className={`px-3 py-1 rounded ${channel === 'all' ? 'bg-primary-600 text-white' : 'bg-gray-100'}`} onClick={() => setChannel('all')}>All</button>
								<button className={`px-3 py-1 rounded ${channel === 'cafe24' ? 'bg-primary-600 text-white' : 'bg-gray-100'}`} onClick={() => setChannel('cafe24')}>Cafe24</button>
								<button className={`px-3 py-1 rounded ${channel === 'oms-mock' ? 'bg-primary-600 text-white' : 'bg-gray-100'}`} onClick={() => setChannel('oms-mock')}>OMS Mock</button>
								<button className={`px-3 py-1 rounded ${channel === 'custom' ? 'bg-primary-600 text-white' : 'bg-gray-100'}`} onClick={() => setChannel('custom')}>Custom</button>
							</div>
						</div>
					</Card>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<div className="md:col-span-2">
													<Card className="mb-4 p-4">
														<ConnectionsList platform={channel} />
													</Card>
						</div>

						<div>
										<Card className="mb-4 p-4">
											<div className="flex items-center justify-between mb-3">
												<h2 className="text-lg font-medium">인증 / 시크릿</h2>
												<button className="text-sm text-primary-600 underline" onClick={() => setShowCredentials(s => !s)}>{showCredentials ? '숨기기' : '표시'}</button>
											</div>
											{showCredentials && (
												<div className="space-y-4">
													<AuthForm onAuth={handleAuth} />
													<SecretForm onSave={handleSecretSave} />
												</div>
											)}
										</Card>
						</div>
					</div>

					<Card className="mt-6">
						<h2 className="text-lg font-medium mb-3">연동 테스트 프리뷰</h2>
						<TestPreview channel={channel} />
					</Card>
		</Container>
	);
}
