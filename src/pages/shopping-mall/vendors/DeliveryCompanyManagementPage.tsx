import React, { useState } from "react";
import { Container } from "../../../design-system";

interface DeliveryCompany {
  id: string;
  name: string;
  code: string;
  apiUrl: string;
  isDefault: boolean;
  status: "active" | "inactive";
  trackingUrlFormat: string;
  logo?: string;
  contact: {
    phone: string;
    email: string;
    website: string;
  };
  pricing: {
    basePrice: number;
    weightLimit: number;
    sizeLimit: string;
    jejuSurcharge: number;
    islandSurcharge: number;
  };
}

const DeliveryCompanyManagementPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCompany, setSelectedCompany] =
    useState<DeliveryCompany | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const mockDeliveryCompanies: DeliveryCompany[] = [
    {
      id: "DC001",
      name: "CJ대한통운",
      code: "CJ",
      apiUrl: "https://api.cjlogistics.com/tracking",
      isDefault: true,
      status: "active",
      trackingUrlFormat:
        "https://www.doortodoor.co.kr/parcel/doortodoor.do?fsp_action=PARC_ACT_002&fsp_cmd=retrieveInvNoACT&invc_no={trackingNumber}",
      logo: "📦",
      contact: {
        phone: "1588-1255",
        email: "customer@cjlogistics.com",
        website: "https://www.cjlogistics.com",
      },
      pricing: {
        basePrice: 3000,
        weightLimit: 20,
        sizeLimit: "160cm",
        jejuSurcharge: 2000,
        islandSurcharge: 3000,
      },
    },
  ];

  const filteredCompanies = mockDeliveryCompanies.filter(
    (company) =>
      company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.code.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleAddCompany = () => {
    setSelectedCompany(null);
    setIsModalOpen(true);
  };

  const handleEditCompany = (company: DeliveryCompany) => {
    setSelectedCompany(company);
    setIsModalOpen(true);
  };

  const handleSaveCompany = () => {
    alert("택배사 정보가 저장되었습니다.");
    setIsModalOpen(false);
  };

  const handleSetDefault = (companyId: string) => {
    if (window.confirm("이 택배사를 기본 택배사로 설정하시겠습니까?")) {
      alert("기본 택배사가 설정되었습니다.");
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

  return (
    <Container maxWidth="full">
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">택배사 관리</h1>
          <p className="text-gray-600">택배사 정보와 배송비를 관리합니다.</p>
        </div>

        <div className="bg-white border rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <input
                type="text"
                placeholder="택배사명 또는 코드로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-80 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-500">
                총 {filteredCompanies.length}개의 택배사
              </span>
            </div>
            <button
              onClick={handleAddCompany}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center gap-2"
            >
              <span>+</span>
              신규 택배사 등록
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredCompanies.map((company) => (
            <div key={company.id} className="bg-white border rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{company.logo}</div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {company.name}
                      </h3>
                      {company.isDefault && (
                        <span className="inline-flex px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                          기본 택배사
                        </span>
                      )}
                      {getStatusBadge(company.status)}
                    </div>
                    <p className="text-sm text-gray-500">코드: {company.code}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditCompany(company)}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    수정
                  </button>
                  {!company.isDefault && (
                    <button
                      onClick={() => handleSetDefault(company.id)}
                      className="text-green-600 hover:text-green-800 text-sm"
                    >
                      기본설정
                    </button>
                  )}
                </div>
              </div>

              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  연락처 정보
                </h4>
                <div className="grid grid-cols-1 gap-1 text-sm text-gray-600">
                  <div>📞 {company.contact.phone}</div>
                  <div>✉️ {company.contact.email}</div>
                  <div>🌐 {company.contact.website}</div>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">요금 정보</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-gray-50 p-2 rounded">
                    <div className="text-gray-500">기본 배송비</div>
                    <div className="font-medium">
                      ₩{company.pricing.basePrice.toLocaleString()}
                    </div>
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <div className="text-gray-500">중량 제한</div>
                    <div className="font-medium">{company.pricing.weightLimit}kg</div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-sm text-gray-600">API 연동</div>
                    <div className="text-xs text-gray-500">{company.apiUrl}</div>
                  </div>
                  <div className="text-green-600">
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Container>
  );
};

export default DeliveryCompanyManagementPage;

