import React, { useState, useEffect } from 'react';

// 타입 정의
interface CategoryMapping {
  id: string;
  vendorId: string;
  vendorCategory: string;
  internalCategory: string;
}

interface Vendor {
  id: string;
  name: string;
  is_active: boolean;
}

// Mock 데이터 - 많은 판매처 시뮬레이션
const mockVendors: Vendor[] = [
  { id: "1", name: "스마트스토어", is_active: true },
  { id: "2", name: "쿠팡", is_active: true },
  { id: "3", name: "지그재그", is_active: true },
  { id: "4", name: "11번가", is_active: true },
  { id: "5", name: "G마켓", is_active: true },
  { id: "6", name: "옥션", is_active: false },
  { id: "7", name: "티몬", is_active: true },
  { id: "8", name: "위메프", is_active: true },
];

// 쇼핑몰 카테고리 트리
const mallCategoryTree: Record<string, any> = {
  "1": {
    "패션": {
      "여성의류": ["상의", "하의", "원피스", "아우터"],
      "남성의류": ["티셔츠", "바지", "자켓"],
      "잡화": ["가방", "신발", "액세서리"]
    },
    "뷰티": {
      "스킨케어": ["토너", "에센스", "크림"],
      "메이크업": ["립스틱", "아이섀도우"]
    }
  },
  "2": {
    "의류": {
      "여성": ["블라우스", "팬츠", "드레스"],
      "남성": ["셔츠", "청바지"]
    },
    "화장품": ["기초", "색조"]
  },
};

// 내부 카테고리 트리
const internalCategoryTree = {
  "의류": {
    "여성": ["상의", "하의", "원피스", "아우터"],
    "남성": ["상의", "하의", "아우터"]
  },
  "잡화": ["가방", "신발", "액세서리"],
  "뷰티": {
    "스킨케어": ["토너", "로션", "크림"],
    "메이크업": ["립", "아이", "페이스"]
  }
};

