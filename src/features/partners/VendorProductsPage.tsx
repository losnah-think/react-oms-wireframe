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

// 타입 정의
interface Vendor {
  id: string;
  name: string;
  type: string;
  businessNumber: string;
  representative: string;
  phone: string;
  email: string;
  address: string;
  status: string;
  registrationDate: string;
  apiKey: string;
  lastLoginDate: string;
}

interface Product {
  id: number;
  name: string;
  code: string;
  vendor: string;
  classificationPath: string[];
  selling_price: number;
  stock: number;
  is_selling: boolean;
}

// Mock 데이터
const mockProducts: Product[] = [
  {
    id: 1,
    name: "베이직 티셔츠",
    code: "TS001",
    vendor: "카페24",
    classificationPath: ["의류", "상의", "티셔츠"],
    selling_price: 29000,
    stock: 150,
    is_selling: true,
  },
  {
    id: 2,
    name: "슬림핏 청바지",
    code: "JN002",
    vendor: "스마트스토어",
    classificationPath: ["의류", "하의", "청바지"],
    selling_price: 59000,
    stock: 80,
    is_selling: true,
  },
  {
    id: 3,
    name: "가죽 크로스백",
    code: "BG003",
    vendor: "카페24",
    classificationPath: ["잡화", "가방", "크로스백"],
    selling_price: 89000,
    stock: 45,
    is_selling: false,
  },
  {
    id: 4,
    name: "캐주얼 스니커즈",
    code: "SH004",
    vendor: "스마트스토어",
    classificationPath: ["신발", "운동화", "스니커즈"],
    selling_price: 79000,
    stock: 0,
    is_selling: true,
  },
];

const mockVendors: Vendor[] = [
  {
    id: "cafe24",
    name: "카페24",
    type: "판매처",
    businessNumber: "123-45-67890",
    representative: "김철수",
    phone: "02-1234-5678",
    email: "cafe24@example.com",
    address: "서울시 강남구 테헤란로 123",
    status: "active",
    registrationDate: "2023-01-15",
    apiKey: "cafe24_api_key_1234",
    lastLoginDate: "2025-09-29",
  },
  {
    id: "smartstore",
    name: "스마트스토어",
    type: "판매처",
    businessNumber: "987-65-43210",
    representative: "이영희",
    phone: "02-9876-5432",
    email: "smartstore@example.com",
    address: "서울시 서초구 서초대로 456",
    status: "active",
    registrationDate: "2023-03-20",
    apiKey: "smartstore_api_key_5678",
    lastLoginDate: "2025-09-30",
  },
];

