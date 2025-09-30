import React, { useState, useEffect } from "react";

// Mock 데이터
const mockVendors = [
  {
    id: "V001",
    name: "네이버 스마트스토어",
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
  category: 'basic' | 'payment' | 'shipping' | 'template' | 'custom';
  key: string;
  value: string;
  description?: string;
  isRequired: boolean;
  mappingField?: string; // 상품 외부 송신 시 매핑할 필드
}

// 판매처별 부가 정보 Mock 데이터
const mockExtraInfo: VendorExtraInfo[] = [
  // 네이버 스마트스토어
  {
    id: "EI001",
    vendorId: "V001",
    category: 'basic',
    key: "판매자 ID",
    value: "naver_seller_123",
    description: "네이버 스마트스토어 판매자 식별자",
    isRequired: true,
    mappingField: "seller_id"
  },
  {
    id: "EI002",
    vendorId: "V001",
    category: 'payment',
    key: "정산 주기",
    value: "월 2회 (15일, 말일)",
    description: "정산 받는 주기",
    isRequired: true,
    mappingField: "settlement_period"
  },
  {
    id: "EI003",
    vendorId: "V001",
    category: 'payment',
    key: "수수료율",
    value: "12%",
    description: "판매 수수료 비율",
    isRequired: true,
    mappingField: "commission_rate"
  },
  {
    id: "EI004",
    vendorId: "V001",
    category: 'shipping',
    key: "배송비 템플릿 ID",
    value: "TPL-NAVER-001",
    description: "배송비 계산 템플릿",
    isRequired: false,
    mappingField: "shipping_template_id"
  },
  {
    id: "EI005",
    vendorId: "V001",
    category: 'basic',
    key: "고객센터 번호",
    value: "1588-1234",
    description: "고객 문의 전화번호",
    isRequired: false,
    mappingField: "customer_service_phone"
  },
  
  // 쿠팡 파트너스
  {
    id: "EI006",
    vendorId: "V002",
    category: 'basic',
    key: "판매자 ID",
    value: "coupang_seller_456",
    description: "쿠팡 파트너스 판매자 식별자",
    isRequired: true,
    mappingField: "seller_id"
  },
  {
    id: "EI007",
    vendorId: "V002",
    category: 'payment',
    key: "정산 주기",
    value: "주 1회 (매주 금요일)",
    description: "정산 받는 주기",
    isRequired: true,
    mappingField: "settlement_period"
  },
  {
    id: "EI008",
    vendorId: "V002",
    category: 'payment',
    key: "수수료율",
    value: "15%",
    description: "판매 수수료 비율",
    isRequired: true,
    mappingField: "commission_rate"
  },
  {
    id: "EI009",
    vendorId: "V002",
    category: 'shipping',
    key: "로켓배송 사용",
    value: "사용함",
    description: "쿠팡 로켓배송 서비스 사용 여부",
    isRequired: false,
    mappingField: "rocket_delivery_enabled"
  },
  {
    id: "EI010",
    vendorId: "V002",
    category: 'shipping',
    key: "반품배송비",
    value: "5,000원",
    description: "반품 시 고객 부담 배송비",
    isRequired: false,
    mappingField: "return_shipping_fee"
  },
  
  // 11번가
  {
    id: "EI011",
    vendorId: "V003",
    category: 'basic',
    key: "판매자 ID",
    value: "11st_seller_789",
    description: "11번가 판매자 식별자",
    isRequired: true,
    mappingField: "seller_id"
  },
  {
    id: "EI012",
    vendorId: "V003",
    category: 'payment',
    key: "정산 주기",
    value: "월 1회 (말일)",
    description: "정산 받는 주기",
    isRequired: true,
    mappingField: "settlement_period"
  },
  {
    id: "EI013",
    vendorId: "V003",
    category: 'payment',
    key: "수수료율",
    value: "10%",
    description: "판매 수수료 비율",
    isRequired: true,
    mappingField: "commission_rate"
  }
];

// 카테고리별 색상 및 아이콘
const categoryConfig = {
  basic: { label: '기본 정보', color: 'blue', icon: '🏢' },
  payment: { label: '결제/정산', color: 'green', icon: '💰' },
  shipping: { label: '배송', color: 'purple', icon: '🚚' },
  template: { label: '템플릿', color: 'orange', icon: '📋' },
  custom: { label: '사용자 정의', color: 'gray', icon: '⚙️' }
};

// 판매처 정보 카드 컴포넌트
function VendorInfoCard({ vendor, onEdit }: any) {
  return (
    <div className="bg-white rounded-lg border shadow-sm p-6 mb-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{vendor.name}</h2>
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
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  
  // 새 정보 추가 폼 상태
  const [newInfo, setNewInfo] = useState({
    category: 'basic' as VendorExtraInfo['category'],
    key: '',
    value: '',
    description: '',
    isRequired: false,
    mappingField: ''
  });

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
    const matchesSearch = searchTerm === "" || 
      info.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
      info.value.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || info.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // 카테고리별 그룹화
  const groupedInfo = filteredExtraInfo.reduce((acc, info) => {
    if (!acc[info.category]) {
      acc[info.category] = [];
    }
    acc[info.category].push(info);
    return acc;
  }, {} as Record<string, VendorExtraInfo[]>);

  const handleAddInfo = () => {
    if (!newInfo.key.trim() || !newInfo.value.trim()) {
      alert("항목명과 값을 입력해주세요.");
      return;
    }
    
    const newExtraInfo: VendorExtraInfo = {
      id: `EI${Date.now()}`,
      vendorId: selectedVendor.id,
      ...newInfo
    };
    
    setExtraInfoList(prev => [...prev, newExtraInfo]);
    setNewInfo({
      category: 'basic',
      key: '',
      value: '',
      description: '',
      isRequired: false,
      mappingField: ''
    });
    setShowAddModal(false);
  };

  const handleEditInfo = (info: VendorExtraInfo) => {
    setEditingInfo(info);
    setNewInfo({
      category: info.category,
      key: info.key,
      value: info.value,
      description: info.description || '',
      isRequired: info.isRequired,
      mappingField: info.mappingField || ''
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
        ? { ...info, ...newInfo }
        : info
    ));
    
    setEditingInfo(null);
    setNewInfo({
      category: 'basic',
      key: '',
      value: '',
      description: '',
      isRequired: false,
      mappingField: ''
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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* 헤더 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">판매처별 부가 정보 관리</h1>
        <p className="text-gray-600 mt-1">
          판매처별로 추가 정보(정산 주기, 수수료, 템플릿 ID 등)를 관리합니다.
        </p>
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
                          category: 'basic',
                          key: '',
                          value: '',
                          description: '',
                          isRequired: false,
                          mappingField: ''
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
                    <div className="relative">
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                      >
                        <option value="all">전체 카테고리</option>
                        {Object.entries(categoryConfig).map(([key, config]) => (
                          <option key={key} value={key}>
                            {config.icon} {config.label}
                          </option>
                        ))}
                      </select>
                      <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* 부가 정보 목록 */}
                <div className="divide-y">
                  {filteredExtraInfo.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-gray-400 text-4xl mb-3">📋</div>
                      <p className="text-gray-600 mb-2">
                        {searchTerm || selectedCategory !== "all" 
                          ? "검색 조건에 맞는 부가 정보가 없습니다." 
                          : "등록된 부가 정보가 없습니다."
                        }
                      </p>
                      <button
                        onClick={() => {
                          setEditingInfo(null);
                          setNewInfo({
                            category: 'basic',
                            key: '',
                            value: '',
                            description: '',
                            isRequired: false,
                            mappingField: ''
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
                    Object.entries(groupedInfo).map(([category, infos]) => (
                      <div key={category} className="p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-lg">{categoryConfig[category as keyof typeof categoryConfig].icon}</span>
                          <h4 className="font-semibold text-gray-900">
                            {categoryConfig[category as keyof typeof categoryConfig].label}
                          </h4>
                          <span className="text-sm text-gray-500">({infos.length}개)</span>
                        </div>
                        <div className="space-y-3">
                          {infos.map((info) => (
                            <div
                              key={info.id}
                              className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className="font-medium text-gray-900">{info.key}</span>
                                    {info.isRequired && (
                                      <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded-full">
                                        필수
                                      </span>
                                    )}
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
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-lg border shadow-sm p-12 text-center">
              <div className="text-gray-400 text-4xl mb-3">🏪</div>
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    카테고리 <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newInfo.category}
                    onChange={(e) => setNewInfo({...newInfo, category: e.target.value as VendorExtraInfo['category']})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {Object.entries(categoryConfig).map(([key, config]) => (
                      <option key={key} value={key}>
                        {config.icon} {config.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    필수 여부
                  </label>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newInfo.isRequired}
                      onChange={(e) => setNewInfo({...newInfo, isRequired: e.target.checked})}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">필수 항목</span>
                  </div>
                </div>
              </div>
              
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
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  매핑 필드명
                </label>
                <input
                  type="text"
                  value={newInfo.mappingField}
                  onChange={(e) => setNewInfo({...newInfo, mappingField: e.target.value})}
                  placeholder="예: seller_id, commission_rate (상품 외부 송신 시 사용)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  상품을 외부 플랫폼으로 송신할 때 사용할 필드명을 입력하세요.
                </p>
              </div>
            </div>
            
            <div className="p-6 border-t flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingInfo(null);
                  setNewInfo({
                    category: 'basic',
                    key: '',
                    value: '',
                    description: '',
                    isRequired: false,
                    mappingField: ''
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
    </div>
  );
}