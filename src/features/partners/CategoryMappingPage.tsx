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

// 스켈레톤 로딩 컴포넌트
function SkeletonCard() {
  return (
    <div className="bg-white rounded-lg border shadow-sm p-6 mb-6 animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="flex items-center gap-2 mt-2">
            <div className="h-5 bg-gray-200 rounded-full w-16"></div>
            <div className="h-5 bg-gray-200 rounded-full w-20"></div>
          </div>
        </div>
        <div className="h-8 bg-gray-200 rounded w-20"></div>
      </div>
      <div className="grid grid-cols-2 gap-6">
        <div>
          <div className="h-4 bg-gray-200 rounded w-16 mb-3"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
        <div>
          <div className="h-4 bg-gray-200 rounded w-20 mb-3"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/5"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    </div>
  );
}


// 판매처별 카테고리 타입 정의
interface VendorCategory {
  id: string;
  vendorId: string;
  name: string;
  path: string;
  level: number;
  parentId?: string;
  lastSyncDate: string;
  productCount?: number;
}

// Mock 데이터
const mockVendors = [
  {
    id: "V001",
    name: "네이버 스마트스토어",
    type: "판매처" as const,
    businessNumber: "123-45-67890",
    representative: "김철수",
    phone: "02-1234-5678",
    email: "naver@example.com",
    address: "서울시 강남구 테헤란로 123",
    status: "active" as const,
    registrationDate: "2023-01-15",
    apiKey: "naver_api_key_1234",
    lastLoginDate: "2025-09-30",
  },
  {
    id: "V002",
    name: "쿠팡 파트너스",
    type: "판매처" as const,
    businessNumber: "987-65-43210",
    representative: "이영희",
    phone: "031-1111-2222",
    email: "coupang@example.com",
    address: "경기도 성남시 분당구 판교로 100",
    status: "active" as const,
    registrationDate: "2023-02-01",
    apiKey: "coupang_api_key_5678",
    lastLoginDate: "2025-09-29",
  },
  {
    id: "V003",
    name: "11번가",
    type: "판매처" as const,
    businessNumber: "111-22-33444",
    representative: "박민수",
    phone: "02-3333-4444",
    email: "11st@example.com",
    address: "서울시 중구 청계천로 100",
    status: "active" as const,
    registrationDate: "2023-03-10",
  },
];

// 판매처별 카테고리 Mock 데이터 (API에서 가져온 것으로 가정)
const mockVendorCategories: VendorCategory[] = [
  // 네이버 스마트스토어 카테고리
  {
    id: "VC001",
    vendorId: "V001",
    name: "패션의류",
    path: "패션의류",
    level: 1,
    lastSyncDate: "2025-01-15T10:30:00Z",
    productCount: 1250
  },
  {
    id: "VC002",
    vendorId: "V001",
    name: "남성의류",
    path: "패션의류 > 남성의류",
    level: 2,
    parentId: "VC001",
    lastSyncDate: "2025-01-15T10:30:00Z",
    productCount: 450
  },
  {
    id: "VC003",
    vendorId: "V001",
    name: "상의",
    path: "패션의류 > 남성의류 > 상의",
    level: 3,
    parentId: "VC002",
    lastSyncDate: "2025-01-15T10:30:00Z",
    productCount: 180
  },
  {
    id: "VC004",
    vendorId: "V001",
    name: "하의",
    path: "패션의류 > 남성의류 > 하의",
    level: 3,
    parentId: "VC002",
    lastSyncDate: "2025-01-15T10:30:00Z",
    productCount: 120
  },
  {
    id: "VC005",
    vendorId: "V001",
    name: "패션잡화",
    path: "패션잡화",
    level: 1,
    lastSyncDate: "2025-01-15T10:30:00Z",
    productCount: 890
  },
  {
    id: "VC006",
    vendorId: "V001",
    name: "가방",
    path: "패션잡화 > 가방",
    level: 2,
    parentId: "VC005",
    lastSyncDate: "2025-01-15T10:30:00Z",
    productCount: 320
  },
  
  // 쿠팡 파트너스 카테고리
  {
    id: "VC007",
    vendorId: "V002",
    name: "의류",
    path: "의류",
    level: 1,
    lastSyncDate: "2025-01-14T15:20:00Z",
    productCount: 2100
  },
  {
    id: "VC008",
    vendorId: "V002",
    name: "상의",
    path: "의류 > 상의",
    level: 2,
    parentId: "VC007",
    lastSyncDate: "2025-01-14T15:20:00Z",
    productCount: 850
  },
  {
    id: "VC009",
    vendorId: "V002",
    name: "신발",
    path: "신발",
    level: 1,
    lastSyncDate: "2025-01-14T15:20:00Z",
    productCount: 1200
  },
  {
    id: "VC010",
    vendorId: "V002",
    name: "운동화",
    path: "신발 > 운동화",
    level: 2,
    parentId: "VC009",
    lastSyncDate: "2025-01-14T15:20:00Z",
    productCount: 650
  },
  
  // 11번가 카테고리
  {
    id: "VC011",
    vendorId: "V003",
    name: "패션",
    path: "패션",
    level: 1,
    lastSyncDate: "2025-01-13T09:45:00Z",
    productCount: 1800
  },
  {
    id: "VC012",
    vendorId: "V003",
    name: "남성패션",
    path: "패션 > 남성패션",
    level: 2,
    parentId: "VC011",
    lastSyncDate: "2025-01-13T09:45:00Z",
    productCount: 720
  },
  {
    id: "VC013",
    vendorId: "V003",
    name: "티셔츠",
    path: "패션 > 남성패션 > 티셔츠",
    level: 3,
    parentId: "VC012",
    lastSyncDate: "2025-01-13T09:45:00Z",
    productCount: 280
  }
];

