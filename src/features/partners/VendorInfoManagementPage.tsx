import React from "react";
import {
  Container,
  Card,
  Button,
  Input,
  Dropdown,
  Badge,
  Modal,
  Stack,
  Table,
  type TableColumn,
} from "../../design-system";
import { mockVendors } from "../../data/mockVendors";

type VendorRow = {
  id: string;
  name: string;
  code: string;
  platform: string;
  platformLabel: string;
  is_active: boolean;
  created_at: string;
  contact?: string;
};

const platformOptions = [
  { value: "", label: "전체 플랫폼" },
  { value: "godomall", label: "고도몰" },
  { value: "wisa", label: "위사" },
  { value: "kurly", label: "마켓컬리" },
  { value: "smartstore", label: "스마트스토어" },
  { value: "cafe24", label: "카페24" },
  { value: "gmarket", label: "G마켓" },
  { value: "coupang", label: "쿠팡" },
  { value: "naver", label: "네이버" },
];

const statusFilters = [
  { value: "", label: "전체 상태" },
  { value: "active", label: "활성" },
  { value: "inactive", label: "비활성" },
];

const PLATFORM_LABEL: Record<string, string> = {
  godomall: "고도몰",
  wisa: "위사",
  kurly: "마켓컬리",
  smartstore: "스마트스토어",
  cafe24: "카페24",
  gmarket: "G마켓",
  coupang: "쿠팡",
  naver: "네이버",
};

const deriveVendors = (): VendorRow[] =>
  mockVendors.map((vendor) => ({
    id: vendor.id,
    name: vendor.name,
    code: vendor.code,
    platform: vendor.platform,
    platformLabel: PLATFORM_LABEL[vendor.platform] || vendor.platform,
    is_active: vendor.is_active,
    created_at: new Date(vendor.created_at).toLocaleDateString(),
    contact: vendor.settings?.manager ? String(vendor.settings.manager) : undefined,
  }));

