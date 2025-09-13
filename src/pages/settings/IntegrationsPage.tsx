import React, { useState } from "react";
import { Container, Card } from "../../design-system";
import ConnectionsList from "../../components/integrations/ConnectionsList";
import { Integration } from "../../data/mockIntegrations";
import RegisterIntegrationForm from "../../components/integrations/RegisterIntegrationForm";

export default function IntegrationsPage({
  onNavigate,
}: {
  onNavigate?: (page: string, id?: string) => void;
}) {
  const [channel, setChannel] = useState<string>("all");
  const [showCredentials, setShowCredentials] = useState<boolean>(false);
  const [selectedIntegration, setSelectedIntegration] =
    useState<Integration | null>(null);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [collectionInterval, setCollectionInterval] = useState<string>("15m");
  const [intervalsByChannel, setIntervalsByChannel] = useState<
    Record<string, any[]>
  >({});

  React.useEffect(() => {
    try {
      const raw = window.localStorage.getItem("collectionIntervalsByChannel");
      if (raw) setIntervalsByChannel(JSON.parse(raw));
    } catch (e) {}
  }, []);

  const saveIntervals = (channel: string, list: any[]) => {
    const next = { ...(intervalsByChannel || {}), [channel]: list };
    setIntervalsByChannel(next);
    try {
      window.localStorage.setItem(
        "collectionIntervalsByChannel",
        JSON.stringify(next),
      );
    } catch (e) {}
  };

  const handleAuth = (data: { clientId: string; clientSecret: string }) => {
    console.log("Auth saved", data);
    alert("인증 정보가 저장되었습니다. (mock)");
  };

  const handleSecretSave = (data: { key: string; value: string }) => {
    console.log("Secret saved", data);
    alert("시크릿이 저장되었습니다. (mock)");
  };

  const handleRunCafe24Test = async () => {
    // mock: 실제로는 API 호출을 여기서 수행
    const target = selectedIntegration
      ? `integration ${selectedIntegration}`
      : `channel ${channel}`;
    alert(`${target} 주문 수집 테스트를 실행합니다. (mock)`);
  };

  return (
    <Container maxWidth="full">
      <Card className="mb-6 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-1">외부 연동 관리</h1>
            <p className="text-gray-600">
              채널 커넥터 등록, 자격증명 관리 및 연동 테스트
            </p>
          </div>

          <div className="space-x-2">
            <div className="inline-flex items-center space-x-2">
              <label className="text-sm text-gray-600">수집 주기</label>
              <select
                className="border rounded px-2 py-1"
                value={collectionInterval}
                onChange={(e) => setCollectionInterval(e.target.value)}
              >
                <option value="5m">5분</option>
                <option value="15m">15분</option>
                <option value="30m">30분</option>
                <option value="1h">1시간</option>
                <option value="6h">6시간</option>
              </select>
            </div>

            <button
              className="btn"
              onClick={handleRunCafe24Test}
              aria-label="run-order-collection-test"
            >
              {channel} 주문 수집 테스트 ({collectionInterval})
            </button>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex flex-wrap gap-2">
            <button
              className={`px-3 py-1 rounded ${channel === "all" ? "bg-primary-600 text-white" : "bg-gray-100"}`}
              onClick={() => setChannel("all")}
            >
              All
            </button>

            <button
              className={`px-3 py-1 rounded ${channel === "cafe24" ? "bg-primary-600 text-white" : "bg-gray-100"}`}
              onClick={() => setChannel("cafe24")}
            >
              Cafe24
            </button>

            <button
              className={`px-3 py-1 rounded ${channel === "oms-mock" ? "bg-primary-600 text-white" : "bg-gray-100"}`}
              onClick={() => setChannel("oms-mock")}
            >
              OMS Mock
            </button>

            <button
              className={`px-3 py-1 rounded ${channel === "custom" ? "bg-primary-600 text-white" : "bg-gray-100"}`}
              onClick={() => setChannel("custom")}
            >
              Custom
            </button>
          </div>
        </div>
      </Card>

      <div className="mb-4">
        <Card className="p-4">
          <ConnectionsList
            platform={channel}
            onSelectIntegration={(integration) =>
              setSelectedIntegration(integration)
            }
          />
        </Card>
      </div>

      {showRegisterModal && (
        <RegisterIntegrationForm onClose={() => setShowRegisterModal(false)} />
      )}
    </Container>
  );
}
