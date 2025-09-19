import React, { useState } from "react";
import { Container } from "../../design-system";

interface Vendor {
  id: string;
  name: string;
  type: "판매처" | "공급처";
  businessNumber: string;
  representative: string;
  phone: string;
  email: string;
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
    alert("거래처 정보가 저장되었습니다.");
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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">거래처 관리</h1>
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
        </div>
      </div>
    </Container>
  );
};

export default VendorManagementPage;
