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
  { value: "", label: "전체 채널" },
  { value: "cafe24", label: "카페24" },
  { value: "smartstore", label: "네이버 스마트스토어" },
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
      title: "연동 샵",
      render: (_, record) => (
        <div className="flex flex-col">
          <span className="font-semibold text-gray-900">{record.name}</span>
          <span className="text-xs text-gray-500">ID: {record.id}</span>
        </div>
      ),
    },
    {
      key: "platform",
      title: "채널",
      render: (value) => (
        <Badge size="small" variant="secondary">
          {channelOptions.find((option) => option.value === value)?.label ?? value}
        </Badge>
      ),
    },
    {
      key: "status",
      title: "상태",
      render: (value) => (
        <Badge
          size="small"
          variant={value === "연동중" ? "success" : value === "오류" ? "danger" : "secondary"}
        >
          {value}
        </Badge>
      ),
    },
    { key: "lastSync", title: "최근 동기화" },
    { key: "nextSync", title: "다음 동기화" },
  ];

  return (
    <Container maxWidth="7xl" className="space-y-6 pb-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-gray-900">외부 연동 관리</h1>
        <p className="text-sm text-gray-600">
          셀메이트·사방넷·카페24 등 주요 채널과의 연동 현황을 살펴보고, 빠르게 신규 샵을 등록하거나 설정을 변경하세요.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card padding="lg" className="flex flex-col gap-1">
          <span className="text-xs text-gray-500">전체 연동 샵</span>
          <span className="text-2xl font-semibold text-gray-900">{summary.total}</span>
        </Card>
        <Card padding="lg" className="flex flex-col gap-1">
          <span className="text-xs text-gray-500">정상 연동</span>
          <span className="text-2xl font-semibold text-green-600">{summary.active}</span>
        </Card>
        <Card padding="lg" className="flex flex-col gap-1">
          <span className="text-xs text-gray-500">미연동</span>
          <span className="text-2xl font-semibold text-gray-900">{summary.pending}</span>
        </Card>
        <Card padding="lg" className="flex flex-col gap-1">
          <span className="text-xs text-gray-500">연동 오류</span>
          <span className="text-2xl font-semibold text-red-500">{summary.error}</span>
        </Card>
      </div>

      <Card padding="lg" className="space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-1 flex-col gap-3 md:flex-row md:items-center">
            <Input
              label="검색"
              placeholder="샵 이름 또는 ID 검색"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              fullWidth
            />
            <Dropdown
              label="채널"
              options={channelOptions}
              value={channelFilter}
              onChange={setChannelFilter}
              fullWidth
            />
            <Dropdown
              label="상태"
              options={[
                { value: "", label: "전체 상태" },
                { value: "연동중", label: "연동중" },
                { value: "오류", label: "연동 오류" },
                { value: "미연동", label: "미연동" },
              ]}
              value={statusFilter}
              onChange={setStatusFilter}
              fullWidth
            />
          </div>
          <Stack direction="row" gap={3} className="flex-wrap">
            <Button variant="outline" size="small" onClick={() => {
              setSearch("");
              setChannelFilter("");
              setStatusFilter("");
            }}>
              필터 초기화
            </Button>
            <Button size="small" onClick={() => setRegisterOpen(true)}>
              새 샵 등록
            </Button>
          </Stack>
        </div>

        <Table<ConnectedShop>
          bordered
          data={filteredShops}
          columns={columns}
          onRow={(record) => ({
            onClick: () => setSelectedShop(record.id),
            className: record.id === selectedShop ? "bg-primary-50" : undefined,
          })}
          rowSelection={{
            selectedRowKeys: selectedShop ? [selectedShop] : [],
            onChange: (keys) => setSelectedShop(keys[0] ?? null),
          }}
          size="middle"
        />
      </Card>

      {selectedShop ? (
        <Card padding="lg" className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">연동 상세 및 설정</h2>
          <RegisterIntegrationForm
            initialShop={mockConnectedShops.find((shop) => shop.id === selectedShop)}
            vendors={mockVendors}
            onClose={() => setSelectedShop(null)}
            onRegistered={() => setSelectedShop(null)}
          />
        </Card>
      ) : (
        <Card padding="lg" className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">연동 가이드</h2>
          <ConnectionsList />
        </Card>
      )}

      <Card padding="lg" className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">세부 채널 테스트 로그</h2>
        <ConnectorTable />
      </Card>

      <CollectionScheduleManager shops={connectedShopOptions} />

      <Modal
        open={isRegisterOpen}
        onClose={() => setRegisterOpen(false)}
        title="새 샵 등록"
        footer={null}
        size="big"
      >
        <RegisterIntegrationForm
          vendors={mockVendors}
          onClose={() => setRegisterOpen(false)}
          onRegistered={() => setRegisterOpen(false)}
        />
      </Modal>
    </Container>
  );
};

export default IntegrationPage;
