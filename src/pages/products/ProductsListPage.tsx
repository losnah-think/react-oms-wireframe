import React, { useState } from 'react';

interface ProductVariant {
  id: number;
  name: string;
  optionCode: string;
  stock: number;
  price: number;
  barcode?: string;
}

interface Product {
  id: number;
  name: string;
  code: string;
  category: string;
  brand: string;
  price: number;
  originalPrice: number;
  supplierPrice: number;
  margin: number;
  registrationDate: string;
  modifiedDate: string;
  shippingPolicy: string;
  status: 'active' | 'inactive' | 'soldout';
  image: string;
  hasBarcode: boolean;
  variants: ProductVariant[];
}

const ProductsListPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedShippingPolicy, setSelectedShippingPolicy] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [expandedProducts, setExpandedProducts] = useState<number[]>([]);

  // Mock data
  const mockProducts: Product[] = [
    {
      id: 1,
      name: '베이직 면 티셔츠',
      code: 'CODE-1059',
      category: '상의 > 티셔츠',
      brand: 'Basic Brand',
      price: 15900,
      originalPrice: 7950,
      supplierPrice: 11130,
      margin: 4770,
      registrationDate: '2025. 9. 30.',
      modifiedDate: '2025. 9. 30.',
      shippingPolicy: '기본',
      status: 'active',
      hasBarcode: true,
      image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=400&q=80',
      variants: [
        { id: 1, name: '화이트/S', optionCode: 'WH-S', stock: 10, price: 15900, barcode: '8801234567890' },
        { id: 2, name: '화이트/M', optionCode: 'WH-M', stock: 15, price: 15900, barcode: '8801234567891' },
        { id: 3, name: '블랙/S', optionCode: 'BK-S', stock: 8, price: 15900, barcode: '8801234567892' },
        { id: 4, name: '블랙/M', optionCode: 'BK-M', stock: 12, price: 15900, barcode: '8801234567893' }
      ]
    },
    {
      id: 2,
      name: '데님 청바지',
      code: 'CODE-1029',
      category: '하의 > 청바지',
      brand: 'Denim Co.',
      price: 45900,
      originalPrice: 25000,
      supplierPrice: 32000,
      margin: 13900,
      registrationDate: '2025. 9. 29.',
      modifiedDate: '2025. 9. 30.',
      shippingPolicy: '무료',
      status: 'active',
      hasBarcode: true,
      image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=400&q=80',
      variants: [
        { id: 5, name: '인디고/28', optionCode: 'IND-28', stock: 5, price: 45900, barcode: '8801234567894' },
        { id: 6, name: '인디고/30', optionCode: 'IND-30', stock: 3, price: 45900, barcode: '8801234567895' },
        { id: 7, name: '블랙/28', optionCode: 'BLK-28', stock: 7, price: 45900, barcode: '8801234567896' }
      ]
    },
    {
      id: 3,
      name: '캐시미어 스카프',
      code: 'CODE-1058',
      category: '잡화 > 스카프',
      brand: 'Luxury Acc',
      price: 89000,
      originalPrice: 45000,
      supplierPrice: 62000,
      margin: 27000,
      registrationDate: '2025. 9. 28.',
      modifiedDate: '2025. 9. 29.',
      shippingPolicy: '특수 포장',
      status: 'soldout',
      hasBarcode: true,
      image: 'https://images.unsplash.com/photo-1601762603339-fd61e28b698a?auto=format&fit=crop&w=400&q=80',
      variants: [
        { id: 8, name: '베이지', optionCode: 'BEIGE', stock: 0, price: 89000, barcode: '8801234567897' }
      ]
    },
    {
      id: 4,
      name: '운동화',
      code: 'CODE-1028',
      category: '신발 > 운동화',
      brand: 'Sport Shoes',
      price: 129000,
      originalPrice: 65000,
      supplierPrice: 90000,
      margin: 39000,
      registrationDate: '2025. 9. 27.',
      modifiedDate: '2025. 9. 28.',
      shippingPolicy: '기본',
      status: 'inactive',
      hasBarcode: false,
      image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=400&q=80',
      variants: [
        { id: 9, name: '화이트/250', optionCode: 'WH-250', stock: 2, price: 129000 },
        { id: 10, name: '화이트/260', optionCode: 'WH-260', stock: 4, price: 129000 },
        { id: 11, name: '블랙/250', optionCode: 'BK-250', stock: 1, price: 129000 }
      ]
    },
    {
      id: 5,
      name: '체크 셔츠',
      code: 'CODE-1057',
      category: '상의 > 셔츠',
      brand: 'Classic Style',
      price: 35900,
      originalPrice: 18000,
      supplierPrice: 25000,
      margin: 10900,
      registrationDate: '2025. 9. 26.',
      modifiedDate: '2025. 9. 28.',
      shippingPolicy: '기본',
      status: 'active',
      hasBarcode: true,
      image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=400&q=80',
      variants: [
        { id: 12, name: '레드체크/M', optionCode: 'RC-M', stock: 6, price: 35900, barcode: '8801234567898' },
        { id: 13, name: '레드체크/L', optionCode: 'RC-L', stock: 9, price: 35900, barcode: '8801234567899' }
      ]
    },
    {
      id: 6,
      name: '가죽 지갑',
      code: 'CODE-1027',
      category: '잡화 > 지갑',
      brand: 'Leather Craft',
      price: 65000,
      originalPrice: 32000,
      supplierPrice: 45000,
      margin: 20000,
      registrationDate: '2025. 9. 25.',
      modifiedDate: '2025. 9. 27.',
      shippingPolicy: '미지정',
      status: 'active',
      hasBarcode: true,
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=400&q=80',
      variants: [
        { id: 14, name: '브라운', optionCode: 'BROWN', stock: 15, price: 65000, barcode: '8801234567900' }
      ]
    }
  ];

  const categories = ['전체', '상의', '상의 > 셔츠', '상의 > 티셔츠', '하의', '하의 > 청바지', '신발', '신발 > 운동화', '잡화', '잡화 > 스카프', '잡화 > 지갑'];
  const brands = ['전체', 'Basic Brand', 'Denim Co.', 'Luxury Acc', 'Sport Shoes', 'Classic Style', 'Leather Craft'];
  const statuses = ['전체', 'active', 'inactive', 'soldout'];
  const shippingPolicies = ['전체', '기본', '무료', '특수 포장', '미지정'];

  const handleSelectAll = () => {
    if (selectedProducts.length === mockProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(mockProducts.map(p => p.id));
    }
  };

  const handleProductSelect = (productId: number) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const toggleProductExpand = (productId: number) => {
    setExpandedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">판매중</span>;
      case 'inactive':
        return <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded">비활성</span>;
      case 'soldout':
        return <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded">품절</span>;
      default:
        return null;
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">상품 목록</h1>
        <div className="flex gap-2">
          <button className="px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50">
            라벨 출력
          </button>
          <button className="px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50">
            외부 API 조회
          </button>
          <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-2">
            상품 등록
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">상품명/상품코드 검색</label>
            <input
              type="text"
              placeholder="상품명 또는 상품코드 입력"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">카테고리</label>
            <select 
              value={selectedCategory} 
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categories.map(category => (
                <option key={category} value={category === '전체' ? '' : category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Brand */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">브랜드</label>
            <select 
              value={selectedBrand} 
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {brands.map(brand => (
                <option key={brand} value={brand === '전체' ? '' : brand}>
                  {brand}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">판매 상태</label>
            <select 
              value={selectedStatus} 
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {statuses.map(status => (
                <option key={status} value={status === '전체' ? '' : status}>
                  {status === 'active' ? '판매중' : 
                   status === 'inactive' ? '비활성' : 
                   status === 'soldout' ? '품절' : '전체'}
                </option>
              ))}
            </select>
          </div>

          {/* Shipping Policy */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">배송 정책</label>
            <select 
              value={selectedShippingPolicy} 
              onChange={(e) => setSelectedShippingPolicy(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {shippingPolicies.map(policy => (
                <option key={policy} value={policy === '전체' ? '' : policy}>
                  {policy}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Price Range */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">가격 범위</label>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="최소 가격"
                value={priceRange.min}
                onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="self-center">~</span>
              <input
                type="number"
                placeholder="최대 가격"
                value={priceRange.max}
                onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">등록일 범위</label>
            <div className="flex gap-2">
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="self-center">~</span>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Filter Actions */}
        <div className="flex justify-end gap-2">
          <button className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50">
            초기화
          </button>
          <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            검색
          </button>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4">
          <span className="text-lg font-semibold">총 {mockProducts.length}건</span>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={selectedProducts.length === mockProducts.length}
              onChange={handleSelectAll}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label className="text-sm text-gray-700">전체 선택</label>
          </div>
          {selectedProducts.length > 0 && (
            <div className="flex gap-2">
              <button className="px-3 py-1 text-sm text-red-600 border border-red-300 rounded hover:bg-red-50">
                삭제 ({selectedProducts.length})
              </button>
              <button className="px-3 py-1 text-sm text-blue-600 border border-blue-300 rounded hover:bg-blue-50">
                라벨 출력 ({selectedProducts.length})
              </button>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <select className="px-3 py-2 border border-gray-300 rounded-md text-sm">
            <option>등록일순</option>
            <option>가격순</option>
            <option>상품명순</option>
            <option>수정일순</option>
          </select>
        </div>
      </div>

      {/* Product List */}
      <div className="space-y-4">
        {mockProducts.map((product) => {
          const isExpanded = expandedProducts.includes(product.id);
          const hasMultipleVariants = product.variants.length > 1;
          
          return (
            <div key={product.id} className={`bg-white border rounded-lg overflow-hidden ${product.status === 'inactive' ? 'opacity-60' : ''}`}>
              {/* Main Product Row */}
              <div className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex gap-4">
                  {/* Checkbox */}
                  <div className="flex-shrink-0 pt-2">
                    <input
                      type="checkbox"
                      checked={selectedProducts.includes(product.id)}
                      onChange={() => handleProductSelect(product.id)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </div>

                  {/* Product Image */}
                  <div className="flex-shrink-0">
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-20 h-20 object-cover rounded"
                    />
                  </div>

                  {/* Product Info Grid */}
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-8 gap-4">
                    {/* Basic Info */}
                    <div className="md:col-span-2">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{product.name}</h3>
                        {getStatusBadge(product.status)}
                        {product.hasBarcode && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-1 py-0.5 rounded">바코드</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">코드: {product.code}</p>
                      <p className="text-sm text-gray-600">브랜드: {product.brand}</p>
                      <p className="text-sm text-gray-600">분류: {product.category}</p>
                    </div>

                    {/* Dates */}
                    <div>
                      <p className="text-xs text-gray-500">등록일</p>
                      <p className="text-sm font-medium">{product.registrationDate}</p>
                      <p className="text-xs text-gray-500 mt-1">수정일</p>
                      <p className="text-sm">{product.modifiedDate}</p>
                    </div>

                    {/* Shipping Policy */}
                    <div>
                      <p className="text-xs text-gray-500">배송정책</p>
                      <p className="text-sm font-medium">{product.shippingPolicy}</p>
                    </div>

                    {/* Prices */}
                    <div className="md:col-span-2">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-xs text-gray-500">판매가</p>
                          <p className="font-bold text-blue-600">₩{product.price.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">공급가</p>
                          <p>₩{product.supplierPrice.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">원가</p>
                          <p>₩{product.originalPrice.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">마진</p>
                          <p className="text-green-600">₩{product.margin.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>

                    {/* Variants Info & Actions */}
                    <div className="flex flex-col justify-between">
                      <div className="mb-2">
                        {hasMultipleVariants ? (
                          <button
                            onClick={() => toggleProductExpand(product.id)}
                            className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                          >
                            옵션 {product.variants.length}개 
                            <span className="text-xs">
                              {isExpanded ? '▲' : '▼'}
                            </span>
                          </button>
                        ) : (
                          <div className="text-sm text-gray-600">
                            <p className="font-medium">{product.variants[0]?.name}</p>
                            <p className="text-xs">재고: {product.variants[0]?.stock}개</p>
                            {product.variants[0]?.barcode && (
                              <p className="text-xs text-blue-600">바코드: {product.variants[0].barcode}</p>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        <button className="text-xs text-blue-500 hover:text-blue-700 border border-blue-300 px-2 py-1 rounded">
                          수정
                        </button>
                        <button className="text-xs text-red-500 hover:text-red-700 border border-red-300 px-2 py-1 rounded">
                          삭제
                        </button>
                        <button className="text-xs text-gray-500 hover:text-gray-700 border border-gray-300 px-2 py-1 rounded">
                          이력
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Expanded Variants */}
              {hasMultipleVariants && isExpanded && (
                <div className="border-t bg-gray-50">
                  <div className="p-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">상품 옵션</h4>
                    <div className="space-y-2">
                      {product.variants.map((variant) => (
                        <div key={variant.id} className="bg-white p-3 rounded border">
                          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                            <div className="md:col-span-2">
                              <p className="font-medium text-sm">{variant.name}</p>
                              <p className="text-xs text-gray-600">코드: {variant.optionCode}</p>
                            </div>
                            
                            <div>
                              <p className="text-xs text-gray-500">재고</p>
                              <p className="text-sm font-medium">{variant.stock}개</p>
                            </div>
                            
                            <div>
                              <p className="text-xs text-gray-500">가격</p>
                              <p className="text-sm font-medium">₩{variant.price.toLocaleString()}</p>
                            </div>
                            
                            <div>
                              <p className="text-xs text-gray-500">바코드</p>
                              {variant.barcode ? (
                                <p className="text-xs font-mono text-blue-600">{variant.barcode}</p>
                              ) : (
                                <p className="text-xs text-gray-400">없음</p>
                              )}
                            </div>
                            
                            <div className="flex gap-1">
                              <button className="text-xs text-blue-500 hover:text-blue-700 border border-blue-300 px-2 py-1 rounded">
                                바코드 관리
                              </button>
                              <button className="text-xs text-gray-500 hover:text-gray-700 border border-gray-300 px-1 py-1 rounded">
                                출력
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      <div className="flex justify-center mt-6">
        <div className="flex gap-2">
          <button className="px-3 py-2 border border-gray-300 rounded hover:bg-gray-50">이전</button>
          <button className="px-3 py-2 bg-blue-500 text-white rounded">1</button>
          <button className="px-3 py-2 border border-gray-300 rounded hover:bg-gray-50">2</button>
          <button className="px-3 py-2 border border-gray-300 rounded hover:bg-gray-50">3</button>
          <span className="px-3 py-2">...</span>
          <button className="px-3 py-2 border border-gray-300 rounded hover:bg-gray-50">6</button>
          <button className="px-3 py-2 border border-gray-300 rounded hover:bg-gray-50">다음</button>
        </div>
      </div>
    </div>
  );
};

export default ProductsListPage;
