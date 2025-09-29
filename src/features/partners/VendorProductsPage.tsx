import React from "react";
import {
  Container,
  Card,
  Button,
  Input,
  Dropdown,
  Badge,
  Table,
  type TableColumn,
  Stack,
} from "../../design-system";
import { mockProducts } from "../../data/mockProducts";
import { mockVendors } from "../../data/mockVendors";

type VendorProductRow = {
  id: number;
  name: string;
  code: string;
  vendorId: string;
  vendorName: string;
  platform: string;
  classification: string;
  sellingPrice: number;
  stock: number;
  status: "판매중" | "중지";
  updatedAt: string;
};

const statusOptions = [
  { value: "", label: "상태 전체" },
  { value: "판매중", label: "판매중" },
  { value: "중지", label: "판매중지" },
];

export default function VendorProductsPage() {
  const derivedProducts = React.useMemo<VendorProductRow[]>(() => {
    return mockProducts.slice(0, 40).map((product, index) => {
      const vendor = mockVendors[index % mockVendors.length];
      const stock = (product.variants || []).reduce(
        (acc: number, variant: any) => acc + (variant?.stock ?? 0),
        0,
      );
      return {
        id: product.id,
        name: product.name,
        code: product.code,
        vendorId: vendor.id,
        vendorName: vendor.name,
        platform: vendor.platform,
        classification: (product.classificationPath || []).join(" › ") || "-",
        sellingPrice: product.selling_price,
        stock,
        status: product.is_selling ? "판매중" : "중지",
        updatedAt: new Date(product.updated_at || Date.now()).toLocaleDateString(),
      };
    });
  }, []);

  const vendorOptions = React.useMemo(
    () => [
      { value: "", label: "전체 판매처" },
      ...mockVendors.map((vendor) => ({ value: vendor.id, label: vendor.name })),
    ],
    [],
  );

  const [search, setSearch] = React.useState("");
  const [vendorFilter, setVendorFilter] = React.useState(vendorOptions[0].value);
  const [statusFilter, setStatusFilter] = React.useState(statusOptions[0].value);

  const filteredProducts = React.useMemo(() => {
    return derivedProducts.filter((product) => {
      const matchesSearch = search
        ? product.name.includes(search) || product.code.includes(search)
        : true;
      const matchesVendor = vendorFilter ? product.vendorId === vendorFilter : true;
      const matchesStatus = statusFilter ? product.status === statusFilter : true;
      return matchesSearch && matchesVendor && matchesStatus;
    });
  }, [derivedProducts, search, vendorFilter, statusFilter]);

  const summary = React.useMemo(() => {
    const total = derivedProducts.length;
    const selling = derivedProducts.filter((item) => item.status === "판매중").length;
    const stopped = total - selling;
    const avgPrice =
      derivedProducts.reduce((acc, item) => acc + item.sellingPrice, 0) /
      (total || 1);
    return { total, selling, stopped, avgPrice };
  }, [derivedProducts]);

  const columns: TableColumn<VendorProductRow>[] = [
    {
      key: "name",
      title: "상품",
      render: (_, record) => (
        <div className="flex flex-col">
          <span className="font-semibold text-gray-900">{record.name}</span>
          <span className="text-xs text-gray-500">{record.code}</span>
        </div>
      ),
    },
    {
      key: "vendorName",
      title: "판매처",
      render: (_, record) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-800">{record.vendorName}</span>
          <span className="text-xs text-gray-500">{record.platform}</span>
        </div>
      ),
    },
    {
      key: "classification",
      title: "카테고리",
      render: (value) => <span className="text-sm text-gray-600">{value || "-"}</span>,
    },
    {
      key: "sellingPrice",
      title: "판매가",
      render: (value) => (
        <span className="font-semibold text-gray-900">₩{Number(value).toLocaleString()}</span>
      ),
      align: "right",
    },
    {
      key: "stock",
      title: "재고",
      render: (value) => <span className="font-medium text-gray-800">{value}</span>,
      align: "right",
    },
    {
      key: "status",
      title: "상태",
      render: (value) => (
        <Badge variant={value === "판매중" ? "success" : "secondary"} size="small">
          {value}
        </Badge>
      ),
      align: "center",
    },
    {
      key: "updatedAt",
      title: "최근 수정일",
    },
  ];

  return (
    <Container maxWidth="7xl" className="space-y-6 pb-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-gray-900">판매처 상품 관리</h1>
        <p className="text-sm text-gray-600">
          각 판매처에서 등록된 상품을 조회하고, 판매 상태와 재고를 한 번에 확인하세요.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card padding="lg" className="flex flex-col gap-2">
          <span className="text-xs text-gray-500">전체 상품 수</span>
          <span className="text-2xl font-semibold text-gray-900">{summary.total}</span>
        </Card>
        <Card padding="lg" className="flex flex-col gap-2">
          <span className="text-xs text-gray-500">판매중</span>
          <span className="text-2xl font-semibold text-green-600">{summary.selling}</span>
        </Card>
        <Card padding="lg" className="flex flex-col gap-2">
          <span className="text-xs text-gray-500">판매중지</span>
          <span className="text-2xl font-semibold text-red-500">{summary.stopped}</span>
        </Card>
        <Card padding="lg" className="flex flex-col gap-2">
          <span className="text-xs text-gray-500">평균 판매가</span>
          <span className="text-2xl font-semibold text-gray-900">
            ₩{Math.round(summary.avgPrice).toLocaleString()}
          </span>
        </Card>
      </div>

      <Card padding="lg" className="space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-1 flex-col gap-3 md:flex-row md:items-center">
            <Input
              label="검색"
              placeholder="상품명 또는 코드 검색"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              fullWidth
            />
            <Dropdown
              label="판매처"
              options={vendorOptions}
              value={vendorFilter}
              onChange={setVendorFilter}
              fullWidth
            />
            <Dropdown
              label="상태"
              options={statusOptions}
              value={statusFilter}
              onChange={setStatusFilter}
              fullWidth
            />
          </div>
          <Stack direction="row" gap={3} className="flex-wrap">
            <Button variant="outline" size="small" onClick={() => showStatus("상품 내보내기 기능은 준비 중입니다.")}>
              내보내기
            </Button>
            <Button size="small" onClick={() => showStatus("선택한 판매처로 상품을 연동합니다.")}>
              판매처 연동
            </Button>
          </Stack>
        </div>

        <Table<VendorProductRow>
          bordered
          columns={columns}
          data={filteredProducts}
          size="middle"
          className="bg-white"
        />
      </Card>
    </Container>
  );
}

function showStatus(message: string) {
  if (typeof window !== "undefined") {
    window.alert(message);
  }
}
