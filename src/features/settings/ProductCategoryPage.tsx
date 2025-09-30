import React from "react";
import {
  Container,
  Card,
  Button,
  Input,
  Dropdown,
  Badge,
  Stack,
  Table,
  type TableColumn,
  Modal,
} from "../../design-system";

const STORAGE_KEY = "productCategories_v2";

export type Category = {
  id: string;
  name: string;
  slug: string;
  group: string;
  description?: string;
  isDefault?: boolean;
};

const groupOptions = [
  { value: "의류", label: "의류" },
  { value: "잡화", label: "잡화" },
  { value: "식품", label: "식품" },
  { value: "생활", label: "생활" },
  { value: "기타", label: "기타" },
];

const defaultCategories: Category[] = [
  { id: "default-1", name: "티셔츠", slug: "clothing-tshirt", group: "의류", isDefault: true },
  { id: "default-2", name: "스니커즈", slug: "shoes-sneakers", group: "의류", isDefault: true },
  { id: "default-3", name: "주얼리", slug: "accessories-jewelry", group: "잡화", isDefault: true },
  { id: "default-4", name: "건강식품", slug: "food-health", group: "식품", isDefault: true },
];

const loadCategories = (): Category[] => {
  if (typeof window === "undefined") return defaultCategories;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultCategories));
      return defaultCategories;
    }
    const parsed = JSON.parse(raw) as Category[];
    return parsed.length ? parsed : defaultCategories;
  } catch (err) {
    return defaultCategories;
  }
};

const saveCategories = (categories: Category[]) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
  } catch (err) {
    // ignore
  }
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9가-힣\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

