import React, { useState } from 'react';

interface DeliveryCompany {
  id: string;
  name: string;
  code: string;
  apiUrl: string;
  isDefault: boolean;
  status: 'active' | 'inactive';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<DeliveryCompany | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const mockDeliveryCompanies: DeliveryCompany[] = [
    {
      id: 'DC001',
      name: 'CJ대한통운',
      code: 'CJ',
      apiUrl: 'https://api.cjlogistics.com/tracking',
      isDefault: true,
      status: 'active',
      trackingUrlFormat: 'https://www.doortodoor.co.kr/parcel/doortodoor.do?fsp_action=PARC_ACT_002&fsp_cmd=retrieveInvNoACT&invc_no={trackingNumber}',
      logo: '📦',
      contact: {
        phone: '1588-1255',
        email: 'customer@cjlogistics.com',
        website: 'https://www.cjlogistics.com'
      },
      pricing: {
        basePrice: 3000,
        weightLimit: 20,
        sizeLimit: '160cm',
        jejuSurcharge: 2000,
        islandSurcharge: 3000
      }
    },
    {
      id: 'DC002',
      name: '한진택배',
      code: 'HANJIN',
      apiUrl: 'https://api.hanjin.co.kr/tracking',
      isDefault: false,
      status: 'active',
      trackingUrlFormat: 'https://www.hanjin.co.kr/kor/CMS/DeliveryMgr/WaybillResult.do?mCode=MN038&wblnum={trackingNumber}',
      logo: '🚚',
      contact: {
        phone: '1588-0011',
        email: 'service@hanjin.co.kr',
        website: 'https://www.hanjin.co.kr'
      },
      pricing: {
        basePrice: 2800,
        weightLimit: 25,
        sizeLimit: '160cm',
        jejuSurcharge: 2500,
        islandSurcharge: 3500
      }
    },
    {
      id: 'DC003',
      name: '로젠택배',
      code: 'LOGEN',
      apiUrl: 'https://api.ilogen.com/tracking',
      isDefault: false,
      status: 'active',
      trackingUrlFormat: 'https://www.ilogen.com/web/personal/trace/{trackingNumber}',
      logo: '📮',
      contact: {
        phone: '1588-9988',
        email: 'cs@ilogen.com',
        website: 'https://www.ilogen.com'
      },
      pricing: {
        basePrice: 2700,
        weightLimit: 20,
        sizeLimit: '140cm',
        jejuSurcharge: 2000,
        islandSurcharge: 2800
      }
    },
    {
      id: 'DC004',
      name: '우체국택배',
      code: 'EPOST',
      apiUrl: 'https://service.epost.go.kr/trace.RetrieveDomRigiTraceList.comm',
      isDefault: false,
      status: 'inactive',
      trackingUrlFormat: 'https://service.epost.go.kr/trace.RetrieveRegiPrclDeliv.comm?sid1={trackingNumber}',
      logo: '📬',
      contact: {
        phone: '1588-1300',
        email: 'service@koreapost.go.kr',
        website: 'https://www.epost.go.kr'
      },
      pricing: {
        basePrice: 3200,
        weightLimit: 20,
        sizeLimit: '160cm',
        jejuSurcharge: 1500,
        islandSurcharge: 2000
      }
    }
  ];

  const filteredCompanies = mockDeliveryCompanies.filter(company =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.code.toLowerCase().includes(searchTerm.toLowerCase())
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
    alert('택배사 정보가 저장되었습니다.');
    setIsModalOpen(false);
  };

  const handleSetDefault = (companyId: string) => {
    if (window.confirm('이 택배사를 기본 택배사로 설정하시겠습니까?')) {
      alert('기본 택배사가 설정되었습니다.');
    }
  };

