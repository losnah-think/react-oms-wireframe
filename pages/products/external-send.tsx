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

// 판매처별 부가 정보 타입 정의
interface VendorExtraInfo {
  id: string;
  vendorId: string;
  key: string;
  value: string;
  description?: string;
  mappingField?: string;
}

// 판매처별 부가 정보 Mock 데이터
const mockExtraInfo: VendorExtraInfo[] = [
  // 네이버 스마트스토어
  {
    id: "EI001",
    vendorId: "V001",
    key: "판매자 ID",
    value: "naver_seller_123",
    description: "네이버 스마트스토어 판매자 식별자",
    mappingField: "seller_id"
  },
  {
    id: "EI002",
    vendorId: "V001",
    key: "정산 주기",
    value: "월 2회 (15일, 말일)",
    description: "정산 받는 주기",
    mappingField: "settlement_period"
  },
  {
    id: "EI003",
    vendorId: "V001",
    key: "수수료율",
    value: "12%",
    description: "판매 수수료 비율",
    mappingField: "commission_rate"
  },
  {
    id: "EI004",
    vendorId: "V001",
    key: "배송비 템플릿 ID",
    value: "TPL-NAVER-001",
    description: "배송비 계산 템플릿",
    mappingField: "shipping_template_id"
  },
  {
    id: "EI005",
    vendorId: "V001",
    key: "고객센터 번호",
    value: "1588-1234",
    description: "고객 문의 전화번호",
    mappingField: "customer_service_phone"
  },
  
  // 쿠팡
  {
    id: "EI006",
    vendorId: "V002",
    key: "판매자 ID",
    value: "coupang_seller_456",
    description: "쿠팡 판매자 식별자",
    mappingField: "seller_id"
  },
  {
    id: "EI007",
    vendorId: "V002",
    key: "정산 주기",
    value: "주 1회 (매주 금요일)",
    description: "정산 받는 주기",
    mappingField: "settlement_period"
  },
  {
    id: "EI008",
    vendorId: "V002",
    key: "수수료율",
    value: "15%",
    description: "판매 수수료 비율",
    mappingField: "commission_rate"
  },
  {
    id: "EI009",
    vendorId: "V002",
    key: "로켓배송 사용",
    value: "사용함",
    description: "쿠팡 로켓배송 서비스 사용 여부",
    mappingField: "rocket_delivery_enabled"
  },
  {
    id: "EI010",
    vendorId: "V002",
    key: "반품배송비",
    value: "5,000원",
    description: "반품 시 고객 부담 배송비",
    mappingField: "return_shipping_fee"
  },
  
  // 11번가
  {
    id: "EI011",
    vendorId: "V003",
    key: "판매자 ID",
    value: "11st_seller_789",
    description: "11번가 판매자 식별자",
    mappingField: "seller_id"
  },
  {
    id: "EI012",
    vendorId: "V003",
    key: "정산 주기",
    value: "월 1회 (말일)",
    description: "정산 받는 주기",
    mappingField: "settlement_period"
  },
  {
    id: "EI013",
    vendorId: "V003",
    key: "수수료율",
    value: "10%",
    description: "판매 수수료 비율",
    mappingField: "commission_rate"
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
    name?: string;
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

  // 판매처/상품별 부가 정보 관리
  const [selectedExtraInfo, setSelectedExtraInfo] = useState<Record<string, Record<string, Array<{
    key: string;
    value: string;
    description?: string;
    mappingField?: string;
  }>>>>({});

  // 부가 정보 모달 상태
  const [extraInfoModalOpen, setExtraInfoModalOpen] = useState(false);
  const [extraInfoModalContext, setExtraInfoModalContext] = useState<{
    productId: string;
    vendorId: string;
  } | null>(null);

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

  // 판매처의 사용 가능한 부가 정보 가져오기
  const getAvailableExtraInfo = (vendorId: string) => {
    return mockExtraInfo.filter(info => info.vendorId === vendorId);
  };

  // 판매처/상품별 부가 정보 추가
  const addExtraInfo = (productId: string, vendorId: string, extraInfoId: string) => {
    const extraInfo = mockExtraInfo.find(info => info.id === extraInfoId);
    if (!extraInfo) return;

    setSelectedExtraInfo(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [vendorId]: [
          ...(prev[productId]?.[vendorId] || []),
          {
            key: extraInfo.key,
            value: extraInfo.value,
            description: extraInfo.description,
            mappingField: extraInfo.mappingField
          }
        ]
      }
    }));
  };

  // 판매처/상품별 부가 정보 삭제
  const removeExtraInfo = (productId: string, vendorId: string, index: number) => {
    setSelectedExtraInfo(prev => {
      const vendorInfo = prev[productId]?.[vendorId] || [];
      const newVendorInfo = vendorInfo.filter((_, i) => i !== index);
      
      return {
        ...prev,
        [productId]: {
          ...prev[productId],
          [vendorId]: newVendorInfo
        }
      };
    });
  };

  // 판매처/상품별 부가 정보 값 수정
  const updateExtraInfoValue = (productId: string, vendorId: string, index: number, newValue: string) => {
    setSelectedExtraInfo(prev => {
      const vendorInfo = prev[productId]?.[vendorId] || [];
      const newVendorInfo = [...vendorInfo];
      newVendorInfo[index] = {
        ...newVendorInfo[index],
        value: newValue
      };
      
      return {
        ...prev,
        [productId]: {
          ...prev[productId],
          [vendorId]: newVendorInfo
        }
      };
    });
  };

  // 판매처/상품별 부가 정보 가져오기
  const getProductVendorExtraInfo = (productId: string, vendorId: string) => {
    return selectedExtraInfo[productId]?.[vendorId] || [];
  };

  // 부가 정보 모달 열기
  const openExtraInfoModal = (productId: string, vendorId: string) => {
    setExtraInfoModalContext({ productId, vendorId });
    setExtraInfoModalOpen(true);
  };

  // 부가 정보 모달 닫기
  const closeExtraInfoModal = () => {
    setExtraInfoModalOpen(false);
    setExtraInfoModalContext(null);
  };

  // 부가 정보 일괄 추가
  const addMultipleExtraInfo = (productId: string, vendorId: string, extraInfoIds: string[]) => {
    const newExtraInfoList = extraInfoIds.map(id => {
      const extraInfo = mockExtraInfo.find(info => info.id === id);
      if (!extraInfo) return null;
      return {
        key: extraInfo.key,
        value: extraInfo.value,
        description: extraInfo.description,
        mappingField: extraInfo.mappingField
      };
    }).filter(Boolean) as Array<{
      key: string;
      value: string;
      description?: string;
      mappingField?: string;
    }>;

    setSelectedExtraInfo(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [vendorId]: newExtraInfoList
      }
    }));

    closeExtraInfoModal();
  };

  // 이미 추가된 부가 정보인지 확인
  const isExtraInfoAdded = (productId: string, vendorId: string, extraInfoKey: string) => {
    const existingInfo = getProductVendorExtraInfo(productId, vendorId);
    return existingInfo.some(info => info.key === extraInfoKey);
  };

  // 기본값 설정
  const getDefaultSetting = (productId: string, vendorId: string, field: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return '';
    
    switch (field) {
      case 'name':
        return productSettings[productId]?.[vendorId]?.name || product.name;
      case 'price':
        return productSettings[productId]?.[vendorId]?.price || product.selling_price;
      case 'stock':
        return productSettings[productId]?.[vendorId]?.stock || product.stock;
      case 'category':
        return productSettings[productId]?.[vendorId]?.category || product.classificationPath.join(' > ');
      case 'description':
        return productSettings[productId]?.[vendorId]?.description || `${product.name} - ${product.brand}`;
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
      productSettings,
      selectedExtraInfo
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

          {/* 2단계: 상품별 판매처 설정 */}
          {selectedVendors.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">2. 상품별 판매처 설정</h3>
              <p className="text-sm text-gray-600 mb-6">
                각 상품의 판매처별 가격, 재고, 카테고리 등을 개별적으로 설정하세요.
              </p>
              
              <div className="space-y-8">
                {products.map((product) => (
                  <div key={product.id} className="border border-gray-200 rounded-lg p-5">
                    {/* 상품 정보 헤더 */}
                    <div className="flex items-start gap-4 pb-4 mb-4 border-b border-gray-200">
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
                        <h4 className="text-lg font-semibold text-gray-900">{product.name}</h4>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                          <span>상품코드: {product.code}</span>
                          <span>•</span>
                          <span>브랜드: {product.brand}</span>
                          <span>•</span>
                          <span>{product.year} {product.season}</span>
                        </div>
                      </div>
                    </div>

                    {/* 판매처별 개별 설정 리스트 */}
                    <div className="space-y-4">
                      {selectedVendors.map((vendorId) => {
                        const vendor = mockVendors.find(v => v.id === vendorId);
                        const productStatus = getProductStatus(product.id, vendorId);
                        
                        return (
                          <div key={vendorId} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-300">
                              <div>
                                <h5 className="font-semibold text-gray-900">{vendor?.name}</h5>
                                <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                                  <span>{productStatus.isNew ? '신규 등록' : '기존 수정'}</span>
                                  <span>•</span>
                                  <span>원본 가격: ₩{formatPrice(product.selling_price)}</span>
                                  <span>•</span>
                                  <span>원본 재고: {product.stock}개</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-600">상태:</span>
                                <select
                                  value={productStatus.status}
                                  onChange={(e) => updateProductStatus(product.id, vendorId, e.target.value as any)}
                                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                >
                                  <option value="active">판매중</option>
                                  <option value="inactive">판매중지</option>
                                  <option value="out_of_stock">품절</option>
                                  <option value="discontinued">단종</option>
                                </select>
                              </div>
                            </div>
                            
                            {/* 입력 필드들 */}
                            <div className="space-y-4">
                              {/* 상품명 */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                  상품명
                                </label>
                                <input
                                  type="text"
                                  value={getDefaultSetting(product.id, vendorId, 'name') || product.name}
                                  onChange={(e) => updateProductSetting(product.id, vendorId, 'name', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                  placeholder="판매처별 상품명"
                                />
                              </div>

                              {/* 가격과 재고 */}
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    판매 가격
                                  </label>
                                  <input
                                    type="number"
                                    min="1"
                                    value={getDefaultSetting(product.id, vendorId, 'price')}
                                    onChange={(e) => updateProductSetting(product.id, vendorId, 'price', Number(e.target.value))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                    placeholder="가격"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    판매 재고
                                  </label>
                                  <input
                                    type="number"
                                    min="0"
                                    value={getDefaultSetting(product.id, vendorId, 'stock')}
                                    onChange={(e) => updateProductSetting(product.id, vendorId, 'stock', Number(e.target.value))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                    placeholder="재고"
                                  />
                                </div>
                              </div>

                              {/* 카테고리 */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                  판매처 카테고리
                                </label>
                                <select
                                  value={getDefaultSetting(product.id, vendorId, 'category')}
                                  onChange={(e) => updateProductSetting(product.id, vendorId, 'category', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
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
                              </div>

                              {/* 상품 설명 */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                  상품 설명
                                </label>
                                <textarea
                                  value={getDefaultSetting(product.id, vendorId, 'description')}
                                  onChange={(e) => updateProductSetting(product.id, vendorId, 'description', e.target.value)}
                                  rows={3}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none bg-white"
                                  placeholder="판매처에 표시될 상품 설명을 입력하세요"
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3단계: 기본정보 확인 */}
          {selectedVendors.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">3. 기본정보 확인</h3>
              
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

          {/* 4단계: 부가 정보 추가 */}
          {selectedVendors.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">4. 판매처별 부가 정보 추가 (선택사항)</h3>
              <p className="text-sm text-gray-600 mb-6">
                각 판매처의 요구사항에 맞는 부가 정보를 추가하세요. 키와 값을 설정하여 여러 개를 추가할 수 있습니다.
              </p>
              
              <div className="space-y-6">
                {selectedVendors.map((vendorId) => {
                  const vendor = mockVendors.find(v => v.id === vendorId);
                  const availableExtraInfo = getAvailableExtraInfo(vendorId);
                  
                  return (
                    <div key={vendorId} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h5 className="font-semibold text-gray-900">{vendor?.name}</h5>
                        <span className="text-sm text-gray-500">
                          사용 가능한 부가 정보: {availableExtraInfo.length}개
                        </span>
                      </div>
                      
                      {products.map((product) => {
                        const extraInfoList = getProductVendorExtraInfo(product.id, vendorId);
                        
                        return (
                          <div key={product.id} className="mb-4 last:mb-0">
                            <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-200">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                                  <img 
                                    src={product.image} 
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.currentTarget.style.display = 'none';
                                    }}
                                  />
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                  <div className="text-xs text-gray-500">{product.code}</div>
                                </div>
                              </div>
                              
                              {/* 부가 정보 추가 버튼 */}
                              <button
                                onClick={() => openExtraInfoModal(product.id, vendorId)}
                                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                부가 정보 추가
                              </button>
                            </div>
                            
                            {/* 선택된 부가 정보 목록 */}
                            {extraInfoList.length > 0 ? (
                              <div className="space-y-2">
                                {extraInfoList.map((info, index) => (
                                  <div key={index} className="bg-gray-50 rounded-lg p-3">
                                    <div className="flex items-start gap-3">
                                      <div className="flex-1 grid grid-cols-2 gap-3">
                                        <div>
                                          <label className="block text-xs font-medium text-gray-700 mb-1">
                                            키
                                          </label>
                                          <input
                                            type="text"
                                            value={info.key}
                                            readOnly
                                            className="w-full px-2 py-1.5 text-sm bg-white border border-gray-300 rounded focus:outline-none text-gray-600"
                                          />
                                          {info.description && (
                                            <p className="text-xs text-gray-500 mt-1">{info.description}</p>
                                          )}
                                        </div>
                                        <div>
                                          <label className="block text-xs font-medium text-gray-700 mb-1">
                                            값
                                          </label>
                                          <input
                                            type="text"
                                            value={info.value}
                                            onChange={(e) => updateExtraInfoValue(product.id, vendorId, index, e.target.value)}
                                            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="값을 입력하세요"
                                          />
                                          {info.mappingField && (
                                            <p className="text-xs text-gray-500 mt-1">
                                              매핑 필드: {info.mappingField}
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                      <button
                                        onClick={() => removeExtraInfo(product.id, vendorId, index)}
                                        className="mt-6 p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                                        title="삭제"
                                      >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center py-4 text-sm text-gray-500">
                                추가된 부가 정보가 없습니다. 위에서 부가 정보를 선택하여 추가하세요.
                              </div>
                            )}
                          </div>
                        );
                      })}
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

      {/* 부가 정보 선택 모달 */}
      {extraInfoModalOpen && extraInfoModalContext && (
        <ExtraInfoModal
          productId={extraInfoModalContext.productId}
          vendorId={extraInfoModalContext.vendorId}
          availableExtraInfo={getAvailableExtraInfo(extraInfoModalContext.vendorId)}
          selectedExtraInfo={getProductVendorExtraInfo(extraInfoModalContext.productId, extraInfoModalContext.vendorId)}
          onClose={closeExtraInfoModal}
          onSave={addMultipleExtraInfo}
        />
      )}
    </div>
  );
};

// 부가 정보 선택 모달 컴포넌트
interface ExtraInfoModalProps {
  productId: string;
  vendorId: string;
  availableExtraInfo: VendorExtraInfo[];
  selectedExtraInfo: Array<{
    key: string;
    value: string;
    description?: string;
    mappingField?: string;
  }>;
  onClose: () => void;
  onSave: (productId: string, vendorId: string, extraInfoIds: string[]) => void;
}

const ExtraInfoModal: React.FC<ExtraInfoModalProps> = ({
  productId,
  vendorId,
  availableExtraInfo,
  selectedExtraInfo,
  onClose,
  onSave
}) => {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(() => {
    // 이미 선택된 항목들을 초기 체크 상태로 설정
    const initialChecked = new Set<string>();
    selectedExtraInfo.forEach(info => {
      const matchingItem = availableExtraInfo.find(item => item.key === info.key);
      if (matchingItem) {
        initialChecked.add(matchingItem.id);
      }
    });
    return initialChecked;
  });

  const toggleItem = (id: string) => {
    setCheckedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleSave = () => {
    onSave(productId, vendorId, Array.from(checkedItems));
  };

  const handleSelectAll = () => {
    setCheckedItems(new Set(availableExtraInfo.map(info => info.id)));
  };

  const handleDeselectAll = () => {
    setCheckedItems(new Set());
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[80vh] flex flex-col">
        {/* 모달 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">부가 정보 선택</h3>
            <p className="text-sm text-gray-600 mt-1">
              추가할 부가 정보를 선택하세요 ({checkedItems.size}개 선택됨)
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 전체 선택/해제 버튼 */}
        <div className="px-6 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            총 {availableExtraInfo.length}개 항목
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSelectAll}
              className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors"
            >
              전체 선택
            </button>
            <button
              onClick={handleDeselectAll}
              className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded transition-colors"
            >
              전체 해제
            </button>
          </div>
        </div>

        {/* 모달 바디 - 스크롤 가능 */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-2">
            {availableExtraInfo.map((info) => {
              const isChecked = checkedItems.has(info.id);
              
              return (
                <label
                  key={info.id}
                  className={`flex items-start p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    isChecked
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleItem(info.id)}
                    className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <div className="ml-3 flex-1">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{info.key}</div>
                        {info.description && (
                          <div className="text-sm text-gray-600 mt-1">{info.description}</div>
                        )}
                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                          <span>기본값: {info.value}</span>
                          {info.mappingField && (
                            <>
                              <span>•</span>
                              <span>매핑: {info.mappingField}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        {/* 모달 푸터 */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            선택 완료 ({checkedItems.size}개)
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExternalSendPage;