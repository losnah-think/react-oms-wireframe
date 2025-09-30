import React, { useState, useEffect } from "react";

// Mock 데이터
const mockProducts = [
  {
    id: 1,
    name: "베이직 티셔츠",
    code: "TS001",
    vendor: "카페24",
    classificationPath: ["의류", "상의", "티셔츠"],
    selling_price: 29000,
    stock: 150,
    is_selling: true,
  },
  {
    id: 2,
    name: "슬림핏 청바지",
    code: "JN002",
    vendor: "스마트스토어",
    classificationPath: ["의류", "하의", "청바지"],
    selling_price: 59000,
    stock: 80,
    is_selling: true,
  },
  {
    id: 3,
    name: "가죽 크로스백",
    code: "BG003",
    vendor: "카페24",
    classificationPath: ["잡화", "가방", "크로스백"],
    selling_price: 89000,
    stock: 45,
    is_selling: false,
  },
  {
    id: 4,
    name: "캐주얼 스니커즈",
    code: "SH004",
    vendor: "스마트스토어",
    classificationPath: ["신발", "운동화", "스니커즈"],
    selling_price: 79000,
    stock: 0,
    is_selling: true,
  },
];

const mockVendors = [
  {
    id: "cafe24",
    name: "카페24",
    type: "판매처",
    businessNumber: "123-45-67890",
    representative: "김철수",
    phone: "02-1234-5678",
    email: "cafe24@example.com",
    address: "서울시 강남구 테헤란로 123",
    status: "active",
    registrationDate: "2023-01-15",
    apiKey: "cafe24_api_key_1234",
    lastLoginDate: "2025-09-29",
  },
  {
    id: "smartstore",
    name: "스마트스토어",
    type: "판매처",
    businessNumber: "987-65-43210",
    representative: "이영희",
    phone: "02-9876-5432",
    email: "smartstore@example.com",
    address: "서울시 서초구 서초대로 456",
    status: "active",
    registrationDate: "2023-03-20",
    apiKey: "smartstore_api_key_5678",
    lastLoginDate: "2025-09-30",
  },
];

