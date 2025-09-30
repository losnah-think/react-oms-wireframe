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

// 판매처별 부가 정보 Mock
const mockExtraInfo: Record<string, Record<string, string>> = {
  V001: {
    "판매자 ID": "naver_seller_123",
    "정산 주기": "월 2회 (15일, 말일)",
    "수수료율": "12%",
    "배송비 템플릿 ID": "TPL-NAVER-001",
    "고객센터 번호": "1588-1234",
  },
  V002: {
    "판매자 ID": "coupang_seller_456",
    "정산 주기": "주 1회 (매주 금요일)",
    "수수료율": "15%",
    "로켓배송 사용": "사용함",
    "반품배송비": "5,000원",
  },
  V003: {
    "판매자 ID": "11st_seller_789",
    "정산 주기": "월 1회 (말일)",
    "수수료율": "10%",
  },
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
  const [extraInfo, setExtraInfo] = useState<Record<string, string>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");
  const [editingKey, setEditingKey] = useState<string | null>(null);

  useEffect(() => {
    if (vendors.length > 0 && !selectedVendor) {
      setSelectedVendor(vendors[0]);
    }
  }, [vendors]);

  useEffect(() => {
    if (selectedVendor) {
      setExtraInfo(mockExtraInfo[selectedVendor.id] || {});
      setIsEditing(false);
    }
  }, [selectedVendor]);

  const handleAddInfo = () => {
    if (!newKey.trim()) {
      alert("항목명을 입력해주세요.");
      return;
    }
    if (!newValue.trim()) {
      alert("값을 입력해주세요.");
      return;
    }
    setExtraInfo({ ...extraInfo, [newKey]: newValue });
    setNewKey("");
    setNewValue("");
  };

  const handleDeleteInfo = (key: string) => {
    if (window.confirm(`"${key}" 항목을 삭제하시겠습니까?`)) {
      const updated = { ...extraInfo };
      delete updated[key];
      setExtraInfo(updated);
    }
  };

  const handleEditInfo = (key: string) => {
    setEditingKey(key);
    setNewKey(key);
    setNewValue(extraInfo[key]);
  };

  const handleUpdateInfo = () => {
    if (!newKey.trim() || !newValue.trim()) {
      alert("항목명과 값을 입력해주세요.");
      return;
    }
    const updated = { ...extraInfo };
    if (editingKey && editingKey !== newKey) {
      delete updated[editingKey];
    }
    updated[newKey] = newValue;
    setExtraInfo(updated);
    setEditingKey(null);
    setNewKey("");
    setNewValue("");
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
                    {Object.keys(mockExtraInfo[vendor.id] || {}).length}개 부가 정보
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
                <div className="p-4 border-b flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">
                    부가 정보 ({Object.keys(extraInfo).length}개)
                  </h3>
                  <div className="flex items-center gap-2">
                    {isEditing ? (
                      <>
                        <button
                          onClick={() => {
                            setIsEditing(false);
                            setEditingKey(null);
                            setNewKey("");
                            setNewValue("");
                          }}
                          className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50"
                        >
                          취소
                        </button>
                        <button
                          onClick={handleSave}
                          className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                          저장
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="px-3 py-1.5 text-sm bg-green-500 text-white rounded hover:bg-green-600"
                      >
                        편집 모드
                      </button>
                    )}
                  </div>
                </div>

                {/* 편집 모드: 추가/수정 폼 */}
                {isEditing && (
                  <div className="p-4 bg-gray-50 border-b">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          항목명
                        </label>
                        <input
                          type="text"
                          value={newKey}
                          onChange={(e) => setNewKey(e.target.value)}
                          placeholder="예: 정산 주기"
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          값
                        </label>
                        <input
                          type="text"
                          value={newValue}
                          onChange={(e) => setNewValue(e.target.value)}
                          placeholder="예: 월 2회"
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <div className="mt-3">
                      {editingKey ? (
                        <button
                          onClick={handleUpdateInfo}
                          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                        >
                          수정
                        </button>
                      ) : (
                        <button
                          onClick={handleAddInfo}
                          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                        >
                          + 추가
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* 부가 정보 목록 */}
                <div className="divide-y">
                  {Object.keys(extraInfo).length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-gray-400 text-4xl mb-3">📋</div>
                      <p className="text-gray-600">등록된 부가 정보가 없습니다.</p>
                      {!isEditing && (
                        <button
                          onClick={() => setIsEditing(true)}
                          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                          부가 정보 추가하기
                        </button>
                      )}
                    </div>
                  ) : (
                    Object.entries(extraInfo).map(([key, value]) => (
                      <div
                        key={key}
                        className="p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{key}</div>
                            <div className="text-sm text-gray-600 mt-1">{value}</div>
                          </div>
                          {isEditing && (
                            <div className="ml-4 flex gap-2">
                              <button
                                onClick={() => handleEditInfo(key)}
                                className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50"
                              >
                                수정
                              </button>
                              <button
                                onClick={() => handleDeleteInfo(key)}
                                className="px-3 py-1.5 text-sm text-red-600 border border-red-300 rounded hover:bg-red-50"
                              >
                                삭제
                              </button>
                            </div>
                          )}
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
    </div>
  );
}