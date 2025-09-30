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
      prevSelected === target.id ? (prev.filter((category) => category.id !== target.id)[0]?.id ?? null) : prevSelected,
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
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">카테고리</h1>
          <Button size="big" onClick={openAddModal}>
            ➕ 추가
          </Button>
        </div>
      </div>

      {/* 통계 */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-5 gap-6 mb-8">
          <button className="bg-white rounded-xl p-8 text-center shadow-sm hover:shadow-md transition">
            <div className="text-5xl font-bold text-gray-900 mb-2">{summary.total}</div>
            <div className="text-gray-600">전체</div>
          </button>
          
          <button className="bg-blue-50 rounded-xl p-8 text-center shadow-sm hover:shadow-md transition">
            <div className="text-5xl font-bold text-blue-600 mb-2">{summary.groupCounts["의류"] ?? 0}</div>
            <div className="text-blue-700 font-medium">의류</div>
          </button>

          <button className="bg-purple-50 rounded-xl p-8 text-center shadow-sm hover:shadow-md transition">
            <div className="text-5xl font-bold text-purple-600 mb-2">{summary.groupCounts["잡화"] ?? 0}</div>
            <div className="text-purple-700 font-medium">잡화</div>
          </button>

          <button className="bg-green-50 rounded-xl p-8 text-center shadow-sm hover:shadow-md transition">
            <div className="text-5xl font-bold text-green-600 mb-2">{summary.groupCounts["식품"] ?? 0}</div>
            <div className="text-green-700 font-medium">식품</div>
          </button>

          <button className="bg-orange-50 rounded-xl p-8 text-center shadow-sm hover:shadow-md transition">
            <div className="text-5xl font-bold text-orange-600 mb-2">{summary.groupCounts["생활"] ?? 0}</div>
            <div className="text-orange-700 font-medium">생활</div>
          </button>
        </div>

        {/* 검색 */}
        <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
          <div className="grid grid-cols-2 gap-4">
            <Input
              placeholder="카테고리 검색"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              fullWidth
            />
            <Dropdown
              options={[{ value: "", label: "전체 그룹" }, ...groupOptions]}
              value={groupFilter}
              onChange={setGroupFilter}
              fullWidth
            />
          </div>
        </div>

        {/* 카테고리 목록 - 거대한 카드 */}
        <div className="space-y-4">
          {filtered.map((cat) => {
            const isSelected = selectedId === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedId(isSelected ? null : cat.id)}
                className={`w-full bg-white rounded-xl p-6 text-left shadow-sm hover:shadow-md transition ${
                  isSelected ? "ring-4 ring-blue-500" : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="text-2xl font-bold text-gray-900">{cat.name}</div>
                      {cat.isDefault && (
                        <span className="text-sm px-3 py-1 bg-gray-100 text-gray-600 rounded-full">
                          기본
                        </span>
                      )}
                    </div>
                    <div className="text-gray-500">{cat.group}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-400">{cat.slug}</div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* 선택된 카테고리 편집 */}
        {selectedId && (
          <div className="mt-8 bg-white rounded-xl p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">편집</h2>
              <Button 
                variant="ghost" 
                onClick={() => setSelectedId(null)}
              >
                ✕
              </Button>
            </div>

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

              <div className="flex gap-4 pt-4">
                <Button size="big" onClick={handleDetailSave} fullWidth>
                  💾 저장
                </Button>
                <Button
                  size="big"
                  variant="outline"
                  onClick={handleDelete}
                  disabled={categories.find((category) => category.id === selectedId)?.isDefault}
                  fullWidth
                >
                  🗑️ 삭제
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

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