export default function VendorProductsPage() {
  const [products, setProducts] = useState(mockProducts);
  const [vendors, setVendors] = useState(mockVendors);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (vendors.length > 0 && !selectedVendor) {
      setSelectedVendor(vendors[0]);
    }
  }, [vendors]);

  const filteredProducts = selectedVendor
    ? products.filter((p) => p.vendor === selectedVendor.name)
    : [];

  const filteredVendors = vendors.filter(
    (v) =>
      v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.representative.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* 헤더 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">판매처별 상품 관리</h1>
        <p className="text-gray-600 mt-1">
          각 판매처의 기본 정보와 등록된 상품을 확인하고 관리합니다.
        </p>
      </div>

      <div className="flex gap-6">
        {/* 좌측: 판매처 목록 */}
        <div className="w-80 flex-shrink-0">
          <div className="bg-white rounded-lg border shadow-sm">
            {/* 검색 */}
            <div className="p-4 border-b">
              <input
                type="text"
                placeholder="판매처 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* 판매처 목록 */}
            <div className="max-h-[calc(100vh-280px)] overflow-y-auto">
              {filteredVendors.map((vendor) => (
                <button
                  key={vendor.id}
                  onClick={() => setSelectedVendor(vendor)}
                  className={`w-full text-left p-4 border-b hover:bg-gray-50 transition-colors ${
                    selectedVendor?.id === vendor.id
                      ? "bg-blue-50 border-l-4 border-l-blue-500"
                      : ""
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">
                        {vendor.name}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {vendor.representative}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {products.filter((p) => p.vendor === vendor.name).length}개 상품
                      </div>
                    </div>
                    <div
                      className={`px-2 py-1 text-xs rounded ${
                        vendor.status === "active"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {vendor.status === "active" ? "활성" : "비활성"}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 우측: 판매처 정보 및 상품 목록 */}
        <div className="flex-1">
          {selectedVendor ? (
            <>
              {/* 판매처 기본 정보 카드 */}
              <div className="bg-white rounded-lg border shadow-sm p-6 mb-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {selectedVendor.name}
                    </h2>
                    <div className="flex items-center gap-2 mt-2">
                      <span
                        className={`px-3 py-1 text-sm rounded-full ${
                          selectedVendor.status === "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {selectedVendor.status === "active" ? "활성" : "비활성"}
                      </span>
                      {selectedVendor.apiKey && (
                        <span className="px-3 py-1 text-sm rounded-full bg-blue-100 text-blue-700">
                          API 연동됨
                        </span>
                      )}
                    </div>
                  </div>
                  <button className="px-4 py-2 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600">
                    정보 수정
                  </button>
                </div>

                {/* 상세 정보 그리드 */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">
                      기본 정보
                    </h3>
                    <div className="space-y-2">
                      <div className="flex">
                        <span className="text-sm text-gray-600 w-24">대표자</span>
                        <span className="text-sm text-gray-900 font-medium">
                          {selectedVendor.representative}
                        </span>
                      </div>
                      <div className="flex">
                        <span className="text-sm text-gray-600 w-24">사업자번호</span>
                        <span className="text-sm text-gray-900 font-medium">
                          {selectedVendor.businessNumber}
                        </span>
                      </div>
                      <div className="flex">
                        <span className="text-sm text-gray-600 w-24">등록일</span>
                        <span className="text-sm text-gray-900">
                          {selectedVendor.registrationDate}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">
                      연락 정보
                    </h3>
                    <div className="space-y-2">
                      <div className="flex">
                        <span className="text-sm text-gray-600 w-24">전화번호</span>
                        <span className="text-sm text-gray-900 font-medium">
                          {selectedVendor.phone}
                        </span>
                      </div>
                      <div className="flex">
                        <span className="text-sm text-gray-600 w-24">이메일</span>
                        <span className="text-sm text-gray-900 font-medium">
                          {selectedVendor.email}
                        </span>
                      </div>
                      <div className="flex">
                        <span className="text-sm text-gray-600 w-24">주소</span>
                        <span className="text-sm text-gray-900">
                          {selectedVendor.address}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {selectedVendor.apiKey && (
                  <div className="mt-6 pt-4 border-t">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">
                      API 연동 정보
                    </h3>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="text-xs text-gray-600">마지막 로그인</div>
                        <div className="text-sm text-gray-900 font-medium mt-1">
                          {selectedVendor.lastLoginDate}
                        </div>
                      </div>
                      <button className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50">
                        연동 설정
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* 상품 목록 */}
              <div className="bg-white rounded-lg border shadow-sm">
                <div className="p-4 border-b flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">
                    등록 상품 목록 ({filteredProducts.length}개)
                  </h3>
                  <button className="px-3 py-1.5 text-sm bg-green-500 text-white rounded hover:bg-green-600">
                    + 상품 추가
                  </button>
                </div>

                <div className="divide-y">
                  {filteredProducts.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-gray-400 text-4xl mb-3">📦</div>
                      <p className="text-gray-600">등록된 상품이 없습니다.</p>
                      <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                        상품 추가하기
                      </button>
                    </div>
                  ) : (
                    filteredProducts.map((product) => (
                      <div
                        key={product.id}
                        className="p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <div className="font-medium text-gray-900">
                                {product.name}
                              </div>
                              <span
                                className={`px-2 py-1 text-xs rounded ${
                                  product.is_selling
                                    ? "bg-green-100 text-green-700"
                                    : "bg-gray-100 text-gray-700"
                                }`}
                              >
                                {product.is_selling ? "판매중" : "판매중지"}
                              </span>
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                              {product.code} • {product.classificationPath.join(" > ")}
                            </div>
                          </div>
                          <div className="text-right ml-4">
                            <div className="font-semibold text-gray-900">
                              ₩{product.selling_price.toLocaleString()}
                            </div>
                            <div
                              className={`text-sm mt-1 ${
                                product.stock === 0
                                  ? "text-red-600 font-medium"
                                  : product.stock < 10
                                  ? "text-orange-600"
                                  : "text-gray-600"
                              }`}
                            >
                              재고: {product.stock}개
                            </div>
                          </div>
                          <div className="ml-4">
                            <button className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50">
                              수정
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
                좌측에서 판매처를 선택하면 상세 정보와 상품 목록을 확인할 수 있습니다.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}