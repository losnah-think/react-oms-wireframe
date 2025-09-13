import React, { useState, useMemo } from 'react';
import { Container, Card, Button, Badge, Stack, GridRow, GridCol } from '../../design-system';
import { mockProducts } from '../../data/mockProducts';
import { mockProductFilterOptions } from '../../data/mockProductFilters';
import { formatPrice, getStockStatus } from '../../utils/productUtils';

interface ProductsListPageProps {
  onNavigate?: (page: string, productId?: string) => void;
}

const ProductsListPage: React.FC<ProductsListPageProps> = ({ onNavigate }) => {
  // 필터 상태
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [selectedBrand, setSelectedBrand] = useState('전체');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedProducts, setSelectedProducts] = useState<Set<number>>(new Set());
  const [expandedProducts, setExpandedProducts] = useState<Set<number>>(new Set());
  
  // 페이지네이션
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  // 카테고리 이름 매핑
  const categoryNames: { [key: string]: string } = {};
mockProductFilterOptions.categories.forEach(cur => {
  categoryNames[cur.id] = cur.name;
});

  // 정렬 옵션 정의
  const sortOptions = [
    { value: 'newest', label: '최신순' },
    { value: 'oldest', label: '오래된순' },
    { value: 'name_asc', label: '상품명 (가나다순)' },
    { value: 'name_desc', label: '상품명 (가나다 역순)' },
    { value: 'price_high', label: '가격 높은순' },
    { value: 'price_low', label: '가격 낮은순' },
    { value: 'stock_high', label: '재고 많은순' },
    { value: 'stock_low', label: '재고 적은순' }
  ];

  // 필터링된 상품 목록
  const filteredProducts = useMemo(() => {
    let filtered = mockProducts.filter(product => {
      // 검색어 필터
      if (searchTerm && !product.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !product.code.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      // 카테고리 필터
      if (selectedCategory !== '전체' && categoryNames[product.category_id] !== selectedCategory) {
        return false;
      }
      // 브랜드 필터
      if (selectedBrand !== '전체' && product.brand !== selectedBrand) {
        return false;
      }
      // 상태 필터 (isSelling, isSoldout, active 없음 → 생략)
      return true;
    });
    // 정렬
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'name_asc':
          return a.name.localeCompare(b.name);
        case 'name_desc':
          return b.name.localeCompare(a.name);
        case 'price_high':
          return b.selling_price - a.selling_price;
        case 'price_low':
          return a.selling_price - b.selling_price;
        case 'stock_high': {
          const aStock = a.variants?.reduce((sum, v) => sum + (v.stock || 0), 0) || 0;
          const bStock = b.variants?.reduce((sum, v) => sum + (v.stock || 0), 0) || 0;
          return bStock - aStock;
        }
        case 'stock_low': {
          const aStock = a.variants?.reduce((sum, v) => sum + (v.stock || 0), 0) || 0;
          const bStock = b.variants?.reduce((sum, v) => sum + (v.stock || 0), 0) || 0;
          return aStock - bStock;
        }
        default:
          return 0;
      }
    });
    return filtered;
  }, [searchTerm, selectedCategory, selectedBrand, selectedStatus, sortBy]);

  // 페이지네이션된 상품 목록
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredProducts.slice(startIndex, startIndex + pageSize);
  }, [filteredProducts, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredProducts.length / pageSize);

  // 전체 선택 토글
  const handleSelectAll = () => {
    if (selectedProducts.size === paginatedProducts.length) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(paginatedProducts.map(p => p.id)));
    }
  };

  // 개별 선택 토글
  const handleSelectProduct = (productId: number) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedProducts(newSelected);
  };

  // 옵션 펼치기 토글
  const handleToggleExpand = (productId: number) => {
    const newExpanded = new Set(expandedProducts);
    if (newExpanded.has(productId)) {
      newExpanded.delete(productId);
    } else {
      newExpanded.add(productId);
    }
    setExpandedProducts(newExpanded);
  };

  // 옵션별 재고 상태 분석
  const getVariantStockStatus = (product: any) => {
    if (!product.variants || product.variants.length === 0) {
      // 옵션이 없는 상품의 경우 메인 재고 사용
      const stock = product.stock;
      if (stock > 50) return { status: '충분', count: 1, color: 'text-green-600' };
      if (stock > 10) return { status: '부족', count: 1, color: 'text-yellow-600' };
      return { status: '위험', count: 1, color: 'text-red-600' };
    }

    const sufficient = product.variants.filter((v: any) => v.stock > 50).length;
    const insufficient = product.variants.filter((v: any) => v.stock > 10 && v.stock <= 50).length;
    const dangerous = product.variants.filter((v: any) => v.stock <= 10).length;

    // 가장 심각한 상태를 우선으로 표시
    if (dangerous > 0) {
      return { 
        status: '위험', 
        count: dangerous, 
        total: product.variants.length,
        color: 'text-red-600',
        details: { sufficient, insufficient, dangerous }
      };
    }
    if (insufficient > 0) {
      return { 
        status: '부족', 
        count: insufficient, 
        total: product.variants.length,
        color: 'text-yellow-600',
        details: { sufficient, insufficient, dangerous }
      };
    }
    return { 
      status: '충분', 
      count: sufficient, 
      total: product.variants.length,
      color: 'text-green-600',
      details: { sufficient, insufficient, dangerous }
    };
  };

  return (
    <Container maxWidth="full" padding="md" className="bg-gray-50 min-h-screen">
      {/* 헤더 */}
      <div className="mb-6">
        <Stack direction="row" justify="between" align="center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">상품 목록</h1>
            <p className="text-gray-600 mt-1 text-lg">
              총 <span className="font-bold text-blue-600">{filteredProducts.length}</span>개 상품 
              <span className="text-gray-400 ml-2">(전체 {mockProducts.length}개)</span>
            </p>
          </div>
          <Stack direction="row" gap={3}>
            <Button
              variant="outline"
              onClick={() => onNavigate?.('products-import')}
              className="border-gray-300"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              상품 가져오기
            </Button>
            <Button
              variant="primary"
              onClick={() => onNavigate?.('products-add')}
              className="px-6"
            >
              <svg className="w-4 h-4 mr-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              신규 상품 등록
            </Button>
          </Stack>
        </Stack>
      </div>

      {/* 검색 및 필터 */}
      <Card padding="lg" className="mb-6 shadow-sm">
        <GridRow gutter={16}>
          {/* 검색창 */}
          <GridCol span={8}>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="상품명, 상품코드로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
              />
            </div>
          </GridCol>

          {/* 카테고리 필터 */}
          <GridCol span={4}>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
            >
              <option value="전체">전체</option>
              {mockProductFilterOptions.categories.map(category => (
                <option key={category.id} value={category.name}>{category.name}</option>
              ))}
            </select>
          </GridCol>

          {/* 브랜드 필터 */}
          <GridCol span={4}>
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
            >
              <option value="전체">전체 브랜드</option>
              {mockProductFilterOptions.brands.map(brand => (
                <option key={brand.id} value={brand.id}>{brand.name}</option>
              ))}
            </select>
          </GridCol>

          {/* 상태 필터 */}
          <GridCol span={4}>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
            >
              <option value="all">전체 상태</option>
              {mockProductFilterOptions.status.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </GridCol>

          {/* 정렬 */}
          <GridCol span={4}>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </GridCol>
        </GridRow>
      </Card>

      {/* 선택된 항목 액션 바 */}
      {selectedProducts.size > 0 && (
        <Card padding="md" className="mb-6 bg-blue-50 border-blue-200 border-2">
          <Stack direction="row" justify="between" align="center">
            <div className="flex items-center space-x-3">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-blue-800 font-bold text-lg">
                {selectedProducts.size}개 상품 선택됨
              </span>
            </div>
            <Stack direction="row" gap={2}>
              <Button variant="outline" size="small" className="border-blue-300 text-blue-600">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                엑셀 다운로드
              </Button>
              <Button variant="outline" size="small" className="border-green-300 text-green-600">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                일괄 활성화
              </Button>
              <Button variant="outline" size="small" className="border-orange-300 text-orange-600">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                일괄 비활성화
              </Button>
              <Button variant="outline" size="small" className="border-red-300 text-red-600">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                일괄 삭제
              </Button>
            </Stack>
          </Stack>
        </Card>
      )}

      {/* 상품 목록 테이블 */}
      <Card padding="none" className="overflow-hidden shadow-sm">
        {/* 테이블 헤더 */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <Stack direction="row" justify="between" align="center">
            <div className="flex items-center space-x-4 flex-1">
              <input
                type="checkbox"
                checked={selectedProducts.size === paginatedProducts.length && paginatedProducts.length > 0}
                onChange={handleSelectAll}
                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <span className="text-base font-semibold text-gray-700 flex-1">
                전체 선택 ({paginatedProducts.length}개)
              </span>
            </div>
            <div className="text-sm text-gray-500">
              페이지: {currentPage} / {totalPages}
            </div>
          </Stack>
        </div>

        {/* 테이블 본문 */}
        <div className="overflow-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider w-16">선택</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider w-36">이미지</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">상품정보</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider w-32">분류/브랜드</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider w-28">재고상태</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider w-32">가격정보</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider w-28">등록일</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider w-32">관리</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedProducts.map((product) => (
                <React.Fragment key={product.id}>
                  {/* 메인 상품 행 */}
                  <tr className="hover:bg-gray-50 transition-colors duration-200 group">
                    <td className="px-6 py-6 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedProducts.has(product.id)}
                        onChange={() => handleSelectProduct(product.id)}
                        className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 focus:ring-2"
                      />
                    </td>
                    
                    <td className="px-6 py-6 whitespace-nowrap">
                      <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 border-2 border-gray-200 shadow-lg group-hover:shadow-xl transition-all duration-300" style={{ width: '120px', height: '120px' }}>
                        {/* <img
                          src={product.representativeImage}
                          alt={product.name}
                          className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                          style={{ width: '120px', height: '120px' }}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=120&h=120&fit=crop";
                          }}
                        /> */}
                        {product.variants && product.variants.length > 1 && (
                          <div className="absolute bottom-1 right-1 bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-semibold">
                            +{product.variants.length - 1}
                          </div>
                        )}
                      </div>
                    </td>
                    
                    <td className="px-6 py-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2 flex-1">
                          <button
                            onClick={() => onNavigate?.('products-detail', String(product.id))}
                            className="text-left group-hover:text-blue-600 transition-colors duration-200"
                          >
                            <h3 className="font-bold text-gray-900 hover:underline text-lg leading-tight line-clamp-2">
                              {product.name}
                            </h3>
                          </button>
                          <div className="flex flex-wrap gap-2">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              {product.code}
                            </span>
                          </div>
                        </div>
                        
                        {/* 옵션 펼치기 버튼 */}
                        {product.variants && product.variants.length > 0 && (
                          <button
                            onClick={() => handleToggleExpand(product.id)}
                            className="ml-4 p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                            title="옵션 보기"
                          >
                            <svg 
                              className={`w-5 h-5 transform transition-transform duration-200 ${
                                expandedProducts.has(product.id) ? 'rotate-180' : ''
                              }`} 
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                            <span className="text-xs text-gray-500 mt-1 block">
                              {product.variants.length}개
                            </span>
                          </button>
                        )}
                      </div>
                    </td>
                    
                    <td className="px-6 py-6 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="font-semibold text-gray-900">{categoryNames[product.category_id]}</div>
                        {product.brand && (
                          <div className="font-semibold text-gray-900">{product.brand}</div>
                        )}
                      </div>
                    </td>
                    
                    <td className="px-6 py-6 whitespace-nowrap">
                      {(() => {
                        const stockStatus = getVariantStockStatus(product);
                        return (
                          <div className="text-center space-y-2">
                            <div className={`text-lg font-bold ${stockStatus.color}`}>
                              {stockStatus.status}
                            </div>
                            <div className="text-sm text-gray-600">
                              {stockStatus.total ? (
                                <div>
                                  <div>{stockStatus.count}/{stockStatus.total} 옵션</div>
                                  {stockStatus.details && (
                                    <div className="text-xs mt-1 space-y-1">
                                      {stockStatus.details.sufficient > 0 && (
                                        <div className="text-green-600">충분: {stockStatus.details.sufficient}</div>
                                      )}
                                      {stockStatus.details.insufficient > 0 && (
                                        <div className="text-yellow-600">부족: {stockStatus.details.insufficient}</div>
                                      )}
                                      {stockStatus.details.dangerous > 0 && (
                                        <div className="text-red-600">위험: {stockStatus.details.dangerous}</div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div>총 {(product.variants?.reduce((sum, v) => sum + (v.stock || 0), 0) || 0)}개</div>
                              )}
                            </div>
                          </div>
                        );
                      })()}
                    </td>
                    
                    <td className="px-6 py-6">
                      <div className="text-right space-y-1">
                        <div className="text-sm text-gray-500">원가</div>
                        <div className="font-medium text-gray-700">{formatPrice(product.cost_price)}</div>
                        <div className="border-t border-gray-200 pt-2 mt-2">
                          <div className="text-sm text-green-700 font-medium">판매가</div>
                          <div className="text-xl font-bold text-green-600">
                            {formatPrice(product.selling_price)}
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-6 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(product.created_at).toLocaleDateString('ko-KR', { 
                          year: 'numeric', 
                          month: '2-digit', 
                          day: '2-digit' 
                        })}
                      </div>
                    </td>
                    
                    <td className="px-6 py-6 whitespace-nowrap">
                      <div className="flex justify-center items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="small"
                          onClick={() => onNavigate?.('products-edit', String(product.id))}
                          className="text-green-600 hover:bg-green-50 hover:text-green-700"
                          title="상품 수정"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </Button>
                        <Button
                          variant="ghost"
                          size="small"
                          className="text-red-600 hover:bg-red-50 hover:text-red-700"
                          title="상품 삭제"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </Button>
                      </div>
                    </td>
                  </tr>
                  
                  {/* 옵션 펼치기 행 */}
                  {expandedProducts.has(product.id) && product.variants && product.variants.length > 0 && (
                    <tr className="bg-blue-50">
                      <td colSpan={8} className="px-6 py-4">
                        <div className="bg-white rounded-lg p-4 shadow-inner">
                          <h4 className="font-bold text-gray-900 mb-4 text-lg">상품 옵션 ({product.variants.length}개)</h4>
                          <div className="space-y-3">
                            {product.variants.map((variant: any, index: number) => (
                              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-4">
                                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200 border border-gray-300 shadow-sm">
                                      <img
                                        src={product.representativeImage}
                                        alt={`${product.name} - ${variant.variantName}`}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                          (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=64&h=64&fit=crop";
                                        }}
                                      />
                                    </div>
                                    <div className="space-y-1">
                                      <div className="font-semibold text-gray-900">
                                        {variant.variantName}
                                      </div>
                                      <div className="text-sm text-gray-600">
                                        {variant.code && `코드: ${variant.code}`}
                                        {variant.barcode1 && ` | 바코드: ${variant.barcode1}`}
                                      </div>
                                      <div className="flex space-x-2">
                                        {variant.stock > 0 ? (
                                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            재고 {variant.stock}개
                                          </span>
                                        ) : (
                                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                            품절
                                          </span>
                                        )}
                                        {variant.isSelling && (
                                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            판매중
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right space-y-1">
                                  <div className="text-sm text-gray-500">원가</div>
                                  <div className="font-medium text-gray-700">{formatPrice(variant.costPrice)}</div>
                                  <div className="text-sm text-gray-500">공급가</div>
                                  <div className="font-medium text-blue-600">{formatPrice(variant.supplyPrice)}</div>
                                  <div className="text-sm text-gray-500">판매가</div>
                                  <div className="text-lg font-bold text-green-600">{formatPrice(variant.sellingPrice)}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </Card> 

      {/* 빈 상태 */}
      {paginatedProducts.length === 0 && (
        <Card padding="xl" className="text-center">
          <div className="w-24 h-24 mx-auto mb-6 text-gray-300">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <h3 className="text-2xl font-semibold text-gray-600 mb-3">검색 결과가 없습니다</h3>
          <p className="text-gray-500 mb-8 text-lg">다른 검색어나 필터 조건을 시도해보세요.</p>
          <Button
            variant="primary"
            size="big"
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('전체');
              setSelectedBrand('전체');
              setSelectedStatus('all');
            }}
            className="px-8 py-3"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            필터 초기화
          </Button>
        </Card>
      )}

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <Stack direction="row" gap={2} align="center">
            <Button
              variant="outline"
              size="small"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              className="px-3"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Button>
            
            {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
              let pageNumber;
              if (totalPages <= 7) {
                pageNumber = i + 1;
              } else if (currentPage <= 4) {
                pageNumber = i + 1;
              } else if (currentPage >= totalPages - 3) {
                pageNumber = totalPages - 6 + i;
              } else {
                pageNumber = currentPage - 3 + i;
              }
              
              return (
                <Button
                  key={pageNumber}
                  variant={currentPage === pageNumber ? 'primary' : 'outline'}
                  size="small"
                  onClick={() => setCurrentPage(pageNumber)}
                  className="px-3"
                >
                  {pageNumber}
                </Button>
              );
            })}
            
            <Button
              variant="outline"
              size="small"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
              className="px-3"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Button>
          </Stack>
        </div>
      )}
    </Container>
  );
};

export default ProductsListPage;
