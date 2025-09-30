import React, { useState, useEffect } from "react";

// 고정 주소 타입 정의
interface FixedAddress {
  id: string;
  name: string;
  address: string;
  description: string;
  vendorIds: string[]; // 이 주소를 사용하는 판매처들
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

// 판매처 타입 정의
interface Vendor {
  id: string;
  name: string;
  type: string;
  businessNumber: string;
  representative: string;
  phone: string;
  email: string;
  address: string;
  status: "active" | "inactive";
  registrationDate: string;
}

// Mock 데이터
const mockVendors: Vendor[] = [
  {
    id: "V001",
    name: "네이버 스마트스토어",
    type: "판매처",
    businessNumber: "123-45-67890",
    representative: "김철수",
    phone: "02-1234-5678",
    email: "naver@example.com",
    address: "서울시 강남구 테헤란로 123",
    status: "active",
    registrationDate: "2023-01-15",
  },
  {
    id: "V002",
    name: "쿠팡 파트너스",
    type: "판매처",
    businessNumber: "987-65-43210",
    representative: "이영희",
    phone: "031-1111-2222",
    email: "coupang@example.com",
    address: "경기도 성남시 분당구 판교로 100",
    status: "active",
    registrationDate: "2023-02-01",
  },
  {
    id: "V003",
    name: "11번가",
    type: "판매처",
    businessNumber: "111-22-33444",
    representative: "박민수",
    phone: "02-3333-4444",
    email: "11st@example.com",
    address: "서울시 중구 청계천로 100",
    status: "active",
    registrationDate: "2023-03-10",
  },
];

const mockFixedAddresses: FixedAddress[] = [
  {
    id: "FA001",
    name: "본사 창고",
    address: "서울시 강남구 테헤란로 123, 본사 빌딩 지하 1층",
    description: "메인 창고로 모든 판매처의 기본 배송지로 사용됩니다. 대용량 상품 보관 가능.",
    vendorIds: ["V001", "V002"],
    isDefault: true,
    createdAt: "2023-01-01",
    updatedAt: "2023-01-01",
  },
  {
    id: "FA002",
    name: "경기 물류센터",
    address: "경기도 성남시 분당구 판교로 100, 물류센터 A동",
    description: "경기 지역 배송 최적화를 위한 물류센터입니다. 쿠팡 로켓배송 전용.",
    vendorIds: ["V002"],
    isDefault: false,
    createdAt: "2023-02-01",
    updatedAt: "2023-02-01",
  },
  {
    id: "FA003",
    name: "서울 동부 창고",
    address: "서울시 중구 청계천로 100, 동부 물류센터",
    description: "서울 동부 지역 배송을 위한 소규모 창고입니다. 신선식품 보관 시설 완비.",
    vendorIds: ["V003"],
    isDefault: false,
    createdAt: "2023-03-01",
    updatedAt: "2023-03-01",
  },
];

export default function VendorFixedAddressManagementPage() {
  const [fixedAddresses, setFixedAddresses] = useState<FixedAddress[]>(mockFixedAddresses);
  const [vendors] = useState<Vendor[]>(mockVendors);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVendor, setSelectedVendor] = useState<string>("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<FixedAddress | null>(null);
  
  // 새 주소 폼 상태
  const [newAddress, setNewAddress] = useState({
    name: "",
    address: "",
    description: "",
    vendorIds: [] as string[],
    isDefault: false
  });

  // 필터링된 주소 목록 (사용하지 않음 - 이제 선택된 판매처의 주소만 표시)
  const filteredAddresses = fixedAddresses.filter(address => {
    const matchesSearch = searchTerm === "" || 
      address.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      address.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      address.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesVendor = selectedVendor === "" || 
      address.vendorIds.includes(selectedVendor);
    
    return matchesSearch && matchesVendor;
  });

  // 주소 추가
  const handleAddAddress = () => {
    if (!newAddress.name.trim() || !newAddress.address.trim()) {
      alert("주소명과 주소를 입력해주세요.");
      return;
    }
    
    const address: FixedAddress = {
      id: `FA${Date.now()}`,
      ...newAddress,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };
    
    setFixedAddresses(prev => [...prev, address]);
    setNewAddress({
      name: "",
      address: "",
      description: "",
      vendorIds: [],
      isDefault: false
    });
    setShowAddModal(false);
  };

  // 주소 수정
  const handleEditAddress = (address: FixedAddress) => {
    setEditingAddress(address);
    setNewAddress({
      name: address.name,
      address: address.address,
      description: address.description,
      vendorIds: address.vendorIds,
      isDefault: address.isDefault
    });
    setShowAddModal(true);
  };

  // 주소 업데이트
  const handleUpdateAddress = () => {
    if (!newAddress.name.trim() || !newAddress.address.trim()) {
      alert("주소명과 주소를 입력해주세요.");
      return;
    }
    
    setFixedAddresses(prev => prev.map(addr => 
      addr.id === editingAddress?.id 
        ? { ...addr, ...newAddress, updatedAt: new Date().toISOString().split('T')[0] }
        : addr
    ));
    
    setEditingAddress(null);
    setNewAddress({
      name: "",
      address: "",
      description: "",
      vendorIds: [],
      isDefault: false
    });
    setShowAddModal(false);
  };

  // 주소 삭제
  const handleDeleteAddress = (addressId: string) => {
    const address = fixedAddresses.find(addr => addr.id === addressId);
    if (address?.isDefault) {
      alert("기본 주소는 삭제할 수 없습니다.");
      return;
    }
    
    if (window.confirm("이 주소를 삭제하시겠습니까?")) {
      setFixedAddresses(prev => prev.filter(addr => addr.id !== addressId));
    }
  };

  // 판매처 토글
  const toggleVendor = (vendorId: string) => {
    setNewAddress(prev => ({
      ...prev,
      vendorIds: prev.vendorIds.includes(vendorId)
        ? prev.vendorIds.filter(id => id !== vendorId)
        : [...prev.vendorIds, vendorId]
    }));
  };

  // 기본 주소 설정
  const setAsDefault = (addressId: string) => {
    setFixedAddresses(prev => prev.map(addr => ({
      ...addr,
      isDefault: addr.id === addressId,
      updatedAt: addr.id === addressId ? new Date().toISOString().split('T')[0] : addr.updatedAt
    })));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* 헤더 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">판매처별 고정 주소 관리</h1>
        <p className="text-gray-600 mt-1">
          판매처들이 사용할 수 있는 고정 주소를 등록하고 관리합니다. 상품 등록 시 주소 선택에 활용됩니다.
        </p>
      </div>

      <div className="flex gap-6">
        {/* 좌측: 판매처 목록 */}
        <div className="w-80 flex-shrink-0">
          <div className="bg-white rounded-lg border shadow-sm">
            {/* 검색 */}
            <div className="p-4 border-b">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="판매처 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              {searchTerm && (
                <div className="mt-2 text-sm text-gray-500">
                  {vendors.filter(v => 
                    v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    v.representative.toLowerCase().includes(searchTerm.toLowerCase())
                  ).length}개 판매처 검색됨
                </div>
              )}
            </div>

