import React, { useState } from "react";
import { Container } from "@/design-system";

interface Vendor {
  id: string;
  name: string;
  type: "판매처" | "공급처";
  businessNumber: string;
  representative: string;
  phone: string;
  email?: string;

  address: string;
  status: "active" | "inactive";
  apiKey?: string;
  password?: string;
  registrationDate: string;
  lastLoginDate?: string;
}

const VendorManagementPage: React.FC = () => {
  const [selectedType, setSelectedType] = useState<"판매처" | "공급처">(
    "판매처",
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const mockVendors: Vendor[] = [
    {
      id: "V001",
      name: "네이버 스마트스토어",
      type: "판매처",
      businessNumber: "123-45-67890",
      representative: "김판매",
      phone: "02-1234-5678",
      email: "naver@smartstore.com",
      address: "서울시 강남구 테헤란로 123",
      status: "active",
      apiKey: "naver_api_key_12345",
      registrationDate: "2024-01-15",
      lastLoginDate: "2024-09-10",
    },
    {
      id: "V002",
      name: "쿠팡 파트너스",
      type: "판매처",
      businessNumber: "234-56-78901",
      representative: "이쿠팡",
      phone: "02-2345-6789",
      email: "partners@coupang.com",
      address: "서울시 송파구 올림픽로 300",
      status: "active",
      apiKey: "coupang_api_key_67890",
      registrationDate: "2024-02-01",
      lastLoginDate: "2024-09-09",
    },
    {
      id: "S001",
      name: "(주)글로벌공급사",
      type: "공급처",
      businessNumber: "345-67-89012",
      representative: "박공급",
      phone: "031-1234-5678",
      email: "global@supplier.co.kr",
      address: "경기도 성남시 분당구 정자로 100",
      status: "active",
      registrationDate: "2024-01-20",
    },
    {
      id: "S002",
      name: "한국제조",
      type: "공급처",
      businessNumber: "456-78-90123",
      representative: "최제조",
      phone: "042-9876-5432",
      email: "korea@manufacturing.kr",
      address: "대전시 유성구 과학로 50",
      status: "inactive",
      registrationDate: "2024-03-10",
    },
  ];

  const filteredVendors = mockVendors.filter(
    (vendor) =>
      vendor.type === selectedType &&
      (vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.businessNumber.includes(searchTerm) ||
        vendor.representative.includes(searchTerm)),
  );

  const handleAddVendor = () => {
    setSelectedVendor(null);
    setIsModalOpen(true);
  };

  const handleEditVendor = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setIsModalOpen(true);
  };

  const handleSaveVendor = () => {
  alert("판매처 정보가 저장되었습니다.");
    setIsModalOpen(false);
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

  return (
    <Container maxWidth="full">
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">판매처 관리</h1>
          <p className="text-gray-600">
            판매처와 공급처 정보를 통합 관리합니다.
          </p>
        </div>

        {/* 타입 선택 탭 */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-6 w-fit">
          <button
            onClick={() => setSelectedType("판매처")}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              selectedType === "판매처"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            🛒 판매처 관리
          </button>
          <button
            onClick={() => setSelectedType("공급처")}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              selectedType === "공급처"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            🏭 공급처 관리
          </button>
        </div>

        {/* 검색 및 추가 버튼 */}
        <div className="bg-white border rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <input
                type="text"
                placeholder={`${selectedType} 이름, 사업자번호, 대표자명으로 검색...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-80 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-500">
                총 {filteredVendors.length}개의 {selectedType}
              </span>
            </div>
            <button
              onClick={handleAddVendor}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center gap-2"
            >
              <span>+</span>
              신규 {selectedType} 등록
            </button>
          </div>
        </div>

  {/* 판매처 목록 */}
        <div className="bg-white border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {selectedType} 정보
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    연락처
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    주소
                  </th>
                  {selectedType === "판매처" && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      API 연동
                    </th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    상태
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    관리
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredVendors.map((vendor) => (
                  <tr key={vendor.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {vendor.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          사업자번호: {vendor.businessNumber}
                        </div>
                        <div className="text-sm text-gray-500">
                          대표자: {vendor.representative}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm text-gray-900">
                          {vendor.phone}
                        </div>
                        <div className="text-sm text-gray-500">
                          {vendor.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {vendor.address}
                      </div>
                    </td>
                    {selectedType === "판매처" && (
                      <td className="px-6 py-4">
                        <div>
                          {vendor.apiKey && (
                            <>
                              <div className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded mb-1 w-fit">
                                API 연동됨
                              </div>
                              <div className="text-xs text-gray-500">
                                마지막 로그인: {vendor.lastLoginDate}
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                    )}
                    <td className="px-6 py-4">
                      <div>
                        {getStatusBadge(vendor.status)}
                        <div className="text-xs text-gray-500 mt-1">
                          등록일: {vendor.registrationDate}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditVendor(vendor)}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          수정
                        </button>
                        <button className="text-red-600 hover:text-red-800 text-sm">
                          삭제
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredVendors.length === 0 && (
          <div className="bg-white border rounded-lg p-12 text-center">
            <div className="text-gray-400 text-4xl mb-4">
              {selectedType === "판매처" ? "🛒" : "🏭"}
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              등록된 {selectedType}가 없습니다
            </h3>
            <p className="text-gray-600 mb-4">
              새로운 {selectedType}를 등록해주세요.
            </p>
            <button
              onClick={handleAddVendor}
              className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              신규 {selectedType} 등록
            </button>
          </div>
        )}

        {/* 모달 */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">
                  {selectedVendor
                    ? `${selectedType} 정보 수정`
                    : `신규 ${selectedType} 등록`}
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
                      {selectedType} 이름 *
                    </label>
                    <input
                      type="text"
                      defaultValue={selectedVendor?.name || ""}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="판매처명을 입력하세요"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      사업자등록번호 *
                    </label>
                    <input
                      type="text"
                      defaultValue={selectedVendor?.businessNumber || ""}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="123-45-67890"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      대표자명 *
                    </label>
                    <input
                      type="text"
                      defaultValue={selectedVendor?.representative || ""}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="대표자명을 입력하세요"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      연락처 *
                    </label>
                    <input
                      type="text"
                      defaultValue={selectedVendor?.phone || ""}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="02-1234-5678"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    이메일
                  </label>
                  <input
                    type="email"
                    defaultValue={selectedVendor?.email || ""}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="email@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    주소
                  </label>
                  <input
                    type="text"
                    defaultValue={selectedVendor?.address || ""}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="주소를 입력하세요"
                  />
                </div>

                {selectedType === "판매처" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        API 인증키
                      </label>
                      <input
                        type="text"
                        defaultValue={selectedVendor?.apiKey || ""}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="API 인증키를 입력하세요"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        비밀번호
                      </label>
                      <input
                        type="password"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="비밀번호를 입력하세요"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    상태
                  </label>
                  <select
                    defaultValue={selectedVendor?.status || "active"}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="active">활성</option>
                    <option value="inactive">비활성</option>
                  </select>
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
                  onClick={handleSaveVendor}
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

export default VendorManagementPage;