  const getStatusBadge = (status: 'active' | 'inactive') => {
    return status === 'active' ? (
      <span className="inline-flex px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">활성</span>
    ) : (
      <span className="inline-flex px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">비활성</span>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">택배사 관리</h1>
        <p className="text-gray-600">택배사 정보와 배송비를 관리합니다.</p>
      </div>

      {/* 검색 및 추가 버튼 */}
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

      {/* 택배사 목록 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredCompanies.map((company) => (
          <div key={company.id} className="bg-white border rounded-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">{company.logo}</div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-semibold text-gray-900">{company.name}</h3>
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

            {/* 연락처 정보 */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">연락처 정보</h4>
              <div className="grid grid-cols-1 gap-1 text-sm text-gray-600">
                <div>📞 {company.contact.phone}</div>
                <div>✉️ {company.contact.email}</div>
                <div>🌐 {company.contact.website}</div>
              </div>
            </div>

            {/* 요금 정보 */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">요금 정보</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="bg-gray-50 p-2 rounded">
                  <div className="text-gray-500">기본 배송비</div>
                  <div className="font-medium">₩{company.pricing.basePrice.toLocaleString()}</div>
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <div className="text-gray-500">중량 제한</div>
                  <div className="font-medium">{company.pricing.weightLimit}kg</div>
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <div className="text-gray-500">제주 추가</div>
                  <div className="font-medium">₩{company.pricing.jejuSurcharge.toLocaleString()}</div>
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <div className="text-gray-500">도서산간 추가</div>
                  <div className="font-medium">₩{company.pricing.islandSurcharge.toLocaleString()}</div>
                </div>
              </div>
            </div>

            {/* API 연동 상태 */}
            <div className="pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm text-gray-600">API 연동</div>
                  <div className="text-xs text-gray-500">{company.apiUrl}</div>
                </div>
                <div className="text-green-600">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredCompanies.length === 0 && (
        <div className="bg-white border rounded-lg p-12 text-center">
          <div className="text-gray-400 text-4xl mb-4">📦</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            등록된 택배사가 없습니다
          </h3>
          <p className="text-gray-600 mb-4">
            새로운 택배사를 등록해주세요.
          </p>
          <button
            onClick={handleAddCompany}
            className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            신규 택배사 등록
          </button>
        </div>
      )}

      {/* 모달 */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">
                {selectedCompany ? '택배사 정보 수정' : '신규 택배사 등록'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {/* 기본 정보 */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">기본 정보</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    택배사명 *
                  </label>
                  <input
                    type="text"
                    defaultValue={selectedCompany?.name || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="택배사명을 입력하세요"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    택배사 코드 *
                  </label>
                  <input
                    type="text"
                    defaultValue={selectedCompany?.code || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="COMPANY_CODE"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    API URL
                  </label>
                  <input
                    type="url"
                    defaultValue={selectedCompany?.apiUrl || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://api.company.com/tracking"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    배송조회 URL 형식
                  </label>
                  <input
                    type="text"
                    defaultValue={selectedCompany?.trackingUrlFormat || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://tracking.com/trace/{trackingNumber}"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {'{trackingNumber}'} 는 운송장번호로 자동 치환됩니다.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    상태
                  </label>
                  <select
                    defaultValue={selectedCompany?.status || 'active'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="active">활성</option>
                    <option value="inactive">비활성</option>
                  </select>
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      defaultChecked={selectedCompany?.isDefault || false}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">기본 택배사로 설정</span>
                  </label>
                </div>
              </div>

              {/* 연락처 및 요금 정보 */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">연락처 정보</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    대표 전화번호
                  </label>
                  <input
                    type="text"
                    defaultValue={selectedCompany?.contact.phone || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="1588-0000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    고객센터 이메일
                  </label>
                  <input
                    type="email"
                    defaultValue={selectedCompany?.contact.email || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="cs@company.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    웹사이트
                  </label>
                  <input
                    type="url"
                    defaultValue={selectedCompany?.contact.website || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://www.company.com"
                  />
                </div>

                <h3 className="text-lg font-medium text-gray-900 pt-4">요금 정보</h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      기본 배송비 (원)
                    </label>
                    <input
                      type="number"
                      defaultValue={selectedCompany?.pricing.basePrice || 3000}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      중량 제한 (kg)
                    </label>
                    <input
                      type="number"
                      defaultValue={selectedCompany?.pricing.weightLimit || 20}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    크기 제한
                  </label>
                  <input
                    type="text"
                    defaultValue={selectedCompany?.pricing.sizeLimit || '160cm'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="160cm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      제주 추가비 (원)
                    </label>
                    <input
                      type="number"
                      defaultValue={selectedCompany?.pricing.jejuSurcharge || 2000}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      도서산간 추가비 (원)
                    </label>
                    <input
                      type="number"
                      defaultValue={selectedCompany?.pricing.islandSurcharge || 3000}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
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
                onClick={handleSaveCompany}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryCompanyManagementPage;
