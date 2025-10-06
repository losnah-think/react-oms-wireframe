import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

// 상품 인터페이스
interface Product {
  id: string;
  productName: string;
  productCode: string;
  representativeSellingPrice: number;
  stock: number;
  isSelling: boolean;
  productCategory: string[];
  brand: string;
  representativeImage: string | null;
  variants: ProductVariant[];
  originalCost: number;
  createdAt: string;
  season: string;
  year: string;
  designer: string;
  supplier: string;
  registrant: string;
  tags: string[];
}

interface ProductVariant {
  id: string;
  optionName: string;
  salesStatus: 'active' | 'inactive' | 'out_of_stock';
  stock: number;
  location: string;
  barcode: string;
  lastModified: string;
}

// Mock 데이터
const mockProducts: Product[] = [
  {
    id: "1",
    productName: "[MADE] 임스 베이직 반폴라 니트 JT09390",
    productCode: "JJBD03-KN01",
    representativeSellingPrice: 10000,
    stock: 45,
    isSelling: true,
    productCategory: ["카테고리", "카테고리", "카테고리", "카테고리"],
    brand: "MADE J",
    representativeImage: "/images/product1.jpg",
    variants: [
      {
        id: "v1",
        optionName: "V-1000-1",
        salesStatus: 'active',
        stock: 30,
        location: "aaaaaaaaa",
        barcode: "123456",
        lastModified: "2025.01.01-7분 전"
      },
      {
        id: "v2", 
        optionName: "V-1000-2",
        salesStatus: 'active',
        stock: 15,
        location: "",
        barcode: "123457",
        lastModified: "2025.01.01-5분 전"
      }
    ],
    originalCost: 6000,
    createdAt: "2025.01.01",
    season: "2024 SS",
    year: "2024",
    designer: "김디자이너",
    supplier: "공급처A",
    registrant: "등록자A",
    tags: ["니트", "반폴라", "베이직"]
  },
  {
    id: "2",
    productName: "[FULGO] 클래식 데님 청바지",
    productCode: "FG-DN-001",
    representativeSellingPrice: 25000,
    stock: 120,
    isSelling: true,
    productCategory: ["의류", "하의", "청바지"],
    brand: "FULGO",
    representativeImage: "/images/product2.jpg",
    variants: [
      {
        id: "v3",
        optionName: "28-30",
        salesStatus: 'active',
        stock: 50,
        location: "창고A-1",
        barcode: "234567",
        lastModified: "2025.01.01-10분 전"
      },
      {
        id: "v4",
        optionName: "30-32", 
        salesStatus: 'active',
        stock: 70,
        location: "창고A-2",
        barcode: "234568",
        lastModified: "2025.01.01-8분 전"
      }
    ],
    originalCost: 15000,
    createdAt: "2025.01.01",
    season: "2024 FW",
    year: "2024",
    designer: "이디자이너",
    supplier: "공급처B",
    registrant: "등록자B",
    tags: ["데님", "청바지", "클래식"]
  }
];

