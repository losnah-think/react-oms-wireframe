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

const STORAGE_KEY = "productCategories_v3";

export type Category = {
  id: string;
  name: string;
  parentId: string | null;
  depth: number;
  description?: string;
  isDefault?: boolean;
};

const defaultCategories: Category[] = [
  { id: "default-1", name: "의류", parentId: null, depth: 0, isDefault: true },
  { id: "default-2", name: "상의", parentId: "default-1", depth: 1, isDefault: true },
  { id: "default-3", name: "티셔츠", parentId: "default-2", depth: 2, isDefault: true },
  { id: "default-4", name: "신발", parentId: null, depth: 0, isDefault: true },
  { id: "default-5", name: "스니커즈", parentId: "default-4", depth: 1, isDefault: true },
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

const ProductCategoryPage: React.FC = () => {
  const [categories, setCategories] = React.useState<Category[]>(loadCategories);
  const [search, setSearch] = React.useState("");
  const [isModalOpen, setModalOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [formState, setFormState] = React.useState({
    name: "",
    parentId: null as string | null,
    description: "",
  });

  React.useEffect(() => {
    saveCategories(categories);
  }, [categories]);

  // 계층 구조로 정렬하는 함수
  const sortCategoriesHierarchically = (cats: Category[]): Category[] => {
    const result: Category[] = [];
    const categoryMap = new Map(cats.map(cat => [cat.id, cat]));
    
    // 1단계(depth 0) 카테고리부터 시작
    const addCategoryAndChildren = (category: Category) => {
      result.push(category);
      
      // 이 카테고리를 부모로 하는 자식들을 찾아서 추가
      const children = cats
        .filter(cat => cat.parentId === category.id)
        .sort((a, b) => a.name.localeCompare(b.name));
      
      children.forEach(child => addCategoryAndChildren(child));
    };
    
    // 최상위(depth 0) 카테고리들을 찾아서 정렬
    const topLevel = cats
      .filter(cat => cat.parentId === null)
      .sort((a, b) => a.name.localeCompare(b.name));
    
    topLevel.forEach(cat => addCategoryAndChildren(cat));
    
    return result;
  };

  const filtered = React.useMemo(() => {
    const searchFiltered = categories.filter((category) => {
      const matchesSearch = search
        ? category.name.includes(search)
        : true;
      return matchesSearch;
    });
    
    // 계층 구조로 정렬
    return sortCategoriesHierarchically(searchFiltered);
  }, [categories, search]);

  const getParentCategories = (currentDepth: number) => {
    return categories.filter(cat => cat.depth === currentDepth - 1);
  };

  const getCategoryPath = (categoryId: string): string => {
    const category = categories.find(c => c.id === categoryId);
    if (!category) return "";
    
    if (category.parentId) {
      const parentPath = getCategoryPath(category.parentId);
      return parentPath ? `${parentPath} > ${category.name}` : category.name;
    }
    return category.name;
  };

  const openModal = (category?: Category) => {
    if (category) {
      setEditingId(category.id);
      setFormState({
        name: category.name,
        parentId: category.parentId,
        description: category.description ?? "",
      });
    } else {
      setEditingId(null);
      setFormState({
        name: "",
        parentId: null,
        description: "",
      });
    }
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!formState.name.trim()) {
      window.alert("카테고리 이름을 입력하세요");
      return;
    }

    // 뎁스 계산
    let depth = 0;
    if (formState.parentId) {
      const parent = categories.find(c => c.id === formState.parentId);
      if (parent) {
        depth = parent.depth + 1;
        if (depth > 3) {
          window.alert("카테고리는 최대 4단계까지만 가능합니다");
          return;
        }
      }
    }

    const categoryData: Category = {
      id: editingId ?? `cat-${Date.now()}`,
      name: formState.name.trim(),
      parentId: formState.parentId,
      depth,
      description: formState.description.trim() || undefined,
      isDefault: editingId ? categories.find((c) => c.id === editingId)?.isDefault : false,
    };

    setCategories((prev) => {
      if (editingId) {
        // 수정: depth나 parentId가 변경되면 하위 카테고리들도 업데이트
        const oldCategory = prev.find(c => c.id === editingId);
        if (oldCategory && (oldCategory.depth !== depth || oldCategory.parentId !== formState.parentId)) {
          const updateChildrenDepth = (parentId: string, baseDepth: number): Category[] => {
            return prev.map(cat => {
              if (cat.parentId === parentId) {
                const newDepth = baseDepth + 1;
                return { ...cat, depth: newDepth };
              }
              return cat;
            });
          };
          
          let updated = prev.map((category) => 
            category.id === editingId ? categoryData : category
          );
          
          // 하위 카테고리 depth 재계산
          const children = updated.filter(c => c.parentId === editingId);
          children.forEach(child => {
            updated = updateChildrenDepth(child.id, depth);
          });
          
          return updated;
        }
        return prev.map((category) => (category.id === editingId ? categoryData : category));
      } else {
        return [...prev, categoryData];
      }
    });
    setModalOpen(false);
  };

  const handleDelete = (id: string) => {
    const target = categories.find((category) => category.id === id);
    if (!target) return;
    if (target.isDefault) {
      window.alert("기본 카테고리는 삭제할 수 없습니다");
      return;
    }
    if (!window.confirm("삭제하시겠습니까?")) return;
    setCategories((prev) => prev.filter((category) => category.id !== id));
  };

  const columns: TableColumn<Category>[] = [
    {
      key: "name",
      title: "카테고리",
      render: (value, cat) => (
        <div style={{ paddingLeft: `${cat.depth * 24}px` }}>
          <div className="font-medium text-gray-900">
            {cat.depth > 0 && <span className="text-gray-400 mr-2">└</span>}
            {value}
          </div>
          {cat.description && (
            <div className="text-sm text-gray-500 mt-1">{cat.description}</div>
          )}
        </div>
      ),
    },
    {
      key: "depth",
      title: "단계",
      render: (depth) => (
        <div className="text-sm text-gray-600">
          {depth + 1}단계
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
            variant="ghost"
            onClick={() => openModal(cat)}
          >
            수정
          </Button>
          <Button
            size="small"
            variant="ghost"
            onClick={() => handleDelete(cat.id)}
            disabled={cat.isDefault}
          >
            삭제
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Container maxWidth="full" centered={false} padding="lg">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">상품 카테고리</h1>
            <p className="text-sm text-gray-600 mt-1">상품 카테고리 관리</p>
          </div>
          <Button onClick={() => openModal()}>
            카테고리 추가
          </Button>
        </div>

        {/* 검색 */}
        <Card padding="lg" className="mb-6">
          <Input
            placeholder="카테고리 이름으로 검색"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            fullWidth
          />
        </Card>

        {/* 카테고리 목록 테이블 */}
        <Card padding="none">
          <Table
            data={filtered}
            columns={columns}
          />
        </Card>
      </div>

      {/* 추가/수정 모달 */}
      <Modal
        open={isModalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? "카테고리 수정" : "카테고리 추가"}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              상위 카테고리
            </label>
            <select
              value={formState.parentId ?? ""}
              onChange={(e) => setFormState((prev) => ({ 
                ...prev, 
                parentId: e.target.value || null 
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">없음 (1단계)</option>
              {categories
                .filter(cat => {
                  // 자기 자신과 자신의 하위는 제외
                  if (editingId && cat.id === editingId) return false;
                  // 3단계까지만 상위로 선택 가능
                  return cat.depth < 3;
                })
                .map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {getCategoryPath(cat.id)} ({cat.depth + 1}단계)
                  </option>
                ))}
            </select>
          </div>

          <Input
            label="카테고리명"
            placeholder="예: 티셔츠"
            value={formState.name}
            onChange={(event) => setFormState((prev) => ({ ...prev, name: event.target.value }))}
            fullWidth
          />
          
          <Input
            label="설명"
            placeholder="예: 반팔 티셔츠"
            value={formState.description}
            onChange={(event) => setFormState((prev) => ({ ...prev, description: event.target.value }))}
            fullWidth
          />

          <div className="flex gap-3 pt-4">
            <Button variant="ghost" onClick={() => setModalOpen(false)} fullWidth>
              취소
            </Button>
            <Button onClick={handleSave} fullWidth>
              {editingId ? "수정" : "등록"}
            </Button>
          </div>
        </div>
      </Modal>
    </Container>
  );
};

export default ProductCategoryPage;