const ProductCategoryPage: React.FC = () => {
  const [categories, setCategories] = React.useState<Category[]>(loadCategories);
  const [search, setSearch] = React.useState("");
  const [groupFilter, setGroupFilter] = React.useState("");
  const [selectedId, setSelectedId] = React.useState<string | null>(
    () => loadCategories()[0]?.id ?? null,
  );
  const [detailForm, setDetailForm] = React.useState({
    name: "",
    slug: "",
    group: groupOptions[0].value,
    description: "",
  });
  const [isModalOpen, setModalOpen] = React.useState(false);
  const [newCategory, setNewCategory] = React.useState({
    name: "",
    slug: "",
    group: groupOptions[0].value,
    description: "",
  });

  React.useEffect(() => {
    saveCategories(categories);
  }, [categories]);

  React.useEffect(() => {
    if (!selectedId && categories.length) {
      setSelectedId(categories[0].id);
    }
  }, [categories, selectedId]);

  React.useEffect(() => {
    if (!selectedId) return;
    const current = categories.find((category) => category.id === selectedId);
    if (!current) return;
    setDetailForm({
      name: current.name,
      slug: current.slug,
      group: current.group,
      description: current.description ?? "",
    });
  }, [selectedId, categories]);

  const filtered = React.useMemo(() => {
    return categories.filter((category) => {
      const matchesSearch = search
        ? category.name.includes(search) || category.slug.includes(search)
        : true;
      const matchesGroup = groupFilter ? category.group === groupFilter : true;
      return matchesSearch && matchesGroup;
    });
  }, [categories, search, groupFilter]);

  const summary = React.useMemo(() => {
    const total = categories.length;
    const defaultCount = categories.filter((category) => category.isDefault).length;
    const groupCounts = groupOptions.reduce((acc, group) => {
      acc[group.value] = categories.filter((category) => category.group === group.value).length;
      return acc;
    }, {} as Record<string, number>);
    return { total, defaultCount, groupCounts };
  }, [categories]);

  const columns: TableColumn<Category>[] = [
    {
      key: "name",
      title: "상품 분류",
      render: (_, record) => (
        <div className="flex flex-col">
          <span className="font-semibold text-gray-900">{record.name}</span>
          <span className="text-xs text-gray-500">슬러그: {record.slug}</span>
        </div>
      ),
    },
    {
      key: "group",
      title: "그룹",
      render: (value) => <span className="text-sm text-gray-700">{value}</span>,
    },
    {
      key: "description",
      title: "설명",
      render: (value) => (
        <span className="text-sm text-gray-600">{value || "-"}</span>
      ),
    },
  ];

  const handleDetailSave = () => {
    if (!selectedId) return;
    if (!detailForm.name.trim()) {
      window.alert("분류명을 입력해주세요.");
      return;
    }
    setCategories((prev) =>
      prev.map((category) =>
        category.id === selectedId
          ? {
              ...category,
              name: detailForm.name.trim(),
              slug: detailForm.slug.trim() || slugify(detailForm.name),
              group: detailForm.group,
              description: detailForm.description.trim() || undefined,
            }
          : category,
      ),
    );
  };

  const handleDelete = () => {
    if (!selectedId) return;
    const target = categories.find((category) => category.id === selectedId);
    if (!target) return;
    if (target.isDefault) {
      window.alert("기본 상품 분류는 삭제할 수 없습니다.");
      return;
    }
    if (!window.confirm("이 상품 분류를 삭제하시겠습니까?")) return;
    setCategories((prev) => prev.filter((category) => category.id !== selectedId));
    setSelectedId((prevSelected) =>
      prevSelected === target.id ? (prev.filter((category) => category.id !== target.id)[0]?.id ?? null) : prevSelected,
    );
  };

  const openAddModal = () => {
    setNewCategory({ name: "", slug: "", group: groupOptions[0].value, description: "" });
    setModalOpen(true);
  };

  const handleCreate = () => {
    if (!newCategory.name.trim()) {
      window.alert("분류명을 입력해주세요.");
      return;
    }
    const slug = newCategory.slug.trim() || slugify(newCategory.name);
    const category: Category = {
      id: `cat-${Date.now()}`,
      name: newCategory.name.trim(),
      slug,
      group: newCategory.group,
      description: newCategory.description.trim() || undefined,
    };
    setCategories((prev) => [category, ...prev]);
    setSelectedId(category.id);
    setModalOpen(false);
  };

  return (
    <Container maxWidth="7xl" className="space-y-6 pb-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-gray-900">상품 분류 관리</h1>
        <p className="text-sm text-gray-600">
          기본 분류에 사용자 정의 분류를 추가하고, 그룹별로 정리합니다.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card padding="lg" className="flex flex-col gap-1">
          <span className="text-xs text-gray-500">총 분류</span>
          <span className="text-2xl font-semibold text-gray-900">{summary.total}</span>
        </Card>
        <Card padding="lg" className="flex flex-col gap-1">
          <span className="text-xs text-gray-500">기본 분류</span>
          <span className="text-2xl font-semibold text-gray-900">{summary.defaultCount}</span>
        </Card>
        <Card padding="lg" className="flex flex-col gap-1">
          <span className="text-xs text-gray-500">의류 그룹</span>
          <span className="text-2xl font-semibold text-gray-900">{summary.groupCounts["의류"] ?? 0}</span>
        </Card>
        <Card padding="lg" className="flex flex-col gap-1">
          <span className="text-xs text-gray-500">잡화 그룹</span>
          <span className="text-2xl font-semibold text-gray-900">{summary.groupCounts["잡화"] ?? 0}</span>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.6fr)_minmax(0,0.4fr)]">
        <Card padding="lg" className="space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex flex-1 flex-col gap-3 md:flex-row md:items-center">
              <Input
                label="검색"
                placeholder="상품 분류명 또는 슬러그 검색"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                fullWidth
              />
              <Dropdown
                label="그룹"
                options={[{ value: "", label: "전체 그룹" }, ...groupOptions]}
                value={groupFilter}
                onChange={setGroupFilter}
                fullWidth
              />
            </div>
            <Stack direction="row" gap={3} className="flex-wrap">
              <Button variant="outline" size="small" onClick={() => setGroupFilter("")}>필터 초기화</Button>
              <Button size="small" onClick={openAddModal}>상품 분류 추가</Button>
            </Stack>
          </div>

          <Table<Category>
            bordered
            data={filtered}
            columns={columns}
            size="middle"
            rowSelection={{
              selectedRowKeys: selectedId ? [selectedId] : [],
              onChange: (keys) => setSelectedId(keys[0] ?? null),
            }}
            onRow={(record) => ({
              onClick: () => setSelectedId(record.id),
              className: record.id === selectedId ? "bg-primary-50" : undefined,
            })}
          />
        </Card>

        <Card padding="lg" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">상품 분류 상세</h2>
            {selectedId && (
              <Badge size="small" variant="secondary">
                {categories.find((category) => category.id === selectedId)?.isDefault ? "기본값" : "사용자 정의"}
              </Badge>
            )}
          </div>

          {selectedId ? (
            <div className="space-y-4">
              <Input
                label="상품 분류명"
                value={detailForm.name}
                onChange={(event) => setDetailForm((prev) => ({ ...prev, name: event.target.value }))}
                fullWidth
              />
              <Input
                label="슬러그"
                value={detailForm.slug}
                placeholder="입력하지 않으면 자동 생성"
                onChange={(event) => setDetailForm((prev) => ({ ...prev, slug: event.target.value }))}
                fullWidth
              />
              <Dropdown
                label="그룹"
                options={groupOptions}
                value={detailForm.group}
                onChange={(value) => setDetailForm((prev) => ({ ...prev, group: value }))}
                fullWidth
              />
              <Input
                label="설명"
                value={detailForm.description}
                onChange={(event) => setDetailForm((prev) => ({ ...prev, description: event.target.value }))}
                fullWidth
              />

              <Stack direction="row" gap={3} className="flex-wrap">
                <Button size="small" onClick={handleDetailSave}>저장</Button>
                <Button
                  size="small"
                  variant="outline"
                  onClick={() => {
                    const current = categories.find((category) => category.id === selectedId);
                    if (!current) return;
                    setDetailForm({
                      name: current.name,
                      slug: current.slug,
                      group: current.group,
                      description: current.description ?? "",
                    });
                  }}
                >
                  되돌리기
                </Button>
                <Button
                  size="small"
                  variant="outline"
                  onClick={handleDelete}
                  disabled={categories.find((category) => category.id === selectedId)?.isDefault}
                >
                  삭제
                </Button>
              </Stack>
            </div>
          ) : (
            <div className="rounded-md border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">
              왼쪽 목록에서 상품 분류를 선택하면 상세 정보를 편집할 수 있습니다.
            </div>
          )}
        </Card>
      </div>

      <Modal
        open={isModalOpen}
        onClose={() => setModalOpen(false)}
        title="상품 분류 추가"
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
            label="상품 분류명"
            value={newCategory.name}
            onChange={(event) => setNewCategory((prev) => ({ ...prev, name: event.target.value }))}
            fullWidth
          />
          <Input
            label="슬러그"
            value={newCategory.slug}
            placeholder="입력하지 않으면 자동 생성"
            onChange={(event) => setNewCategory((prev) => ({ ...prev, slug: event.target.value }))}
            fullWidth
          />
          <Dropdown
            label="그룹"
            options={groupOptions}
            value={newCategory.group}
            onChange={(value) => setNewCategory((prev) => ({ ...prev, group: value }))}
            fullWidth
          />
          <Input
            label="설명"
            value={newCategory.description}
            onChange={(event) => setNewCategory((prev) => ({ ...prev, description: event.target.value }))}
            fullWidth
          />
        </div>
      </Modal>
    </Container>
  );
};

export default ProductCategoryPage;
