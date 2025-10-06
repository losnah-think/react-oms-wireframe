import React from "react";
import {
  Container,
  Card,
  Button,
  Input,
  Dropdown,
  Badge,
  Stack,
  Modal,
  Table,
  type TableColumn,
} from "../../design-system";
import { mockVendors } from "../../data/mockVendors";

import ConnectionsList from "../../components/integrations/ConnectionsList";
import RegisterIntegrationForm from "../../components/integrations/RegisterIntegrationForm";
import ConnectorTable from "../../components/integrations/ConnectorTable";
import CollectionScheduleManager from "../../components/integrations/CollectionScheduleManager";

// 판매처 연동 관리 타입 정의
interface VendorIntegration {
  id: string;
  vendorId: string;
  vendorName: string;
  platform: string;
  apiKey: string;
  status: "연동중" | "오류" | "미연동";
  lastSync: string;
  nextSync: string;
  productCount: number;
  categoryCount: number;
}

// 판매처 연동 Mock 데이터
const mockVendorIntegrations: VendorIntegration[] = [
  {
    id: "vendor-int-1",
    vendorId: "V001",
    vendorName: "네이버 스마트스토어",
    platform: "smartstore",
    apiKey: "smartstore_api_key_1234",
    status: "연동중",
    lastSync: "2025-01-15 10:30",
    nextSync: "2025-01-15 14:30",
    productCount: 1250,
    categoryCount: 15
  },
  {
    id: "vendor-int-2",
    vendorId: "V002",
    vendorName: "쿠팡 파트너스",
    platform: "coupang",
    apiKey: "coupang_api_key_5678",
    status: "연동중",
    lastSync: "2025-01-15 09:15",
    nextSync: "2025-01-15 13:15",
    productCount: 2100,
    categoryCount: 8
  },
  {
    id: "vendor-int-3",
    vendorId: "V003",
    vendorName: "11번가",
    platform: "11st",
    apiKey: "11st_api_key_9012",
    status: "오류",
    lastSync: "2025-01-14 15:20",
    nextSync: "2025-01-15 11:00",
    productCount: 1800,
    categoryCount: 12
  },
  {
    id: "vendor-int-4",
    vendorId: "V004",
    vendorName: "카페24",
    platform: "cafe24",
    apiKey: "",
    status: "미연동",
    lastSync: "-",
    nextSync: "-",
    productCount: 0,
    categoryCount: 0
  }
];

const channelOptions = [
  { value: "", label: "전체" },
  { value: "cafe24", label: "카페24" },
  { value: "smartstore", label: "스마트스토어" },
  { value: "coupang", label: "쿠팡" },
  { value: "kurly", label: "마켓컬리" },
  { value: "godo", label: "고도몰" },
  { value: "wisa", label: "위사" },
];

interface ConnectedShop {
  id: string;
  name: string;
  vendorId: string;
  platform: string;
  status: "연동중" | "오류" | "미연동";
  lastSync: string;
  nextSync: string;
}

const mockConnectedShops: ConnectedShop[] = [
  {
    id: "shop-1",
    name: "카페24 베이직 몰",
    vendorId: "1",
    platform: "cafe24",
    status: "연동중",
    lastSync: "2024-04-20 08:30",
    nextSync: "2024-04-20 12:30",
  },
  {
    id: "shop-2",
    name: "스마트스토어 메인",
    vendorId: "3",
    platform: "smartstore",
    status: "오류",
    lastSync: "2024-04-19 23:10",
    nextSync: "2024-04-20 11:00",
  },
  {
    id: "shop-3",
    name: "쿠팡 마켓플레이스",
    vendorId: "5",
    platform: "coupang",
    status: "연동중",
    lastSync: "2024-04-20 09:05",
    nextSync: "2024-04-20 13:05",
  },
  {
    id: "shop-4",
    name: "고도몰 파트너",
    vendorId: "2",
    platform: "godo",
    status: "미연동",
    lastSync: "-",
    nextSync: "-",
  },
];

const connectedShopOptions = mockConnectedShops.map((shop) => ({
  id: shop.id,
  name: shop.name,
  platform: shop.platform,
}));