export default function VendorProductsPage() {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [vendors, setVendors] = useState<Vendor[]>(mockVendors);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  // UI/UX 개선을 위한 상태
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showVendorEditModal, setShowVendorEditModal] = useState(false);
  const [productSearchTerm, setProductSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  
  // 토스트 알림 헬퍼 함수
  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
  };

  // 상품 정보 동기화 함수
  const syncProducts = async (vendorId: string) => {
    setIsLoading(true);
    showToast(`${vendors.find(v => v.id === vendorId)?.name} 상품 정보 동기화 중...`, "info");
    
    // API 호출 시뮬레이션
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 새로운 상품 데이터 생성 (실제로는 API에서 받아옴)
    const newProducts = [
      {
        id: Date.now() + Math.random(),
        name: "새로운 상품 1",
        code: `NEW${Math.floor(Math.random() * 1000)}`,
        vendor: vendors.find(v => v.id === vendorId)?.name || "",
        classificationPath: ["의류", "상의"],
        selling_price: Math.floor(Math.random() * 100000) + 10000,
        stock: Math.floor(Math.random() * 100),
        is_selling: true,
      },
      {
        id: Date.now() + Math.random() + 1,
        name: "새로운 상품 2", 
        code: `NEW${Math.floor(Math.random() * 1000)}`,
        vendor: vendors.find(v => v.id === vendorId)?.name || "",
        classificationPath: ["의류", "하의"],
        selling_price: Math.floor(Math.random() * 100000) + 10000,
        stock: Math.floor(Math.random() * 100),
        is_selling: true,
      }
    ];
    
    setProducts(prev => [...prev, ...newProducts]);
    setIsLoading(false);
    showToast("상품 정보 동기화가 완료되었습니다.", "success");
  };

  useEffect(() => {
    if (vendors.length > 0 && !selectedVendor) {
      setSelectedVendor(vendors[0]);
    }
  }, [vendors]);

  const filteredProducts = selectedVendor
    ? products.filter((p) => {
        const matchesVendor = p.vendor === selectedVendor.name;
        const matchesSearch = p.name.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
                             p.code.toLowerCase().includes(productSearchTerm.toLowerCase());
        const matchesStatus = filterStatus === "all" ||
                             (filterStatus === "selling" && p.is_selling) ||
                             (filterStatus === "not_selling" && !p.is_selling);
        return matchesVendor && matchesSearch && matchesStatus;
      })
    : [];

  const filteredVendors = vendors.filter(
    (v) =>
      v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.representative.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // \uc0c1\ud488 \ucd94\uac00 \ubaa8\ub2ec \uc5f4\uae30
  const handleAddProduct = () => {
    setEditingProduct({
      id: Date.now(),
      name: "",
      code: "",
      vendor: selectedVendor?.name || "",
      classificationPath: [],
      selling_price: 0,
      stock: 0,
      is_selling: true
    });
    setShowProductModal(true);
  };
  
  // \uc0c1\ud488 \uc218\uc815 \ubaa8\ub2ec \uc5f4\uae30
  const handleEditProduct = (product: any) => {
    setEditingProduct({ ...product });
    setShowProductModal(true);
  };
  
  // \uc0c1\ud488 \uc800\uc7a5
  const handleSaveProduct = async () => {
    if (!editingProduct?.name.trim()) {
      showToast("\uc0c1\ud488\uba85\uc744 \uc785\ub825\ud574\uc8fc\uc138\uc694.", "error");
      return;
    }
    if (!editingProduct?.code.trim()) {
      showToast("\uc0c1\ud488\ucf54\ub4dc\ub97c \uc785\ub825\ud574\uc8fc\uc138\uc694.", "error");
      return;
    }
    
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const existingIndex = products.findIndex(p => p.id === editingProduct.id);
    if (existingIndex >= 0) {
      setProducts(products.map(p => p.id === editingProduct.id ? editingProduct : p));
      showToast("\uc0c1\ud488\uc774 \uc218\uc815\ub418\uc5c8\uc2b5\ub2c8\ub2e4.", "success");
    } else {
      setProducts([...products, editingProduct]);
      showToast("\uc0c1\ud488\uc774 \ucd94\uac00\ub418\uc5c8\uc2b5\ub2c8\ub2e4.", "success");
    }
    
    setIsLoading(false);
    setShowProductModal(false);
    setEditingProduct(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* 헤더 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">판매처별 상품 관리</h1>
        <p className="text-gray-600 mt-1">
          각 판매처의 기본 정보와 등록된 상품을 확인하고 관리합니다.
        </p>
      </div>

      <div className="flex gap-6">
        {/* 좌측: 판매처 목록 */}
        <div className="w-80 flex-shrink-0">
          <div className="bg-white rounded-lg border shadow-sm">
            {/* 검색 */}
            <div className="p-4 border-b">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="판매처 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              {searchTerm && (
                <div className="mt-2 text-sm text-gray-500">
                  {filteredVendors.length}개 판매처 검색됨
                </div>
              )}
            </div>

            {/* 판매처 목록 */}
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
                          {products.filter((p) => p.vendor === vendor.name).length}개 상품
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

        {/* 우측: 판매처 정보 및 상품 목록 */}
        <div className="flex-1">
          {selectedVendor ? (
            <>
              {/* 판매처 기본 정보 카드 */}
              <div className="bg-white rounded-lg border shadow-sm p-6 mb-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {selectedVendor.name}
                    </h2>
                    <div className="flex items-center gap-2 mt-2">
                      <span
                        className={`px-3 py-1 text-sm rounded-full ${
                          selectedVendor.status === "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {selectedVendor.status === "active" ? "활성" : "비활성"}
                      </span>
                      {selectedVendor.apiKey && (
                        <span className="px-3 py-1 text-sm rounded-full bg-blue-100 text-blue-700">
                          API 연동됨
                        </span>
                      )}
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowVendorEditModal(true)}
                    className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    정보 수정
                  </button>
                </div>

                {/* 상세 정보 그리드 */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">
                      기본 정보
                    </h3>
                    <div className="space-y-2">
                      <div className="flex">
                        <span className="text-sm text-gray-600 w-24">대표자</span>
                        <span className="text-sm text-gray-900 font-medium">
                          {selectedVendor.representative}
                        </span>
                      </div>
                      <div className="flex">
                        <span className="text-sm text-gray-600 w-24">사업자번호</span>
                        <span className="text-sm text-gray-900 font-medium">
                          {selectedVendor.businessNumber}
                        </span>
                      </div>
                      <div className="flex">
                        <span className="text-sm text-gray-600 w-24">등록일</span>
                        <span className="text-sm text-gray-900">
                          {selectedVendor.registrationDate}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">
                      연락 정보
                    </h3>
                    <div className="space-y-2">
                      <div className="flex">
                        <span className="text-sm text-gray-600 w-24">전화번호</span>
                        <span className="text-sm text-gray-900 font-medium">
                          {selectedVendor.phone}
                        </span>
                      </div>
                      <div className="flex">
                        <span className="text-sm text-gray-600 w-24">이메일</span>
                        <span className="text-sm text-gray-900 font-medium">
                          {selectedVendor.email}
                        </span>
                      </div>
                      <div className="flex">
                        <span className="text-sm text-gray-600 w-24">주소</span>
                        <span className="text-sm text-gray-900">
                          {selectedVendor.address}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {selectedVendor.apiKey && (
                  <div className="mt-6 pt-4 border-t">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">
                      API 연동 정보
                    </h3>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="text-xs text-gray-600">마지막 로그인</div>
                        <div className="text-sm text-gray-900 font-medium mt-1">
                          {selectedVendor.lastLoginDate}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 상품 목록 */}
              <div className="bg-white rounded-lg border shadow-sm">
                <div className="p-4 border-b">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">
                      등록 상품 목록 ({filteredProducts.length}개)
                    </h3>
                    <button 
                      onClick={() => syncProducts(selectedVendor.id)}
                      disabled={isLoading}
                      className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-md"
                    >
                      {isLoading ? (
                        <>
                          <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          동기화 중...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          상품 정보 동기화
                        </>
                      )}
                    </button>
                  </div>
                  
                  {/* 검색 및 필터 */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <div className="relative">
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none bg-white pr-8"
                      >
                        <option value="all">전체 상태</option>
                        <option value="selling">판매중</option>
                        <option value="not_selling">판매중지</option>
                      </select>
                      <svg className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                    <div className="relative flex-1">
                      <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <input
                        type="text"
                        placeholder="상품명 또는 코드로 검색..."
                        value={productSearchTerm}
                        onChange={(e) => setProductSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>
                  </div>
                </div>

                <div className="divide-y">
                  {filteredProducts.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-gray-400 text-4xl mb-3">📦</div>
                      <p className="text-gray-600">등록된 상품이 없습니다.</p>
                      <button 
                        onClick={() => syncProducts(selectedVendor.id)}
                        disabled={isLoading}
                        className="mt-4 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
                      >
                        {isLoading ? (
                          <>
                            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            동기화 중...
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            상품 정보 동기화
                          </>
                        )}
                      </button>
                    </div>
                  ) : (
                    filteredProducts.map((product) => (
                      <div
                        key={product.id}
                        className="p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <div className="font-medium text-gray-900">
                                {product.name}
                              </div>
                              <span
                                className={`px-2 py-1 text-xs rounded ${
                                  product.is_selling
                                    ? "bg-green-100 text-green-700"
                                    : "bg-gray-100 text-gray-700"
                                }`}
                              >
                                {product.is_selling ? "판매중" : "판매중지"}
                              </span>
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                              {product.code} • {product.classificationPath.join(" > ")}
                            </div>
                          </div>
                          <div className="text-right ml-4">
                            <div className="font-semibold text-gray-900">
                              ₩{product.selling_price.toLocaleString()}
                            </div>
                            <div
                              className={`text-sm mt-1 ${
                                product.stock === 0
                                  ? "text-red-600 font-medium"
                                  : product.stock < 10
                                  ? "text-orange-600"
                                  : "text-gray-600"
                              }`}
                            >
                              재고: {product.stock}개
                            </div>
                          </div>
                          <div className="ml-4">
                            <button 
                              onClick={() => handleEditProduct(product)}
                              disabled={isLoading}
                              className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              수정
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-lg border shadow-sm p-12 text-center">
              <div className="text-gray-400 text-4xl mb-3">🏪</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                판매처를 선택해주세요
              </h3>
              <p className="text-gray-600">
                좌측에서 판매처를 선택하면 상세 정보와 상품 목록을 확인할 수 있습니다.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 상품 추가/수정 모달 */}
      {showProductModal && editingProduct && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in"
          onClick={(e) => e.target === e.currentTarget && setShowProductModal(false)}
        >
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto transform transition-all duration-300 ease-out animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                {products.find(p => p.id === editingProduct.id) ? '상품 수정' : '상품 추가'}
              </h3>
              <button
                onClick={() => setShowProductModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">상품명 (필수)</label>
                <input
                  type="text"
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="예: 베이직 티셔츠"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">상품코드 (필수)</label>
                <input
                  type="text"
                  value={editingProduct.code}
                  onChange={(e) => setEditingProduct({ ...editingProduct, code: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="예: TS001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">판매가격</label>
                <input
                  type="number"
                  value={editingProduct.selling_price}
                  onChange={(e) => setEditingProduct({ ...editingProduct, selling_price: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">재고수량</label>
                <input
                  type="number"
                  value={editingProduct.stock}
                  onChange={(e) => setEditingProduct({ ...editingProduct, stock: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">판매상태</label>
                <select
                  value={editingProduct.is_selling ? 'selling' : 'not_selling'}
                  onChange={(e) => setEditingProduct({ ...editingProduct, is_selling: e.target.value === 'selling' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="selling">판매중</option>
                  <option value="not_selling">판매중지</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowProductModal(false)}
                disabled={isLoading}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                취소
              </button>
              <button
                onClick={handleSaveProduct}
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
                    {products.find(p => p.id === editingProduct.id) ? '수정' : '추가'}
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