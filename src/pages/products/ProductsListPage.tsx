import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { 
  MultiTenantProduct, 
  ProductSearchFilters, 
  ProductListParams,
  BulkOperation,
  Tenant,
  ProductSortField
} from '../../types/multitenant';

interface ProductsListPageProps {
  onNavigate?: (page: string, productId?: string) => void;
  onEdit?: (product: MultiTenantProduct) => void;
  onDelete?: (productId: string) => void;
}

const ProductsListPage: React.FC<ProductsListPageProps> = ({
  onNavigate,
  onEdit,
  onDelete
}) => {
  // 현재 테넌트 (임시 데이터)
  const [currentTenant] = useState<Tenant>({
    id: 'tenant-1',
    code: 'T001',
    name: '화주사 A',
    type: 'external', // 외부 화주사로 설정하여 공급처 필터 테스트
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  });
  
  // 상품 목록 상태
  const [products, setProducts] = useState<MultiTenantProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  
  // 페이지네이션
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  
  // 정렬
  const [sortBy, setSortBy] = useState<ProductSortField>('updatedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // 필터 상태
  const [filters, setFilters] = useState<ProductSearchFilters>({});
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  // 선택 상태
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  
  // 외부 화주사 여부 확인 (조건부 필터용)
  const isExternalTenant = currentTenant?.type === 'external';
  
  // 검색 매개변수 메모이제이션
  const searchParams = useMemo<ProductListParams>(() => ({
    page: currentPage,
    pageSize,
    sortBy,
    sortOrder,
    filters: {
      ...filters,
      // 현재 테넌트 필터 자동 적용
      ...(currentTenant?.id && { tenantId: currentTenant.id })
    },
    tenantId: currentTenant?.id
  }), [currentPage, pageSize, sortBy, sortOrder, filters, currentTenant?.id]);
  
  // 상품 목록 조회
  const fetchProducts = useCallback(async (params: ProductListParams) => {
    setLoading(true);
    try {
      // API 호출 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 임시 데이터
      const mockProducts: MultiTenantProduct[] = Array.from({ length: params.pageSize }, (_, index) => ({
        id: `product-${params.page}-${index}`,
        tenantId: currentTenant?.id || 'tenant-1',
        productName: `상품 ${params.page * params.pageSize + index + 1}`,
        codes: {
          internal: `PRD${String(params.page * params.pageSize + index + 1).padStart(6, '0')}`,
          cafe24: `C24${String(params.page * params.pageSize + index + 1).padStart(6, '0')}`,
          channels: [
            { channelId: 'naver', channelName: '네이버', code: `N${String(params.page * params.pageSize + index + 1).padStart(6, '0')}` },
            { channelId: 'coupang', channelName: '쿠팡', code: `CP${String(params.page * params.pageSize + index + 1).padStart(6, '0')}` }
          ]
        },
        categoryId: 'cat-1',
        categoryName: '카테고리 A',
        brandId: 'brand-1',
        brandName: '브랜드 A',
        pricing: {
          sellingPrice: 29900,
          consumerPrice: 39900,
          supplyPrice: 25410,
          commissionRate: 15,
          isSupplyPriceCalculated: true,
          calculationMethod: 'commission'
        },
        stockInfo: {
          totalStock: 100,
          availableStock: 95,
          reservedStock: 5,
          lastStockUpdate: new Date(),
          warehouseStocks: [
            { warehouseId: 'wh-1', warehouseName: '본사창고', stock: 100 }
          ]
        },
        status: {
          isActive: true,
          isSelling: true,
          isDisplayed: true,
          isSoldOut: false
        },
        tags: [
          { id: 'tag-1', name: '신상품', category: 'general' },
          { id: 'tag-2', name: '베스트', category: 'general' }
        ],
        logistics: {
          width: 20,
          height: 15,
          depth: 5,
          weight: 300,
          packagingUnit: 'ea',
          packagingQuantity: 1,
          isFragile: false,
          isLiquid: false
        },
        policies: {
          showProductNameOnInvoice: true,
          preventConsolidation: false,
          shippingPolicyId: 'policy-1',
          isReturnable: true,
          isExchangeable: true,
          returnPeriodDays: 14
        },
        description: '상품 설명입니다.',
        thumbnailUrl: `https://via.placeholder.com/100x100?text=Product${index + 1}`,
        images: [],
        supplier: isExternalTenant ? {
          id: 'supplier-1',
          name: '공급처 A',
          code: 'SUP001',
          contactPerson: '홍길동',
          phone: '02-1234-5678',
          email: 'contact@supplier-a.com'
        } : undefined,
        hasBarcode: Math.random() > 0.5,
        barcodes: Math.random() > 0.5 ? [`880123456789${index}`.slice(0, 13)] : [],
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        createdBy: 'user-1',
        updatedBy: 'user-1',
        syncStatus: [
          { channelId: 'naver', channelName: '네이버', syncStatus: 'success', needsSync: false },
          { channelId: 'coupang', channelName: '쿠팡', syncStatus: 'pending', needsSync: true }
        ]
      }));
      
      setProducts(mockProducts);
      setTotalCount(1000); // 전체 개수 시뮬레이션
    } catch (error) {
      console.error('상품 목록 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  }, [currentTenant?.id, isExternalTenant]);
  
  // 초기 로딩 및 검색 매개변수 변경 시 재조회
  useEffect(() => {
    fetchProducts(searchParams);
  }, [fetchProducts, searchParams]);
  
  // 전체 선택 토글
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(products.map(p => p.id)));
    }
    setSelectAll(!selectAll);
  };
  
  // 개별 선택 토글
  const handleSelectProduct = (productId: string) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedProducts(newSelected);
    setSelectAll(newSelected.size === products.length);
  };
  
  // 일괄 작업 처리
  const handleBulkOperation = async (operation: BulkOperation) => {
    if (selectedProducts.size === 0) {
      alert('선택된 상품이 없습니다.');
      return;
    }
    
    switch (operation.type) {
      case 'status_change':
        console.log('상태 변경:', operation);
        break;
      case 'excel_download':
        console.log('엑셀 다운로드:', operation);
        break;
      case 'channel_sync':
        console.log('채널 동기화:', operation);
        break;
    }
  };
  
  // 필터 변경 처리
  const handleFilterChange = (newFilters: Partial<ProductSearchFilters>) => {
    setFilters((prev: ProductSearchFilters) => ({ ...prev, ...newFilters }));
    setCurrentPage(1);
  };
  
  // 정렬 변경 처리
  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field as any);
      setSortOrder('desc');
    }
    setCurrentPage(1);
  };
  
  // 페이지 변경 처리
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  // 상품 상태 표시
  const getStatusBadge = (status: any) => {
    if (!status.isActive) return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">비활성</span>;
    if (status.isSoldOut) return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-600">품절</span>;
    if (!status.isSelling) return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-600">판매중지</span>;
    return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-600">판매중</span>;
  };
  
  // 가격 포맷팅
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price) + '원';
  };
  
  return (
    <div className="h-screen bg-gray-50">
      {/* 메인 콘텐츠 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 헤더 */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">상품 목록</h1>
              {currentTenant && (
                <p className="text-sm text-gray-500 mt-1">
                  {currentTenant.name} ({currentTenant.type === 'external' ? '외부 공급처' : '자체 화주사'})
                </p>
              )}
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => handleBulkOperation({ type: 'excel_download', productIds: Array.from(selectedProducts), params: { format: 'selected' } })}
                disabled={selectedProducts.size === 0}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <span>📥</span>
                <span>엑셀 다운로드</span>
              </button>
              <button 
                onClick={() => onNavigate?.('products-add')}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 flex items-center space-x-2"
              >
                <span>상품 등록</span>
              </button>
            </div>
          </div>
        </div>
        
        {/* 필터 및 검색 영역 */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center space-x-4 mb-4">
            {/* 검색 */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
                <input
                  type="text"
                  placeholder="상품명 또는 상품코드 검색"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={filters.productName || ''}
                  onChange={(e) => handleFilterChange({ productName: e.target.value })}
                />
              </div>
            </div>
            
            {/* 기본 필터 */}
            <select
              value={filters.categoryIds?.[0] || ''}
              onChange={(e) => handleFilterChange({ categoryIds: e.target.value ? [e.target.value] : undefined })}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="">전체 카테고리</option>
              <option value="cat-1">카테고리 A</option>
              <option value="cat-2">카테고리 B</option>
            </select>
            
            <select
              value={filters.brandIds?.[0] || ''}
              onChange={(e) => handleFilterChange({ brandIds: e.target.value ? [e.target.value] : undefined })}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="">전체 브랜드</option>
              <option value="brand-1">브랜드 A</option>
              <option value="brand-2">브랜드 B</option>
            </select>
            
            {/* 조건부 공급처 필터 (외부 화주사만) */}
            {isExternalTenant && (
              <select
                value={filters.supplierIds?.[0] || ''}
                onChange={(e) => handleFilterChange({ supplierIds: e.target.value ? [e.target.value] : undefined })}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="">전체 공급처</option>
                <option value="supplier-1">공급처 A</option>
                <option value="supplier-2">공급처 B</option>
              </select>
            )}
            
            {/* 고급 필터 토글 */}
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 flex items-center space-x-2"
            >
              <span>🔧</span>
              <span>고급 필터</span>
              <span>{showAdvancedFilters ? '▲' : '▼'}</span>
            </button>
          </div>
          
          {/* 고급 필터 */}
          {showAdvancedFilters && (
            <div className="bg-gray-50 p-4 rounded-lg space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">상태</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500">
                    <option value="">전체</option>
                    <option value="active">활성</option>
                    <option value="inactive">비활성</option>
                    <option value="selling">판매중</option>
                    <option value="soldout">품절</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">등록일</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">바코드</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500">
                    <option value="">전체</option>
                    <option value="true">있음</option>
                    <option value="false">없음</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">태그</label>
                  <input
                    type="text"
                    placeholder="태그 검색"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => {
                    setFilters({});
                    setShowAdvancedFilters(false);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  초기화
                </button>
                <button
                  onClick={() => setShowAdvancedFilters(false)}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  적용
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* 일괄 작업 바 */}
        {selectedProducts.size > 0 && (
          <div className="bg-blue-50 border-b border-blue-200 px-6 py-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-700">
                {selectedProducts.size}개 상품 선택됨
              </span>
              <div className="flex items-center space-x-2">
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      handleBulkOperation({
                        type: 'status_change',
                        productIds: Array.from(selectedProducts),
                        params: { status: e.target.value }
                      });
                    }
                  }}
                  className="px-3 py-1.5 text-sm border border-blue-300 rounded-md bg-white"
                  value=""
                >
                  <option value="">상태 변경</option>
                  <option value="active">활성화</option>
                  <option value="inactive">비활성화</option>
                  <option value="selling">판매 시작</option>
                  <option value="stop_selling">판매 중지</option>
                </select>
                
                <button
                  onClick={() => handleBulkOperation({ type: 'excel_download', productIds: Array.from(selectedProducts) })}
                  className="px-3 py-1.5 text-sm font-medium text-blue-700 bg-white border border-blue-300 rounded-md hover:bg-blue-50 flex items-center space-x-1"
                >
                  <span>📥</span>
                  <span>선택 다운로드</span>
                </button>
                
                <button
                  onClick={() => handleBulkOperation({ type: 'channel_sync', productIds: Array.from(selectedProducts) })}
                  className="px-3 py-1.5 text-sm font-medium text-blue-700 bg-white border border-blue-300 rounded-md hover:bg-blue-50 flex items-center space-x-1"
                >
                  <span>📤</span>
                  <span>외부 송신</span>
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* 테이블 */}
        <div className="flex-1 overflow-auto">
          <div className="min-w-full">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="w-12 px-6 py-3">
                    <button
                      onClick={handleSelectAll}
                      className="flex items-center justify-center"
                    >
                      {selectAll ? '☑' : '☐'}
                    </button>
                  </th>
                  <th className="w-20 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    썸네일
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('productName')}
                      className="flex items-center space-x-1 hover:text-gray-700"
                    >
                      <span>상품명</span>
                      {sortBy === 'productName' && (
                        <span>{sortOrder === 'asc' ? '▲' : '▼'}</span>
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    자체상품코드
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    카테고리
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    브랜드
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('sellingPrice')}
                      className="flex items-center space-x-1 hover:text-gray-700"
                    >
                      <span>판매가</span>
                      {sortBy === 'sellingPrice' && (
                        <span>{sortOrder === 'asc' ? '▲' : '▼'}</span>
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    공급가
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    소비자가
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    상태
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    바코드
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    태그
                  </th>
                  {isExternalTenant && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      공급처
                    </th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('updatedAt')}
                      className="flex items-center space-x-1 hover:text-gray-700"
                    >
                      <span>수정일</span>
                      {sortBy === 'updatedAt' && (
                        <span>{sortOrder === 'asc' ? '▲' : '▼'}</span>
                      )}
                    </button>
                  </th>
                  <th className="w-20 px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    작업
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={isExternalTenant ? 15 : 14} className="px-6 py-12 text-center">
                      <div className="flex items-center justify-center">
                        <span className="animate-spin mr-2">⏳</span>
                        <span>로딩 중...</span>
                      </div>
                    </td>
                  </tr>
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan={isExternalTenant ? 15 : 14} className="px-6 py-12 text-center text-gray-500">
                      검색 결과가 없습니다.
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr 
                      key={product.id} 
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => onNavigate?.('product-detail', product.id)}
                    >
                      <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleSelectProduct(product.id)}
                          className="flex items-center justify-center"
                        >
                          {selectedProducts.has(product.id) ? '☑' : '☐'}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        {product.thumbnailUrl && (
                          <img
                            src={product.thumbnailUrl}
                            alt={product.productName}
                            className="w-12 h-12 object-cover rounded"
                          />
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{product.productName}</div>
                        {product.englishProductName && (
                          <div className="text-sm text-gray-500">{product.englishProductName}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {product.codes.internal}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {product.categoryName}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {product.brandName || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {formatPrice(product.pricing.sellingPrice)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {formatPrice(product.pricing.supplyPrice)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {product.pricing.consumerPrice ? formatPrice(product.pricing.consumerPrice) : '-'}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(product.status)}
                      </td>
                      <td className="px-6 py-4">
                        {product.hasBarcode ? (
                          <span className="text-sm text-green-600">있음</span>
                        ) : (
                          <span className="text-sm text-gray-500">없음</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {product.tags.slice(0, 2).map((tag) => (
                            <span
                              key={tag.id}
                              className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-600"
                            >
                              {tag.name}
                            </span>
                          ))}
                          {product.tags.length > 2 && (
                            <span className="text-xs text-gray-500">
                              +{product.tags.length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      {isExternalTenant && (
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {product.supplier?.name || '-'}
                        </td>
                      )}
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(product.updatedAt).toLocaleDateString('ko-KR')}
                      </td>
                      <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center">
                          <button className="text-gray-400 hover:text-gray-500">
                            ⋮
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* 페이지네이션 */}
        {!loading && totalCount > 0 && (
          <div className="bg-white border-t border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-700">
                  총 {totalCount.toLocaleString()}개 중 {((currentPage - 1) * pageSize + 1).toLocaleString()}-{Math.min(currentPage * pageSize, totalCount).toLocaleString()}개
                </span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-md"
                >
                  <option value={10}>10개씩</option>
                  <option value={20}>20개씩</option>
                  <option value={50}>50개씩</option>
                  <option value={100}>100개씩</option>
                </select>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  이전
                </button>
                
                {/* 페이지 번호 */}
                {Array.from({ length: Math.min(5, Math.ceil(totalCount / pageSize)) }, (_, i) => {
                  const pageNumber = Math.max(1, currentPage - 2) + i;
                  if (pageNumber > Math.ceil(totalCount / pageSize)) return null;
                  
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => handlePageChange(pageNumber)}
                      className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                        pageNumber === currentPage
                          ? 'text-blue-600 bg-blue-50 border border-blue-300'
                          : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === Math.ceil(totalCount / pageSize)}
                  className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  다음
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsListPage;
