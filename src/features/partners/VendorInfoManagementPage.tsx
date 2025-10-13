import React, { useState, useEffect } from "react";

// Mock 데이터
const mockVendors = [
  {
    id: "V001",
    name: "네이버 스마트스토어",
    platform: "네이버 스마트스토어",
    type: "판매처" as const,
    businessNumber: "123-45-67890",
    representative: "김철수",
    phone: "02-1234-5678",
    email: "naver@example.com",
    address: "서울시 강남구 테헤란로 123",
    status: "active" as const,
    registrationDate: "2023-01-15",
    apiKey: "naver_api_key_1234",
    lastLoginDate: "2025-09-30",
  },
  {
    id: "V002",
    name: "쿠팡 파트너스",
    platform: "쿠팡",
    type: "판매처" as const,
    businessNumber: "987-65-43210",
    representative: "이영희",
    phone: "031-1111-2222",
    email: "coupang@example.com",
    address: "경기도 성남시 분당구 판교로 100",
    status: "active" as const,
    registrationDate: "2023-02-01",
    apiKey: "coupang_api_key_5678",
    lastLoginDate: "2025-09-29",
  },
  {
    id: "V003",
    name: "11번가",
    platform: "11번가",
    type: "판매처" as const,
    businessNumber: "111-22-33444",
    representative: "박민수",
    phone: "02-3333-4444",
    email: "11st@example.com",
    address: "서울시 중구 청계천로 100",
    status: "active" as const,
    registrationDate: "2023-03-10",
  },
];

// 판매처별 부가 정보 타입 정의
interface VendorExtraInfo {
  id: string;
  vendorId: string;
  key: string;
  value: string;
  description?: string;
  mappingField?: string; // 상품 외부 송신 시 매핑할 필드
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
  
  // 쿠팡 파트너스
  {
    id: "EI006",
    vendorId: "V002",
    key: "판매자 ID",
    value: "coupang_seller_456",
    description: "쿠팡 파트너스 판매자 식별자",
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


// 판매처 정보 카드 컴포넌트
function VendorInfoCard({ vendor, onEdit }: any) {
  return (
    <div className="bg-white rounded-lg border shadow-sm p-6 mb-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-gray-900">{vendor.name}</h2>
            {vendor.platform && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
                {vendor.platform}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span
              className={`px-3 py-1 text-sm rounded-full ${
                vendor.status === "active"
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {vendor.status === "active" ? "활성" : "비활성"}
            </span>
            {vendor.apiKey && (
              <span className="px-3 py-1 text-sm rounded-full bg-blue-100 text-blue-700">
                API 연동됨
              </span>
            )}
          </div>
        </div>
        {onEdit && (
          <button
            onClick={onEdit}
            className="px-4 py-2 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            정보 수정
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">기본 정보</h3>
          <div className="space-y-2">
            <div className="flex">
              <span className="text-sm text-gray-600 w-24">대표자</span>
              <span className="text-sm text-gray-900 font-medium">
                {vendor.representative}
              </span>
            </div>
            <div className="flex">
              <span className="text-sm text-gray-600 w-24">사업자번호</span>
              <span className="text-sm text-gray-900 font-medium">
                {vendor.businessNumber}
              </span>
            </div>
            <div className="flex">
              <span className="text-sm text-gray-600 w-24">등록일</span>
              <span className="text-sm text-gray-900">{vendor.registrationDate}</span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">연락 정보</h3>
          <div className="space-y-2">
            <div className="flex">
              <span className="text-sm text-gray-600 w-24">전화번호</span>
              <span className="text-sm text-gray-900 font-medium">
                {vendor.phone}
              </span>
            </div>
            <div className="flex">
              <span className="text-sm text-gray-600 w-24">이메일</span>
              <span className="text-sm text-gray-900 font-medium">
                {vendor.email}
              </span>
            </div>
            <div className="flex">
              <span className="text-sm text-gray-600 w-24">주소</span>
              <span className="text-sm text-gray-900">{vendor.address}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VendorExtraInfoPage() {
  const [vendors] = useState(mockVendors);
  const [selectedVendor, setSelectedVendor] = useState<any>(null);
  const [extraInfoList, setExtraInfoList] = useState<VendorExtraInfo[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingInfo, setEditingInfo] = useState<VendorExtraInfo | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showMappingModal, setShowMappingModal] = useState(false);
  
  // 새 정보 추가 폼 상태
  const [newInfo, setNewInfo] = useState({
    key: '',
    value: '',
    description: ''
  });

  // 매핑 템플릿 정의
  const mappingTemplates = {
    '네이버 스마트스토어': [
      { key: '판매자 ID', mappingField: 'seller_id' },
      { key: '정산 주기', mappingField: 'settlement_period' },
      { key: '수수료율', mappingField: 'commission_rate' },
      { key: '배송비 템플릿', mappingField: 'shipping_template' },
      { key: '상품 카테고리', mappingField: 'product_category' },
      { key: '브랜드', mappingField: 'brand' },
      { key: '모델명', mappingField: 'model_name' },
      { key: '원산지', mappingField: 'origin_country' },
      { key: '제조사', mappingField: 'manufacturer' },
      { key: 'AS 책임자', mappingField: 'as_responsible' }
    ],
    '쿠팡 파트너스': [
      { key: '파트너 ID', mappingField: 'partner_id' },
      { key: '정산 주기', mappingField: 'settlement_cycle' },
      { key: '수수료율', mappingField: 'commission_rate' },
      { key: '로켓배송 여부', mappingField: 'rocket_delivery' },
      { key: '상품 분류', mappingField: 'product_classification' },
      { key: '브랜드명', mappingField: 'brand_name' },
      { key: '모델번호', mappingField: 'model_number' },
      { key: '제조국', mappingField: 'manufacturing_country' },
      { key: '제조업체', mappingField: 'manufacturer' },
      { key: 'A/S 연락처', mappingField: 'as_contact' }
    ],
    '11번가': [
      { key: '판매자 코드', mappingField: 'seller_code' },
      { key: '정산 주기', mappingField: 'settlement_period' },
      { key: '수수료율', mappingField: 'commission_rate' },
      { key: '배송 방법', mappingField: 'delivery_method' },
      { key: '상품 카테고리', mappingField: 'product_category' },
      { key: '브랜드', mappingField: 'brand' },
      { key: '모델명', mappingField: 'model_name' },
      { key: '원산지', mappingField: 'origin' },
      { key: '제조사', mappingField: 'manufacturer' },
      { key: '고객센터', mappingField: 'customer_service' }
    ]
  };

  // 자동 매칭 함수
  const autoMatchFields = () => {
    if (!selectedVendor) return;
    
    const template = mappingTemplates[selectedVendor.name as keyof typeof mappingTemplates];
    if (!template) return;

    const newMappings = template.map(item => ({
      id: `EI${Date.now()}_${Math.random()}`,
      vendorId: selectedVendor.id,
      key: item.key,
      value: '', // 사용자가 입력할 값
      description: `${item.key} 필드 매핑`,
      mappingField: item.mappingField
    }));

    setExtraInfoList(prev => [...prev, ...newMappings]);
    setShowTemplateModal(false);
  };

  useEffect(() => {
    if (vendors.length > 0 && !selectedVendor) {
      setSelectedVendor(vendors[0]);
    }
  }, [vendors]);

  useEffect(() => {
    if (selectedVendor) {
      const vendorInfo = mockExtraInfo.filter(info => info.vendorId === selectedVendor.id);
      setExtraInfoList(vendorInfo);
      setIsEditing(false);
    }
  }, [selectedVendor]);

  // 필터링된 부가 정보
  const filteredExtraInfo = extraInfoList.filter(info => {
    return searchTerm === "" || 
      info.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
      info.value.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleAddInfo = () => {
    if (!newInfo.key.trim() || !newInfo.value.trim()) {
      alert("항목명과 값을 입력해주세요.");
      return;
    }
    
    const newExtraInfo: VendorExtraInfo = {
      id: `EI${Date.now()}`,
      vendorId: selectedVendor.id,
      key: newInfo.key.trim(),
      value: newInfo.value.trim(),
      description: newInfo.description.trim(),
      mappingField: ''
    };
    
    setExtraInfoList(prev => [...prev, newExtraInfo]);
    setNewInfo({
      key: '',
      value: '',
      description: ''
    });
    setShowAddModal(false);
  };

  const handleEditInfo = (info: VendorExtraInfo) => {
    setEditingInfo(info);
    setNewInfo({
      key: info.key,
      value: info.value,
      description: info.description || ''
    });
    setShowAddModal(true);
  };

  const handleUpdateInfo = () => {
    if (!newInfo.key.trim() || !newInfo.value.trim()) {
      alert("항목명과 값을 입력해주세요.");
      return;
    }
    
    setExtraInfoList(prev => prev.map(info => 
      info.id === editingInfo?.id 
        ? { 
            ...info, 
            key: newInfo.key.trim(),
            value: newInfo.value.trim(),
            description: newInfo.description.trim()
          }
        : info
    ));
    
    setEditingInfo(null);
    setNewInfo({
      key: '',
      value: '',
      description: ''
    });
    setShowAddModal(false);
  };

  const handleDeleteInfo = (infoId: string) => {
    if (window.confirm("이 항목을 삭제하시겠습니까?")) {
      setExtraInfoList(prev => prev.filter(info => info.id !== infoId));
    }
  };

  const handleSave = () => {
    alert("부가 정보가 저장되었습니다.");
    setIsEditing(false);
    // 실제로는 여기서 API 호출
  };


  // 매핑 필드 자동 완성
  const getMappingSuggestions = (key: string) => {
    const suggestions = [
      'seller_id', 'partner_id', 'commission_rate', 'settlement_period',
      'shipping_template', 'product_category', 'brand', 'model_name',
      'manufacturer', 'origin_country', 'as_contact', 'customer_service'
    ];
    
    return suggestions.filter(suggestion => 
      suggestion.toLowerCase().includes(key.toLowerCase()) ||
      key.toLowerCase().includes(suggestion.toLowerCase())
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* 헤더 */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">판매처별 부가 정보 관리</h1>
            <p className="text-gray-600 mt-1">
              각 판매처별로 필요한 부가 정보를 등록하고 관리합니다. 상품 등록 시 외부 송신에 활용됩니다.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowTemplateModal(true)}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-md"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              템플릿 적용
            </button>
            <button
              onClick={() => setShowMappingModal(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-md"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              매핑 시각화
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-6">
        {/* 좌측: 판매처 목록 */}
        <div className="w-80 flex-shrink-0">
          <div className="bg-white rounded-lg border shadow-sm">
            <div className="p-4 border-b">
              <input
                type="text"
                placeholder="판매처 검색..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="max-h-[calc(100vh-280px)] overflow-y-auto">
              {vendors.map((vendor) => (
                <button
                  key={vendor.id}
                  onClick={() => setSelectedVendor(vendor)}
                  className={`w-full text-left p-4 border-b hover:bg-gray-50 transition-colors ${
                    selectedVendor?.id === vendor.id
                      ? "bg-blue-50 border-l-4 border-l-blue-500"
                      : ""
                  }`}
                >
                  <div className="font-semibold text-gray-900">{vendor.name}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    {vendor.representative}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {mockExtraInfo.filter(info => info.vendorId === vendor.id).length}개 부가 정보
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 우측: 판매처 정보 및 부가 정보 */}
        <div className="flex-1">
          {selectedVendor ? (
            <>
              {/* 판매처 기본 정보 */}
              <VendorInfoCard
                vendor={selectedVendor}
                onEdit={() => alert("판매처 정보 수정")}
              />

              {/* 부가 정보 */}
              <div className="bg-white rounded-lg border shadow-sm">
                <div className="p-4 border-b">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">
                      부가 정보 ({extraInfoList.length}개)
                    </h3>
                    <button
                      onClick={() => {
                        setEditingInfo(null);
                        setNewInfo({
                          key: '',
                          value: '',
                          description: ''
                        });
                        setShowAddModal(true);
                      }}
                      className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-md"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      부가 정보 추가
                    </button>
                  </div>
                  
                  {/* 검색 및 필터 */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <div className="relative flex-1">
                      <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <input
                        type="text"
                        placeholder="부가 정보 검색..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* 부가 정보 목록 */}
                <div className="divide-y">
                  {filteredExtraInfo.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-gray-600 mb-2">
                        {searchTerm 
                          ? "검색 조건에 맞는 부가 정보가 없습니다" 
                          : "아직 등록된 부가 정보가 없습니다"
                        }
                      </p>
                      <button
                        onClick={() => {
                          setEditingInfo(null);
                          setNewInfo({
                            key: '',
                            value: '',
                            description: ''
                          });
                          setShowAddModal(true);
                        }}
                        className="mt-4 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2 mx-auto"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        부가 정보 추가하기
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredExtraInfo.map((info) => (
                        <div
                          key={info.id}
                          className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="font-medium text-gray-900">{info.key}</span>
                                {info.mappingField && (
                                  <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
                                    매핑: {info.mappingField}
                                  </span>
                                )}
                              </div>
                              <div className="text-sm text-gray-700 mb-2">{info.value}</div>
                              {info.description && (
                                <div className="text-xs text-gray-500">{info.description}</div>
                              )}
                            </div>
                            <div className="ml-4 flex gap-2">
                              <button
                                onClick={() => handleEditInfo(info)}
                                className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                              >
                                수정
                              </button>
                              <button
                                onClick={() => handleDeleteInfo(info.id)}
                                className="px-3 py-1.5 text-sm text-red-600 border border-red-300 rounded hover:bg-red-50 transition-colors"
                              >
                                삭제
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
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
                좌측에서 판매처를 선택하면 부가 정보를 관리할 수 있습니다.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 부가 정보 추가/수정 모달 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 animate-scale-in">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingInfo ? '부가 정보 수정' : '부가 정보 추가'}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                상품 외부 송신 시 사용할 매핑 정보를 설정할 수 있습니다.
              </p>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  항목명 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newInfo.key}
                  onChange={(e) => setNewInfo({...newInfo, key: e.target.value})}
                  placeholder="예: 판매자 ID, 정산 주기"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  값 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newInfo.value}
                  onChange={(e) => setNewInfo({...newInfo, value: e.target.value})}
                  placeholder="예: naver_seller_123, 월 2회"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  설명
                </label>
                <textarea
                  value={newInfo.description}
                  onChange={(e) => setNewInfo({...newInfo, description: e.target.value})}
                  placeholder="이 항목에 대한 설명을 입력하세요"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="p-6 border-t flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingInfo(null);
                  setNewInfo({
                    key: '',
                    value: '',
                    description: ''
                  });
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
              <button
                onClick={editingInfo ? handleUpdateInfo : handleAddInfo}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                {editingInfo ? '수정' : '추가'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 템플릿 적용 모달 */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">매핑 템플릿 적용</h3>
              <p className="text-sm text-gray-600 mt-1">
                {selectedVendor?.name}에 대한 표준 매핑 템플릿을 적용합니다.
              </p>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">적용될 템플릿 항목들</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {mappingTemplates[selectedVendor?.name as keyof typeof mappingTemplates]?.map((item, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <span className="text-blue-700">•</span>
                        <span className="text-blue-800">{item.key}</span>
                        <span className="text-blue-600">({item.mappingField})</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <div>
                      <p className="text-yellow-800 font-medium">주의사항</p>
                      <p className="text-yellow-700 text-sm mt-1">
                        기존 항목과 중복되는 경우 덮어쓰기됩니다. 각 항목의 값은 수동으로 입력해야 합니다.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t flex justify-end gap-3">
              <button
                onClick={() => setShowTemplateModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
              <button
                onClick={autoMatchFields}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                템플릿 적용
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 매핑 시각화 모달 */}
      {showMappingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">매핑 시각화</h3>
              <p className="text-sm text-gray-600 mt-1">
                {selectedVendor?.name}의 부가정보 매핑 현황을 시각화합니다.
              </p>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 매핑된 항목들 */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4">매핑된 항목들</h4>
                  <div className="space-y-2">
                    {extraInfoList.filter(info => info.mappingField).map((info) => (
                      <div key={info.id} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div>
                          <span className="font-medium text-green-800">{info.key}</span>
                          <span className="text-green-600 ml-2">→ {info.mappingField}</span>
                        </div>
                        <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                          매핑됨
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 매핑되지 않은 항목들 */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4">매핑되지 않은 항목들</h4>
                  <div className="space-y-2">
                    {extraInfoList.filter(info => !info.mappingField).map((info) => (
                      <div key={info.id} className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div>
                          <span className="font-medium text-yellow-800">{info.key}</span>
                          <span className="text-yellow-600 ml-2">매핑 필요</span>
                        </div>
                        <button
                          onClick={() => {
                            const suggestions = getMappingSuggestions(info.key);
                            if (suggestions.length > 0) {
                              setExtraInfoList(prev => prev.map(item => 
                                item.id === info.id 
                                  ? { ...item, mappingField: suggestions[0] }
                                  : item
                              ));
                            }
                          }}
                          className="text-xs text-yellow-600 bg-yellow-100 px-2 py-1 rounded hover:bg-yellow-200"
                        >
                          자동 매핑
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 매핑 통계 */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-3">매핑 통계</h4>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{extraInfoList.length}</div>
                    <div className="text-sm text-gray-600">전체 항목</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {extraInfoList.filter(info => info.mappingField).length}
                    </div>
                    <div className="text-sm text-gray-600">매핑 완료</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-yellow-600">
                      {extraInfoList.filter(info => !info.mappingField).length}
                    </div>
                    <div className="text-sm text-gray-600">매핑 필요</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t flex justify-end gap-3">
              <button
                onClick={() => setShowMappingModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}