export default function VendorInfoManagementPage() {
  const [vendors, setVendors] = React.useState<VendorRow[]>(deriveVendors);
  const [search, setSearch] = React.useState("");
  const [platformFilter, setPlatformFilter] = React.useState(platformOptions[0].value);
  const [statusFilter, setStatusFilter] = React.useState(statusFilters[0].value);
  const [isModalOpen, setModalOpen] = React.useState(false);
  const [formState, setFormState] = React.useState({
    name: "",
    code: "",
    platform: platformOptions[1].value,
    manager: "",
  });

  const filtered = React.useMemo(() => {
    return vendors.filter((vendor) => {
      const matchesSearch = search
        ? vendor.name.includes(search) || vendor.code.includes(search)
        : true;
      const matchesPlatform = platformFilter ? vendor.platform === platformFilter : true;
      const matchesStatus = statusFilter
        ? statusFilter === "active"
          ? vendor.is_active
          : !vendor.is_active
        : true;
      return matchesSearch && matchesPlatform && matchesStatus;
    });
  }, [vendors, search, platformFilter, statusFilter]);

  const summary = React.useMemo(() => {
    const total = vendors.length;
    const active = vendors.filter((vendor) => vendor.is_active).length;
    return {
      total,
      active,
      inactive: total - active,
    };
  }, [vendors]);

  const columns: TableColumn<VendorRow>[] = [
    {
      key: "name",
      title: "판매처",
      render: (_, record) => (
        <div className="flex flex-col">
          <span className="font-semibold text-gray-900">{record.name}</span>
          <span className="text-xs text-gray-500">코드 {record.code}</span>
        </div>
      ),
    },
    {
      key: "platformLabel",
      title: "플랫폼",
      render: (value) => <span className="text-sm text-gray-700">{value}</span>,
    },
    {
      key: "contact",
      title: "담당자",
      render: (value) => <span className="text-sm text-gray-600">{value ?? "-"}</span>,
    },
    {
      key: "created_at",
      title: "등록일",
    },
    {
      key: "is_active",
      title: "상태",
      render: (value) => (
        <Badge variant={value ? "success" : "secondary"} size="small">
          {value ? "활성" : "비활성"}
        </Badge>
      ),
      align: "center",
    },
  ];

  const handleCreate = () => {
    if (!formState.name.trim()) {
      window.alert("판매처 이름을 입력해주세요.");
      return;
    }
    const vendor: VendorRow = {
      id: `vendor-${Date.now()}`,
      name: formState.name.trim(),
      code: formState.code.trim() || `AUTO-${Date.now().toString().slice(-4)}`,
      platform: formState.platform,
      platformLabel: PLATFORM_LABEL[formState.platform] || formState.platform,
      is_active: true,
      created_at: new Date().toLocaleDateString(),
      contact: formState.manager.trim() || undefined,
    };
    setVendors((prev) => [vendor, ...prev]);
    setFormState({ name: "", code: "", platform: platformOptions[1].value, manager: "" });
    setModalOpen(false);
  };

  return (
    <Container maxWidth="7xl" className="space-y-6 pb-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-gray-900">판매처 정보 관리</h1>
        <p className="text-sm text-gray-600">
          연동 중인 판매처를 조회하고, 담당자 정보 및 연동 상태를 최신으로 유지하세요.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card padding="lg" className="flex flex-col gap-1">
          <span className="text-xs text-gray-500">전체 판매처</span>
          <span className="text-2xl font-semibold text-gray-900">{summary.total}</span>
        </Card>
        <Card padding="lg" className="flex flex-col gap-1">
          <span className="text-xs text-gray-500">활성</span>
          <span className="text-2xl font-semibold text-green-600">{summary.active}</span>
        </Card>
        <Card padding="lg" className="flex flex-col gap-1">
          <span className="text-xs text-gray-500">비활성</span>
          <span className="text-2xl font-semibold text-red-500">{summary.inactive}</span>
        </Card>
        <Card padding="lg" className="flex flex-col gap-1">
          <span className="text-xs text-gray-500">최근 등록일</span>
          <span className="text-2xl font-semibold text-gray-900">
            {vendors[0]?.created_at ?? "-"}
          </span>
        </Card>
      </div>

      <Card padding="lg" className="space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-1 flex-col gap-3 md:flex-row md:items-center">
            <Input
              label="검색"
              placeholder="판매처명 또는 코드 검색"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              fullWidth
            />
            <Dropdown
              label="플랫폼"
              options={platformOptions}
              value={platformFilter}
              onChange={setPlatformFilter}
              fullWidth
            />
            <Dropdown
              label="상태"
              options={statusFilters}
              value={statusFilter}
              onChange={setStatusFilter}
              fullWidth
            />
          </div>
          <Stack direction="row" gap={3} className="flex-wrap">
            <Button variant="outline" size="small" onClick={() => setPlatformFilter("")}>필터 초기화</Button>
            <Button size="small" onClick={() => setModalOpen(true)}>
              판매처 추가
            </Button>
          </Stack>
        </div>

        <Table<VendorRow>
          bordered
          columns={columns}
          data={filtered}
          size="middle"
          className="bg-white"
        />
      </Card>

      <Modal
        open={isModalOpen}
        onClose={() => setModalOpen(false)}
        title="판매처 추가"
        size="default"
        footer={
          <Stack direction="row" gap={3}>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              취소
            </Button>
            <Button onClick={handleCreate}>등록</Button>
          </Stack>
        }
      >
        <div className="space-y-4">
          <Input
            label="판매처 이름"
            value={formState.name}
            onChange={(event) => setFormState((prev) => ({ ...prev, name: event.target.value }))}
            fullWidth
          />
          <Input
            label="판매처 코드"
            value={formState.code}
            onChange={(event) => setFormState((prev) => ({ ...prev, code: event.target.value }))}
            fullWidth
          />
          <Dropdown
            label="플랫폼"
            options={platformOptions.slice(1)}
            value={formState.platform}
            onChange={(value) => setFormState((prev) => ({ ...prev, platform: value }))}
            fullWidth
          />
          <Input
            label="담당자"
            value={formState.manager}
            onChange={(event) => setFormState((prev) => ({ ...prev, manager: event.target.value }))}
            fullWidth
          />
        </div>
      </Modal>
    </Container>
  );
}
