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
  status: 'active' | 'inactive' | 'out_of_stock' | 'discontinued';
  season: string;
  relatedProducts: string[];
  brand: string;
  year: string;
}

interface FulgoProduct {
  id: string;
  name: string;
  code: string;
  category: string[];
  price: number;
  stock: number;
  status: 'active' | 'inactive' | 'out_of_stock' | 'discontinued';
  season: string;
  brand: string;
  year: string;
  description: string;
  images: string[];
  tags: string[];
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
    status: 'active',
    season: "2024 SS",
    relatedProducts: ["TS002", "TS003"],
    brand: "FULGO",
    year: "2024",
  },
  {
    id: 2,
    name: "슬림핏 청바지",
    code: "JN002",
    vendor: "스마트스토어",
    classificationPath: ["의류", "하의", "청바지"],
    selling_price: 59000,
    stock: 80,
    status: 'active',
    season: "2024 FW",
    relatedProducts: ["JN001", "JN003"],
    brand: "FULGO",
    year: "2024",
  },
  {
    id: 3,
    name: "가죽 크로스백",
    code: "BG003",
    vendor: "카페24",
    classificationPath: ["잡화", "가방", "크로스백"],
    selling_price: 89000,
    stock: 45,
    status: 'inactive',
    season: "2023 FW",
    relatedProducts: ["BG001", "BG002"],
    brand: "FULGO",
    year: "2023",
  },
  {
    id: 4,
    name: "캐주얼 스니커즈",
    code: "SH004",
    vendor: "스마트스토어",
    classificationPath: ["신발", "운동화", "스니커즈"],
    selling_price: 79000,
    stock: 0,
    status: 'out_of_stock',
    season: "2024 SS",
    relatedProducts: ["SH001", "SH002"],
    brand: "FULGO",
    year: "2024",
  },
];

