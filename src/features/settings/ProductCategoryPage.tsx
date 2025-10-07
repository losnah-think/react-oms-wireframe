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
  const [isEditModalOpen, setEditModalOpen] = React.useState(false);
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

  const handleDetailSave = () => {
    if (!selectedId) return;
    if (!detailForm.name.trim()) {
      window.alert("카테고리 이름을 입력하세요");
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
    setEditModalOpen(false);
  };

  const handleDelete = () => {
    if (!selectedId) return;
    const target = categories.find((category) => category.id === selectedId);
    if (!target) return;
    if (target.isDefault) {
      window.alert("기본 카테고리는 삭제할 수 없습니다");
      return;
    }
    if (!window.confirm("삭제하시겠습니까?")) return;
    setCategories((prev) => prev.filter((category) => category.id !== selectedId));
    setSelectedId((prevSelected) =>
      prevSelected === target.id ? (categories.filter((category: any) => category.id !== target.id)[0]?.id ?? null) : prevSelected,
    );
  };

  const openAddModal = () => {
    setNewCategory({ name: "", slug: "", group: groupOptions[0].value, description: "" });
    setModalOpen(true);
  };

  const handleCreate = () => {
    if (!newCategory.name.trim()) {
      window.alert("카테고리 이름을 입력하세요");
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
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">상품 카테고리</h1>
              <p className="text-gray-600 mt-1">상품을 체계적으로 분류하고 관리하세요</p>
            </div>
            <Button size="big" onClick={openAddModal} className="shadow-lg">
              ➕ 새 카테고리 추가
            </Button>
          </div>
        </div>
      </div>

      {/* 통계 */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900 mb-1">{summary.total}</div>
                <div className="text-gray-600 font-medium">전체</div>
              </div>
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <span className="text-xl">📋</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-blue-600 mb-1">{summary.groupCounts["의류"] ?? 0}</div>
                <div className="text-gray-600 font-medium">의류</div>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-xl">👕</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-purple-600 mb-1">{summary.groupCounts["잡화"] ?? 0}</div>
                <div className="text-gray-600 font-medium">잡화</div>
              </div>
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-xl">👜</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-green-600 mb-1">{summary.groupCounts["식품"] ?? 0}</div>
                <div className="text-gray-600 font-medium">식품</div>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-xl">🍎</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-orange-600 mb-1">{summary.groupCounts["생활"] ?? 0}</div>
                <div className="text-gray-600 font-medium">생활</div>
              </div>
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <span className="text-xl">🏠</span>
              </div>
            </div>
          </div>
        </div>

        {/* 검색 */}
        <div className="bg-white rounded-xl p-6 mb-6 shadow-sm border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Input
                placeholder="카테고리 이름 또는 경로로 검색..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                fullWidth
                className="text-lg"
              />
            </div>
            <div>
              <Dropdown
                options={[{ value: "", label: "전체 그룹" }, ...groupOptions]}
                value={groupFilter}
                onChange={setGroupFilter}
                fullWidth
              />
            </div>
          </div>
          {(search || groupFilter) && (
            <div className="mt-3 text-sm text-gray-500">
              {search && `"${search}" 검색 결과: `}
              {groupFilter && `${groupOptions.find(g => g.value === groupFilter)?.label} 그룹: `}
              {filtered.length}개 카테고리
            </div>
          )}
        </div>

        {/* 카테고리 목록 테이블 */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-100">
            <div className="text-6xl mb-4">🏷️</div>
            <div className="text-xl font-semibold text-gray-900 mb-2">카테고리가 없습니다</div>
            <div className="text-gray-500 mb-6">새로운 상품 카테고리를 추가해보세요</div>
            <Button size="big" onClick={openAddModal}>
              ➕ 첫 번째 카테고리 추가
            </Button>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <Table
              data={filtered}
              columns={[
                {
                  key: "name",
                  title: "카테고리명",
                  render: (value, cat) => (
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900">{value}</span>
                        {cat.isDefault && (
                          <Badge variant="secondary" size="small">기본</Badge>
                        )}
                      </div>
                      {cat.description && (
                        <div className="text-sm text-gray-500 mt-1">{cat.description}</div>
                      )}
                    </div>
                  ),
                },
                {
                  key: "group",
                  title: "그룹",
                  render: (group) => {
                    const groupColors = {
                      "의류": "bg-blue-50 text-blue-700 border-blue-200",
                      "잡화": "bg-purple-50 text-purple-700 border-purple-200",
                      "식품": "bg-green-50 text-green-700 border-green-200",
                      "생활": "bg-orange-50 text-orange-700 border-orange-200",
                      "기타": "bg-gray-50 text-gray-700 border-gray-200"
                    };
                    return (
                      <Badge 
                        className={groupColors[group as keyof typeof groupColors] || groupColors["기타"]}
                      >
                        {group}
                      </Badge>
                    );
                  },
                },
                {
                  key: "slug",
                  title: "경로",
                  render: (slug) => (
                    <div className="font-mono text-sm text-gray-600 bg-gray-50 px-2 py-1 rounded">
                      {slug}
                    </div>
                  ),
                },
                {
                  key: "actions",
                  title: "작업",
                  render: (_, cat) => (
                    <div className="flex items-center gap-2">
                      <Button
                        size="small"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedId(cat.id);
                          setDetailForm({
                            name: cat.name,
                            slug: cat.slug,
                            group: cat.group,
                            description: cat.description ?? "",
                          });
                          setEditModalOpen(true);
                        }}
                      >
                        편집
                      </Button>
                      <Button
                        size="small"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedId(cat.id);
                          handleDelete();
                        }}
                        disabled={cat.isDefault}
                        className="text-red-600 hover:text-red-700"
                      >
                        삭제
                      </Button>
                    </div>
                  ),
                },
              ]}
            />
          </div>
        )}

      </div>

      {/* 편집 모달 */}
      <Modal
        open={isEditModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="카테고리 편집"
        footer={
          <div className="flex gap-4">
            <Button variant="ghost" onClick={() => setEditModalOpen(false)} fullWidth>
              취소
            </Button>
            <Button onClick={handleDetailSave} fullWidth>
              저장
            </Button>
          </div>
        }
      >
        <div className="space-y-6">
          <Input
            label="이름"
            value={detailForm.name}
            onChange={(event) => setDetailForm((prev) => ({ ...prev, name: event.target.value }))}
            fullWidth
          />
          
          <Input
            label="경로"
            value={detailForm.slug}
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
        </div>
      </Modal>

      {/* 추가 모달 */}
      <Modal
        open={isModalOpen}
        onClose={() => setModalOpen(false)}
        title="카테고리 추가"
        footer={
          <div className="flex gap-4">
            <Button variant="ghost" onClick={() => setModalOpen(false)} fullWidth>
              취소
            </Button>
            <Button onClick={handleCreate} fullWidth>등록</Button>
          </div>
        }
      >
        <div className="space-y-6">
          <Input
            label="이름"
            placeholder="티셔츠"
            value={newCategory.name}
            onChange={(event) => setNewCategory((prev) => ({ ...prev, name: event.target.value }))}
            fullWidth
          />
          
          <Input
            label="경로"
            placeholder="tshirt"
            value={newCategory.slug}
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
            placeholder="반팔 티셔츠"
            value={newCategory.description}
            onChange={(event) => setNewCategory((prev) => ({ ...prev, description: event.target.value }))}
            fullWidth
          />
        </div>
      </Modal>
    </div>
  );
};

export default ProductCategoryPage;