const ProductsListPage: React.FC = () => {
  const router = useRouter();
  
  // 상태 관리
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [isCompactView, setIsCompactView] = useState(false);
  
  // 필터 상태
  const [filters, setFilters] = useState({
    category: "전체",
    brand: "전체", 
    productClassification: "전체",
    supplier: "전체",
    designer: "전체",
    registrant: "전체",
    year: "전체",
    season: "전체",
    inventoryMatching: "전체",
    dateFrom: "",
    dateTo: ""
  });
  
  const [sortBy, setSortBy] = useState("최신순");

  // 필터링된 상품 목록
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.productCode.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilters = 
      (filters.category === "전체" || product.productCategory.includes(filters.category)) &&
      (filters.brand === "전체" || product.brand === filters.brand) &&
      (filters.year === "전체" || product.year === filters.year) &&
      (filters.season === "전체" || product.season === filters.season) &&
      (filters.designer === "전체" || product.designer === filters.designer) &&
      (filters.supplier === "전체" || product.supplier === filters.supplier) &&
      (filters.registrant === "전체" || product.registrant === filters.registrant);
    
    return matchesSearch && matchesFilters;
  });

  // 전체 선택/해제
  const handleSelectAll = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filteredProducts.map(p => p.id));
    }
  };

  // 개별 선택
  const handleSelectProduct = (productId: string) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  // 옵션 접기/펼치기
  const toggleProductExpansion = (productId: string) => {
    setExpandedProducts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  // 가격 포맷팅
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  // 상태 텍스트
  const getStatusText = (isSelling: boolean, stock: number) => {
    if (!isSelling) return "판매 중지";
    if (stock === 0) return "품절";
    return "활성 판매 중";
  };

  // 상태 색상
  const getStatusColor = (isSelling: boolean, stock: number) => {
    if (!isSelling) return "text-gray-500";
    if (stock === 0) return "text-red-500";
    return "text-green-500";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">상품 목록</h1>
            <p className="text-sm text-gray-600 mt-1">총 {filteredProducts.length}개 상품</p>
          </div>
        </div>
      </div>

      {/* 통합 검색 */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-4">
            카테고리 브랜드 기간으로 검색하고, 기간은 필터 영역에서 설정하세요.
          </p>
          
          {/* 메인 검색바 */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="상품명, 상품코드로 검색 (단축키: 8/Ctrl+K, /)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
            
            {/* 날짜 범위 */}
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-gray-500">-</span>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              필터 펼치기
            </button>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="최신순">최신순</option>
              <option value="이름순">이름순</option>
              <option value="가격순">가격순</option>
            </select>
          </div>
        </div>

        {/* 필터 영역 */}
        {showFilters && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-4">
            <select
              value={filters.category}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="전체">카테고리</option>
              <option value="의류">의류</option>
              <option value="신발">신발</option>
              <option value="가방">가방</option>
            </select>
            
            <select
              value={filters.brand}
              onChange={(e) => setFilters(prev => ({ ...prev, brand: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="전체">브랜드</option>
              <option value="MADE J">MADE J</option>
              <option value="FULGO">FULGO</option>
            </select>
            
            <select
              value={filters.productClassification}
              onChange={(e) => setFilters(prev => ({ ...prev, productClassification: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="전체">상품 분류</option>
              <option value="니트">니트</option>
              <option value="청바지">청바지</option>
            </select>
            
            <select
              value={filters.supplier}
              onChange={(e) => setFilters(prev => ({ ...prev, supplier: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="전체">공급처</option>
              <option value="공급처A">공급처A</option>
              <option value="공급처B">공급처B</option>
            </select>
            
            <select
              value={filters.designer}
              onChange={(e) => setFilters(prev => ({ ...prev, designer: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="전체">디자이너</option>
              <option value="김디자이너">김디자이너</option>
              <option value="이디자이너">이디자이너</option>
            </select>
            
            <select
              value={filters.registrant}
              onChange={(e) => setFilters(prev => ({ ...prev, registrant: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="전체">등록자</option>
              <option value="등록자A">등록자A</option>
              <option value="등록자B">등록자B</option>
            </select>
            
            <select
              value={filters.year}
              onChange={(e) => setFilters(prev => ({ ...prev, year: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="전체">연도</option>
              <option value="2024">2024</option>
              <option value="2025">2025</option>
            </select>
            
            <select
              value={filters.season}
              onChange={(e) => setFilters(prev => ({ ...prev, season: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="전체">시즌</option>
              <option value="2024 SS">2024 SS</option>
              <option value="2024 FW">2024 FW</option>
            </select>
          </div>
        )}

        {/* 재고 매칭 사용 상품 */}
        <div className="flex items-center gap-4 mb-4">
          <span className="text-sm font-medium text-gray-700">재고 매칭 사용 상품:</span>
          <div className="flex items-center gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="inventoryMatching"
                value="전체"
                checked={filters.inventoryMatching === "전체"}
                onChange={(e) => setFilters(prev => ({ ...prev, inventoryMatching: e.target.value }))}
                className="mr-2"
              />
              <span className="text-sm">전체</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="inventoryMatching"
                value="적용"
                checked={filters.inventoryMatching === "적용"}
                onChange={(e) => setFilters(prev => ({ ...prev, inventoryMatching: e.target.value }))}
                className="mr-2"
              />
              <span className="text-sm">적용</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="inventoryMatching"
                value="미적용"
                checked={filters.inventoryMatching === "미적용"}
                onChange={(e) => setFilters(prev => ({ ...prev, inventoryMatching: e.target.value }))}
                className="mr-2"
              />
              <span className="text-sm">미적용</span>
            </label>
          </div>
        </div>
      </div>

      {/* 액션 바 */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => {
                // 엑셀 내보내기 기능 (실제로는 CSV 다운로드)
                const csvContent = [
                  ['상품ID', '상품명', '상품코드', '가격', '재고', '상태', '브랜드', '연도', '시즌', '등록일'],
                  ...filteredProducts.map(product => [
                    product.id,
                    product.productName,
                    product.productCode,
                    product.representativeSellingPrice,
                    product.stock,
                    getStatusText(product.isSelling, product.stock),
                    product.brand,
                    product.year,
                    product.season,
                    product.createdAt
                  ])
                ].map(row => row.join(',')).join('\n');
                
                const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = `상품목록_${new Date().toISOString().split('T')[0]}.csv`;
                link.click();
              }}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              엑셀 내보내기
            </button>
            <button 
              disabled={selectedProducts.length === 0}
              onClick={() => {
                if (selectedProducts.length === 0) return;
                router.push(`/products/external-send?ids=${selectedProducts.join(',')}`);
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              선택 외부 송신
            </button>
            <button 
              onClick={() => {
                alert('CSV 도움말:\n\n1. 엑셀 내보내기: 현재 필터된 상품 목록을 CSV 파일로 다운로드합니다.\n2. 파일 형식: UTF-8 인코딩으로 저장됩니다.\n3. 포함 정보: 상품ID, 상품명, 상품코드, 가격, 재고, 상태, 브랜드, 연도, 시즌, 등록일\n4. 파일명: 상품목록_YYYY-MM-DD.csv 형식으로 저장됩니다.');
              }}
              className="px-4 py-2 text-blue-500 hover:text-blue-700 flex items-center gap-1"
            >
              CSV 도움말
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            <button 
              onClick={() => setIsCompactView(!isCompactView)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                isCompactView 
                  ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              }`}
            >
              {isCompactView ? '상세 보기' : '간략히 보기'}
            </button>
          </div>
          <button 
            disabled={selectedProducts.length === 0}
            onClick={() => {
              if (selectedProducts.length === 0) return;
              if (window.confirm(`선택한 ${selectedProducts.length}개 상품을 삭제하시겠습니까?`)) {
                setProducts(prev => prev.filter(p => !selectedProducts.includes(p.id)));
                setSelectedProducts([]);
              }
            }}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            선택 삭제
          </button>
        </div>
      </div>

      {/* 상품 목록 */}
      <div className="px-6 py-4">
        {/* 테이블 헤더 */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-700">
            <div className="col-span-1">
              <input
                type="checkbox"
                checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                onChange={handleSelectAll}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
            </div>
            <div className="col-span-5">상품정보</div>
            <div className="col-span-1">재고</div>
            <div className="col-span-1">가격</div>
            <div className="col-span-1">등록일</div>
            <div className="col-span-3">액션</div>
          </div>

          {/* 상품 목록 */}
          {filteredProducts.map((product) => (
            <div key={product.id} className="border-b border-gray-200">
              {/* 메인 상품 행 */}
              <div className="grid grid-cols-12 gap-4 px-4 py-4 items-center hover:bg-gray-50">
                <div className="col-span-1">
                  <input
                    type="checkbox"
                    checked={selectedProducts.includes(product.id)}
                    onChange={() => handleSelectProduct(product.id)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                </div>
                
                <div className="col-span-5">
                  <div className="flex items-start gap-3">
                    {/* 상품 이미지 */}
                    <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                      {product.representativeImage ? (
                        <img 
                          src={product.representativeImage} 
                          alt={product.productName}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      {isCompactView ? (
                        // 간략히 보기 모드
                        <div>
                          <div className="font-medium text-gray-900 mb-1">
                            {product.productName}
                          </div>
                          <div className="text-sm text-gray-600">
                            {product.productCode} | {product.brand} | {product.year} {product.season}
                          </div>
                        </div>
                      ) : (
                        // 상세 보기 모드
                        <>
                          {/* 상품 상태 */}
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-gray-900">#{product.id}</span>
                            <span className={`text-sm font-medium ${getStatusColor(product.isSelling, product.stock)}`}>
                              {getStatusText(product.isSelling, product.stock)}
                            </span>
                          </div>
                          
                          {/* 카테고리 경로 */}
                          <div className="text-xs text-gray-500 mb-1">
                            {product.productCategory.join(" > ")}
                          </div>
                          
                          {/* 상품명 */}
                          <div className="font-medium text-gray-900 mb-1">
                            {product.productName}
                          </div>
                          
                          {/* 상품코드 */}
                          <div className="text-sm text-gray-600 mb-2">
                            {product.productCode} 복사
                          </div>
                          
                          {/* 브랜드 */}
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                              <span className="text-xs font-medium text-gray-600">{product.brand.charAt(0)}</span>
                            </div>
                            <span className="text-sm text-gray-600">{product.brand}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="col-span-1 text-center">
                  <span className="text-sm font-medium text-gray-900">{product.stock}</span>
                </div>
                
                <div className="col-span-1 text-center">
                  <span className="text-sm font-medium text-gray-900">₩{formatPrice(product.representativeSellingPrice)}</span>
                </div>
                
                <div className="col-span-1 text-center">
                  <span className="text-sm text-gray-600">{product.createdAt}</span>
                </div>
                
                <div className="col-span-3">
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => router.push(`/products/external-send?ids=${product.id}`)}
                      className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      외부송신
                    </button>
                    <button 
                      onClick={() => toggleProductExpansion(product.id)}
                      className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 flex items-center gap-1"
                    >
                      옵션 {expandedProducts.has(product.id) ? '접기' : '보기'}
                      <svg 
                        className={`w-4 h-4 transition-transform ${expandedProducts.has(product.id) ? 'rotate-180' : ''}`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* 옵션 상세 (접기/펼치기) */}
              {expandedProducts.has(product.id) && (
                <div className="bg-gray-50 px-4 py-3">
                  <div className="grid grid-cols-6 gap-4 text-sm font-medium text-gray-700 mb-3">
                    <div>옵션명</div>
                    <div>판매상태/재고</div>
                    <div>위치</div>
                    <div>바코드</div>
                    <div>최종수정일</div>
                    <div>작업</div>
                  </div>
                  
                  {product.variants.map((variant) => (
                    <div key={variant.id} className="grid grid-cols-6 gap-4 py-2 text-sm">
                      <div className="text-gray-900">{variant.optionName}</div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 text-xs rounded ${
                          variant.salesStatus === 'active' ? 'bg-green-100 text-green-700' : 
                          variant.salesStatus === 'inactive' ? 'bg-gray-100 text-gray-700' : 
                          'bg-red-100 text-red-700'
                        }`}>
                          {variant.salesStatus === 'active' ? '판매 중' : 
                           variant.salesStatus === 'inactive' ? '판매 중지' : '품절'}
                        </span>
                        <span className="text-gray-600">{variant.stock}</span>
                      </div>
                      <div className="text-gray-600">{variant.location || '-'}</div>
                      <div className="text-gray-600">
                        {variant.barcode ? (
                          <span className="flex items-center gap-1">
                            <span>없음</span>
                            <span className="font-medium">{variant.barcode}</span>
                            <button className="text-blue-500 hover:text-blue-700">관리</button>
                          </span>
                        ) : '-'}
                      </div>
                      <div className="text-gray-600">{variant.lastModified}</div>
                      <div>
                        <button className="text-blue-500 hover:text-blue-700">상세보기</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 페이지네이션 */}
        <div className="flex items-center justify-center mt-6 gap-2">
          <button className="px-3 py-2 border border-gray-300 rounded hover:bg-gray-50">{"<<"}</button>
          <button className="px-3 py-2 border border-gray-300 rounded hover:bg-gray-50">{"<"}</button>
          <button className="px-3 py-2 bg-blue-500 text-white rounded">1</button>
          <button className="px-3 py-2 border border-gray-300 rounded hover:bg-gray-50">2</button>
          <button className="px-3 py-2 border border-gray-300 rounded hover:bg-gray-50">3</button>
          <button className="px-3 py-2 border border-gray-300 rounded hover:bg-gray-50">4</button>
          <button className="px-3 py-2 border border-gray-300 rounded hover:bg-gray-50">5</button>
          <span className="px-3 py-2 text-gray-500">...</span>
          <button className="px-3 py-2 border border-gray-300 rounded hover:bg-gray-50">999</button>
          <button className="px-3 py-2 border border-gray-300 rounded hover:bg-gray-50">{">"}</button>
          <button className="px-3 py-2 border border-gray-300 rounded hover:bg-gray-50">{">>"}</button>
        </div>
      </div>
    </div>
  );
};

export default ProductsListPage;