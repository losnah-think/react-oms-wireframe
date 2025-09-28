import React, { useState, useEffect } from "react";
import { Container, Card } from "../../design-system";
import { mockCategories } from "../../data/mockCategories";

interface CategoryMapping {
  id: string;
  mallCategory: string;
  internalCategory: string;
}

export default function CategoryMappingPage() {
  const [mappings, setMappings] = useState<CategoryMapping[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<CategoryMapping | null>(null);
  const [mallCategory, setMallCategory] = useState("");
  const [internalCategory, setInternalCategory] = useState("");

  useEffect(() => {
    // Load mappings from localStorage or API
    const saved = localStorage.getItem("categoryMappings");
    if (saved) {
      setMappings(JSON.parse(saved));
    } else {
      // Sample data using mock categories
      const sampleMappings = [
        { id: "1", mallCategory: "전자제품", internalCategory: mockCategories[0].name },
        { id: "2", mallCategory: "의류", internalCategory: mockCategories[1].name },
        { id: "3", mallCategory: "잡화", internalCategory: mockCategories[2].name },
      ];
      setMappings(sampleMappings);
      localStorage.setItem("categoryMappings", JSON.stringify(sampleMappings));
    }
  }, []);

  const saveMapping = () => {
    if (!mallCategory.trim() || !internalCategory.trim()) return;

    const newMapping: CategoryMapping = {
      id: editing?.id || Date.now().toString(),
      mallCategory: mallCategory.trim(),
      internalCategory: internalCategory.trim(),
    };

    let updatedMappings;
    if (editing) {
      updatedMappings = mappings.map(m => m.id === editing.id ? newMapping : m);
    } else {
      updatedMappings = [...mappings, newMapping];
    }

    setMappings(updatedMappings);
    localStorage.setItem("categoryMappings", JSON.stringify(updatedMappings));
    setShowModal(false);
    setEditing(null);
    setMallCategory("");
    setInternalCategory("");
  };

  const deleteMapping = (id: string) => {
    if (!confirm("매핑을 삭제하시겠습니까?")) return;
    const updatedMappings = mappings.filter(m => m.id !== id);
    setMappings(updatedMappings);
    localStorage.setItem("categoryMappings", JSON.stringify(updatedMappings));
  };

  const openAdd = () => {
    setEditing(null);
    setMallCategory("");
    setInternalCategory("");
    setShowModal(true);
  };

  const openEdit = (mapping: CategoryMapping) => {
    setEditing(mapping);
    setMallCategory(mapping.mallCategory);
    setInternalCategory(mapping.internalCategory);
    setShowModal(true);
  };

  return (
    <Container>
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">카테고리 매핑 관리</h1>
            <p className="text-gray-600">쇼핑몰 카테고리와 내부 카테고리를 매핑합니다.</p>
          </div>
          <button
            className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
            onClick={openAdd}
          >
            매핑 추가
          </button>
        </div>

        <div className="space-y-3">
          {mappings.length === 0 && (
            <div className="text-sm text-gray-500 text-center py-8">
              등록된 매핑이 없습니다.
            </div>
          )}
          <div className="grid gap-3">
            {mappings.map(mapping => (
              <div key={mapping.id} className="border rounded p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div>
                    <div className="font-medium">{mapping.mallCategory}</div>
                    <div className="text-sm text-gray-500">쇼핑몰 카테고리</div>
                  </div>
                  <div className="text-gray-400">→</div>
                  <div>
                    <div className="font-medium">{mapping.internalCategory}</div>
                    <div className="text-sm text-gray-500">내부 카테고리</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="px-3 py-1 border rounded text-sm hover:bg-gray-50"
                    onClick={() => openEdit(mapping)}
                  >
                    편집
                  </button>
                  <button
                    className="px-3 py-1 border rounded text-sm text-red-600 hover:bg-red-50"
                    onClick={() => deleteMapping(mapping.id)}
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">
              {editing ? "매핑 편집" : "매핑 추가"}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  쇼핑몰 카테고리
                </label>
                <input
                  value={mallCategory}
                  onChange={(e) => setMallCategory(e.target.value)}
                  className="w-full border px-3 py-2 rounded"
                  placeholder="쇼핑몰 카테고리 입력"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  내부 카테고리
                </label>
                <select
                  value={internalCategory}
                  onChange={(e) => setInternalCategory(e.target.value)}
                  className="w-full border px-3 py-2 rounded"
                >
                  <option value="">카테고리 선택</option>
                  {mockCategories.slice(0, 10).map(cat => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-6 text-right space-x-2">
              <button
                className="px-4 py-2 border rounded hover:bg-gray-50"
                onClick={() => setShowModal(false)}
              >
                취소
              </button>
              <button
                className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
                onClick={saveMapping}
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}
    </Container>
  );
}