// 내부 카테고리 Mock
const mockInternalCategories = [
  { id: "IC001", name: "의류", path: "의류" },
  { id: "IC002", name: "상의", path: "의류 > 상의" },
  { id: "IC003", name: "하의", path: "의류 > 하의" },
  { id: "IC004", name: "잡화", path: "잡화" },
  { id: "IC005", name: "가방", path: "잡화 > 가방" },
  { id: "IC006", name: "신발", path: "신발" },
  { id: "IC007", name: "운동화", path: "신발 > 운동화" },
  { id: "IC008", name: "구두", path: "신발 > 구두" },
];

// 카테고리 매핑 Mock
interface CategoryMapping {
  id: string;
  vendorId: string;
  vendorCategory: string;
  internalCategoryId: string;
  internalCategoryPath: string;
}

const mockMappings: CategoryMapping[] = [
  {
    id: "M001",
    vendorId: "V001",
    vendorCategory: "패션의류 > 남성의류 > 상의",
    internalCategoryId: "IC002",
    internalCategoryPath: "의류 > 상의",
  },
  {
    id: "M002",
    vendorId: "V001",
    vendorCategory: "패션의류 > 남성의류 > 하의",
    internalCategoryId: "IC003",
    internalCategoryPath: "의류 > 하의",
  },
  {
    id: "M003",
    vendorId: "V001",
    vendorCategory: "패션잡화 > 가방",
    internalCategoryId: "IC005",
    internalCategoryPath: "잡화 > 가방",
  },
  {
    id: "M004",
    vendorId: "V002",
    vendorCategory: "의류 > 상의",
    internalCategoryId: "IC002",
    internalCategoryPath: "의류 > 상의",
  },
  {
    id: "M005",
    vendorId: "V002",
    vendorCategory: "신발 > 운동화",
    internalCategoryId: "IC007",
    internalCategoryPath: "신발 > 운동화",
  },
];