const CategoryMappingPage = () => {
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [mappings, setMappings] = useState<CategoryMapping[]>([]);
  const [selectedMallPath, setSelectedMallPath] = useState<string[]>([]);
  const [selectedInternalPath, setSelectedInternalPath] = useState<string[]>([]);
  const [vendorSearch, setVendorSearch] = useState('');
  const [mappingSearch, setMappingSearch] = useState('');

  // 로컬스토리지에서 매핑 로드
  useEffect(() => {
    const saved = localStorage.getItem('vendorCategoryMappings');
    if (saved) {
      setMappings(JSON.parse(saved));
    }
  }, []);

  // 매핑 저장
  const saveMappings = (newMappings: CategoryMapping[]) => {
    setMappings(newMappings);
    localStorage.setItem('vendorCategoryMappings', JSON.stringify(newMappings));
  };

  // 매핑 추가
  const addMapping = () => {
    if (!selectedVendor) {
      alert('판매처를 선택하세요');
      return;
    }
    if (selectedMallPath.length === 0 || selectedInternalPath.length === 0) {
      alert('양쪽 카테고리를 모두 선택하세요');
      return;
    }

    const mallPath = selectedMallPath.join(' > ');
    const internalPath = selectedInternalPath.join(' > ');

    const newMapping: CategoryMapping = {
      id: Date.now().toString(),
      vendorId: selectedVendor.id,
      vendorCategory: mallPath,
      internalCategory: internalPath,
    };

    saveMappings([...mappings, newMapping]);
    setSelectedMallPath([]);
    setSelectedInternalPath([]);
  };

  // 매핑 삭제
  const deleteMapping = (id: string) => {
    if (confirm('삭제하시겠습니까?')) {
      saveMappings(mappings.filter(m => m.id !== id));
    }
  };

  // 판매처 필터링
  const filteredVendors = mockVendors.filter(v => 
    v.name.toLowerCase().includes(vendorSearch.toLowerCase())
  );

  // 현재 선택된 판매처의 매핑
  const currentMappings = selectedVendor 
    ? mappings.filter(m => m.vendorId === selectedVendor.id)
    : [];

  // 매핑 검색
  const filteredMappings = currentMappings.filter(m =>
    m.vendorCategory.toLowerCase().includes(mappingSearch.toLowerCase()) ||
    m.internalCategory.toLowerCase().includes(mappingSearch.toLowerCase())
  );

  // 트리 렌더링
  const renderTree = (
    tree: any, 
    path: string[], 
    selectedPath: string[], 
    onSelect: (newPath: string[]) => void, 
    level: number = 0
  ) => {
    if (typeof tree === 'string' || Array.isArray(tree)) {
      const items = Array.isArray(tree) ? tree : [tree];
      return (
        <div className="space-y-1">
          {items.map((item) => {
            const newPath = [...path, item];
            const isSelected = JSON.stringify(newPath) === JSON.stringify(selectedPath);
            return (
              <button
                key={item}
                onClick={() => onSelect(newPath)}
                className={`block w-full text-left px-3 py-2 rounded text-sm ${
                  isSelected
                    ? 'bg-blue-600 text-white font-medium'
                    : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                }`}
                style={{ marginLeft: level * 12 }}
              >
                {item}
              </button>
            );
          })}
        </div>
      );
    }

    return (
      <div className="space-y-1">
        {Object.entries(tree).map(([key, value]) => {
          const newPath = [...path, key];
          const isExpanded = selectedPath[level] === key;
          
          return (
            <div key={key}>
              <button
                onClick={() => onSelect(newPath)}
                className={`block w-full text-left px-3 py-2 rounded text-sm font-medium ${
                  isExpanded
                    ? 'bg-blue-50 text-blue-900'
                    : 'bg-white hover:bg-gray-50 text-gray-700'
                }`}
                style={{ marginLeft: level * 12 }}
              >
                {isExpanded ? '📂' : '📁'} {key}
              </button>
              {isExpanded && renderTree(value, newPath, selectedPath, onSelect, level + 1)}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold">판매처별 카테고리 맵핑</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* 왼쪽: 판매처 목록 */}
          <div className="col-span-3">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-4 border-b">
                <h2 className="font-semibold mb-3">판매처</h2>
                <input
                  type="text"
                  placeholder="검색..."
                  value={vendorSearch}
                  onChange={(e) => setVendorSearch(e.target.value)}
                  className="w-full px-3 py-2 border rounded text-sm"
                />
              </div>
              <div className="p-2 max-h-[calc(100vh-240px)] overflow-y-auto">
                {filteredVendors.map((vendor) => {
                  const isSelected = selectedVendor?.id === vendor.id;
                  const mappingCount = mappings.filter(m => m.vendorId === vendor.id).length;
                  
                  return (
                    <button
                      key={vendor.id}
                      onClick={() => {
                        setSelectedVendor(vendor);
                        setSelectedMallPath([]);
                        setSelectedInternalPath([]);
                      }}
                      className={`w-full text-left px-3 py-3 rounded mb-1 transition ${
                        isSelected
                          ? 'bg-blue-600 text-white'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {vendor.is_active ? '✓' : '⏸️'}
                          <span className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                            {vendor.name}
                          </span>
                        </div>
                        {mappingCount > 0 && (
                          <span className={`text-xs px-2 py-0.5 rounded ${
                            isSelected ? 'bg-blue-500' : 'bg-blue-100 text-blue-700'
                          }`}>
                            {mappingCount}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 오른쪽: 매핑 작업 영역 */}
          <div className="col-span-9">
            {!selectedVendor ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <div className="text-5xl mb-4">👈</div>
                <p className="text-gray-600">왼쪽에서 판매처를 선택하세요</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* 상단: 카테고리 선택 */}
                <div className="bg-white rounded-lg shadow-sm p-4">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    {/* 판매처 카테고리 */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-sm">
                          {selectedVendor.name} 카테고리
                        </h3>
                        {selectedMallPath.length > 0 && (
                          <button
                            onClick={() => setSelectedMallPath([])}
                            className="text-xs text-gray-500 hover:text-gray-700"
                          >
                            초기화
                          </button>
                        )}
                      </div>
                      <div className="border rounded p-3 max-h-64 overflow-y-auto bg-gray-50">
                        {mallCategoryTree[selectedVendor.id] ? (
                          renderTree(
                            mallCategoryTree[selectedVendor.id],
                            [],
                            selectedMallPath,
                            setSelectedMallPath
                          )
                        ) : (
                          <p className="text-sm text-gray-500 text-center py-8">
                            카테고리 없음
                          </p>
                        )}
                      </div>
                      {selectedMallPath.length > 0 && (
                        <div className="mt-2 p-2 bg-blue-50 rounded text-xs">
                          <span className="text-blue-600 font-medium">
                            {selectedMallPath.join(' > ')}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* 내부 카테고리 */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-sm">내부 카테고리</h3>
                        {selectedInternalPath.length > 0 && (
                          <button
                            onClick={() => setSelectedInternalPath([])}
                            className="text-xs text-gray-500 hover:text-gray-700"
                          >
                            초기화
                          </button>
                        )}
                      </div>
                      <div className="border rounded p-3 max-h-64 overflow-y-auto bg-gray-50">
                        {renderTree(
                          internalCategoryTree,
                          [],
                          selectedInternalPath,
                          setSelectedInternalPath
                        )}
                      </div>
                      {selectedInternalPath.length > 0 && (
                        <div className="mt-2 p-2 bg-green-50 rounded text-xs">
                          <span className="text-green-600 font-medium">
                            {selectedInternalPath.join(' > ')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 매핑 추가 버튼 */}
                  <button
                    onClick={addMapping}
                    disabled={selectedMallPath.length === 0 || selectedInternalPath.length === 0}
                    className="w-full py-3 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
                  >
                    ➕ 매핑 추가
                  </button>
                </div>

                {/* 하단: 매핑 목록 */}
                <div className="bg-white rounded-lg shadow-sm">
                  <div className="p-4 border-b flex items-center justify-between">
                    <h3 className="font-semibold">
                      매핑 목록 ({currentMappings.length}개)
                    </h3>
                    <input
                      type="text"
                      placeholder="매핑 검색..."
                      value={mappingSearch}
                      onChange={(e) => setMappingSearch(e.target.value)}
                      className="px-3 py-1.5 border rounded text-sm w-64"
                    />
                  </div>
                  <div className="p-4 max-h-96 overflow-y-auto">
                    {filteredMappings.length === 0 ? (
                      <div className="text-center py-12 text-gray-400">
                        <div className="text-4xl mb-3">📋</div>
                        <p className="text-sm">
                          {currentMappings.length === 0 ? '매핑이 없습니다' : '검색 결과 없음'}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {filteredMappings.map((mapping) => (
                          <div
                            key={mapping.id}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded hover:bg-gray-100 transition"
                          >
                            <div className="flex items-center gap-4 flex-1 text-sm">
                              <div className="flex-1">
                                <div className="text-xs text-gray-500 mb-0.5">판매처</div>
                                <div className="font-medium text-gray-900">
                                  {mapping.vendorCategory}
                                </div>
                              </div>
                              <div className="text-gray-400">→</div>
                              <div className="flex-1">
                                <div className="text-xs text-gray-500 mb-0.5">내부</div>
                                <div className="font-medium text-gray-900">
                                  {mapping.internalCategory}
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => deleteMapping(mapping.id)}
                              className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded transition"
                            >
                              삭제
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryMappingPage;