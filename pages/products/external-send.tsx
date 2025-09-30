import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';

// Mock 데이터 (실제로는 API에서 가져옴)
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

const mockVendorProducts = [
  {
    id: "VP001",
    vendorId: "V001",
    productId: "1",
    vendorProductCode: "NAVER-TS001",
    vendorPrice: 29000,
    vendorStock: 150,
    vendorCategory: "의류/상의",
    vendorDescription: "네이버 스마트스토어용 상의 상품",
    isActive: true,
    lastSyncDate: "2025-09-30"
  },
  {
    id: "VP002",
    vendorId: "V002",
    productId: "1",
    vendorProductCode: "COUPANG-TS001",
    vendorPrice: 31000,
    vendorStock: 120,
    vendorCategory: "의류/상의",
    vendorDescription: "쿠팡용 상의 상품",
    isActive: true,
    lastSyncDate: "2025-09-29"
  }
];

const mockProducts = [
  {
    id: "1",
    name: "기본 반팔티셔츠",
    code: "TS001",
    selling_price: 25000,
    stock: 100,
    is_selling: true,
    classificationPath: ["의류", "상의"]
  },
  {
    id: "2", 
    name: "기본 청바지",
    code: "JN001",
    selling_price: 45000,
    stock: 50,
    is_selling: true,
    classificationPath: ["의류", "하의"]
  }
];

interface VendorProduct {
  id: string;
  vendorId: string;
  productId: string;
  vendorProductCode: string;
  vendorPrice: number;
  vendorStock: number;
  vendorCategory?: string;
  vendorDescription?: string;
  isActive: boolean;
  lastSyncDate: string;
}

const ExternalSendPage: React.FC = () => {
  const router = useRouter();
  const { ids } = router.query;
  
  // URL에서 받은 상품 ID들을 배열로 변환
  const productIds = ids ? (typeof ids === 'string' ? ids.split(',') : ids) : [];
  
  // 외부송신 단계별 상태 관리
  const [sendStep, setSendStep] = useState<'vendors' | 'products' | 'review'>('vendors');
  const [selectedVendorsForSend, setSelectedVendorsForSend] = useState<string[]>([]);
  const [productVendorMapping, setProductVendorMapping] = useState<Record<string, string[]>>({});
  
  // 상품 정보 편집을 위한 상태
  const [editingProductVendor, setEditingProductVendor] = useState<{
    productId: string;
    vendorId: string;
  } | null>(null);
  const [vendorProductForm, setVendorProductForm] = useState({
    vendorProductCode: '',
    vendorPrice: 0,
    vendorStock: 0,
    vendorCategory: '',
    vendorDescription: ''
  });

  // 가격 포맷팅 함수
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW'
    }).format(price);
  };

  // 판매처별 상품 정보 편집 함수들
  const handleEditVendorProduct = (productId: string, vendorId: string) => {
    const vendorProduct = mockVendorProducts.find(vp => 
      vp.vendorId === vendorId && vp.productId === productId
    );
    
    setEditingProductVendor({ productId, vendorId });
    setVendorProductForm({
      vendorProductCode: vendorProduct?.vendorProductCode || '',
      vendorPrice: vendorProduct?.vendorPrice || 0,
      vendorStock: vendorProduct?.vendorStock || 0,
      vendorCategory: vendorProduct?.vendorCategory || '',
      vendorDescription: vendorProduct?.vendorDescription || ''
    });
  };

  const handleSaveVendorProduct = () => {
    if (!editingProductVendor) return;
    
    console.log('판매처별 상품 정보 저장:', {
      ...editingProductVendor,
      ...vendorProductForm
    });
    
    setEditingProductVendor(null);
    setVendorProductForm({
      vendorProductCode: '',
      vendorPrice: 0,
      vendorStock: 0,
      vendorCategory: '',
      vendorDescription: ''
    });
  };

  const handleCancelVendorProductEdit = () => {
    setEditingProductVendor(null);
    setVendorProductForm({
      vendorProductCode: '',
      vendorPrice: 0,
      vendorStock: 0,
      vendorCategory: '',
      vendorDescription: ''
    });
  };

  // 외부 송신 실행
  const handleExternalSend = async () => {
    console.log('외부 송신 실행:', {
      productIds,
      selectedVendors: selectedVendorsForSend,
      productVendorMapping
    });
    
    // 실제로는 API 호출
    alert('외부 송신이 완료되었습니다!');
    router.push('/products');
  };

  // 상품 정보 가져오기
  const products = mockProducts.filter(p => productIds.includes(p.id));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 메인 콘텐츠 */}
      <div className="flex flex-col h-screen">
          {/* 헤더 */}
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">상품 외부 송신</h1>
                <p className="text-sm text-gray-600 mt-1">
                  선택된 상품 {products.length}개를 외부 판매처로 전송합니다.
                </p>
              </div>
              <button
                onClick={() => router.push('/products')}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* 단계 표시기 */}
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-center">
              {[
                { key: 'vendors', label: '전송할 판매처', icon: '🤝' },
                { key: 'products', label: '상품 정보 맵핑', icon: '📦' },
                { key: 'review', label: '최종 확인', icon: '✅' }
              ].map((step, index) => (
                <div key={step.key} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    sendStep === step.key 
                      ? 'bg-blue-500 border-blue-500 text-white' 
                      : ['vendors', 'products', 'review'].indexOf(sendStep) > index
                      ? 'bg-green-500 border-green-500 text-white'
                      : 'bg-gray-100 border-gray-300 text-gray-500'
                  }`}>
                    <span className="text-sm">{step.icon}</span>
                  </div>
                  <div className="ml-2 text-sm font-medium text-gray-700">{step.label}</div>
                  {index < 2 && (
                    <div className={`w-16 h-0.5 mx-4 ${
                      ['vendors', 'products', 'review'].indexOf(sendStep) > index
                        ? 'bg-green-500' 
                        : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 단계별 콘텐츠 */}
          <div className="flex-1 p-6 bg-gray-50">
            <div className="max-w-4xl mx-auto">
              
              {/* 1단계: 전송할 판매처 선택 */}
              {sendStep === 'vendors' && (
                <div className="space-y-6">
                  <h4 className="text-lg font-semibold text-gray-900">전송할 판매처를 선택하세요</h4>
                  <p className="text-sm text-gray-600">
                    상품을 전송할 판매처를 선택하세요. 각 판매처별로 상품 정보를 다르게 설정할 수 있습니다.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {mockVendors.map((vendor) => {
                      const isSelected = selectedVendorsForSend.includes(vendor.id);
                      
                      return (
                        <div
                          key={vendor.id}
                          onClick={() => {
                            if (isSelected) {
                              setSelectedVendorsForSend(prev => prev.filter(id => id !== vendor.id));
                            } else {
                              setSelectedVendorsForSend(prev => [...prev, vendor.id]);
                            }
                          }}
                          className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${
                            isSelected
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-lg">
                                🤝
                              </div>
                              <div className="ml-3">
                                <h5 className="font-semibold text-gray-900">{vendor.name}</h5>
                                <p className="text-sm text-gray-600">{vendor.representative}</p>
                              </div>
                            </div>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              vendor.status === "active" 
                                ? "bg-green-100 text-green-700" 
                                : "bg-gray-100 text-gray-700"
                            }`}>
                              {vendor.status === "active" ? "활성" : "비활성"}
                            </span>
                          </div>
                          
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">사업자번호:</span>
                              <span className="font-medium">{vendor.businessNumber}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">연락처:</span>
                              <span className="font-medium">{vendor.phone}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">등록일:</span>
                              <span className="font-medium">{vendor.registrationDate}</span>
                            </div>
                          </div>
                          
                          {isSelected && (
                            <div className="mt-3 pt-3 border-t border-blue-200">
                              <div className="text-sm text-blue-600 font-medium">✓ 선택됨</div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 2단계: 상품 정보 맵핑 */}
              {sendStep === 'products' && selectedVendorsForSend.length > 0 && (
                <div className="space-y-6">
                  <h4 className="text-lg font-semibold text-gray-900">상품별 판매처 매핑 및 정보 수정</h4>
                  <p className="text-sm text-gray-600">
                    각 상품이 어떤 판매처로 전송될지 선택하고, 판매처별 상품 정보를 수정하세요.
                  </p>
                  
                  <div className="space-y-4">
                    {productIds.map(productId => {
                      const product = products.find(p => String(p.id) === productId);
                      const mappedVendors = productVendorMapping[productId] || [];
                      
                      return (
                        <div key={productId} className="border border-gray-200 rounded-lg p-4">
                          <div className="mb-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-start">
                                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center text-white text-lg">
                                  📦
                                </div>
                                <div className="ml-3 flex-1">
                                  <h5 className="font-semibold text-gray-900 mb-1">{product?.name}</h5>
                                  <div className="text-sm text-gray-600 space-y-1">
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium">코드:</span>
                                      <span>{product?.code}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium">가격:</span>
                                      <span className="text-blue-600 font-semibold">{formatPrice(product?.selling_price || 0)}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium">재고:</span>
                                      <span className={`font-medium ${(product?.stock || 0) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {product?.stock || 0}개
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium">분류:</span>
                                      <span>{product?.classificationPath?.join(' > ') || '미분류'}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium">상태:</span>
                                      <span className={`px-2 py-1 text-xs rounded-full ${
                                        product?.is_selling ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                      }`}>
                                        {product?.is_selling ? '판매중' : '판매중단'}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="text-sm text-gray-500 bg-gray-50 px-3 py-2 rounded-lg">
                                {mappedVendors.length}개 판매처 선택됨
                              </div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {selectedVendorsForSend.map(vendorId => {
                              const vendor = mockVendors.find(v => v.id === vendorId);
                              const vendorProduct = mockVendorProducts.find(vp => 
                                vp.vendorId === vendorId && vp.productId === productId
                              );
                              const isMapped = mappedVendors.includes(vendorId);
                              
                              return (
                                <div
                                  key={vendorId}
                                  onClick={() => {
                                    if (isMapped) {
                                      setProductVendorMapping(prev => ({
                                        ...prev,
                                        [productId]: prev[productId]?.filter(id => id !== vendorId) || []
                                      }));
                                    } else {
                                      setProductVendorMapping(prev => ({
                                        ...prev,
                                        [productId]: [...(prev[productId] || []), vendorId]
                                      }));
                                    }
                                  }}
                                  className={`p-3 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                                    isMapped
                                      ? 'border-purple-500 bg-purple-50'
                                      : 'border-gray-200 hover:border-gray-300'
                                  }`}
                                >
                                  <div className="flex items-center justify-between mb-2">
                                    <h6 className="font-medium text-gray-900">{vendor?.name}</h6>
                                    {isMapped && (
                                      <span className="text-purple-600 text-sm">✓</span>
                                    )}
                                  </div>
                                  
                                  {vendorProduct ? (
                                    <div className="space-y-1 text-sm">
                                      <div className="text-gray-600">코드: {vendorProduct.vendorProductCode}</div>
                                      <div className="text-gray-600">가격: {formatPrice(vendorProduct.vendorPrice)}</div>
                                      <div className="text-gray-600">재고: {vendorProduct.vendorStock}개</div>
                                      <div className="text-gray-600">카테고리: {vendorProduct.vendorCategory}</div>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleEditVendorProduct(productId, vendorId);
                                        }}
                                        className="mt-2 px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                                      >
                                        정보 수정
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="space-y-2">
                                      <div className="text-sm text-gray-500">신규 등록 예정</div>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleEditVendorProduct(productId, vendorId);
                                        }}
                                        className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                                      >
                                        정보 등록
                                      </button>
                                    </div>
                                  )}
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

              {/* 3단계: 최종 확인 */}
              {sendStep === 'review' && (
                <div className="space-y-6">
                  <h4 className="text-lg font-semibold text-gray-900">전송 정보 최종 확인</h4>
                  
                  {/* 판매처별 전송 요약 */}
                  <div className="space-y-4">
                    <h5 className="font-semibold text-gray-900">판매처별 전송 요약</h5>
                    {selectedVendorsForSend.map(vendorId => {
                      const vendor = mockVendors.find(v => v.id === vendorId);
                      const mappedProducts = productIds.filter(productId => 
                        productVendorMapping[productId]?.includes(vendorId)
                      );
                      
                      return (
                        <div key={vendorId} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h6 className="font-semibold text-gray-900">{vendor?.name}</h6>
                            <span className="px-2 py-1 text-sm bg-green-100 text-green-700 rounded-full">
                              {mappedProducts.length}개 상품 전송
                            </span>
                          </div>
                          
                          <div className="space-y-2">
                            {mappedProducts.map(productId => {
                              const product = products.find(p => String(p.id) === productId);
                              const vendorProduct = mockVendorProducts.find(vp => 
                                vp.vendorId === vendorId && vp.productId === productId
                              );
                              
                              return (
                                <div key={productId} className="bg-gray-50 rounded-lg p-3">
                                  <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1">
                                      <div className="font-medium text-gray-900 mb-1">{product?.name}</div>
                                      <div className="text-sm text-gray-600 space-y-1">
                                        <div className="flex items-center gap-2">
                                          <span className="font-medium">코드:</span>
                                          <span>{product?.code}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <span className="font-medium">분류:</span>
                                          <span>{product?.classificationPath?.join(' > ') || '미분류'}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <span className="font-medium">기본 재고:</span>
                                          <span className={`font-medium ${(product?.stock || 0) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {product?.stock || 0}개
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="text-right ml-4">
                                      <div className="text-lg font-semibold text-blue-600 mb-1">
                                        {vendorProduct ? formatPrice(vendorProduct.vendorPrice) : formatPrice(product?.selling_price || 0)}
                                      </div>
                                      <div className="text-sm text-gray-600">
                                        {vendorProduct ? (
                                          <div className="space-y-1">
                                            <div className="text-green-600 font-medium">
                                              판매처 재고: {vendorProduct.vendorStock}개
                                            </div>
                                            <div className="text-xs text-gray-500">
                                              판매처 코드: {vendorProduct.vendorProductCode}
                                            </div>
                                            {vendorProduct.vendorCategory && (
                                              <div className="text-xs text-gray-500">
                                                카테고리: {vendorProduct.vendorCategory}
                                              </div>
                                            )}
                                          </div>
                                        ) : (
                                          <div className="text-orange-600 font-medium">신규 등록</div>
                                        )}
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
              <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={() => {
                    if (sendStep === 'vendors') {
                      router.push('/products');
                    } else if (sendStep === 'products') {
                      setSendStep('vendors');
                    } else if (sendStep === 'review') {
                      setSendStep('products');
                    }
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  {sendStep === 'vendors' ? '취소' : '이전'}
                </button>
                
                <div className="flex gap-3">
                  {sendStep === 'vendors' && (
                    <button
                      onClick={() => setSendStep('products')}
                      disabled={selectedVendorsForSend.length === 0}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      다음
                    </button>
                  )}
                  
                  {sendStep === 'products' && (
                    <button
                      onClick={() => setSendStep('review')}
                      disabled={Object.keys(productVendorMapping).length === 0}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      다음
                    </button>
                  )}
                  
                  {sendStep === 'review' && (
                    <button
                      onClick={handleExternalSend}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      전송 시작
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

      {/* 판매처별 상품 정보 편집 모달 */}
      {editingProductVendor && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onMouseDown={(e) => { if (e.target === e.currentTarget) { handleCancelVendorProductEdit(); } }}
        >
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  판매처별 상품 정보 {mockVendorProducts.find(vp => 
                    vp.vendorId === editingProductVendor.vendorId && 
                    vp.productId === editingProductVendor.productId
                  ) ? '수정' : '등록'}
                </h3>
                <button
                  onClick={handleCancelVendorProductEdit}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* 상품 정보 표시 */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">상품 정보</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">상품명:</span>
                    <span className="ml-2 font-medium">
                      {products.find(p => String(p.id) === editingProductVendor.productId)?.name}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">상품코드:</span>
                    <span className="ml-2 font-medium">
                      {products.find(p => String(p.id) === editingProductVendor.productId)?.code}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">판매처:</span>
                    <span className="ml-2 font-medium">
                      {mockVendors.find(v => v.id === editingProductVendor.vendorId)?.name}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">기본 가격:</span>
                    <span className="ml-2 font-medium">
                      {formatPrice(products.find(p => String(p.id) === editingProductVendor.productId)?.selling_price || 0)}
                    </span>
                  </div>
                </div>
              </div>

              {/* 판매처별 상품 정보 입력 폼 */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    판매처 상품 코드 *
                  </label>
                  <input
                    type="text"
                    value={vendorProductForm.vendorProductCode}
                    onChange={(e) => setVendorProductForm({...vendorProductForm, vendorProductCode: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="판매처에서 사용할 상품 코드"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      판매처 가격 *
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={vendorProductForm.vendorPrice}
                      onChange={(e) => setVendorProductForm({...vendorProductForm, vendorPrice: Number(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="1"
                    />
                    <p className="text-xs text-gray-500 mt-1">가격은 1원 이상이어야 합니다.</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      판매처 재고 *
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={vendorProductForm.vendorStock}
                      onChange={(e) => setVendorProductForm({...vendorProductForm, vendorStock: Number(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0"
                    />
                    <p className="text-xs text-gray-500 mt-1">재고는 0개 이상 입력 가능합니다.</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    판매처 카테고리
                  </label>
                  <select
                    value={vendorProductForm.vendorCategory}
                    onChange={(e) => setVendorProductForm({...vendorProductForm, vendorCategory: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">카테고리를 선택하세요</option>
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    판매처 상품 설명
                  </label>
                  <textarea
                    value={vendorProductForm.vendorDescription}
                    onChange={(e) => setVendorProductForm({...vendorProductForm, vendorDescription: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="판매처에서 표시할 상품 설명"
                  />
                </div>
              </div>

              {/* 버튼 */}
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={handleCancelVendorProductEdit}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handleSaveVendorProduct}
                  disabled={!vendorProductForm.vendorProductCode || vendorProductForm.vendorPrice <= 0 || vendorProductForm.vendorStock < 0}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  저장
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExternalSendPage;
