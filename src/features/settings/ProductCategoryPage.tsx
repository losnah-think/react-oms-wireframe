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
} from "../../design-system";

const STORAGE_KEY = "productCategories_v2";

export type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  group: string;
  isDefault?: boolean;
};

const categoryGroups = [
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
    return parsed.length > 0 ? parsed : defaultCategories;
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

const slugify = (name: string) =>
  name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9가-힣\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

export default function ProductCategoryPage() {
  const [categories, setCategories] = React.useState<Category[]>(loadCategories);
  const [search, setSearch] = React.useState("");
  const [groupFilter, setGroupFilter] = React.useState("");
  const [isModalOpen, setModalOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [formState, setFormState] = React.useState({
    name: "",
    slug: "",
    group: categoryGroups[0].value,
    description: "",
  });

  React.useEffect(() => {
    saveCategories(categories);
  }, [categories]);

  const filtered = categories.filter((category) => {
    const matchesSearch = search
      ? category.name.includes(search) || category.slug.includes(search)
      : true;
    const matchesGroup = groupFilter ? category.group === groupFilter : true;
    return matchesSearch && matchesGroup;
  });

  const openModal = (category?: Category) => {
    if (category) {
      setEditingId(category.id);
      setFormState({
        name: category.name,
        slug: category.slug,
        group: category.group,
        description: category.description ?? "",
      });
    } else {
      setEditingId(null);
      setFormState({
        name: "",
        slug: "",
        group: categoryGroups[0].value,
        description: "",
      });
    }
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!formState.name.trim()) {
      window.alert("카테고리 이름을 입력해주세요.");
      return;
    }
    const slug = formState.slug.trim() || slugify(formState.name);
    const category: Category = {
      id: editingId ?? `cat-${Date.now()}`,
      name: formState.name.trim(),
      slug,
      group: formState.group,
      description: formState.description.trim() || undefined,
      isDefault: editingId ? categories.find((item) => item.id === editingId)?.isDefault : false,
    };

    setCategories((prev) =>
      editingId ? prev.map((item) => (item.id === editingId ? category : item)) : [category, ...prev],
    );
    setModalOpen(false);
  };

  const handleDelete = (id: string) => {
    const target = categories.find((category) => category.id === id);
    if (!target || target.isDefault) {
      window.alert("기본 카테고리는 삭제할 수 없습니다.");
      return;
    }
    if (!window.confirm("카테고리를 삭제하시겠습니까?")) return;
    setCategories((prev) => prev.filter((category) => category.id !== id));
  };

  return (
    <Container maxWidth="7xl" className="space-y-6 pb-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-gray-900">상품 분류 관리</h1>
        <p className="text-sm text-gray-600">
          내부 상품 분류 체계를 관리하고, 신규 분류를 추가하거나 기본 분류를 확인하세요.
        </p>
      </div>

      <Card padding="lg" className="space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-1 flex-col gap-3 md:flex-row md:items-center">
            <Input
              label="검색"
              placeholder="상품 분류명 또는 슬러그로 검색"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              fullWidth
            />
            <Dropdown
              label="상품 분류 그룹"
              options={[{ value: "", label: "전체 그룹" }, ...categoryGroups]}
              value={groupFilter}
              onChange={setGroupFilter}
              fullWidth
            />
          </div>
          <Stack direction="row" gap={3} className="flex-wrap">
            <Button variant="outline" size="small" onClick={() => setGroupFilter("")}>필터 초기화</Button>
            <Button size="small" onClick={() => openModal()}>상품 분류 추가</Button>
          </Stack>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((category) => (
            <Card key={category.id} padding="lg" className="flex h-full flex-col gap-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                    {category.isDefault && (
                      <Badge size="small" variant="primary">
                        기본값
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">슬러그: {category.slug}</p>
                  <p className="text-xs text-gray-500">그룹: {category.group}</p>
                  {category.description && (
                    <p className="text-xs text-gray-600">{category.description}</p>
                  )}
                </div>
                <Stack direction="column" gap={2}>
                  <Button variant="ghost" size="small" onClick={() => openModal(category)}>
                    수정
                  </Button>
                  <Button
                    variant="outline"
                    size="small"
                    disabled={category.isDefault}
                    onClick={() => handleDelete(category.id)}
                  >
                    삭제
                  </Button>
                </Stack>
              </div>
            </Card>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="rounded-md border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500">
            조건에 맞는 상품 분류가 없습니다. 새 분류를 추가해 보세요.
          </div>
        )}
      </Card>

      <Card padding="lg" className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">참고: 기본 상품 분류</h2>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {defaultCategories.map((category) => (
            <Card key={category.id} padding="md" className="space-y-2 bg-gray-50">
              <Badge size="small" variant="secondary">
                기본값
              </Badge>
              <h3 className="text-sm font-semibold text-gray-900">{category.name}</h3>
              <p className="text-xs text-gray-500">슬러그: {category.slug}</p>
              <p className="text-xs text-gray-500">그룹: {category.group}</p>
            </Card>
          ))}
        </div>
      </Card>

      <Modal
        open={isModalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? "상품 분류 수정" : "상품 분류 추가"}
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
          <Input
            label="상품 분류명"
            value={formState.name}
            onChange={(event) => setFormState((prev) => ({ ...prev, name: event.target.value }))}
            fullWidth
          />
          <Input
            label="슬러그"
            value={formState.slug}
            placeholder="입력하지 않으면 자동 생성"
            onChange={(event) => setFormState((prev) => ({ ...prev, slug: event.target.value }))}
            fullWidth
          />
          <Dropdown
            label="그룹"
            options={categoryGroups}
            value={formState.group}
            onChange={(value) => setFormState((prev) => ({ ...prev, group: value }))}
            fullWidth
          />
          <Input
            label="설명"
            value={formState.description}
            onChange={(event) => setFormState((prev) => ({ ...prev, description: event.target.value }))}
            fullWidth
          />
        </div>
      </Modal>
    </Container>
  );
}
