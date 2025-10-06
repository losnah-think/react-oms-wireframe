import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

// Mock 데이터
const mockVendors = [
  {
    id: "V001",
    name: "네이버 스마트스토어",
    representative: "김네이버",
    businessNumber: "123-45-67890",
    phone: "02-1234-5678",
    email: "naver@example.com",
    address: "서울시 강남구 테헤란로 123",
    status: "active",
    registrationDate: "2023-01-15"
  },
  {
    id: "V002",
    name: "쿠팡",
    representative: "박쿠팡",
    businessNumber: "234-56-78901",
    phone: "02-2345-6789",
    email: "coupang@example.com",
    address: "서울시 서초구 서초대로 456",
    status: "active",
    registrationDate: "2023-02-20"
  },
  {
    id: "V003",
    name: "11번가",
    representative: "이일번가",
    businessNumber: "345-67-89012",
    phone: "02-3456-7890",
    email: "11st@example.com",
    address: "서울시 마포구 홍대입구역 789",
    status: "active",
    registrationDate: "2023-03-10"
  }
];

const mockProducts = [
  {
    id: "1",
    name: "[MADE] 임스 베이직 반폴라 니트 JT09390",
    code: "JJBD03-KN01",
    selling_price: 10000,
    stock: 45,
    is_selling: true,
    classificationPath: ["카테고리", "카테고리", "카테고리", "카테고리"],
    brand: "MADE J",
    season: "2024 SS",
    year: "2024",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300&h=300&fit=crop"
  },
  {
    id: "2", 
    name: "[FULGO] 클래식 데님 청바지",
    code: "FG-DN-001",
    selling_price: 25000,
    stock: 120,
    is_selling: true,
    classificationPath: ["의류", "하의", "청바지"],
    brand: "FULGO",
    season: "2024 FW",
    year: "2024",
    image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=300&h=300&fit=crop"
  }
];