// 판매처 정보 카드 컴포넌트
function VendorInfoCard({ vendor, onSyncCategories, isLoadingCategories, lastSyncTime }: any) {
  return (
    <div className="bg-white rounded-lg border shadow-sm p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-bold text-gray-900">{vendor.name}</h2>
          <span className="text-sm text-gray-600">{vendor.representative}</span>
          {vendor.apiKey && (
            <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">
              API 연동됨
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="text-xs text-gray-500">
            마지막 동기화: {lastSyncTime || "동기화 필요"}
          </div>
          <button
            onClick={() => onSyncCategories(vendor.id)}
            disabled={isLoadingCategories}
            className="px-3 py-1.5 text-sm bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-1"
          >
            {isLoadingCategories ? (
              <>
                <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                동기화 중...
              </>
            ) : (
              <>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                동기화
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function VendorCategoryMappingPage() {
  const [vendors, setVendors] = useState(mockVendors);
  const [selectedVendor, setSelectedVendor] = useState<any>(null);
  const [mappings, setMappings] = useState<CategoryMapping[]>(mockMappings);
  const [showModal, setShowModal] = useState(false);
  const [editingMapping, setEditingMapping] = useState<CategoryMapping | null>(null);
  const [vendorCategory, setVendorCategory] = useState("");
  const [selectedInternalCategory, setSelectedInternalCategory] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  

  // UI/UX 개선을 위한 상태
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [vendorSearchTerm, setVendorSearchTerm] = useState("");
  
  // 판매처별 카테고리 상태 (API에서 가져온 데이터)
  const [vendorCategories, setVendorCategories] = useState<VendorCategory[]>(mockVendorCategories);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>("");

  useEffect(() => {
    if (vendors.length > 0 && !selectedVendor) {
      setSelectedVendor(vendors[0]);
    }
  }, [vendors]);

  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (showModal) {
          setShowModal(false);
        }
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, [showModal]);

  // 토스트 알림 헬퍼 함수
  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
  };

  // API 연동 시뮬레이션 함수들
  const syncVendorCategories = async (vendorId: string) => {
    setIsLoadingCategories(true);
    showToast(`${vendors.find(v => v.id === vendorId)?.name} 카테고리 동기화 중...`, "info");
    
    // API 호출 시뮬레이션
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 새로운 카테고리 데이터 생성 (실제로는 API에서 받아옴)
    const newCategories = mockVendorCategories.filter(cat => cat.vendorId === vendorId).map(cat => ({
      ...cat,
      lastSyncDate: new Date().toISOString(),
      productCount: Math.floor(Math.random() * 1000) + 100 // 랜덤 상품 수
    }));
    
    setVendorCategories(prev => [
      ...prev.filter(cat => cat.vendorId !== vendorId),
      ...newCategories
    ]);
    
    setLastSyncTime(new Date().toLocaleString());
    setIsLoadingCategories(false);
    showToast("카테고리 동기화가 완료되었습니다.", "success");
  };

  const getVendorCategories = (vendorId: string) => {
    return vendorCategories.filter(cat => cat.vendorId === vendorId);
  };

  // 판매처 검색 필터링
  const filteredVendors = vendors.filter(vendor =>
    vendor.name.toLowerCase().includes(vendorSearchTerm.toLowerCase()) ||
    vendor.representative.toLowerCase().includes(vendorSearchTerm.toLowerCase())
  );

  const filteredMappings = mappings.filter((mapping) => {
    if (!selectedVendor) return false;
    const matchesVendor = mapping.vendorId === selectedVendor.id;
    const matchesSearch =
      mapping.vendorCategory.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mapping.internalCategoryPath.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesVendor && matchesSearch;
  });

  const handleAddMapping = () => {
    setEditingMapping(null);
    setVendorCategory("");
    setSelectedInternalCategory("");
    setShowModal(true);
  };

  const handleEditMapping = (mapping: CategoryMapping) => {
    setEditingMapping(mapping);
    setVendorCategory(mapping.vendorCategory);
    setSelectedInternalCategory(mapping.internalCategoryId);
    setShowModal(true);
  };

  const handleSaveMapping = async () => {
    if (!vendorCategory.trim()) {
      showToast("판매처 카테고리를 입력해주세요", "error");
      return;
    }
    if (!selectedInternalCategory) {
      showToast("내부 카테고리를 먼저 선택해주세요", "error");
      return;
    }

    const internalCat = mockInternalCategories.find(
      (c) => c.id === selectedInternalCategory
    );
    if (!internalCat) return;

    setIsLoading(true);
    
    // 실제 API 호출을 시뮬레이션
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (editingMapping) {
      // 수정
      setMappings(
        mappings.map((m) =>
          m.id === editingMapping.id
            ? {
                ...m,
                vendorCategory,
                internalCategoryId: selectedInternalCategory,
                internalCategoryPath: internalCat.path,
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
        internalCategoryId: selectedInternalCategory,
        internalCategoryPath: internalCat.path,
      };
      setMappings([...mappings, newMapping]);
      showToast("매핑이 추가되었습니다.", "success");
    }

    setIsLoading(false);
    setShowModal(false);
    setVendorCategory("");
    setSelectedInternalCategory("");
  };

  const handleDeleteMapping = async (id: string) => {
    if (window.confirm("매핑을 삭제하시겠습니까?")) {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      setMappings(mappings.filter((m) => m.id !== id));
      setIsLoading(false);
      showToast("매핑이 삭제되었습니다.", "success");
    }
  };



  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* 헤더 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">판매처별 카테고리 매핑</h1>
        <p className="text-gray-600 mt-1">
          각 판매처의 카테고리와 내부 카테고리를 매핑하여 상품 분류를 관리합니다.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* 좌측: 판매처 목록 */}
        <div className="w-full lg:w-80 flex-shrink-0">
          <div className="bg-white rounded-lg border shadow-sm">
            <div className="p-4 border-b">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="판매처 검색..."
                  value={vendorSearchTerm}
                  onChange={(e) => setVendorSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              {vendorSearchTerm && (
                <div className="mt-2 text-sm text-gray-500">
                  {filteredVendors.length}개 판매처 검색됨
                </div>
              )}
            </div>

            <div className="max-h-[calc(100vh-280px)] overflow-y-auto">
              {filteredVendors.map((vendor) => (
                <button
                  key={vendor.id}
                  onClick={() => setSelectedVendor(vendor)}
                  className={`w-full text-left p-4 border-b hover:bg-gray-50 transition-all duration-200 group ${
                    selectedVendor?.id === vendor.id
                      ? "bg-blue-50 border-l-4 border-l-blue-500 shadow-sm"
                      : ""
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {vendor.name}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {vendor.representative}
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          vendor.status === "active" 
                            ? "bg-green-100 text-green-700" 
                            : "bg-gray-100 text-gray-700"
                        }`}>
                          {vendor.status === "active" ? "활성" : "비활성"}
                        </span>
                        <span className="text-xs text-gray-500">
                          {mappings.filter((m) => m.vendorId === vendor.id).length}개 매핑
                        </span>
                      </div>
                    </div>
                    {selectedVendor?.id === vendor.id && (
                      <div className="text-blue-500">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 우측: 판매처 정보 및 매핑 목록 */}
        <div className="flex-1">
          {isLoading ? (
            <SkeletonCard />
          ) : selectedVendor ? (
            <>
              {/* 판매처 기본 정보 */}
              <VendorInfoCard
                vendor={selectedVendor}
                onSyncCategories={syncVendorCategories}
                isLoadingCategories={isLoadingCategories}
                lastSyncTime={lastSyncTime}
              />

              {/* 카테고리 매핑 목록 */}
              <div className="bg-white rounded-lg border shadow-sm">
                <div className="p-4 border-b">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">
                      카테고리 매핑 ({filteredMappings.length}개)
                    </h3>
                    <button
                      onClick={handleAddMapping}
                      disabled={isLoading}
                      className="px-4 py-2 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-md"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      매핑 추가
                    </button>
                  </div>

                  {/* 필터 및 검색 */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <div className="relative flex-1">
                      <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <input
                        type="text"
                        placeholder="카테고리 검색..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>
                  </div>
                </div>

                {filteredMappings.length === 0 ? (
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
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            번호
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            판매처 카테고리
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
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {index + 1}
                            </td>
                            <td className="px-4 py-3">
                              <div className="text-sm font-medium text-gray-900">
                                {mapping.vendorCategory}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="text-sm text-gray-900">
                                {mapping.internalCategoryPath}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => handleEditMapping(mapping)}
                                  disabled={isLoading}
                                  className="px-3 py-1.5 text-xs border border-gray-300 rounded hover:bg-gray-50 hover:border-gray-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                  title="수정"
                                >
                                  수정
                                </button>
                                <button
                                  onClick={() => handleDeleteMapping(mapping.id)}
                                  disabled={isLoading}
                                  className="px-3 py-1.5 text-xs text-red-600 border border-red-300 rounded hover:bg-red-50 hover:border-red-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                  title="삭제"
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
                )}
              </div>
            </>
          ) : (
            <div className="bg-white rounded-lg border shadow-sm p-12 text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                판매처를 선택해주세요
              </h3>
              <p className="text-gray-600">
                좌측에서 판매처를 선택하면 카테고리 매핑을 관리할 수 있습니다.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 매핑 추가/수정 모달 */}
      {showModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in"
          onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
        >
          <div className="bg-white rounded-lg p-6 w-full max-w-md transform transition-all duration-300 ease-out animate-scale-in">
            <h3 className="text-lg font-semibold mb-4">
              {editingMapping ? "매핑 수정" : "매핑 추가"}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  판매처 카테고리 (필수)
                </label>
                <select
                  value={vendorCategory}
                  onChange={(e) => setVendorCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">카테고리를 선택하세요</option>
                  {selectedVendor && getVendorCategories(selectedVendor.id).map((category: VendorCategory) => (
                    <option key={category.id} value={category.path}>
                      {category.path} {category.productCount && `(${category.productCount}개 상품)`}
                    </option>
                  ))}
                </select>
                {selectedVendor && getVendorCategories(selectedVendor.id).length === 0 && (
                  <div className="mt-2 p-3 bg-yellow-50 rounded-lg">
                    <div className="text-sm text-yellow-800">
                      <strong>알림:</strong> 이 판매처의 카테고리가 동기화되지 않았습니다. 
                      <button 
                        onClick={() => syncVendorCategories(selectedVendor.id)}
                        className="ml-1 text-blue-600 hover:text-blue-800 underline"
                      >
                        지금 동기화하기
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  내부 카테고리 (필수)
                </label>
                <select
                  value={selectedInternalCategory}
                  onChange={(e) => setSelectedInternalCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">카테고리 선택</option>
                  {mockInternalCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.path}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                disabled={isLoading}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                취소
              </button>
              <button
                onClick={handleSaveMapping}
                disabled={isLoading}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-md"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    처리중...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {editingMapping ? "수정" : "추가"}
                  </>
                )}
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