            {/* 판매처 목록 */}
            <div className="max-h-[calc(100vh-280px)] overflow-y-auto">
              {vendors.filter(v => 
                v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                v.representative.toLowerCase().includes(searchTerm.toLowerCase())
              ).map((vendor) => (
                <button
                  key={vendor.id}
                  onClick={() => setSelectedVendor(vendor.id)}
                  className={`w-full text-left p-4 border-b hover:bg-gray-50 transition-all duration-200 group ${
                    selectedVendor === vendor.id
                      ? "bg-blue-50 border-l-4 border-l-blue-500 shadow-sm"
                      : ""
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {vendor.name}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {vendor.representative}
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          vendor.status === "active" 
                            ? "bg-green-100 text-green-700" 
                            : "bg-gray-100 text-gray-700"
                        }`}>
                          {vendor.status === "active" ? "활성" : "비활성"}
                        </span>
                        <span className="text-xs text-gray-500">
                          {fixedAddresses.filter(addr => addr.vendorIds.includes(vendor.id)).length}개 주소
                        </span>
                      </div>
                    </div>
                    {selectedVendor === vendor.id && (
                      <div className="text-blue-500">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 우측: 선택된 판매처의 주소 목록 */}
        <div className="flex-1">
          {selectedVendor ? (
            <>
              {/* 판매처 기본 정보 카드 */}
              <div className="bg-white rounded-lg border shadow-sm p-6 mb-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {vendors.find(v => v.id === selectedVendor)?.name}
                    </h2>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`px-3 py-1 text-sm rounded-full ${
                        vendors.find(v => v.id === selectedVendor)?.status === "active"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-700"
                      }`}>
                        {vendors.find(v => v.id === selectedVendor)?.status === "active" ? "활성" : "비활성"}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setEditingAddress(null);
                      setNewAddress({
                        name: "",
                        address: "",
                        description: "",
                        vendorIds: [selectedVendor],
                        isDefault: false
                      });
                      setShowAddModal(true);
                    }}
                    className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-md"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    주소 추가
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">기본 정보</h3>
                    <div className="space-y-2">
                      <div className="flex">
                        <span className="text-sm text-gray-600 w-24">대표자</span>
                        <span className="text-sm text-gray-900 font-medium">
                          {vendors.find(v => v.id === selectedVendor)?.representative}
                        </span>
                      </div>
                      <div className="flex">
                        <span className="text-sm text-gray-600 w-24">사업자번호</span>
                        <span className="text-sm text-gray-900 font-medium">
                          {vendors.find(v => v.id === selectedVendor)?.businessNumber}
                        </span>
                      </div>
                      <div className="flex">
                        <span className="text-sm text-gray-600 w-24">등록일</span>
                        <span className="text-sm text-gray-900">{vendors.find(v => v.id === selectedVendor)?.registrationDate}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">연락 정보</h3>
                    <div className="space-y-2">
                      <div className="flex">
                        <span className="text-sm text-gray-600 w-24">전화번호</span>
                        <span className="text-sm text-gray-900 font-medium">
                          {vendors.find(v => v.id === selectedVendor)?.phone}
                        </span>
                      </div>
                      <div className="flex">
                        <span className="text-sm text-gray-600 w-24">이메일</span>
                        <span className="text-sm text-gray-900 font-medium">
                          {vendors.find(v => v.id === selectedVendor)?.email}
                        </span>
                      </div>
                      <div className="flex">
                        <span className="text-sm text-gray-600 w-24">주소</span>
                        <span className="text-sm text-gray-900">{vendors.find(v => v.id === selectedVendor)?.address}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 주소 목록 */}
              <div className="bg-white rounded-lg border shadow-sm">
                <div className="p-4 border-b">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">
                      등록된 주소 목록 ({fixedAddresses.filter(addr => addr.vendorIds.includes(selectedVendor)).length}개)
                    </h3>
                  </div>
                </div>

                <div className="divide-y">
                  {fixedAddresses.filter(addr => addr.vendorIds.includes(selectedVendor)).length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-gray-400 text-4xl mb-3">🏢</div>
                      <p className="text-gray-600">등록된 주소가 없습니다.</p>
                      <button
                        onClick={() => {
                          setEditingAddress(null);
                          setNewAddress({
                            name: "",
                            address: "",
                            description: "",
                            vendorIds: [selectedVendor],
                            isDefault: false
                          });
                          setShowAddModal(true);
                        }}
                        className="mt-4 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2 mx-auto"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        주소 등록하기
                      </button>
                    </div>
                  ) : (
                    fixedAddresses.filter(addr => addr.vendorIds.includes(selectedVendor)).map((address) => (
                      <div key={address.id} className="p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-medium text-gray-900">{address.name}</h4>
                              {address.isDefault && (
                                <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">
                                  기본 주소
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-700 mb-2">{address.address}</p>
                            {address.description && (
                              <p className="text-xs text-gray-500">{address.description}</p>
                            )}
                          </div>
                          <div className="ml-4 flex gap-2">
                            {!address.isDefault && (
                              <button
                                onClick={() => setAsDefault(address.id)}
                                className="px-3 py-1.5 text-sm bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                              >
                                기본 설정
                              </button>
                            )}
                            <button
                              onClick={() => handleEditAddress(address)}
                              className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                            >
                              수정
                            </button>
                            <button
                              onClick={() => handleDeleteAddress(address.id)}
                              className="px-3 py-1.5 text-sm text-red-600 border border-red-300 rounded hover:bg-red-50 transition-colors"
                            >
                              삭제
                            </button>
                          </div>
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
                좌측에서 판매처를 선택하면 해당 판매처의 주소를 관리할 수 있습니다.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 주소 등록/수정 모달 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingAddress ? '고정 주소 수정' : '고정 주소 등록'}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                판매처들이 상품 등록 시 선택할 수 있는 주소를 등록합니다.
              </p>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  주소명 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newAddress.name}
                  onChange={(e) => setNewAddress({...newAddress, name: e.target.value})}
                  placeholder="예: 본사 창고, 경기 물류센터"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  주소 <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={newAddress.address}
                  onChange={(e) => setNewAddress({...newAddress, address: e.target.value})}
                  placeholder="상세 주소를 입력하세요"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  설명
                </label>
                <textarea
                  value={newAddress.description}
                  onChange={(e) => setNewAddress({...newAddress, description: e.target.value})}
                  placeholder="이 주소에 대한 설명을 입력하세요 (선택사항)"
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  사용 판매처
                </label>
                <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-300 rounded-lg p-3">
                  {vendors.map(vendor => (
                    <label key={vendor.id} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={newAddress.vendorIds.includes(vendor.id)}
                        onChange={() => toggleVendor(vendor.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">{vendor.name}</span>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  이 주소를 사용할 판매처를 선택하세요.
                </p>
              </div>
              
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={newAddress.isDefault}
                    onChange={(e) => setNewAddress({...newAddress, isDefault: e.target.checked})}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">기본 주소로 설정</span>
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  기본 주소로 설정하면 다른 주소들의 기본 설정이 해제됩니다.
                </p>
              </div>
            </div>
            
            <div className="p-6 border-t flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingAddress(null);
                  setNewAddress({
                    name: "",
                    address: "",
                    description: "",
                    vendorIds: [],
                    isDefault: false
                  });
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
              <button
                onClick={editingAddress ? handleUpdateAddress : handleAddAddress}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                {editingAddress ? '수정' : '등록'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}