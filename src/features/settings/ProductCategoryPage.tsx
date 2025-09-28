import React from "react";
import { Container, Card, Button, Input } from "../../design-system";

type Category = {
  id: string;
  name: string;
  slug?: string;
};

const STORAGE_KEY = "productCategories";

const defaultCategories: Category[] = [
  { id: "c1", name: "의류", slug: "clothing" },
  { id: "c2", name: "신발", slug: "shoes" },
  { id: "c3", name: "액세서리", slug: "accessories" },
];

function loadCategories(): Category[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return defaultCategories;
}

function saveCategories(categories: Category[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
  } catch (e) {}
}

export default function ProductCategoryPage() {
  const [categories, setCategories] = React.useState<Category[]>(() =>
    loadCategories(),
  );
  const [newCategory, setNewCategory] = React.useState("");
  const [newSlug, setNewSlug] = React.useState("");

  React.useEffect(() => {
    saveCategories(categories);
  }, [categories]);

  const addCategory = () => {
    if (!newCategory.trim()) return;
    const category: Category = {
      id: `c_${Date.now()}`,
      name: newCategory.trim(),
      slug: newSlug.trim() || undefined,
    };
    setCategories((prev) => [...prev, category]);
    setNewCategory("");
    setNewSlug("");
  };

  const removeCategory = (id: string) => {
    if (!confirm("카테고리를 삭제하시겠습니까?")) return;
    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <Container>
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">상품 카테고리 관리</h1>
            <p className="text-gray-600">
              상품 카테고리를 추가 및 삭제합니다.
            </p>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex gap-2">
            <Input
              placeholder="카테고리명"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
            />
            <Input
              placeholder="슬러그 (선택)"
              value={newSlug}
              onChange={(e) => setNewSlug(e.target.value)}
            />
            <Button onClick={addCategory}>추가</Button>
          </div>
        </div>

        <div className="space-y-3">
          {categories.length === 0 && (
            <div className="text-sm text-gray-500">
              등록된 카테고리가 없습니다.
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {categories.map((category) => (
              <div
                key={category.id}
                className="border rounded p-3 flex items-center justify-between"
              >
                <div>
                  <div className="font-medium">{category.name}</div>
                  <div className="text-xs text-gray-500">
                    {category.slug ?? "-"}
                  </div>
                </div>
                <Button variant="ghost" onClick={() => removeCategory(category.id)}>
                  삭제
                </Button>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </Container>
  );
}
