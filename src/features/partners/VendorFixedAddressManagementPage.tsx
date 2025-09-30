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
];

const mockAddresses = [
  {
    id: "FA001",
    vendorId: "V001",
    addressType: "발송지" as const,
    name: "김발송",
    phone: "02-1234-5678",
    zipcode: "06292",
    address: "서울시 강남구 테헤란로 123",
    addressDetail: "삼성동 빌딩 5층",
    isDefault: true,
    status: "active" as const,
  },
  {
    id: "FA002",
    vendorId: "V001",
    addressType: "반송지" as const,
    name: "이반송",
    phone: "02-2222-3333",
    zipcode: "06293",
    address: "서울시 강남구 테헤란로 124",
    addressDetail: "2층",
    isDefault: false,
    status: "active" as const,
  },
  {
    id: "FA003",
    vendorId: "V002",
    addressType: "발송지" as const,
    name: "박발송",
    phone: "031-1111-2222",
    zipcode: "13494",
    address: "경기도 성남시 분당구 판교로 100",
    addressDetail: "판교 물류센터 A동",
    isDefault: true,
    status: "active" as const,
  },
];

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

export default function VendorFixedAddressesPage() {
  const [vendors] = useState(mockVendors);
  const [selectedVendor, setSelectedVendor] = useState<any>(null);
  const [addresses] = useState(mockAddresses);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");

  useEffect(() => {
    if (vendors.length > 0 && !selectedVendor) {
      setSelectedVendor(vendors[0]);
    }
  }, [vendors]);

  const filteredAddresses = addresses.filter((addr) => {
    if (!selectedVendor) return false;
    const matchesVendor = addr.vendorId === selectedVendor.id;
    const matchesType = selectedType === "all" || addr.addressType === selectedType;
    const matchesSearch =
      addr.name.includes(searchTerm) || addr.address.includes(searchTerm);
    return matchesVendor && matchesType && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* 헤더 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">판매처별 고정주소 관리</h1>
        <p className="text-gray-600 mt-1">
          판매처별로 발송지, 반송지, 교환지 등 고정주소를 관리합니다.
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
                    {addresses.filter((a) => a.vendorId === vendor.id).length}개 주소
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 우측: 판매처 정보 및 주소 목록 */}
        <div className="flex-1">
          {selectedVendor ? (
            <>
              {/* 판매처 기본 정보 */}
              <VendorInfoCard
                vendor={selectedVendor}
                onEdit={() => alert("판매처 정보 수정")}
              />

              {/* 주소 목록 */}
              <div className="bg-white rounded-lg border shadow-sm">
                <div className="p-4 border-b flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">
                    고정주소 목록 ({filteredAddresses.length}개)
                  </h3>
                  <div className="flex items-center gap-3">
                    <select
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value)}
                      className="px-3 py-1.5 text-sm border border-gray-300 rounded"
                    >
                      <option value="all">전체 유형</option>
                      <option value="발송지">발송지</option>
                      <option value="반송지">반송지</option>
                      <option value="교환지">교환지</option>
                    </select>
                    <button className="px-3 py-1.5 text-sm bg-green-500 text-white rounded hover:bg-green-600">
                      + 주소 추가
                    </button>
                  </div>
                </div>

                <div className="divide-y">
                  {filteredAddresses.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-gray-400 text-4xl mb-3">📍</div>
                      <p className="text-gray-600">등록된 고정주소가 없습니다.</p>
                      <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                        주소 추가하기
                      </button>
                    </div>
                  ) : (
                    filteredAddresses.map((address) => (
                      <div
                        key={address.id}
                        className="p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span
                                className={`px-2 py-1 text-xs rounded ${
                                  address.addressType === "발송지"
                                    ? "bg-blue-100 text-blue-700"
                                    : address.addressType === "반송지"
                                    ? "bg-red-100 text-red-700"
                                    : "bg-green-100 text-green-700"
                                }`}
                              >
                                {address.addressType}
                              </span>
                              {address.isDefault && (
                                <span className="px-2 py-1 text-xs rounded bg-yellow-100 text-yellow-700">
                                  기본 주소
                                </span>
                              )}
                            </div>
                            <div className="font-medium text-gray-900">
                              {address.name}
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                              {address.phone}
                            </div>
                            <div className="text-sm text-gray-600 mt-2">
                              ({address.zipcode}) {address.address}
                              {address.addressDetail && `, ${address.addressDetail}`}
                            </div>
                          </div>
                          <div className="ml-4 flex flex-col gap-2">
                            <button className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50">
                              수정
                            </button>
                            {!address.isDefault && (
                              <button className="px-3 py-1.5 text-sm text-green-600 border border-green-300 rounded hover:bg-green-50">
                                기본설정
                              </button>
                            )}
                            <button className="px-3 py-1.5 text-sm text-red-600 border border-red-300 rounded hover:bg-red-50">
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
                좌측에서 판매처를 선택하면 고정주소 목록을 확인할 수 있습니다.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}