const ExternalSendPage: React.FC = () => {
  const router = useRouter();
  const { ids } = router.query;
  
  // URL에서 받은 상품 ID들을 배열로 변환
  const productIds = ids ? (typeof ids === 'string' ? ids.split(',') : ids) : [];
  
  // 상태 관리
  const [selectedVendors, setSelectedVendors] = useState<string[]>([]);
  const [productSettings, setProductSettings] = useState<Record<string, Record<string, {
    price: number;
    stock: number;
    category: string;
    description: string;
  }>>>({});
  
  // 상품 기본 정보 편집 상태
  const [editingProducts, setEditingProducts] = useState<Record<string, {
    name: string;
    price: number;
    stock: number;
    category: string;
  }>>({});
  
  // 판매처별 상품 상태 관리
  const [productStatuses, setProductStatuses] = useState<Record<string, Record<string, {
    status: 'active' | 'inactive' | 'out_of_stock' | 'discontinued';
    isNew: boolean; // 신규 등록인지 기존 수정인지
  }>>>({});

  // 상품 정보 가져오기
  const products = mockProducts.filter(p => productIds.includes(p.id));

  // 상품 기본 정보 초기화
  useEffect(() => {
    products.forEach(product => {
      if (!editingProducts[product.id]) {
        initializeProductBasicInfo(product.id);
      }
    });
  }, [products]);

  // 가격 포맷팅 함수
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  // 판매처 선택/해제
  const toggleVendor = (vendorId: string) => {
    setSelectedVendors(prev => 
      prev.includes(vendorId) 
        ? prev.filter(id => id !== vendorId)
        : [...prev, vendorId]
    );
  };

  // 상품 설정 업데이트
  const updateProductSetting = (productId: string, vendorId: string, field: string, value: any) => {
    setProductSettings(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [vendorId]: {
          ...prev[productId]?.[vendorId],
          [field]: value
        }
      }
    }));
  };

  // 상품 기본 정보 업데이트
  const updateProductBasicInfo = (productId: string, field: string, value: any) => {
    setEditingProducts(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [field]: value
      }
    }));
  };

  // 상품 기본 정보 초기화
  const initializeProductBasicInfo = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    setEditingProducts(prev => ({
      ...prev,
      [productId]: {
        name: product.name,
        price: product.selling_price,
        stock: product.stock,
        category: product.classificationPath.join(' > ')
      }
    }));
  };

  // 판매처별 상품 상태 업데이트
  const updateProductStatus = (productId: string, vendorId: string, status: 'active' | 'inactive' | 'out_of_stock' | 'discontinued', isNew: boolean = false) => {
    setProductStatuses(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [vendorId]: {
          status,
          isNew
        }
      }
    }));
  };

  // 판매처별 상품 상태 가져오기
  const getProductStatus = (productId: string, vendorId: string) => {
    return productStatuses[productId]?.[vendorId] || {
      status: 'active' as const,
      isNew: true
    };
  };

  // 상태 텍스트 변환
  const getStatusText = (status: 'active' | 'inactive' | 'out_of_stock' | 'discontinued') => {
    const statusMap = {
      'active': '판매중',
      'inactive': '판매중지',
      'out_of_stock': '품절',
      'discontinued': '단종'
    };
    return statusMap[status];
  };

  // 상태 색상 변환
  const getStatusColor = (status: 'active' | 'inactive' | 'out_of_stock' | 'discontinued') => {
    const colorMap = {
      'active': 'bg-green-100 text-green-700',
      'inactive': 'bg-gray-100 text-gray-700',
      'out_of_stock': 'bg-red-100 text-red-700',
      'discontinued': 'bg-orange-100 text-orange-700'
    };
    return colorMap[status];
  };

  // 편집된 상품 정보 가져오기
  const getEditedProductInfo = (productId: string, field: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return '';
    
    const editedInfo = editingProducts[productId];
    if (!editedInfo) return '';
    
    switch (field) {
      case 'name':
        return editedInfo.name || product.name;
      case 'price':
        return editedInfo.price || product.selling_price;
      case 'stock':
        return editedInfo.stock || product.stock;
      case 'category':
        return editedInfo.category || product.classificationPath.join(' > ');
      default:
        return '';
    }
  };

  // 기본값 설정
  const getDefaultSetting = (productId: string, vendorId: string, field: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return '';
    
    switch (field) {
      case 'price':
        return productSettings[productId]?.[vendorId]?.price || getEditedProductInfo(productId, 'price');
      case 'stock':
        return productSettings[productId]?.[vendorId]?.stock || getEditedProductInfo(productId, 'stock');
      case 'category':
        return productSettings[productId]?.[vendorId]?.category || getEditedProductInfo(productId, 'category');
      case 'description':
        return productSettings[productId]?.[vendorId]?.description || `${getEditedProductInfo(productId, 'name')} - ${product.brand}`;
      default:
        return '';
    }
  };

  // 외부 송신 실행
  const handleExternalSend = async () => {
    if (selectedVendors.length === 0) {
      alert('전송할 판매처를 선택해주세요.');
      return;
    }

    console.log('외부 송신 실행:', {
      productIds,
      selectedVendors,
      productSettings
    });
    
    alert('외부 송신이 완료되었습니다!');
    router.push('/products');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="text-sm font-medium">뒤로가기</span>
            </button>
            <div className="h-6 w-px bg-gray-300"></div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">상품 외부 송신</h1>
              <p className="text-sm text-gray-600 mt-1">
                선택된 상품 {products.length}개를 외부 판매처로 전송합니다.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="px-6 py-6">
          
          {/* 1단계: 판매처 선택 */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">1. 전송할 판매처 선택</h3>
            <p className="text-sm text-gray-600 mb-6">
              상품을 전송할 판매처를 선택하세요. ({selectedVendors.length}개 선택됨)
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-3">
              {mockVendors.map((vendor) => {
                const isSelected = selectedVendors.includes(vendor.id);
                
                return (
                  <div
                    key={vendor.id}
                    onClick={() => toggleVendor(vendor.id)}
                    className={`p-3 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <h5 className="font-semibold text-gray-900 text-sm truncate">{vendor.name}</h5>
                        <p className="text-xs text-gray-600 truncate">{vendor.representative}</p>
                      </div>
                      {isSelected && (
                        <span className="text-blue-600 text-sm ml-2">✓</span>
                      )}
                    </div>
                    
                    <div className="text-xs text-gray-600 space-y-1">
                      <div className="truncate">사업자: {vendor.businessNumber}</div>
                      <div className="truncate">연락처: {vendor.phone}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2단계: 상품별 설정 */}
          {selectedVendors.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">2. 상품별 판매처 설정</h3>
              <p className="text-sm text-gray-600 mb-6">
                각 상품의 판매처별 가격, 재고, 카테고리를 설정하세요.
              </p>
              
              <div className="space-y-6">
                {products.map((product) => (
                  <div key={product.id} className="border border-gray-200 rounded-lg p-4">
                    {/* 판매처별 기본값 설정 */}
                    <div className="bg-blue-50 rounded-lg p-4 mb-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h5 className="font-semibold text-blue-900">판매처별 기본값 설정</h5>
                          <p className="text-sm text-blue-700 mt-1">
                            아래 값들이 각 판매처별 설정의 기본값으로 사용됩니다. 필요에 따라 개별 판매처에서 수정할 수 있습니다.
                          </p>
                        </div>
                        <button
                          onClick={() => initializeProductBasicInfo(product.id)}
                          className="px-3 py-1 text-sm bg-blue-200 text-blue-700 rounded hover:bg-blue-300"
                        >
                          원본값으로 초기화
                        </button>
                      </div>
                      
                      <div className="flex items-start gap-4 mb-4">
                        {/* 상품 이미지 */}
                        <div className="w-20 h-20 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
                          <img 
                            src={product.image} 
                            alt={product.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.nextElementSibling.style.display = 'flex';
                            }}
                          />
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center" style={{display: 'none'}}>
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        </div>
                        
                        {/* 상품 기본 정보 */}
                        <div className="flex-1">
                          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                        {/* 기본 상품명 */}
                        <div className="lg:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            기본 상품명
                          </label>
                          <input
                            type="text"
                            value={getEditedProductInfo(product.id, 'name')}
                            onChange={(e) => updateProductBasicInfo(product.id, 'name', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="판매처별 기본 상품명"
                          />
                        </div>
                        
                        {/* 기본 가격 */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            기본 가격
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={getEditedProductInfo(product.id, 'price')}
                            onChange={(e) => updateProductBasicInfo(product.id, 'price', Number(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="기본 가격"
                          />
                        </div>
                        
                        {/* 기본 재고 */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            기본 재고
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={getEditedProductInfo(product.id, 'stock')}
                            onChange={(e) => updateProductBasicInfo(product.id, 'stock', Number(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="기본 재고"
                          />
                        </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
                        {/* 기본 카테고리 */}
                        <div className="lg:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            기본 카테고리
                          </label>
                          <input
                            type="text"
                            value={getEditedProductInfo(product.id, 'category')}
                            onChange={(e) => updateProductBasicInfo(product.id, 'category', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="기본 카테고리"
                          />
                        </div>
                        
                        {/* 읽기 전용 정보 */}
                        <div className="flex items-end">
                          <div className="text-sm text-gray-600">
                            <div>코드: {product.code}</div>
                            <div>브랜드: {product.brand} | {product.year} {product.season}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 판매처별 개별 설정 - 테이블 형태 */}
                    <div className="overflow-x-auto">
                      <div className="mb-3">
                        <h6 className="font-semibold text-gray-900">판매처별 개별 설정</h6>
                        <p className="text-sm text-gray-600">각 판매처별로 다른 가격, 재고, 카테고리를 설정할 수 있습니다.</p>
                      </div>
                      <table className="w-full border border-gray-200 rounded-lg">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b border-gray-200">
                              이미지
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b border-gray-200">
                              판매처
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b border-gray-200">
                              상태
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b border-gray-200">
                              판매 가격
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b border-gray-200">
                              판매 재고
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b border-gray-200">
                              판매처 카테고리
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b border-gray-200">
                              상품 설명
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedVendors.map((vendorId) => {
                            const vendor = mockVendors.find(v => v.id === vendorId);
                            
                            return (
                              <tr key={vendorId} className="hover:bg-gray-50">
                                <td className="px-4 py-3 border-b border-gray-200">
                                  <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden">
                                    <img 
                                      src={product.image} 
                                      alt={product.name}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                        e.currentTarget.nextElementSibling.style.display = 'flex';
                                      }}
                                    />
                                    <div className="w-full h-full bg-gray-200 flex items-center justify-center" style={{display: 'none'}}>
                                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                      </svg>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-4 py-3 border-b border-gray-200">
                                  <div className="font-medium text-gray-900">{vendor?.name}</div>
                                  <div className="text-xs text-gray-500 mt-1">
                                    {getProductStatus(product.id, vendorId).isNew ? '신규 등록' : '기존 수정'}
                                  </div>
                                </td>
                                <td className="px-4 py-3 border-b border-gray-200">
                                  <select
                                    value={getProductStatus(product.id, vendorId).status}
                                    onChange={(e) => updateProductStatus(product.id, vendorId, e.target.value as any)}
                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                  >
                                    <option value="active">판매중</option>
                                    <option value="inactive">판매중지</option>
                                    <option value="out_of_stock">품절</option>
                                    <option value="discontinued">단종</option>
                                  </select>
                                </td>
                                <td className="px-4 py-3 border-b border-gray-200">
                                  <input
                                    type="number"
                                    min="1"
                                    value={getDefaultSetting(product.id, vendorId, 'price')}
                                    onChange={(e) => updateProductSetting(product.id, vendorId, 'price', Number(e.target.value))}
                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                  />
                                </td>
                                <td className="px-4 py-3 border-b border-gray-200">
                                  <input
                                    type="number"
                                    min="0"
                                    value={getDefaultSetting(product.id, vendorId, 'stock')}
                                    onChange={(e) => updateProductSetting(product.id, vendorId, 'stock', Number(e.target.value))}
                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                  />
                                </td>
                                <td className="px-4 py-3 border-b border-gray-200">
                                  <select
                                    value={getDefaultSetting(product.id, vendorId, 'category')}
                                    onChange={(e) => updateProductSetting(product.id, vendorId, 'category', e.target.value)}
                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                  >
                                    <option value="의류/상의">의류/상의</option>
                                    <option value="의류/하의">의류/하의</option>
                                    <option value="신발">신발</option>
                                    <option value="가방">가방</option>
                                    <option value="액세서리">액세서리</option>
                                    <option value="화장품">화장품</option>
                                    <option value="생활용품">생활용품</option>
                                    <option value="전자제품">전자제품</option>
                                    <option value="기타">기타</option>
                                  </select>
                                </td>
                                <td className="px-4 py-3 border-b border-gray-200">
                                  <textarea
                                    value={getDefaultSetting(product.id, vendorId, 'description')}
                                    onChange={(e) => updateProductSetting(product.id, vendorId, 'description', e.target.value)}
                                    rows={1}
                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                                    placeholder="상품 설명"
                                  />
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3단계: 최종 확인 */}
          {selectedVendors.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">3. 전송 정보 확인</h3>
              
              <div className="space-y-4">
                {selectedVendors.map((vendorId) => {
                  const vendor = mockVendors.find(v => v.id === vendorId);
                  
                  return (
                    <div key={vendorId} className="border border-gray-200 rounded-lg p-4">
                      <h5 className="font-semibold text-gray-900 mb-3">{vendor?.name}</h5>
                      
                      <div className="space-y-3">
                        {products.map((product) => {
                          const price = getDefaultSetting(product.id, vendorId, 'price');
                          const stock = getDefaultSetting(product.id, vendorId, 'stock');
                          const category = getDefaultSetting(product.id, vendorId, 'category');
                          const productName = getEditedProductInfo(product.id, 'name');
                          const productStatus = getProductStatus(product.id, vendorId);
                          
                          return (
                            <div key={product.id} className="bg-gray-50 rounded-lg p-3">
                              <div className="flex items-start gap-3">
                                {/* 상품 이미지 */}
                                <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
                                  <img 
                                    src={product.image} 
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.currentTarget.style.display = 'none';
                                      e.currentTarget.nextElementSibling.style.display = 'flex';
                                    }}
                                  />
                                  <div className="w-full h-full bg-gray-200 flex items-center justify-center" style={{display: 'none'}}>
                                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                  </div>
                                </div>
                                
                                <div className="flex-1">
                                  <div className="font-medium text-gray-900 mb-1">{productName}</div>
                                  <div className="text-sm text-gray-600 space-y-1">
                                    <div>코드: {product.code}</div>
                                    <div>카테고리: {category}</div>
                                    <div className="flex items-center gap-2">
                                      <span>상태:</span>
                                      <span className={`px-2 py-1 text-xs rounded ${getStatusColor(productStatus.status)}`}>
                                        {getStatusText(productStatus.status)}
                                      </span>
                                      <span className="text-xs text-gray-500">
                                        ({productStatus.isNew ? '신규 등록' : '기존 수정'})
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right ml-4">
                                  <div className="text-lg font-semibold text-blue-600 mb-1">
                                    ₩{formatPrice(price)}
                                  </div>
                                  <div className="text-sm text-gray-600">
                                    재고: {stock}개
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 하단 버튼 */}
          <div className="flex justify-between items-center">
            <button
              onClick={() => router.back()}
              className="px-6 py-2 text-gray-600 hover:text-gray-800"
            >
              뒤로가기
            </button>
            
            <button
              onClick={handleExternalSend}
              disabled={selectedVendors.length === 0}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              외부 송신 시작
            </button>
          </div>
      </div>
    </div>
  );
};

export default ExternalSendPage;