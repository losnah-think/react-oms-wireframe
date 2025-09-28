import React, { useState, useEffect } from "react";
import { Container, Card } from "../../design-system";
import { mockCategories } from "../../data/mockCategories";
import { mockVendors } from "../../data/mockVendors";

interface CategoryMapping {
  id: string;
  vendorId: string;
  vendorName: string;
  vendorCategory: string;
  internalCategory: string;
}

export default function CategoryMappingPage() {
  const [mappings, setMappings] = useState<CategoryMapping[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<CategoryMapping | null>(null);
  const [selectedVendor, setSelectedVendor] = useState("");
  const [vendorCategory, setVendorCategory] = useState("");
  const [internalCategory, setInternalCategory] = useState("");

  useEffect(() => {
    // Load mappings from localStorage or API
    const saved = localStorage.getItem("vendorCategoryMappings");
    if (saved) {
      setMappings(JSON.parse(saved));
    } else {
      // Sample data using mock vendors and categories
      const sampleMappings = [
        {
          id: "1",
          vendorId: mockVendors[0].id,
          vendorName: mockVendors[0].name,
          vendorCategory: "전자제품",
          internalCategory: mockCategories[0].name
        },
        {
          id: "2",
          vendorId: mockVendors[1].id,
          vendorName: mockVendors[1].name,
          vendorCategory: "의류",
          internalCategory: mockCategories[1].name
        },
        {
          id: "3",
          vendorId: mockVendors[2].id,
          vendorName: mockVendors[2].name,
          vendorCategory: "잡화",
          internalCategory: mockCategories[2].name
        },
      ];
      setMappings(sampleMappings);
      localStorage.setItem("vendorCategoryMappings", JSON.stringify(sampleMappings));
    }
  }, []);

  const saveMapping = () => {
    if (!selectedVendor || !vendorCategory.trim() || !internalCategory.trim()) return;

    const vendor = mockVendors.find(v => v.id === selectedVendor);
    if (!vendor) return;

    const newMapping: CategoryMapping = {
      id: editing?.id || Date.now().toString(),
      vendorId: selectedVendor,
      vendorName: vendor.name,
      vendorCategory: vendorCategory.trim(),
      internalCategory: internalCategory.trim(),
    };

    let updatedMappings;
    if (editing) {
      updatedMappings = mappings.map(m => m.id === editing.id ? newMapping : m);
    } else {
      updatedMappings = [...mappings, newMapping];
    }

    setMappings(updatedMappings);
    localStorage.setItem("vendorCategoryMappings", JSON.stringify(updatedMappings));
    setShowModal(false);
    setEditing(null);
    setSelectedVendor("");
    setVendorCategory("");
    setInternalCategory("");
  };

  const deleteMapping = (id: string) => {
    if (!confirm("매핑을 삭제하시겠습니까?")) return;
    const updatedMappings = mappings.filter(m => m.id !== id);
    setMappings(updatedMappings);
    localStorage.setItem("vendorCategoryMappings", JSON.stringify(updatedMappings));
  };

  const openAdd = () => {
    setEditing(null);
    setSelectedVendor("");
    setVendorCategory("");
    setInternalCategory("");
    setShowModal(true);
  };

  const openEdit = (mapping: CategoryMapping) => {
    setEditing(mapping);
    setSelectedVendor(mapping.vendorId);
    setVendorCategory(mapping.vendorCategory);
    setInternalCategory(mapping.internalCategory);
    setShowModal(true);
  };

  const getMappingsByVendor = (vendorId: string) => {
    return mappings.filter(m => m.vendorId === vendorId);
  };

  return (
    <Container>
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">판매처별 카테고리 매핑</h1>
            <p className="text-gray-600">각 판매처의 카테고리와 내부 카테고리를 매핑합니다.</p>
          </div>
          <button
            className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
            onClick={openAdd}
          >
            매핑 추가
          </button>
        </div>

        <div className="space-y-6">
          {mockVendors.map(vendor => {
            const vendorMappings = getMappingsByVendor(vendor.id);
            return (
              <div key={vendor.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-medium">{vendor.name}</h3>
                  <span className={`px-2 py-1 rounded text-xs ${
                    vendor.is_active
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}>
                    {vendor.is_active ? "활성" : "비활성"}
                  </span>
                </div>

                {vendorMappings.length === 0 ? (
                  <div className="text-sm text-gray-500 text-center py-4">
                    등록된 매핑이 없습니다.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {vendorMappings.map(mapping => (
                      <div key={mapping.id} className="border rounded p-3 flex items-center justify-between bg-gray-50">
                        <div className="flex items-center gap-4">
                          <div>
                            <div className="font-medium">{mapping.vendorCategory}</div>
                            <div className="text-sm text-gray-500">판매처 카테고리</div>
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
                )}
              </div>
            );
          })}
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
                  판매처 선택
                </label>
                <select
                  value={selectedVendor}
                  onChange={(e) => setSelectedVendor(e.target.value)}
                  className="w-full border px-3 py-2 rounded"
                >
                  <option value="">판매처 선택</option>
                  {mockVendors.map(vendor => (
                    <option key={vendor.id} value={vendor.id}>{vendor.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  판매처 카테고리
                </label>
                <input
                  value={vendorCategory}
                  onChange={(e) => setVendorCategory(e.target.value)}
                  className="w-full border px-3 py-2 rounded"
                  placeholder="판매처 카테고리 입력"
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