// FULGO 상품 데이터 (실제로는 API에서 가져옴)
const mockFulgoProducts: FulgoProduct[] = [
  {
    id: "fulgo_1",
    name: "베이직 티셔츠",
    code: "TS001",
    category: ["의류", "상의", "티셔츠"],
    price: 25000,
    stock: 200,
    status: 'active',
    season: "2024 SS",
    brand: "FULGO",
    year: "2024",
    description: "편안한 착용감의 베이직 티셔츠입니다.",
    images: ["/images/ts001_1.jpg", "/images/ts001_2.jpg"],
    tags: ["베이직", "티셔츠", "캐주얼"]
  },
  {
    id: "fulgo_2",
    name: "슬림핏 청바지",
    code: "JN002",
    category: ["의류", "하의", "청바지"],
    price: 55000,
    stock: 100,
    status: 'active',
    season: "2024 FW",
    brand: "FULGO",
    year: "2024",
    description: "슬림핏으로 다리를 길어 보이게 하는 청바지입니다.",
    images: ["/images/jn002_1.jpg"],
    tags: ["청바지", "슬림핏", "데님"]
  },
  {
    id: "fulgo_3",
    name: "가죽 크로스백",
    code: "BG003",
    category: ["잡화", "가방", "크로스백"],
    price: 85000,
    stock: 50,
    status: 'inactive',
    season: "2023 FW",
    brand: "FULGO",
    year: "2023",
    description: "고급 가죽으로 제작된 크로스백입니다.",
    images: ["/images/bg003_1.jpg", "/images/bg003_2.jpg"],
    tags: ["가방", "가죽", "크로스백"]
  },
  {
    id: "fulgo_4",
    name: "캐주얼 스니커즈",
    code: "SH004",
    category: ["신발", "운동화", "스니커즈"],
    price: 75000,
    stock: 0,
    status: 'out_of_stock',
    season: "2024 SS",
    brand: "FULGO",
    year: "2024",
    description: "일상에서 편안하게 신을 수 있는 캐주얼 스니커즈입니다.",
    images: ["/images/sh004_1.jpg"],
    tags: ["스니커즈", "캐주얼", "운동화"]
  }
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
  
  // 상품 비교 모달 상태
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [fulgoProduct, setFulgoProduct] = useState<FulgoProduct | null>(null);
  
  // 체크박스 관련 상태
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [isAllSelected, setIsAllSelected] = useState(false);
  
  // 체크박스 관련 함수들
  const handleSelectProduct = (productId: number) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedProducts([]);
      setIsAllSelected(false);
    } else {
      const allProductIds = filteredProducts.map(p => p.id);
      setSelectedProducts(allProductIds);
      setIsAllSelected(true);
    }
  };

  const handleBulkStatusChange = async (newStatus: 'active' | 'inactive' | 'out_of_stock' | 'discontinued') => {
    if (selectedProducts.length === 0) {
      showToast("상품을 선택해주세요.", "error");
      return;
    }

    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setProducts(prev => prev.map(p => 
      selectedProducts.includes(p.id) 
        ? { ...p, status: newStatus }
        : p
    ));
    
    const statusText = {
      'active': '판매중',
      'inactive': '판매중지',
      'out_of_stock': '품절',
      'discontinued': '단종'
    }[newStatus];
    
    showToast(`${selectedProducts.length}개 상품이 ${statusText}으로 변경되었습니다.`, "success");
    
    setSelectedProducts([]);
    setIsAllSelected(false);
    setIsLoading(false);
  };

  const handleBulkDelete = async () => {
    if (selectedProducts.length === 0) {
      showToast("상품을 선택해주세요.", "error");
      return;
    }

    if (!window.confirm(`선택한 ${selectedProducts.length}개 상품을 삭제하시겠습니까?`)) {
      return;
    }

    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setProducts(prev => prev.filter(p => !selectedProducts.includes(p.id)));
    showToast(`${selectedProducts.length}개 상품이 삭제되었습니다.`, "success");
    
    setSelectedProducts([]);
    setIsAllSelected(false);
    setIsLoading(false);
  };

  // 상품 비교 함수
  const handleCompareProduct = (product: Product) => {
    const fulgoProductData = mockFulgoProducts.find(fp => fp.code === product.code);
    setSelectedProduct(product);
    setFulgoProduct(fulgoProductData || null);
    setShowCompareModal(true);
  };
  
  // 토스트 알림 헬퍼 함수
  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
  };
  const syncProducts = async (vendorId: string) => {
    setIsLoading(true);
    showToast(`${vendors.find(v => v.id === vendorId)?.name} 상품 정보 동기화 중...`, "info");
    
    // API 호출 시뮬레이션
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 새로운 상품 데이터 생성 (실제로는 API에서 받아옴)
    const newProducts: Product[] = [
      {
        id: Date.now() + Math.random(),
        name: "새로운 상품 1",
        code: `NEW${Math.floor(Math.random() * 1000)}`,
        vendor: vendors.find(v => v.id === vendorId)?.name || "",
        classificationPath: ["의류", "상의"],
        selling_price: Math.floor(Math.random() * 100000) + 10000,
        stock: Math.floor(Math.random() * 100),
        status: 'active',
        season: "2024 SS",
        relatedProducts: [],
        brand: "FULGO",
        year: "2024",
      },
      {
        id: Date.now() + Math.random() + 1,
        name: "새로운 상품 2", 
        code: `NEW${Math.floor(Math.random() * 1000)}`,
        vendor: vendors.find(v => v.id === vendorId)?.name || "",
        classificationPath: ["의류", "하의"],
        selling_price: Math.floor(Math.random() * 100000) + 10000,
        stock: Math.floor(Math.random() * 100),
        status: 'active',
        season: "2024 FW",
        relatedProducts: [],
        brand: "FULGO",
        year: "2024",
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
                             (filterStatus === "active" && p.status === 'active') ||
                             (filterStatus === "inactive" && p.status === 'inactive') ||
                             (filterStatus === "out_of_stock" && p.status === 'out_of_stock') ||
                             (filterStatus === "discontinued" && p.status === 'discontinued');
        return matchesVendor && matchesSearch && matchesStatus;
      })
    : [];

  // 체크박스 상태 동기화
  useEffect(() => {
    const allSelected = filteredProducts.length > 0 && selectedProducts.length === filteredProducts.length;
    setIsAllSelected(allSelected);
  }, [selectedProducts, filteredProducts]);

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
      status: 'active',
      season: "",
      relatedProducts: [],
      brand: "",
      year: "",
    });
    setShowProductModal(true);
  };
  
  // \uc0c1\ud488 \uc218\uc815 \ubaa8\ub2ec \uc5f4\uae30
  const handleEditProduct = (product: any) => {
    setEditingProduct({ ...product });
    setShowProductModal(true);
  };
  
  // \uc0c1\ud488 \uc800\uc7a5
  const handleDeleteProduct = async (productId: number) => {
    if (!window.confirm("이 상품을 삭제하시겠습니까?")) {
      return;
    }
    
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const product = products.find(p => p.id === productId);
    setProducts(prev => prev.filter(p => p.id !== productId));
    
    showToast(`${product?.name}이(가) 삭제되었습니다.`, "success");
    setIsLoading(false);
  };
  const handleStatusChange = async (productId: number, newStatus: 'active' | 'inactive' | 'out_of_stock' | 'discontinued') => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setProducts(prev => prev.map(p => 
      p.id === productId 
        ? { ...p, status: newStatus }
        : p
    ));
    
    const product = products.find(p => p.id === productId);
    const statusText = {
      'active': '판매중',
      'inactive': '판매중지',
      'out_of_stock': '품절',
      'discontinued': '단종'
    }[newStatus];
    
    showToast(`${product?.name}의 상태가 ${statusText}으로 변경되었습니다.`, "success");
    setIsLoading(false);
  };
  const handleSaveProduct = async () => {
    if (!editingProduct?.name.trim()) {
      showToast("상품명을 입력해주세요.", "error");
      return;
    }
    if (!editingProduct?.code.trim()) {
      showToast("상품코드를 입력해주세요.", "error");
      return;
    }
    
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const existingIndex = products.findIndex(p => p.id === editingProduct.id);
    if (existingIndex >= 0) {
      setProducts(products.map(p => p.id === editingProduct.id ? editingProduct : p));
      showToast("상품이 수정되었습니다.", "success");
    } else {
      setProducts([...products, editingProduct]);
      showToast("상품이 추가되었습니다.", "success");
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
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleBulkStatusChange('active')}
                        disabled={isLoading || selectedProducts.length === 0}
                        className="px-3 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
                      >
                        선택 상품 판매중
                      </button>
                      <button 
                        onClick={() => handleBulkStatusChange('inactive')}
                        disabled={isLoading || selectedProducts.length === 0}
                        className="px-3 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
                      >
                        선택 상품 판매중지
                      </button>
                      <button 
                        onClick={() => handleBulkStatusChange('out_of_stock')}
                        disabled={isLoading || selectedProducts.length === 0}
                        className="px-3 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
                      >
                        선택 상품 품절
                      </button>
                      <button 
                        onClick={() => handleBulkStatusChange('discontinued')}
                        disabled={isLoading || selectedProducts.length === 0}
                        className="px-3 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
                      >
                        선택 상품 단종
                      </button>
                      <button 
                        onClick={handleBulkDelete}
                        disabled={isLoading || selectedProducts.length === 0}
                        className="px-3 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
                      >
                        선택 상품 삭제
                      </button>
                      <button 
                        onClick={() => syncProducts(selectedVendor.id)}
                        disabled={isLoading}
                        className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
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
                        <option value="active">판매중</option>
                        <option value="inactive">판매중지</option>
                        <option value="out_of_stock">품절</option>
                        <option value="discontinued">단종</option>
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
                  {filteredProducts.length > 0 && (
                    <div className="p-4 bg-gray-50 border-b">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isAllSelected}
                          onChange={handleSelectAll}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                        />
                        <span className="text-sm text-gray-700">
                          전체 선택 ({selectedProducts.length}/{filteredProducts.length})
                        </span>
                      </div>
                    </div>
                  )}
                  {filteredProducts.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-gray-600">아직 등록된 상품이 없습니다</p>
                      <p className="text-sm text-gray-500 mt-1">아래 버튼을 눌러 상품을 가져와보세요</p>
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
                        className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => handleCompareProduct(product)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                checked={selectedProducts.includes(product.id)}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  handleSelectProduct(product.id);
                                }}
                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                              />
                              <div className="font-medium text-gray-900">
                                {product.name}
                              </div>
                              <span
                                className={`px-2 py-1 text-xs rounded ${
                                  product.status === 'active'
                                    ? "bg-green-100 text-green-700"
                                    : product.status === 'inactive'
                                    ? "bg-gray-100 text-gray-700"
                                    : product.status === 'out_of_stock'
                                    ? "bg-red-100 text-red-700"
                                    : "bg-orange-100 text-orange-700"
                                }`}
                              >
                                {product.status === 'active' ? "판매중" : 
                                 product.status === 'inactive' ? "판매중지" :
                                 product.status === 'out_of_stock' ? "품절" : "단종"}
                              </span>
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                              {product.code} • {product.classificationPath.join(" > ")}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              브랜드: {product.brand} • 연도: {product.year} • 시즌: {product.season}
                            </div>
                            {product.relatedProducts.length > 0 && (
                              <div className="text-xs text-blue-600 mt-1">
                                연관상품: {product.relatedProducts.join(", ")}
                              </div>
                            )}
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
                          <div className="ml-4 flex gap-2">
                            <select
                              value={product.status}
                              onChange={(e) => handleStatusChange(product.id, e.target.value as 'active' | 'inactive' | 'out_of_stock' | 'discontinued')}
                              disabled={isLoading}
                              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none bg-white pr-8 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <option value="active">판매중</option>
                              <option value="inactive">판매중지</option>
                              <option value="out_of_stock">품절</option>
                              <option value="discontinued">단종</option>
                            </select>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditProduct(product);
                              }}
                              disabled={isLoading}
                              className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                              수정
                            </button>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteProduct(product.id);
                              }}
                              disabled={isLoading}
                              className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                              삭제
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
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                판매처를 선택해주세요
              </h3>
              <p className="text-gray-600">
                좌측 목록에서 판매처를 선택하면 상세 정보와 상품 목록을 확인할 수 있습니다
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
                  value={editingProduct.status}
                  onChange={(e) => setEditingProduct({ ...editingProduct, status: e.target.value as 'active' | 'inactive' | 'out_of_stock' | 'discontinued' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="active">판매중</option>
                  <option value="inactive">판매중지</option>
                  <option value="out_of_stock">품절</option>
                  <option value="discontinued">단종</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">브랜드</label>
                <input
                  type="text"
                  value={editingProduct.brand}
                  onChange={(e) => setEditingProduct({ ...editingProduct, brand: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="예: FULGO"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">연도</label>
                <input
                  type="text"
                  value={editingProduct.year}
                  onChange={(e) => setEditingProduct({ ...editingProduct, year: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="예: 2024"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">시즌</label>
                <input
                  type="text"
                  value={editingProduct.season}
                  onChange={(e) => setEditingProduct({ ...editingProduct, season: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="예: 2024 SS"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">연관상품 코드</label>
                <input
                  type="text"
                  value={editingProduct.relatedProducts.join(", ")}
                  onChange={(e) => setEditingProduct({ 
                    ...editingProduct, 
                    relatedProducts: e.target.value.split(",").map(code => code.trim()).filter(code => code)
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="예: TS002, TS003 (쉼표로 구분)"
                />
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

      {/* 상품 비교 모달 */}
      {showCompareModal && selectedProduct && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in"
          onClick={(e) => e.target === e.currentTarget && setShowCompareModal(false)}
        >
          <div className="bg-white rounded-lg p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto transform transition-all duration-300 ease-out animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                상품 정보 비교 - {selectedProduct.name}
              </h3>
              <button
                onClick={() => setShowCompareModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 판매처 상품 정보 */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-blue-800 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  판매처 상품 정보 ({selectedProduct.vendor})
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">상품명:</span>
                    <span className="font-medium">{selectedProduct.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">상품코드:</span>
                    <span className="font-medium">{selectedProduct.code}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">판매가격:</span>
                    <span className="font-medium">₩{selectedProduct.selling_price.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">재고:</span>
                    <span className="font-medium">{selectedProduct.stock}개</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">상태:</span>
                    <span className={`px-2 py-1 text-xs rounded ${
                      selectedProduct.status === 'active' ? "bg-green-100 text-green-700" :
                      selectedProduct.status === 'inactive' ? "bg-gray-100 text-gray-700" :
                      selectedProduct.status === 'out_of_stock' ? "bg-red-100 text-red-700" :
                      "bg-orange-100 text-orange-700"
                    }`}>
                      {selectedProduct.status === 'active' ? "판매중" : 
                       selectedProduct.status === 'inactive' ? "판매중지" :
                       selectedProduct.status === 'out_of_stock' ? "품절" : "단종"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">브랜드:</span>
                    <span className="font-medium">{selectedProduct.brand}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">연도:</span>
                    <span className="font-medium">{selectedProduct.year}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">시즌:</span>
                    <span className="font-medium">{selectedProduct.season}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">분류:</span>
                    <span className="font-medium">{selectedProduct.classificationPath.join(" > ")}</span>
                  </div>
                  {selectedProduct.relatedProducts.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">연관상품:</span>
                      <span className="font-medium">{selectedProduct.relatedProducts.join(", ")}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* FULGO 상품 정보 */}
              <div className="bg-green-50 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-green-800 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  FULGO 상품 정보
                </h4>
                {fulgoProduct ? (
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">상품명:</span>
                      <span className="font-medium">{fulgoProduct.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">상품코드:</span>
                      <span className="font-medium">{fulgoProduct.code}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">판매가격:</span>
                      <span className="font-medium">₩{fulgoProduct.price.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">재고:</span>
                      <span className="font-medium">{fulgoProduct.stock}개</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">상태:</span>
                      <span className={`px-2 py-1 text-xs rounded ${
                        fulgoProduct.status === 'active' ? "bg-green-100 text-green-700" :
                        fulgoProduct.status === 'inactive' ? "bg-gray-100 text-gray-700" :
                        fulgoProduct.status === 'out_of_stock' ? "bg-red-100 text-red-700" :
                        "bg-orange-100 text-orange-700"
                      }`}>
                        {fulgoProduct.status === 'active' ? "판매중" : 
                         fulgoProduct.status === 'inactive' ? "판매중지" :
                         fulgoProduct.status === 'out_of_stock' ? "품절" : "단종"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">브랜드:</span>
                      <span className="font-medium">{fulgoProduct.brand}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">연도:</span>
                      <span className="font-medium">{fulgoProduct.year}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">시즌:</span>
                      <span className="font-medium">{fulgoProduct.season}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">분류:</span>
                      <span className="font-medium">{fulgoProduct.category.join(" > ")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">설명:</span>
                      <span className="font-medium text-right max-w-xs">{fulgoProduct.description}</span>
                    </div>
                    {fulgoProduct.tags.length > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">태그:</span>
                        <span className="font-medium">{fulgoProduct.tags.join(", ")}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.709M15 6.291A7.962 7.962 0 0012 4c-2.34 0-4.29 1.009-5.824 2.709" />
                    </svg>
                    <p className="text-gray-500">FULGO에 등록된 상품이 없습니다</p>
                    <p className="text-sm text-gray-400 mt-1">상품코드: {selectedProduct.code}</p>
                  </div>
                )}
              </div>
            </div>

            {/* 차이점 요약 */}
            {fulgoProduct && (
              <div className="mt-6 bg-yellow-50 rounded-lg p-4">
                <h5 className="text-lg font-semibold text-yellow-800 mb-3">주요 차이점</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h6 className="font-medium text-yellow-700 mb-2">가격 차이</h6>
                    <p className="text-sm text-gray-600">
                      판매처: ₩{selectedProduct.selling_price.toLocaleString()} | 
                      FULGO: ₩{fulgoProduct.price.toLocaleString()} | 
                      차이: ₩{(selectedProduct.selling_price - fulgoProduct.price).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <h6 className="font-medium text-yellow-700 mb-2">재고 차이</h6>
                    <p className="text-sm text-gray-600">
                      판매처: {selectedProduct.stock}개 | 
                      FULGO: {fulgoProduct.stock}개 | 
                      차이: {selectedProduct.stock - fulgoProduct.stock}개
                    </p>
                  </div>
                </div>
              </div>
            )}
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