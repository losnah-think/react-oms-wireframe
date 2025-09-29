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
import { mockCategories } from "../../data/mockCategories";
import { mockVendors } from "../../data/mockVendors";

type CategoryMapping = {
  id: string;
  vendorId: string;
  vendorName: string;
  vendorPlatform: string;
  vendorCategory: string;
  internalCategory: string;
};

const STORAGE_KEY = "vendorCategoryMappings";

const platformLabel: Record<string, string> = {
  godomall: "고도몰",
  wisa: "위사",
  kurly: "마켓컬리",
  smartstore: "스마트스토어",
  cafe24: "카페24",
  gmarket: "G마켓",
  coupang: "쿠팡",
  naver: "네이버",
};

const vendorOptions = [
  { value: "", label: "전체 판매처" },
  ...mockVendors.map((vendor) => ({ value: vendor.id, label: vendor.name })),
];

export default function CategoryMappingPage() {
  const [mappings, setMappings] = React.useState<CategoryMapping[]>(() => {
    if (typeof window === "undefined") return [];
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
    const seed = mockVendors.slice(0, 3).map((vendor, index) => ({
      id: `seed-${vendor.id}`,
      vendorId: vendor.id,
      vendorName: vendor.name,
      vendorPlatform: vendor.platform,
      vendorCategory: ["전자제품", "의류", "잡화", "뷰티"][index % 4],
      internalCategory: mockCategories[index]?.name ?? "미지정",
    }));
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
    return seed;
  });
  const [search, setSearch] = React.useState("");
  const [vendorFilter, setVendorFilter] = React.useState(vendorOptions[0].value);
  const [isModalOpen, setModalOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [formState, setFormState] = React.useState({
    vendorId: vendorOptions[1]?.value ?? "",
    vendorCategory: "",
    internalCategory: mockCategories[0]?.name ?? "",
  });

  const persist = React.useCallback((next: CategoryMapping[]) => {
    setMappings(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    }
  }, []);

  const filtered = React.useMemo(() => {
    return mappings.filter((mapping) => {
      const matchesVendor = vendorFilter ? mapping.vendorId === vendorFilter : true;
      const matchesSearch = search
        ? mapping.vendorCategory.includes(search) ||
          mapping.internalCategory.includes(search)
        : true;
      return matchesVendor && matchesSearch;
    });
  }, [mappings, vendorFilter, search]);

  const groupedByVendor = React.useMemo(() => {
    return filtered.reduce<Record<string, CategoryMapping[]>>((acc, mapping) => {
      if (!acc[mapping.vendorId]) acc[mapping.vendorId] = [];
      acc[mapping.vendorId].push(mapping);
      return acc;
    }, {});
  }, [filtered]);

  const columns: TableColumn<CategoryMapping>[] = [
    {
      key: "vendorCategory",
      title: "판매처 카테고리",
      render: (value) => <span className="font-medium text-gray-900">{value}</span>,
    },
    {
      key: "internalCategory",
      title: "내부 카테고리",
      render: (value) => <span className="text-sm text-gray-700">{value}</span>,
    },
    {
      key: "vendorPlatform",
      title: "플랫폼",
      render: (value) => (
        <Badge size="small" variant="secondary">
          {platformLabel[value] || value}
        </Badge>
      ),
      align: "center",
    },
  ];

  const openModal = (mapping?: CategoryMapping) => {
    if (mapping) {
      setEditingId(mapping.id);
      setFormState({
        vendorId: mapping.vendorId,
        vendorCategory: mapping.vendorCategory,
        internalCategory: mapping.internalCategory,
      });
    } else {
      setEditingId(null);
      setFormState({
        vendorId: vendorOptions[1]?.value ?? "",
        vendorCategory: "",
        internalCategory: mockCategories[0]?.name ?? "",
      });
    }
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!formState.vendorId || !formState.vendorCategory.trim() || !formState.internalCategory.trim()) {
      window.alert("판매처와 카테고리를 모두 입력해주세요.");
      return;
    }
    const vendor = mockVendors.find((v) => v.id === formState.vendorId);
    if (!vendor) {
      window.alert("유효하지 않은 판매처입니다.");
      return;
    }
    const nextMapping: CategoryMapping = {
      id: editingId ?? `mapping-${Date.now()}`,
      vendorId: vendor.id,
      vendorName: vendor.name,
      vendorPlatform: vendor.platform,
      vendorCategory: formState.vendorCategory.trim(),
      internalCategory: formState.internalCategory.trim(),
    };
    const next = editingId
      ? mappings.map((item) => (item.id === editingId ? nextMapping : item))
      : [nextMapping, ...mappings];
    persist(next);
    setModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (!window.confirm("매핑을 삭제하시겠습니까?")) return;
    persist(mappings.filter((item) => item.id !== id));
  };

  return (
    <Container maxWidth="7xl" className="space-y-6 pb-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-gray-900">판매처별 카테고리 매핑</h1>
        <p className="text-sm text-gray-600">
          판매처 카테고리를 내부 카테고리에 연결해 자동 분류를 구성하세요.
        </p>
      </div>

      <Card padding="lg" className="space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-1 flex-col gap-3 md:flex-row md:items-center">
            <Dropdown
              label="판매처"
              options={vendorOptions}
              value={vendorFilter}
              onChange={setVendorFilter}
              fullWidth
            />
            <Input
              label="검색"
              placeholder="판매처 카테고리 또는 내부 카테고리를 검색"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              fullWidth
            />
          </div>
          <Stack direction="row" gap={3} className="flex-wrap">
            <Button variant="outline" size="small" onClick={() => setVendorFilter("")}>필터 초기화</Button>
            <Button size="small" onClick={() => openModal()}>매핑 추가</Button>
          </Stack>
        </div>

        <div className="space-y-6">
          {Object.keys(groupedByVendor).length === 0 && (
            <div className="rounded-md border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500">
              조건에 맞는 매핑이 없습니다. 새로운 매핑을 추가해 보세요.
            </div>
          )}

          {Object.entries(groupedByVendor).map(([vendorId, rows]) => {
            const vendor = mockVendors.find((item) => item.id === vendorId);
            return (
              <Card key={vendorId} padding="lg" className="space-y-4">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">{vendor?.name ?? "알 수 없는 판매처"}</h2>
                    <div className="text-xs text-gray-500">
                      플랫폼 {vendor ? platformLabel[vendor.platform] : "-"}
                    </div>
                  </div>
                  <Badge variant={vendor?.is_active ? "success" : "secondary"} size="small">
                    {vendor?.is_active ? "연동중" : "중지"}
                  </Badge>
                </div>

                <Table<CategoryMapping>
                  bordered
                  columns={columns}
                  data={rows}
                  size="small"
                  className="bg-white"
                  expandable={{
                    expandedRowRender: (record) => (
                      <div className="flex items-center justify-between gap-4 border-t border-gray-100 pt-3 text-xs text-gray-500">
                        <span>
                          {record.vendorName} → {record.internalCategory}
                        </span>
                        <Stack direction="row" gap={2}>
                          <Button variant="ghost" size="small" onClick={() => openModal(record)}>
                            편집
                          </Button>
                          <Button variant="outline" size="small" onClick={() => handleDelete(record.id)}>
                            삭제
                          </Button>
                        </Stack>
                      </div>
                    ),
                  }}
                />
              </Card>
            );
          })}
        </div>
      </Card>

      <Modal
        open={isModalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? "매핑 편집" : "매핑 추가"}
        footer={
          <Stack direction="row" gap={3}>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              취소
            </Button>
            <Button onClick={handleSave}>저장</Button>
          </Stack>
        }
      >
        <div className="space-y-4">
          <Dropdown
            label="판매처"
            options={vendorOptions.slice(1)}
            value={formState.vendorId}
            onChange={(value) => setFormState((prev) => ({ ...prev, vendorId: value }))}
            fullWidth
          />
          <Input
            label="판매처 카테고리"
            value={formState.vendorCategory}
            onChange={(event) => setFormState((prev) => ({ ...prev, vendorCategory: event.target.value }))}
            fullWidth
          />
          <Dropdown
            label="내부 카테고리"
            options={mockCategories.slice(0, 20).map((cat) => ({ value: cat.name, label: cat.name }))}
            value={formState.internalCategory}
            onChange={(value) => setFormState((prev) => ({ ...prev, internalCategory: value }))}
            fullWidth
          />
        </div>
      </Modal>
    </Container>
  );
}
