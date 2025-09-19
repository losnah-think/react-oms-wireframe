import React, { useState } from "react";
import { Container } from "../../design-system";

interface VendorFixedAddress {
  id: string;
  vendorId: string;
  vendorName: string;
  addressType: "발송지" | "반송지" | "교환지";
  name: string;
  phone: string;
  zipcode: string;
  address: string;
  addressDetail: string;
  isDefault: boolean;
  status: "active" | "inactive";
  registrationDate: string;
}

const VendorFixedAddressManagementPage: React.FC = () => {
  const [selectedVendor, setSelectedVendor] = useState("all");
  const [selectedAddressType, setSelectedAddressType] = useState<
    "all" | "발송지" | "반송지" | "교환지"
  >("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAddress, setSelectedAddress] =
    useState<VendorFixedAddress | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const mockVendors = [
    { id: "V001", name: "네이버 스마트스토어" },
    { id: "V002", name: "쿠팡 파트너스" },
    { id: "V003", name: "11번가" },
    { id: "V004", name: "G마켓" },
  ];

  const mockFixedAddresses: VendorFixedAddress[] = [
    {
      id: "FA001",
      vendorId: "V001",
      vendorName: "네이버 스마트스토어",
      addressType: "발송지",
      name: "김발송",
      phone: "02-1234-5678",
      zipcode: "06292",
      address: "서울시 강남구 테헤란로 123",
      addressDetail: "삼성동 빌딩 5층",
      isDefault: true,
      status: "active",
      registrationDate: "2024-01-15",
    },
    {
      id: "FA002",
      vendorId: "V001",
      vendorName: "네이버 스마트스토어",
      addressType: "반송지",
      name: "이반송",
      phone: "02-9876-5432",
      zipcode: "06293",
      address: "서울시 강남구 역삼로 456",
      addressDetail: "역삼동 물류센터 2층",
      isDefault: false,
      status: "active",
      registrationDate: "2024-01-20",
    },
    {
      id: "FA003",
      vendorId: "V002",
      vendorName: "쿠팡 파트너스",
      addressType: "발송지",
      name: "박쿠팡",
      phone: "031-2222-3333",
      zipcode: "13494",
      address: "경기도 성남시 분당구 판교로 100",
      addressDetail: "판교 물류센터 A동",
      isDefault: true,
      status: "active",
      registrationDate: "2024-02-01",
    },
    {
      id: "FA004",
      vendorId: "V002",
      vendorName: "쿠팡 파트너스",
      addressType: "교환지",
      name: "최교환",
      phone: "031-4444-5555",
      zipcode: "13495",
      address: "경기도 성남시 분당구 대왕판교로 200",
      addressDetail: "교환센터 1층",
      isDefault: false,
      status: "active",
      registrationDate: "2024-02-05",
    },
    {
      id: "FA005",
      vendorId: "V003",
      vendorName: "11번가",
      addressType: "발송지",
      name: "정일일",
      phone: "02-7777-8888",
      zipcode: "07327",
      address: "서울시 영등포구 여의대로 108",
      addressDetail: "SKT타워 10층",
      isDefault: true,
      status: "inactive",
      registrationDate: "2024-01-30",
    },
  ];

  const filteredAddresses = mockFixedAddresses.filter((address) => {
    const matchesVendor =
      selectedVendor === "all" || address.vendorId === selectedVendor;
    const matchesType =
      selectedAddressType === "all" ||
      address.addressType === selectedAddressType;
    const matchesSearch =
      address.name.includes(searchTerm) ||
      address.address.includes(searchTerm) ||
      address.vendorName.includes(searchTerm);
    return matchesVendor && matchesType && matchesSearch;
  });

  const handleAddAddress = () => {
    setSelectedAddress(null);
    setIsModalOpen(true);
  };

  const handleEditAddress = (address: VendorFixedAddress) => {
    setSelectedAddress(address);
    setIsModalOpen(true);
  };

  const handleSaveAddress = () => {
    alert("고정주소가 저장되었습니다.");
    setIsModalOpen(false);
  };

  const handleSetDefault = (addressId: string) => {
    if (window.confirm("이 주소를 기본 주소로 설정하시겠습니까?")) {
      alert("기본 주소가 설정되었습니다.");
    }
  };

  const getStatusBadge = (status: "active" | "inactive") => {
    return status === "active" ? (
      <span className="inline-flex px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
        활성
      </span>
    ) : (
      <span className="inline-flex px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
        비활성
      </span>
    );
  };

  const getAddressTypeColor = (type: string) => {
    switch (type) {
      case "발송지":
        return "bg-blue-100 text-blue-800";
      case "반송지":
        return "bg-red-100 text-red-800";
      case "교환지":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Container maxWidth="full">
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            판매처 고정주소 관리
          </h1>
          <p className="text-gray-600">
            판매처별로 발송지, 반송지, 교환지 등 고정주소를 관리합니다.
          </p>
        </div>

        {/* 필터 및 검색 */}
        <div className="bg-white border rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                판매처 선택
              </label>
              <select
                value={selectedVendor}
                onChange={(e) => setSelectedVendor(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">전체 판매처</option>
                {mockVendors.map((vendor) => (
                  <option key={vendor.id} value={vendor.id}>
                    {vendor.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                주소 유형
              </label>
              <select
                value={selectedAddressType}
                onChange={(e) => setSelectedAddressType(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">전체 유형</option>
                <option value="발송지">발송지</option>
                <option value="반송지">반송지</option>
                <option value="교환지">교환지</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                검색
              </label>
              <input
                type="text"
                placeholder="이름, 주소, 판매처명으로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">
                총 {filteredAddresses.length}개의 주소
              </span>
              <button
                onClick={handleAddAddress}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center gap-2"
              >
                <span>+</span>
                신규 주소 등록
              </button>
            </div>
          </div>
        </div>

        {/* 주소 목록 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredAddresses.map((address) => (
            <div key={address.id} className="bg-white border rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-2">
                  <span
                    className={`inline-flex px-2 py-1 text-xs rounded-full ${getAddressTypeColor(address.addressType)}`}
                  >
                    {address.addressType}
                  </span>
                  {address.isDefault && (
                    <span className="inline-flex px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                      기본 주소
                    </span>
                  )}
                  {getStatusBadge(address.status)}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditAddress(address)}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    수정
                  </button>
                  {!address.isDefault && (
                    <button
                      onClick={() => handleSetDefault(address.id)}
                      className="text-green-600 hover:text-green-800 text-sm"
                    >
                      기본설정
                    </button>
                  )}
                  <button className="text-red-600 hover:text-red-800 text-sm">
                    삭제
                  </button>
                </div>
              </div>

              {/* 판매처 정보 */}
              <div className="mb-3 pb-3 border-b border-gray-100">
                <div className="text-sm text-gray-500">판매처</div>
                <div className="font-medium text-gray-900">
                  {address.vendorName}
                </div>
              </div>

              {/* 연락처 정보 */}
              <div className="mb-3">
                <div className="text-sm text-gray-500">담당자</div>
                <div className="font-medium text-gray-900">{address.name}</div>
                <div className="text-sm text-gray-600">{address.phone}</div>
              </div>

              {/* 주소 정보 */}
              <div className="mb-3">
                <div className="text-sm text-gray-500">주소</div>
                <div className="text-sm text-gray-600">({address.zipcode})</div>
                <div className="text-gray-900">{address.address}</div>
                {address.addressDetail && (
                  <div className="text-gray-600">{address.addressDetail}</div>
                )}
              </div>

              {/* 등록일 */}
              <div className="text-xs text-gray-500 mt-4 pt-3 border-t border-gray-100">
                등록일: {address.registrationDate}
              </div>
            </div>
          ))}
        </div>

        {filteredAddresses.length === 0 && (
          <div className="bg-white border rounded-lg p-12 text-center">
            <div className="text-gray-400 text-4xl mb-4">📍</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              등록된 고정주소가 없습니다
            </h3>
            <p className="text-gray-600 mb-4">
              판매처의 발송지, 반송지, 교환지 주소를 등록해주세요.
            </p>
            <button
              onClick={handleAddAddress}
              className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              신규 주소 등록
            </button>
          </div>
        )}

        {/* 모달 */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">
                  {selectedAddress ? "고정주소 수정" : "신규 고정주소 등록"}
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      판매처 선택 *
                    </label>
                    <select
                      defaultValue={selectedAddress?.vendorId || ""}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">판매처를 선택하세요</option>
                      {mockVendors.map((vendor) => (
                        <option key={vendor.id} value={vendor.id}>
                          {vendor.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      주소 유형 *
                    </label>
                    <select
                      defaultValue={selectedAddress?.addressType || ""}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">유형을 선택하세요</option>
                      <option value="발송지">발송지</option>
                      <option value="반송지">반송지</option>
                      <option value="교환지">교환지</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      담당자명 *
                    </label>
                    <input
                      type="text"
                      defaultValue={selectedAddress?.name || ""}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="담당자명을 입력하세요"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      연락처 *
                    </label>
                    <input
                      type="text"
                      defaultValue={selectedAddress?.phone || ""}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="02-1234-5678"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    우편번호 *
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      defaultValue={selectedAddress?.zipcode || ""}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="우편번호"
                    />
                    <button className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                      우편번호 검색
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    기본주소 *
                  </label>
                  <input
                    type="text"
                    defaultValue={selectedAddress?.address || ""}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="기본주소를 입력하세요"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    상세주소
                  </label>
                  <input
                    type="text"
                    defaultValue={selectedAddress?.addressDetail || ""}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="상세주소를 입력하세요"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        defaultChecked={selectedAddress?.isDefault || false}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        기본 주소로 설정
                      </span>
                    </label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      상태
                    </label>
                    <select
                      defaultValue={selectedAddress?.status || "active"}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="active">활성</option>
                      <option value="inactive">비활성</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2 mt-6">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  취소
                </button>
                <button
                  onClick={handleSaveAddress}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  저장
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Container>
  );
};

export default VendorFixedAddressManagementPage;
