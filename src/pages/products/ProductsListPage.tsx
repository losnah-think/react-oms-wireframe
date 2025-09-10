import React, { useState } from 'react';

// 실제 DB 스키마를 import하여 사용
import { Product, ProductVariant } from '../../types/database';

// UI에서 사용할 Product with Variants 타입
interface ProductWithVariants extends Product {
  variants?: ProductVariant[];
}

interface ProductsListPageProps {
  onNavigate?: (page: string, productId?: number) => void;
}

const ProductsListPage: React.FC<ProductsListPageProps> = ({ onNavigate }) => {
  // const [searchTerm, setSearchTerm] = useState('');
  // const [selectedCategory, setSelectedCategory] = useState('');
  // const [selectedStatus, setSelectedStatus] = useState('');
  // const [selectedBrand, setSelectedBrand] = useState('');
  // const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  // const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedProducts, setSelectedProducts] = useState<(string|number)[]>([]);
  // const [expandedProducts, setExpandedProducts] = useState<(string|number)[]>([]);

  // 실제 DB 스키마 기반 Mock 데이터 
  const mockProducts: ProductWithVariants[] = [
    {
      id: "PROD-001",
      createdAt: new Date("2025-01-15T09:00:00Z"),
      updatedAt: new Date("2025-01-20T14:30:00Z"),
      productName: "삼성 갤럭시 S24 Ultra 256GB",
      englishProductName: "Samsung Galaxy S24 Ultra 256GB",
      productCode: "SAMSUNG-S24U-256",
      productCategory: "스마트폰",
      brandId: "BRAND-SAMSUNG",
      supplierId: "SUPPLIER-001",
      originalCost: 1100000,
      representativeSellingPrice: 1299000,
      representativeSupplyPrice: 1170000,
      marketPrice: 1399000,
      consumerPrice: 1449000,
      foreignCurrencyPrice: 1099,
      stock: 125,
      safeStock: 10,
      isOutOfStock: false,
      isSelling: true,
      isSoldout: false,
      description: "최신 AI 기능이 탑재된 프리미엄 스마트폰. 200MP 카메라와 S펜이 내장된 고성능 플래그십 모델",
      representativeImage: "/images/galaxy-s24-ultra.jpg",
      descriptionImages: ["/images/galaxy-s24-ultra-1.jpg", "/images/galaxy-s24-ultra-2.jpg"],
      width: 162.3,
      height: 79.0,
      depth: 8.6,
      weight: 232.0,
      volume: 110.2,
      hsCode: "8517120000",
      origin: "대한민국",
      isTaxExempt: false,
      showProductNameOnInvoice: true,
      productDesigner: "김디자인",
      productRegistrant: "이등록",
      productYear: "2025",
      productSeason: "상시",
      externalProductId: "EXT-SAMSUNG-001",
      externalUrl: "https://samsung.com/galaxy-s24-ultra",
      active: true,
      variants: [
        {
          id: "VAR-001-001",
          createdAt: new Date("2025-01-15T09:00:00Z"),
          updatedAt: new Date("2025-01-15T09:00:00Z"),
          productId: "PROD-001",
          variantName: "갤럭시 S24 Ultra 256GB 티타늄 블랙",
          optionCode: "256GB-BLACK",
          stock: 15,
          safeStock: 5,
          costPrice: 1290000,
          sellingPrice: 1550000,
          supplyPrice: 1395000,
          isSelling: true,
          isSoldout: false,
          active: true
        }
      ]
    },
    {
      id: "PROD-002",
      createdAt: new Date("2025-01-10T10:30:00Z"),
      updatedAt: new Date("2025-01-18T16:45:00Z"),
      productName: "LG 그램 17인치 노트북 32GB",
      englishProductName: "LG Gram 17inch Laptop 32GB",
      productCode: "LG-GRAM17-32GB",
      productCategory: "노트북",
      brandId: "BRAND-LG",
      supplierId: "SUPPLIER-002",
      originalCost: 1900000,
      representativeSellingPrice: 2290000,
      representativeSupplyPrice: 2061000,
      marketPrice: 2390000,
      consumerPrice: 2499000,
      foreignCurrencyPrice: 1899,
      stock: 45,
      safeStock: 5,
      isOutOfStock: false,
      isSelling: true,
      isSoldout: false,
      description: "17인치 대화면에 초경량 1.35kg의 혁신적인 프리미엄 노트북. 인텔 13세대 코어 프로세서 탑재",
      representativeImage: "/images/lg-gram-17.jpg",
      descriptionImages: ["/images/lg-gram-17-1.jpg", "/images/lg-gram-17-2.jpg"],
      width: 380.0,
      height: 258.8,
      depth: 17.4,
      weight: 1350.0,
      volume: 1713.2,
      hsCode: "8471300000",
      origin: "대한민국",
      isTaxExempt: false,
      showProductNameOnInvoice: true,
      productDesigner: "박노트북",
      productRegistrant: "최등록자",
      productYear: "2025",
      productSeason: "상시",
      externalProductId: "EXT-LG-001",
      externalUrl: "https://lg.com/gram-17",
      active: true
    }
  ];

  // const categories = ['전체', '전자제품', '가전제품', '의류/신발', '화장품/뷰티', '식품/생활용품'];
  // const brands = ['전체', '삼성전자', 'LG전자', '다이슨', '나이키', '설화수', 'CJ제일제당'];
  // const statuses = ['전체', 'selling', 'soldout', 'discontinued'];
  
  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('ko-KR');
  };

  const handleSelectAll = () => {
    if (selectedProducts.length === mockProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(mockProducts.map(p => p.id));
    }
  };

  const handleProductSelect = (productId: string) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'selling':
        return <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">판매중</span>;
      case 'soldout':
        return <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded">품절</span>;
      case 'discontinued':
        return <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded">단종</span>;
      default:
        return null;
    }
  };

  const getCategoryName = (product: Product) => {
    return product.productCategory || '기타';
  };

  const getExternalPlatformStatus = (productId: number) => {
    const platforms = [
      { name: '메이크샵', status: 'connected', syncStatus: 'synced' },
      { name: '카페24', status: 'disconnected', syncStatus: 'pending' }
    ];
    return platforms;
  };

  const getSyncStatusBadge = (status: string) => {
    switch (status) {
      case 'synced':
        return <span className="px-1 py-0.5 text-xs bg-green-100 text-green-800 rounded">동기화됨</span>;
      case 'syncing':
        return <span className="px-1 py-0.5 text-xs bg-blue-100 text-blue-800 rounded">동기화중</span>;
      case 'error':
        return <span className="px-1 py-0.5 text-xs bg-red-100 text-red-800 rounded">오류</span>;
      case 'pending':
        return <span className="px-1 py-0.5 text-xs bg-yellow-100 text-yellow-800 rounded">대기중</span>;
      default:
        return <span className="px-1 py-0.5 text-xs bg-gray-100 text-gray-500 rounded">미연결</span>;
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">상품 목록</h1>
        <div className="flex gap-2">
          <button 
            onClick={() => onNavigate?.('products-add')}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-2"
          >
            + 상품 등록
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
        </div>
      </div>

      {/* Product List */}
      <div className="space-y-4">
        {mockProducts.map((product) => (
          <div key={product.id} className="bg-white border rounded-lg overflow-hidden">
            <div className="p-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0 pt-2">
                  <input
                    type="checkbox"
                    checked={selectedProducts.includes(product.id)}
                    onChange={() => handleProductSelect(product.id)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </div>

                <div className="flex-shrink-0">
                  <div className="w-20 h-20 bg-gray-200 rounded flex items-center justify-center text-gray-500 text-xs">
                    이미지
                  </div>
                </div>

                <div className="flex-1 grid grid-cols-1 md:grid-cols-8 gap-4">
                  <div className="md:col-span-2">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-semibold text-gray-900">{product.productName}</h3>
                      {getStatusBadge(product.isSelling ? 'selling' : product.isSoldout ? 'soldout' : 'discontinued')}
                    </div>
                    <p className="text-sm text-gray-600">코드: {product.productCode}</p>
                    <p className="text-sm text-gray-600">브랜드: {product.brandId}</p>
                    <p className="text-sm text-gray-600">분류: {getCategoryName(product)}</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">등록일</p>
                    <p className="text-sm font-medium">{formatDate(product.createdAt)}</p>
                    <p className="text-xs text-gray-500 mt-1">수정일</p>
                    <p className="text-sm">{formatDate(product.updatedAt)}</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">원산지</p>
                    <p className="text-sm font-medium">{product.origin || '-'}</p>
                    {product.hsCode && (
                      <>
                        <p className="text-xs text-gray-500 mt-1">HS코드</p>
                        <p className="text-sm">{product.hsCode}</p>
                      </>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <h4 className="text-xs font-semibold text-blue-800 mb-2">📊 OMS 정보</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-xs text-blue-700">판매가</p>
                          <p className="font-bold text-blue-600">₩{product.representativeSellingPrice.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-blue-700">공급가</p>
                          <p className="font-medium text-blue-800">₩{(product.representativeSupplyPrice || 0).toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-blue-700">원가</p>
                          <p className="font-medium text-blue-800">₩{product.originalCost.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-blue-700">재고</p>
                          <p className="text-green-600 font-medium">{product.stock}개</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-2">
                      <h4 className="text-xs font-semibold text-green-800 mb-2">🌐 외부 송신</h4>
                      <div className="space-y-1">
                        {getExternalPlatformStatus(parseInt(product.id.replace('PROD-', ''), 10)).map((platform, idx) => (
                          <div key={idx} className="flex items-center justify-between text-xs">
                            <span className="text-gray-600">{platform.name}</span>
                            {getSyncStatusBadge(platform.syncStatus)}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col justify-between">
                    <div className="flex gap-2 flex-wrap">
                      <button className="text-xs text-blue-500 hover:text-blue-700 border border-blue-300 px-2 py-1 rounded">
                        수정
                      </button>
                      <button className="text-xs text-red-500 hover:text-red-700 border border-red-300 px-2 py-1 rounded">
                        삭제
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductsListPage;
