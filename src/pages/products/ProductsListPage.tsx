import React, { useState, useMemo } from 'react';
import { mockProducts, filterOptions, ProductWithVariants } from '../../data/mockProducts';
import { Product } from '../../types/database';
import { 
  formatPrice, 
  getProductStatusBadge, 
  filterProducts, 
  sortProducts,
  calculateTotalValue,
  getCategories
} from '../../utils/productUtils';

interface ProductsListPageProps {
  onNavigate?: (page: string, productId?: string) => void;
  onEdit?: (product: Product) => void;
  onDelete?: (productId: string) => void;
}

const ProductsListPage: React.FC<ProductsListPageProps> = ({
  onNavigate,
  onEdit,
  onDelete
}) => {
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    status: '',
    priceMin: undefined as number | undefined,
    priceMax: undefined as number | undefined
  });
  
  const [sortBy, setSortBy] = useState('updated-desc');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [expandedProducts, setExpandedProducts] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // 필터링 및 정렬된 상품 목록
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = filterProducts(mockProducts, filters);
    return sortProducts(filtered, sortBy);
  }, [filters, sortBy]);

  // 페이지네이션
  const totalPages = Math.ceil(filteredAndSortedProducts.length / itemsPerPage);
  const paginatedProducts = filteredAndSortedProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // 통계 계산
  const stats = useMemo(() => {
    const total = mockProducts.length;
    const selling = mockProducts.filter(p => p.isSelling && !p.isSoldout).length;
    const soldout = mockProducts.filter(p => p.isSoldout).length;
    const discontinued = mockProducts.filter(p => !p.isSelling).length;
    const totalValue = calculateTotalValue(mockProducts);
    
    return { total, selling, soldout, discontinued, totalValue };
  }, []);

  const handleFilterChange = (key: keyof typeof filters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProducts(paginatedProducts.map(p => p.id));
    } else {
      setSelectedProducts([]);
    }
  };

  const handleSelectProduct = (productId: string, checked: boolean) => {
    if (checked) {
      setSelectedProducts(prev => [...prev, productId]);
    } else {
      setSelectedProducts(prev => prev.filter(id => id !== productId));
    }
  };

  const toggleExpandProduct = (productId: string) => {
    setExpandedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleBulkAction = (action: string) => {
    if (selectedProducts.length === 0) {
      alert('선택된 상품이 없습니다.');
      return;
    }

    switch (action) {
      case 'delete':
        if (confirm(`선택된 ${selectedProducts.length}개 상품을 삭제하시겠습니까?`)) {
          selectedProducts.forEach(id => onDelete?.(id));
          setSelectedProducts([]);
        }
        break;
      case 'activate':
        alert(`${selectedProducts.length}개 상품을 활성화했습니다.`);
        setSelectedProducts([]);
        break;
      case 'deactivate':
        alert(`${selectedProducts.length}개 상품을 비활성화했습니다.`);
        setSelectedProducts([]);
        break;
    }
  };

  const StatusBadge: React.FC<{ product: ProductWithVariants }> = ({ product }) => {
    const status = getProductStatusBadge(product);
    const colorClasses = {
      green: 'bg-green-100 text-green-800',
      yellow: 'bg-yellow-100 text-yellow-800',
      red: 'bg-red-100 text-red-800',
      gray: 'bg-gray-100 text-gray-800'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClasses[status.color as keyof typeof colorClasses]}`}>
        {status.text}
      </span>
    );
  };

  return (
    <div className="p-6">
      {/* 헤더 */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">상품 관리</h1>
          <p className="text-gray-600 mt-1">전체 {stats.total}개 상품 관리</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => onNavigate?.('products-import')}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md transition-colors"
          >
            일괄 등록
          </button>
          <button
            onClick={() => onNavigate?.('products-add')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
          >
            상품 등록
          </button>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-2xl font-bold text-gray-900">{stats.total.toLocaleString()}</div>
          <div className="text-sm text-gray-600">전체 상품</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-2xl font-bold text-green-600">{stats.selling.toLocaleString()}</div>
          <div className="text-sm text-gray-600">판매중</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-2xl font-bold text-red-600">{stats.soldout.toLocaleString()}</div>
          <div className="text-sm text-gray-600">품절</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-2xl font-bold text-gray-600">{stats.discontinued.toLocaleString()}</div>
          <div className="text-sm text-gray-600">판매중지</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-2xl font-bold text-blue-600">{formatPrice(stats.totalValue)}</div>
          <div className="text-sm text-gray-600">총 재고가치</div>
        </div>
      </div>

      {/* 필터 및 검색 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">상품명 검색</label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="상품명을 입력하세요"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">카테고리</label>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">전체</option>
              {getCategories(mockProducts).map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">상태</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">전체</option>
              <option value="정상">정상</option>
              <option value="재고부족">재고부족</option>
              <option value="재고없음">재고없음</option>
              <option value="품절">품절</option>
              <option value="판매중단">판매중단</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">정렬</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="updated-desc">최근 수정순</option>
              <option value="name-asc">상품명 (가나다순)</option>
              <option value="name-desc">상품명 (가나다 역순)</option>
              <option value="price-desc">가격 높은순</option>
              <option value="price-asc">가격 낮은순</option>
              <option value="stock-desc">재고 많은순</option>
              <option value="stock-asc">재고 적은순</option>
            </select>
          </div>
          <div className="flex items-end">
            <div className="flex bg-gray-100 rounded-md p-1">
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'table' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
                }`}
              >
                표형식
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'grid' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
                }`}
              >
                격자형
              </button>
            </div>
          </div>
        </div>

        {/* 가격 범위 필터 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">최소 가격</label>
            <input
              type="number"
              value={filters.priceMin || ''}
              onChange={(e) => handleFilterChange('priceMin', e.target.value ? parseInt(e.target.value) : undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">최대 가격</label>
            <input
              type="number"
              value={filters.priceMax || ''}
              onChange={(e) => handleFilterChange('priceMax', e.target.value ? parseInt(e.target.value) : undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="1000000"
            />
          </div>
        </div>
      </div>

      {/* 선택된 항목 관리 */}
      {selectedProducts.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-800">
              {selectedProducts.length}개 상품이 선택됨
            </span>
            <div className="flex space-x-2">
              <button
                onClick={() => handleBulkAction('activate')}
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition-colors"
              >
                활성화
              </button>
              <button
                onClick={() => handleBulkAction('deactivate')}
                className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm transition-colors"
              >
                비활성화
              </button>
              <button
                onClick={() => handleBulkAction('delete')}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 상품 목록 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {viewMode === 'table' ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={selectedProducts.length === paginatedProducts.length && paginatedProducts.length > 0}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    상품정보
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    카테고리
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    판매가
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    재고
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    상태
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    옵션
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    작업
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedProducts.map((product) => (
                  <React.Fragment key={product.id}>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedProducts.includes(product.id)}
                          onChange={(e) => handleSelectProduct(product.id, e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-16 w-16">
                          <img
                            className="h-16 w-16 rounded-lg object-cover border border-gray-200"
                            src={product.representativeImage || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop'}
                            alt={product.productName}
                            onError={(e) => {
                              e.currentTarget.src = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop';
                            }}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                            {product.productName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {product.productCode}
                          </div>
                          <div className="text-xs text-gray-400">
                            {product.brandId}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{product.productCategory}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-sm font-semibold text-gray-900">
                        {formatPrice(product.representativeSellingPrice)}
                      </div>
                      {product.marketPrice && product.marketPrice !== product.representativeSellingPrice && (
                        <div className="text-xs text-gray-400 line-through">
                          {formatPrice(product.marketPrice)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-sm text-gray-900">{product.stock.toLocaleString()}</div>
                      {product.safeStock && (
                        <div className="text-xs text-gray-400">안전재고: {product.safeStock}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <StatusBadge product={product} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => toggleExpandProduct(product.id)}
                        className="flex items-center space-x-1 text-sm text-gray-900 hover:text-blue-600 transition-colors"
                      >
                        <span>{(product as ProductWithVariants).variants ? (product as ProductWithVariants).variants!.length : 0}개</span>
                        {(product as ProductWithVariants).variants && (product as ProductWithVariants).variants!.length > 0 && (
                          <svg 
                            className={`w-4 h-4 transition-transform ${
                              expandedProducts.includes(product.id) ? 'rotate-180' : ''
                            }`}
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => onNavigate?.('product-detail', product.id)}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                        >
                          상세
                        </button>
                        <button
                          onClick={() => onNavigate?.('products-edit', product.id)}
                          className="text-gray-600 hover:text-gray-900 transition-colors"
                        >
                          수정
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('이 상품을 삭제하시겠습니까?')) {
                              onDelete?.(product.id);
                            }
                          }}
                          className="text-red-600 hover:text-red-900 transition-colors"
                        >
                          삭제
                        </button>
                      </div>
                    </td>
                  </tr>
                  
                  {/* 확장된 옵션들 표시 */}
                  {expandedProducts.includes(product.id) && (product as ProductWithVariants).variants && (product as ProductWithVariants).variants!.map((variant: any, index: number) => (
                    <tr key={`${product.id}-variant-${index}`} className="bg-gray-50">
                      <td className="px-6 py-2"></td>
                      <td className="px-6 py-2">
                        <div className="pl-8 flex items-center">
                          <div className="w-4 h-4 bg-gray-300 rounded-full mr-3 flex-shrink-0"></div>
                          <div>
                            <div className="text-sm text-gray-700">{variant.variantName}</div>
                            <div className="text-xs text-gray-500">{variant.optionCode}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-2">
                        <span className="text-xs text-gray-500">옵션</span>
                      </td>
                      <td className="px-6 py-2 text-right">
                        <div className="text-sm text-gray-700">
                          {formatPrice(variant.sellingPrice || 0)}
                        </div>
                      </td>
                      <td className="px-6 py-2 text-right">
                        <div className="text-sm text-gray-700">{variant.stock?.toLocaleString() || 0}</div>
                        {variant.safeStock && (
                          <div className="text-xs text-gray-400">안전재고: {variant.safeStock}</div>
                        )}
                      </td>
                      <td className="px-6 py-2 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          variant.isSelling 
                            ? variant.isSoldout 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {variant.isSelling 
                            ? variant.isSoldout 
                              ? '품절' 
                              : '판매중'
                            : '중단'
                          }
                        </span>
                      </td>
                      <td className="px-6 py-2 text-center">
                        <span className="text-xs text-gray-500">-</span>
                      </td>
                      <td className="px-6 py-2 text-right">
                        <div className="flex justify-end space-x-1">
                          <button className="text-xs text-gray-600 hover:text-gray-800">수정</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
            {paginatedProducts.map((product) => (
              <div key={product.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                <div className="relative">
                  <img
                    src={product.representativeImage || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop'}
                    alt={product.productName}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop';
                    }}
                  />
                  <div className="absolute top-2 right-2">
                    <StatusBadge product={product} />
                  </div>
                  <div className="absolute top-2 left-2">
                    <input
                      type="checkbox"
                      checked={selectedProducts.includes(product.id)}
                      onChange={(e) => handleSelectProduct(product.id, e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-1 truncate">
                    {product.productName}
                  </h3>
                  <p className="text-xs text-gray-500 mb-2">{product.productCode}</p>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-lg font-semibold text-gray-900">
                      {formatPrice(product.representativeSellingPrice)}
                    </span>
                    <span className="text-sm text-gray-600">
                      재고: {product.stock.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>{product.productCategory}</span>
                    <span>옵션: {(product as ProductWithVariants).variants ? (product as ProductWithVariants).variants!.length : 0}개</span>
                  </div>
                  <div className="mt-3 flex space-x-2">
                    <button
                      onClick={() => onNavigate?.('product-detail', product.id)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs transition-colors"
                    >
                      상세
                    </button>
                    <button
                      onClick={() => onNavigate?.('products-edit', product.id)}
                      className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-xs transition-colors"
                    >
                      수정
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  이전
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  다음
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span>
                    {' '}-{' '}
                    <span className="font-medium">
                      {Math.min(currentPage * itemsPerPage, filteredAndSortedProducts.length)}
                    </span>
                    {' '}of{' '}
                    <span className="font-medium">{filteredAndSortedProducts.length}</span>
                    {' '}results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      이전
                    </button>
                    {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => {
                      const page = i + 1;
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            currentPage === page
                              ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      다음
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 결과가 없을 때 */}
      {filteredAndSortedProducts.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">검색 결과가 없습니다</h3>
          <p className="text-gray-600 mb-4">다른 검색어나 필터 조건을 사용해보세요.</p>
          <button
            onClick={() => {
              setFilters({
                search: '',
                category: '',
                status: '',
                priceMin: undefined,
                priceMax: undefined
              });
              setCurrentPage(1);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
          >
            필터 초기화
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductsListPage;