const IntegrationPage: React.FC = () => {
  const [search, setSearch] = React.useState("");
  const [channelFilter, setChannelFilter] = React.useState(channelOptions[0].value);
  const [statusFilter, setStatusFilter] = React.useState<string>("");
  const [isRegisterOpen, setRegisterOpen] = React.useState(false);
  const [selectedShop, setSelectedShop] = React.useState<string | null>(null);
  
  // 판매처 연동 관리 상태
  const [activeTab, setActiveTab] = React.useState<"shops" | "vendors">("shops");
  const [vendorSearch, setVendorSearch] = React.useState("");
  const [vendorStatusFilter, setVendorStatusFilter] = React.useState<string>("");
  const [selectedVendorIntegration, setSelectedVendorIntegration] = React.useState<string | null>(null);
  const [isVendorIntegrationModalOpen, setIsVendorIntegrationModalOpen] = React.useState(false);
  const [isLoadingSync, setIsLoadingSync] = React.useState(false);

  const filteredShops = React.useMemo(() => {
    return mockConnectedShops.filter((shop) => {
      const matchesSearch = search
        ? shop.name.includes(search) || shop.id.includes(search)
        : true;
      const matchesChannel = channelFilter ? shop.platform === channelFilter : true;
      const matchesStatus = statusFilter ? shop.status === statusFilter : true;
      return matchesSearch && matchesChannel && matchesStatus;
    });
  }, [search, channelFilter, statusFilter]);

  // 판매처 연동 필터링
  const filteredVendorIntegrations = React.useMemo(() => {
    return mockVendorIntegrations.filter((integration) => {
      const matchesSearch = vendorSearch
        ? integration.vendorName.includes(vendorSearch) || integration.vendorId.includes(vendorSearch)
        : true;
      const matchesStatus = vendorStatusFilter ? integration.status === vendorStatusFilter : true;
      return matchesSearch && matchesStatus;
    });
  }, [vendorSearch, vendorStatusFilter]);

  // 판매처 연동 동기화 함수
  const syncVendorIntegration = async (integrationId: string) => {
    setIsLoadingSync(true);
    // API 호출 시뮬레이션
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsLoadingSync(false);
    // 실제로는 상태 업데이트 로직이 들어감
  };

  // 판매처 연동 설정 함수
  const configureVendorIntegration = (integrationId: string) => {
    setSelectedVendorIntegration(integrationId);
    setIsVendorIntegrationModalOpen(true);
  };

  const summary = React.useMemo(() => {
    const total = mockConnectedShops.length;
    const active = mockConnectedShops.filter((shop) => shop.status === "연동중").length;
    const pending = mockConnectedShops.filter((shop) => shop.status === "미연동").length;
    const error = total - active - pending;
    return { total, active, pending, error };
  }, []);

  // 판매처 연동 통계
  const vendorSummary = React.useMemo(() => {
    const total = mockVendorIntegrations.length;
    const active = mockVendorIntegrations.filter((integration) => integration.status === "연동중").length;
    const pending = mockVendorIntegrations.filter((integration) => integration.status === "미연동").length;
    const error = total - active - pending;
    return { total, active, pending, error };
  }, []);

  const columns: TableColumn<ConnectedShop>[] = [
    {
      key: "name",
      title: "판매처",
      render: (_, record) => (
        <div className="font-semibold text-gray-900 text-lg">{record.name}</div>
      ),
    },
    {
      key: "platform",
      title: "플랫폼",
      render: (value) => (
        <span className="text-base">{channelOptions.find((option) => option.value === value)?.label ?? value}</span>
      ),
    },
    {
      key: "status",
      title: "상태",
      render: (value) => (
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${
            value === "연동중" ? "bg-green-500" : value === "오류" ? "bg-red-500" : "bg-gray-400"
          }`} />
          <span className="font-medium">{value}</span>
        </div>
      ),
    },
    { 
      key: "lastSync", 
      title: "마지막 동기화",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">외부 연동 관리</h1>
            <Button 
              size="big"
              onClick={() => setRegisterOpen(true)}
            >
              ➕ 새 판매처 연결
            </Button>
          </div>
          
          {/* 탭 메뉴 */}
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab("shops")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === "shops"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              판매처 연동
            </button>
            <button
              onClick={() => setActiveTab("vendors")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === "vendors"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              판매처 연동
            </button>
          </div>
        </div>
      </div>

      {/* 거대한 통계 카드 */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-4 gap-6 mb-8">
          <button className="bg-white rounded-xl p-8 text-center shadow-sm hover:shadow-md transition">
            <div className="text-5xl font-bold text-gray-900 mb-2">
              {activeTab === "shops" ? summary.total : vendorSummary.total}
            </div>
            <div className="text-gray-600">전체</div>
          </button>
          
          <button className="bg-green-50 rounded-xl p-8 text-center shadow-sm hover:shadow-md transition">
            <div className="text-5xl font-bold text-green-600 mb-2">
              {activeTab === "shops" ? summary.active : vendorSummary.active}
            </div>
            <div className="text-green-700 font-medium">정상</div>
          </button>
          
          <button className="bg-gray-100 rounded-xl p-8 text-center shadow-sm hover:shadow-md transition">
            <div className="text-5xl font-bold text-gray-600 mb-2">
              {activeTab === "shops" ? summary.pending : vendorSummary.pending}
            </div>
            <div className="text-gray-700">대기</div>
          </button>
          
          <button className="bg-red-50 rounded-xl p-8 text-center shadow-sm hover:shadow-md transition">
            <div className="text-5xl font-bold text-red-600 mb-2">
              {activeTab === "shops" ? summary.error : vendorSummary.error}
            </div>
            <div className="text-red-700 font-medium">오류</div>
          </button>
        </div>

        {/* 검색 필터 - 크고 단순하게 */}
        <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
          <div className="grid grid-cols-3 gap-4">
            <Input
              placeholder={activeTab === "shops" ? "판매처 검색" : "판매처 검색"}
              value={activeTab === "shops" ? search : vendorSearch}
              onChange={(event) => activeTab === "shops" ? setSearch(event.target.value) : setVendorSearch(event.target.value)}
              fullWidth
              className="text-lg py-3"
            />
            <Dropdown
              options={channelOptions}
              value={activeTab === "shops" ? channelFilter : ""}
              onChange={activeTab === "shops" ? setChannelFilter : () => {}}
              fullWidth
            />
            <Dropdown
              options={[
                { value: "", label: "모든 상태" },
                { value: "연동중", label: "정상" },
                { value: "오류", label: "오류" },
                { value: "미연동", label: "대기" },
              ]}
              value={activeTab === "shops" ? statusFilter : vendorStatusFilter}
              onChange={activeTab === "shops" ? setStatusFilter : setVendorStatusFilter}
              fullWidth
            />
          </div>
        </div>

        {/* 메인 콘텐츠 */}
        {activeTab === "shops" ? (
          <>
            {/* 판매처 목록 - 거대한 카드로 */}
            <div className="space-y-4">
              {filteredShops.map((shop) => {
                const isSelected = selectedShop === shop.id;
                return (
                  <button
                    key={shop.id}
                    onClick={() => setSelectedShop(isSelected ? null : shop.id)}
                    className={`w-full bg-white rounded-xl p-6 text-left shadow-sm hover:shadow-md transition ${
                      isSelected ? "ring-4 ring-blue-500" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-6">
                        <div className={`w-4 h-4 rounded-full ${
                          shop.status === "연동중" ? "bg-green-500" : 
                          shop.status === "오류" ? "bg-red-500" : "bg-gray-400"
                        }`} />
                        <div>
                          <div className="text-xl font-bold text-gray-900 mb-1">{shop.name}</div>
                          <div className="text-gray-500">{channelOptions.find(o => o.value === shop.platform)?.label}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-semibold mb-1 ${
                          shop.status === "연동중" ? "text-green-600" : 
                          shop.status === "오류" ? "text-red-600" : "text-gray-600"
                        }`}>
                          {shop.status}
                        </div>
                        <div className="text-sm text-gray-500">마지막: {shop.lastSync}</div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* 선택된 판매처 상세 */}
            {selectedShop && (
              <div className="mt-8 bg-white rounded-xl p-8 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">설정</h2>
                  <Button 
                    variant="ghost" 
                    onClick={() => setSelectedShop(null)}
                    className="text-lg"
                  >
                    ✕ 닫기
                  </Button>
                </div>
                <RegisterIntegrationForm
                  initialShop={mockConnectedShops.find((shop) => shop.id === selectedShop)}
                  vendors={mockVendors}
                  onClose={() => setSelectedShop(null)}
                  onRegistered={() => setSelectedShop(null)}
                />
              </div>
            )}
          </>
        ) : (
          <>
            {/* 판매처 연동 목록 */}
            <div className="space-y-4">
              {filteredVendorIntegrations.map((integration) => {
                const isSelected = selectedVendorIntegration === integration.id;
                return (
                  <button
                    key={integration.id}
                    onClick={() => setSelectedVendorIntegration(isSelected ? null : integration.id)}
                    className={`w-full bg-white rounded-xl p-6 text-left shadow-sm hover:shadow-md transition ${
                      isSelected ? "ring-4 ring-blue-500" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-6">
                        <div className={`w-4 h-4 rounded-full ${
                          integration.status === "연동중" ? "bg-green-500" : 
                          integration.status === "오류" ? "bg-red-500" : "bg-gray-400"
                        }`} />
                        <div>
                          <div className="text-xl font-bold text-gray-900 mb-1">{integration.vendorName}</div>
                          <div className="text-gray-500">{channelOptions.find(o => o.value === integration.platform)?.label}</div>
                          <div className="text-sm text-gray-400 mt-1">
                            상품 {integration.productCount}개 • 카테고리 {integration.categoryCount}개
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-semibold mb-1 ${
                          integration.status === "연동중" ? "text-green-600" : 
                          integration.status === "오류" ? "text-red-600" : "text-gray-600"
                        }`}>
                          {integration.status}
                        </div>
                        <div className="text-sm text-gray-500">마지막: {integration.lastSync}</div>
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              syncVendorIntegration(integration.id);
                            }}
                            disabled={isLoadingSync}
                            className="px-3 py-1 text-xs bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 transition-colors"
                          >
                            {isLoadingSync ? "동기화 중..." : "동기화"}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              configureVendorIntegration(integration.id);
                            }}
                            className="px-3 py-1 text-xs bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                          >
                            설정
                          </button>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* 모달 */}
      <Modal
        open={isRegisterOpen}
        onClose={() => setRegisterOpen(false)}
        title="새 판매처 연결"
        footer={null}
        size="big"
      >
        <RegisterIntegrationForm
          vendors={mockVendors}
          onClose={() => setRegisterOpen(false)}
          onRegistered={() => setRegisterOpen(false)}
        />
      </Modal>

      {/* 판매처 연동 설정 모달 */}
      <Modal
        open={isVendorIntegrationModalOpen}
        onClose={() => setIsVendorIntegrationModalOpen(false)}
        title="판매처 연동 설정"
        footer={null}
        size="big"
      >
        {selectedVendorIntegration && (
          <div className="p-6">
            {(() => {
              const integration = mockVendorIntegrations.find(i => i.id === selectedVendorIntegration);
              if (!integration) return null;
              
              return (
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-2">{integration.vendorName}</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">플랫폼:</span>
                        <span className="ml-2 font-medium">{channelOptions.find(o => o.value === integration.platform)?.label}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">상태:</span>
                        <span className={`ml-2 font-medium ${
                          integration.status === "연동중" ? "text-green-600" : 
                          integration.status === "오류" ? "text-red-600" : "text-gray-600"
                        }`}>
                          {integration.status}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">상품 수:</span>
                        <span className="ml-2 font-medium">{integration.productCount}개</span>
                      </div>
                      <div>
                        <span className="text-gray-600">카테고리 수:</span>
                        <span className="ml-2 font-medium">{integration.categoryCount}개</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">API 키</label>
                    <div className="flex gap-2">
                      <input
                        type="password"
                        value={integration.apiKey}
                        readOnly
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                      />
                      <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                        복사
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">동기화 설정</label>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">상품 정보 동기화</span>
                        <input type="checkbox" defaultChecked className="rounded" />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">카테고리 동기화</span>
                        <input type="checkbox" defaultChecked className="rounded" />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">재고 동기화</span>
                        <input type="checkbox" defaultChecked className="rounded" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">동기화 주기</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                      <option value="1">1시간마다</option>
                      <option value="6">6시간마다</option>
                      <option value="12">12시간마다</option>
                      <option value="24">24시간마다</option>
                    </select>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t">
                    <button
                      onClick={() => setIsVendorIntegrationModalOpen(false)}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      취소
                    </button>
                    <button
                      onClick={() => setIsVendorIntegrationModalOpen(false)}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                      저장
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default IntegrationPage;