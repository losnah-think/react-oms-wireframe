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

  const summary = React.useMemo(() => {
    const total = mockConnectedShops.length;
    const active = mockConnectedShops.filter((shop) => shop.status === "연동중").length;
    const pending = mockConnectedShops.filter((shop) => shop.status === "미연동").length;
    const error = total - active - pending;
    return { total, active, pending, error };
  }, []);

  const columns: TableColumn<ConnectedShop>[] = [
    {
      key: "name",
      title: "쇼핑몰",
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
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">쇼핑몰 연동</h1>
          <Button 
            size="big"
            onClick={() => setRegisterOpen(true)}
          >
            ➕ 새 쇼핑몰 연결
          </Button>
        </div>
      </div>

      {/* 거대한 통계 카드 */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-4 gap-6 mb-8">
          <button className="bg-white rounded-xl p-8 text-center shadow-sm hover:shadow-md transition">
            <div className="text-5xl font-bold text-gray-900 mb-2">{summary.total}</div>
            <div className="text-gray-600">전체</div>
          </button>
          
          <button className="bg-green-50 rounded-xl p-8 text-center shadow-sm hover:shadow-md transition">
            <div className="text-5xl font-bold text-green-600 mb-2">{summary.active}</div>
            <div className="text-green-700 font-medium">정상</div>
          </button>
          
          <button className="bg-gray-100 rounded-xl p-8 text-center shadow-sm hover:shadow-md transition">
            <div className="text-5xl font-bold text-gray-600 mb-2">{summary.pending}</div>
            <div className="text-gray-700">대기</div>
          </button>
          
          <button className="bg-red-50 rounded-xl p-8 text-center shadow-sm hover:shadow-md transition">
            <div className="text-5xl font-bold text-red-600 mb-2">{summary.error}</div>
            <div className="text-red-700 font-medium">오류</div>
          </button>
        </div>

        {/* 검색 필터 - 크고 단순하게 */}
        <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
          <div className="grid grid-cols-3 gap-4">
            <Input
              placeholder="쇼핑몰 검색"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              fullWidth
              className="text-lg py-3"
            />
            <Dropdown
              options={channelOptions}
              value={channelFilter}
              onChange={setChannelFilter}
              fullWidth
            />
            <Dropdown
              options={[
                { value: "", label: "모든 상태" },
                { value: "연동중", label: "정상" },
                { value: "오류", label: "오류" },
                { value: "미연동", label: "대기" },
              ]}
              value={statusFilter}
              onChange={setStatusFilter}
              fullWidth
            />
          </div>
        </div>

        {/* 쇼핑몰 목록 - 거대한 카드로 */}
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

        {/* 선택된 쇼핑몰 상세 */}
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
      </div>

      {/* 모달 */}
      <Modal
        open={isRegisterOpen}
        onClose={() => setRegisterOpen(false)}
        title="새 쇼핑몰 연결"
        footer={null}
        size="big"
      >
        <RegisterIntegrationForm
          vendors={mockVendors}
          onClose={() => setRegisterOpen(false)}
          onRegistered={() => setRegisterOpen(false)}
        />
      </Modal>
    </div>
  );
};

export default IntegrationPage;