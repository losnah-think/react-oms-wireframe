import React, { useState, useEffect } from "react";

// 토스트 알림 컴포넌트
interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
}

function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500'
  }[type];

  return (
    <div className={`fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50 transform transition-all duration-300 ease-in-out animate-slide-in`}>
      <div className="flex items-center justify-between">
        <span className="font-medium">{message}</span>
        <button
          onClick={onClose}
          className="ml-4 text-white hover:text-gray-200 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// Mock 데이터
const mockVendors = [
  {
    id: "V001",
    name: "네이버 스마트스토어",
    type: "판매처" as const,
    representative: "김철수",
    status: "active" as const,
  },
  {
    id: "V002",
    name: "쿠팡 파트너스",
    type: "판매처" as const,
    representative: "이영희",
    status: "active" as const,
  },
  {
    id: "V003",
    name: "11번가",
    type: "판매처" as const,
    representative: "박민수",
    status: "active" as const,
  },
];

// 내부 카테고리 인터페이스
interface InternalCategory {
  id: string;
  name: string;
  path: string;
}

// 카테고리 매핑 인터페이스
interface CategoryMapping {
  id: string;
  vendorId: string;
  vendorCategory: string;
  internalCategoryId: string;
  internalCategoryName: string;
}

export default function VendorCategoryMappingPage() {
  const [vendors] = useState(mockVendors);
  const [selectedVendor, setSelectedVendor] = useState<any>(null);
  
  // 내부 카테고리 관리
  const [internalCategories, setInternalCategories] = useState<InternalCategory[]>([
    { id: "IC001", name: "의류", path: "의류" },
    { id: "IC002", name: "상의", path: "의류 > 상의" },
    { id: "IC003", name: "하의", path: "의류 > 하의" },
    { id: "IC004", name: "잡화", path: "잡화" },
    { id: "IC005", name: "가방", path: "잡화 > 가방" },
  ]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<InternalCategory | null>(null);
  const [categoryName, setCategoryName] = useState("");
  const [categoryPath, setCategoryPath] = useState("");
  
  // 매핑 관리
  const [mappings, setMappings] = useState<CategoryMapping[]>([
    {
      id: "M001",
      vendorId: "V001",
      vendorCategory: "패션의류 > 남성의류 > 상의",
      internalCategoryId: "IC002",
      internalCategoryName: "의류 > 상의",
    },
    {
      id: "M002",
      vendorId: "V001",
      vendorCategory: "패션잡화 > 가방",
      internalCategoryId: "IC005",
      internalCategoryName: "잡화 > 가방",
    },
  ]);
  const [showMappingModal, setShowMappingModal] = useState(false);
  const [editingMapping, setEditingMapping] = useState<CategoryMapping | null>(null);
  const [vendorCategory, setVendorCategory] = useState("");
  const [selectedInternalCategoryId, setSelectedInternalCategoryId] = useState("");
  
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (vendors.length > 0 && !selectedVendor) {
      setSelectedVendor(vendors[0]);
    }
  }, [vendors, selectedVendor]);

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
  };

  // 내부 카테고리 추가/수정
  const handleAddCategory = () => {
    setEditingCategory(null);
    setCategoryName("");
    setCategoryPath("");
    setShowCategoryModal(true);
  };

  const handleEditCategory = (category: InternalCategory) => {
    setEditingCategory(category);
    setCategoryName(category.name);
    setCategoryPath(category.path);
    setShowCategoryModal(true);
  };

  const handleSaveCategory = () => {
    if (!categoryName.trim() || !categoryPath.trim()) {
      showToast("카테고리 이름과 경로를 모두 입력해주세요", "error");
      return;
    }

    if (editingCategory) {
      // 수정
      setInternalCategories(
        internalCategories.map((c) =>
          c.id === editingCategory.id
            ? { ...c, name: categoryName, path: categoryPath }
            : c
        )
      );
      showToast("카테고리가 수정되었습니다.", "success");
    } else {
      // 추가
      const newCategory: InternalCategory = {
        id: `IC${Date.now()}`,
        name: categoryName,
        path: categoryPath,
      };
      setInternalCategories([...internalCategories, newCategory]);
      showToast("카테고리가 추가되었습니다.", "success");
    }

    setShowCategoryModal(false);
    setCategoryName("");
    setCategoryPath("");
  };

  const handleDeleteCategory = (id: string) => {
    // 매핑에서 사용 중인지 확인
    const isUsed = mappings.some((m) => m.internalCategoryId === id);
    if (isUsed) {
      showToast("이 카테고리는 매핑에서 사용 중이므로 삭제할 수 없습니다", "error");
      return;
    }

    if (window.confirm("카테고리를 삭제하시겠습니까?")) {
      setInternalCategories(internalCategories.filter((c) => c.id !== id));
      showToast("카테고리가 삭제되었습니다.", "success");
    }
  };

  // 매핑 추가/수정
  const handleAddMapping = () => {
    if (!selectedVendor) {
      showToast("판매처를 먼저 선택해주세요", "error");
      return;
    }
    setEditingMapping(null);
    setVendorCategory("");
    setSelectedInternalCategoryId("");
    setShowMappingModal(true);
  };

  const handleEditMapping = (mapping: CategoryMapping) => {
    setEditingMapping(mapping);
    setVendorCategory(mapping.vendorCategory);
    setSelectedInternalCategoryId(mapping.internalCategoryId);
    setShowMappingModal(true);
  };

  const handleSaveMapping = () => {
    if (!vendorCategory.trim()) {
      showToast("판매처 카테고리를 입력해주세요", "error");
      return;
    }
    if (!selectedInternalCategoryId) {
      showToast("내부 카테고리를 선택해주세요", "error");
      return;
    }

    const internalCat = internalCategories.find((c) => c.id === selectedInternalCategoryId);
    if (!internalCat) {
      showToast("선택한 내부 카테고리를 찾을 수 없습니다", "error");
      return;
    }

    if (editingMapping) {
      // 수정
      setMappings(
        mappings.map((m) =>
          m.id === editingMapping.id
            ? {
                ...m,
                vendorCategory,
                internalCategoryId: selectedInternalCategoryId,
                internalCategoryName: internalCat.path,
              }
            : m
        )
      );
      showToast("매핑이 수정되었습니다.", "success");
    } else {
      // 추가
      const newMapping: CategoryMapping = {
        id: `M${Date.now()}`,
        vendorId: selectedVendor.id,
        vendorCategory,
        internalCategoryId: selectedInternalCategoryId,
        internalCategoryName: internalCat.path,
      };
      setMappings([...mappings, newMapping]);
      showToast("매핑이 추가되었습니다.", "success");
    }

    setShowMappingModal(false);
    setVendorCategory("");
    setSelectedInternalCategoryId("");
  };

  const handleDeleteMapping = (id: string) => {
    if (window.confirm("매핑을 삭제하시겠습니까?")) {
      setMappings(mappings.filter((m) => m.id !== id));
      showToast("매핑이 삭제되었습니다.", "success");
    }
  };

  const filteredMappings = mappings.filter((mapping) => {
    if (!selectedVendor) return false;
    const matchesVendor = mapping.vendorId === selectedVendor.id;
    const matchesSearch =
      mapping.vendorCategory.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mapping.internalCategoryName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesVendor && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* 헤더 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">판매처별 카테고리 매핑</h1>
        <p className="text-gray-600 mt-1">
          내부 카테고리를 추가하고 판매처 카테고리와 매핑하세요
        </p>
      </div>

      {/* 섹션 1: 내부 카테고리 관리 */}
      <div className="bg-white rounded-lg border shadow-sm mb-6">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              내부 카테고리 관리 ({internalCategories.length}개)
            </h2>
            <button
              onClick={handleAddCategory}
              className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              카테고리 추가
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-16">
                  번호
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  카테고리명
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  경로
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider w-32">
                  관리
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {internalCategories.map((category, index) => (
                <tr key={category.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm text-gray-600">{index + 1}</td>
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-gray-900">{category.name}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-700">{category.path}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleEditCategory(category)}
                        className="px-3 py-1.5 text-xs border border-gray-300 rounded hover:bg-gray-50 hover:border-gray-400 transition-all"
                      >
                        수정
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category.id)}
                        className="px-3 py-1.5 text-xs text-red-600 border border-red-300 rounded hover:bg-red-50 hover:border-red-400 transition-all"
                      >
                        삭제
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 섹션 2: 판매처 선택 및 매핑 관리 */}
      <div className="bg-white rounded-lg border shadow-sm">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">판매처별 카테고리 매핑</h2>
          
          {/* 판매처 선택 */}
          <div className="flex items-center gap-4 mb-4">
            <label className="text-sm font-medium text-gray-700">판매처 선택:</label>
            <div className="flex gap-2">
              {vendors.map((vendor) => (
                <button
                  key={vendor.id}
                  onClick={() => setSelectedVendor(vendor)}
                  className={`px-4 py-2 text-sm rounded-lg transition-all ${
                    selectedVendor?.id === vendor.id
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {vendor.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="매핑 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={handleAddMapping}
              disabled={!selectedVendor}
              className="px-4 py-2 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              매핑 추가
            </button>
          </div>
        </div>

        {selectedVendor ? (
          filteredMappings.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-4xl mb-3">🔗</div>
              <p className="text-gray-600">등록된 매핑이 없습니다</p>
              <button
                onClick={handleAddMapping}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                매핑 추가하기
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-16">
                      번호
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      판매처 카테고리
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider w-20">
                      →
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      내부 카테고리
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider w-32">
                      관리
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {filteredMappings.map((mapping, index) => (
                    <tr key={mapping.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm text-gray-600">{index + 1}</td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-gray-900">{mapping.vendorCategory}</div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <svg className="w-5 h-5 mx-auto text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-900">{mapping.internalCategoryName}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEditMapping(mapping)}
                            className="px-3 py-1.5 text-xs border border-gray-300 rounded hover:bg-gray-50 hover:border-gray-400 transition-all"
                          >
                            수정
                          </button>
                          <button
                            onClick={() => handleDeleteMapping(mapping.id)}
                            className="px-3 py-1.5 text-xs text-red-600 border border-red-300 rounded hover:bg-red-50 hover:border-red-400 transition-all"
                          >
                            삭제
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">판매처를 선택해주세요</p>
          </div>
        )}
      </div>

      {/* 내부 카테고리 추가/수정 모달 */}
      {showCategoryModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={(e) => e.target === e.currentTarget && setShowCategoryModal(false)}
        >
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              {editingCategory ? "카테고리 수정" : "카테고리 추가"}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  카테고리명 (필수)
                </label>
                <input
                  type="text"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="예: 상의"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  카테고리 경로 (필수)
                </label>
                <input
                  type="text"
                  value={categoryPath}
                  onChange={(e) => setCategoryPath(e.target.value)}
                  placeholder="예: 의류 > 상의"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="mt-1 text-xs text-gray-500">
                  💡 상위 카테고리가 있다면 "상위 {'>'} 하위" 형식으로 입력하세요
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowCategoryModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
              >
                취소
              </button>
              <button
                onClick={handleSaveCategory}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all"
              >
                {editingCategory ? "수정" : "추가"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 매핑 추가/수정 모달 */}
      {showMappingModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={(e) => e.target === e.currentTarget && setShowMappingModal(false)}
        >
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              {editingMapping ? "매핑 수정" : "매핑 추가"}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  판매처 카테고리 (필수)
                </label>
                <input
                  type="text"
                  value={vendorCategory}
                  onChange={(e) => setVendorCategory(e.target.value)}
                  placeholder="예: 패션 > 남성의류 > 상의"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="mt-1 text-xs text-gray-500">
                  💡 {selectedVendor?.name}의 카테고리를 입력하세요
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  매핑할 내부 카테고리 (필수)
                </label>
                <select
                  value={selectedInternalCategoryId}
                  onChange={(e) => setSelectedInternalCategoryId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">카테고리 선택</option>
                  {internalCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.path}
                    </option>
                  ))}
                </select>
                {internalCategories.length === 0 && (
                  <p className="mt-1 text-xs text-red-600">
                    ⚠️ 내부 카테고리를 먼저 추가해주세요
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowMappingModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
              >
                취소
              </button>
              <button
                onClick={handleSaveMapping}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all"
              >
                {editingMapping ? "수정" : "추가"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 토스트 알림 */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
