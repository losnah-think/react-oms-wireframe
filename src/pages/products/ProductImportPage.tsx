import React, { useState } from "react";
import {
  Container,
  Card,
  Button,
  Input,
  Badge,
  Stack,
} from "../../design-system";

interface ExternalProduct {
  id: string;
  externalName: string;
  externalCode: string;
  price: number;
  category: string;
  brand: string;
  hasBarcode: boolean;
  externalUrl?: string;
  selected: boolean;
  // 추가 메이크샵 필드들
  displayStatus: "Y" | "N";
  sellStatus: "Y" | "N";
  productStatus: "sale" | "stop" | "soldout";
  registDate: string;
  modifyDate: string;
  stockQty: number;
  categoryCode: string;
}

interface ProductFilter {
  // 옵션명 작용여부
  optionDisplay: boolean;
  // 상품검색기준
  searchCriteria: "productName" | "productCode" | "categoryName";
  searchKeyword: string;
  // 제외카테고리 설정
  excludeCategory: {
    large: string;
    medium: string;
    small: string;
  };
  excludeSubCategory: boolean;
  // 상품명으로 가져오기
  productNameSearch: string;
  // 상품 진열여부
  displayStatus: "all" | "display" | "hide" | "soldout";
  // 다운로드 상품 조건 (메이크샵에만 특화)
  downloadPeriod: {
    startYear: number;
    startMonth: number;
    startDay: number;
    endYear: number;
    endMonth: number;
    endDay: number;
  };
  downloadInterval:
    | "today"
    | "7days"
    | "10days"
    | "15days"
    | "1month"
    | "3months"
    | "6months";
}

const ProductImportPage: React.FC = () => {
  const [selectedMall, setSelectedMall] = useState("makeshop");
  const [activeTab, setActiveTab] = useState<
    "makeshop" | "cafe24" | "smartstore" | "wisa" | "godomall"
  >("makeshop");
  const [authInfo, setAuthInfo] = useState({
    mallId: "",
    apiKey: "",
    secretKey: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [externalProducts, setExternalProducts] = useState<ExternalProduct[]>(
    [],
  );
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  // 메이크샵 스타일 필터
  const [filters, setFilters] = useState<ProductFilter>({
    optionDisplay: false,
    searchCriteria: "productName",
    searchKeyword: "",
    excludeCategory: { large: "", medium: "", small: "" },
    excludeSubCategory: false,
    productNameSearch: "",
    displayStatus: "all",
    downloadPeriod: {
      startYear: 2025,
      startMonth: 9,
      startDay: 10,
      endYear: 2025,
      endMonth: 9,
      endDay: 10,
    },
    downloadInterval: "today",
  });

  const malls = [
    { id: "makeshop", name: "메이크샵", emoji: "🏪", color: "blue" },
    { id: "cafe24", name: "카페24", emoji: "☕", color: "green" },
    {
      id: "smartstore",
      name: "네이버 스마트스토어",
      emoji: "🛍️",
      color: "emerald",
    },
    { id: "wisa", name: "위사", emoji: "💰", color: "purple" },
    { id: "godomall", name: "고도몰5", emoji: "🏢", color: "orange" },
  ];

  // Mock external products data with all required fields
  const mockExternalProducts: ExternalProduct[] = [
    {
      id: "mkshop_001",
      externalName: "[FULGO] 프리미엄 무선 이어폰",
      externalCode: "FG-WE-200",
      price: 89000,
      category: "디지털/가전 > 오디오 > 이어폰",
      brand: "FULGO",
      hasBarcode: true,
      externalUrl: "https://makeshop.com/product/001",
      selected: false,
      displayStatus: "Y",
      sellStatus: "Y",
      productStatus: "sale",
      registDate: "2025-01-10",
      modifyDate: "2025-01-15",
      stockQty: 150,
      categoryCode: "001002003",
    },
    {
      id: "mkshop_002",
      externalName: "[베이직웨어] 화이트 기본 티셔츠",
      externalCode: "BW-TS-001",
      price: 19900,
      category: "패션의류 > 상의 > 티셔츠",
      brand: "BasicWear",
      hasBarcode: false,
      externalUrl: "https://makeshop.com/product/002",
      selected: false,
      displayStatus: "Y",
      sellStatus: "N",
      productStatus: "stop",
      registDate: "2025-01-08",
      modifyDate: "2025-01-12",
      stockQty: 0,
      categoryCode: "002001001",
    },
    {
      id: "mkshop_003",
      externalName: "[뷰티코스] 수분 크림 50ml",
      externalCode: "BC-CR-050",
      price: 45000,
      category: "뷰티 > 스킨케어 > 크림",
      brand: "BeautyCos",
      hasBarcode: true,
      externalUrl: "https://makeshop.com/product/003",
      selected: false,
      displayStatus: "N",
      sellStatus: "Y",
      productStatus: "soldout",
      registDate: "2025-01-05",
      modifyDate: "2025-01-14",
      stockQty: 25,
      categoryCode: "003001002",
    },
    {
      id: "mkshop_004",
      externalName: "[스포츠맥스] 러닝화 270mm",
      externalCode: "SM-RN-270",
      price: 125000,
      category: "스포츠/레저 > 신발 > 러닝화",
      brand: "SportMax",
      hasBarcode: true,
      externalUrl: "https://makeshop.com/product/004",
      selected: false,
      displayStatus: "Y",
      sellStatus: "Y",
      productStatus: "sale",
      registDate: "2025-01-12",
      modifyDate: "2025-01-15",
      stockQty: 75,
      categoryCode: "004001001",
    },
    {
      id: "mkshop_005",
      externalName: "[홈리빙] 프리미엄 베개 세트",
      externalCode: "HL-PW-SET",
      price: 68000,
      category: "생활용품 > 침구 > 베개",
      brand: "HomeLiving",
      hasBarcode: false,
      externalUrl: "https://makeshop.com/product/005",
      selected: false,
      displayStatus: "Y",
      sellStatus: "Y",
      productStatus: "sale",
      registDate: "2025-01-06",
      modifyDate: "2025-01-11",
      stockQty: 200,
      categoryCode: "005002001",
    },
  ];

  const handleFetchProducts = async () => {
    if (!selectedMall || !authInfo.mallId || !authInfo.apiKey) {
      alert("판매처와 인증 정보를 모두 입력해주세요.");
      return;
    }

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setExternalProducts(mockExternalProducts);
      setIsLoading(false);
    }, 2000);
  };

  const handleSelectAll = () => {
    if (selectedProducts.length === externalProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(externalProducts.map((p) => p.id));
    }
  };

  const handleProductSelect = (productId: string) => {
    setSelectedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId],
    );
  };

  const handleImportSelected = () => {
    if (selectedProducts.length === 0) {
      alert("등록할 상품을 선택해주세요.");
      return;
    }

    const selectedCount = selectedProducts.length;
    if (window.confirm(`선택된 ${selectedCount}개 상품을 등록하시겠습니까?`)) {
      // Simulate import process
      alert(`${selectedCount}개 상품이 성공적으로 등록되었습니다.`);
      setSelectedProducts([]);
    }
  };

  const handleImportAll = () => {
    if (externalProducts.length === 0) {
      alert("조회된 상품이 없습니다.");
      return;
    }

    const totalCount = externalProducts.length;
    if (window.confirm(`전체 ${totalCount}개 상품을 등록하시겠습니까?`)) {
      // Simulate import process
      alert(`전체 ${totalCount}개 상품이 성공적으로 등록되었습니다.`);
      setExternalProducts([]);
    }
  };

  return (
    <Container maxWidth="full" padding="md" className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          외부 쇼핑몰 상품 가져오기
        </h1>
        <p className="text-gray-600">
          연동된 외부 쇼핑몰에서 상품 정보를 필터링하여 가져올 수 있습니다.
        </p>
      </div>

      {/* 쇼핑몰 탭 선택 */}
      <Card padding="none" className="mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex space-x-8 overflow-x-auto">
            {malls.map((mall) => (
              <Button
                key={mall.id}
                variant={activeTab === mall.id ? "primary" : "ghost"}
                onClick={() => setActiveTab(mall.id as any)}
                className="whitespace-nowrap flex items-center gap-2"
              >
                <span>{mall.emoji}</span>
                {mall.name}
              </Button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {/* 연결 상태 표시 */}
          <div
            className={`mb-6 p-4 bg-${malls.find((m) => m.id === activeTab)?.color}-50 border border-${malls.find((m) => m.id === activeTab)?.color}-200 rounded-lg`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-3 h-3 bg-${malls.find((m) => m.id === activeTab)?.color}-400 rounded-full`}
                ></div>
                <div>
                  <h3
                    className={`text-lg font-medium text-${malls.find((m) => m.id === activeTab)?.color}-900`}
                  >
                    {malls.find((m) => m.id === activeTab)?.name} 연결 상태
                  </h3>
                  <p
                    className={`text-sm text-${malls.find((m) => m.id === activeTab)?.color}-700`}
                  >
                    API 연결: 정상 | 마지막 동기화: 2025-01-15 14:30
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 주의사항 (메이크샵 화면과 동일) */}
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-2">
              <div className="w-5 h-5 text-red-600 mt-0.5">⚠️</div>
              <div>
                <h4 className="text-red-800 font-medium mb-2">주의사항</h4>
                <ul className="text-sm text-red-700 space-y-1">
                  <li>• 최대 6개월까지 등록된 상품을 가져옵니다.</li>
                  <li>
                    • 선택사항과 파일옵션셋 중 파일옵션셋을 우선으로 합니다.
                  </li>
                  <li>
                    • 필수 항목인 '상품명'과 '선택사항1', '선택사항2'는 반드시
                    있어야 합니다.
                  </li>
                  <li>
                    • 필수항목이 없는 경우 메이크샵에서 해당 열을 추가 해주세요.
                  </li>
                  <li>
                    • 로그인하는 ID가 '메이크샵 - 상품관리 페이지'에 접근 권한이
                    있는지 확인해주세요.
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* 필터링 옵션들 (메이크샵 화면 기준) */}
          <div className="space-y-6">
            {/* 옵션명 작용여부 */}
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <input
                  id="optionDisplay"
                  type="checkbox"
                  checked={filters.optionDisplay}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      optionDisplay: e.target.checked,
                    }))
                  }
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label
                  htmlFor="optionDisplay"
                  className="ml-2 text-sm font-medium text-gray-700"
                >
                  옵션명 작용여부
                </label>
              </div>
              <div className="text-sm text-blue-600">
                {filters.optionDisplay
                  ? "[제크] 옵션이 '색상 : 빨강', 사이즈 : M' 으로 저장 // [미체크] 옵션이 '빨강 : M'으로 저장"
                  : "[미체크] 옵션이 '빨강 : M'으로 저장"}
              </div>
            </div>

            {/* 상품검색기준 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  상품검색기준
                </label>
                <select
                  value={filters.searchCriteria}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      searchCriteria: e.target.value as any,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="productName">상품등록기준</option>
                  <option value="productCode">상품코드</option>
                  <option value="categoryName">카테고리명</option>
                </select>
              </div>

              <div className="col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  제외카테고리 설정
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="대분류"
                    value={filters.excludeCategory.large}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        excludeCategory: {
                          ...prev.excludeCategory,
                          large: e.target.value,
                        },
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="중분류"
                    value={filters.excludeCategory.medium}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        excludeCategory: {
                          ...prev.excludeCategory,
                          medium: e.target.value,
                        },
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="소분류"
                    value={filters.excludeCategory.small}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        excludeCategory: {
                          ...prev.excludeCategory,
                          small: e.target.value,
                        },
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="mt-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.excludeSubCategory}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          excludeSubCategory: e.target.checked,
                        }))
                      }
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      하위중복배제옵션
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* 상품명으로 가져오기 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                상품명으로 가져오기
              </label>
              <input
                type="text"
                placeholder="검색할 상품명을 입력하세요"
                value={filters.productNameSearch}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    productNameSearch: e.target.value,
                  }))
                }
                className="w-full max-w-lg px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="mt-2 text-sm text-red-600">
                <div>
                  ※정확한 가져오기 위해하여 상품명을 검색하여 상품등록합니다.
                </div>
                <div>
                  ※옵션중복배제로 하옵션 동일이 입력됩니다. (상품명으로 가져오기
                  이용시만 가능)
                </div>
              </div>
            </div>

            {/* 상품 진열여부 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                상품 진열여부
              </label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="displayStatus"
                    value="all"
                    checked={filters.displayStatus === "all"}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        displayStatus: e.target.value as any,
                      }))
                    }
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">전체</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="displayStatus"
                    value="display"
                    checked={filters.displayStatus === "display"}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        displayStatus: e.target.value as any,
                      }))
                    }
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">진열함</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="displayStatus"
                    value="hide"
                    checked={filters.displayStatus === "hide"}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        displayStatus: e.target.value as any,
                      }))
                    }
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">진열안함</span>
                </label>
              </div>
            </div>

            {/* 다운로드 상품 조건 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                다운로드 상품 조건 (메이크샵에만 특화)
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex gap-2 items-center mb-2">
                    <select
                      value={filters.downloadPeriod.startYear}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          downloadPeriod: {
                            ...prev.downloadPeriod,
                            startYear: parseInt(e.target.value),
                          },
                        }))
                      }
                      className="px-2 py-1 border border-gray-300 rounded text-sm"
                    >
                      <option value={2025}>2025</option>
                      <option value={2024}>2024</option>
                      <option value={2023}>2023</option>
                    </select>
                    <span className="text-sm">년</span>

                    <select
                      value={filters.downloadPeriod.startMonth}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          downloadPeriod: {
                            ...prev.downloadPeriod,
                            startMonth: parseInt(e.target.value),
                          },
                        }))
                      }
                      className="px-2 py-1 border border-gray-300 rounded text-sm"
                    >
                      {Array.from({ length: 12 }, (_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {i + 1}
                        </option>
                      ))}
                    </select>
                    <span className="text-sm">월</span>

                    <select
                      value={filters.downloadPeriod.startDay}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          downloadPeriod: {
                            ...prev.downloadPeriod,
                            startDay: parseInt(e.target.value),
                          },
                        }))
                      }
                      className="px-2 py-1 border border-gray-300 rounded text-sm"
                    >
                      {Array.from({ length: 31 }, (_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {i + 1}
                        </option>
                      ))}
                    </select>
                    <span className="text-sm">일 ~</span>
                  </div>

                  <div className="flex gap-2 items-center">
                    <select
                      value={filters.downloadPeriod.endYear}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          downloadPeriod: {
                            ...prev.downloadPeriod,
                            endYear: parseInt(e.target.value),
                          },
                        }))
                      }
                      className="px-2 py-1 border border-gray-300 rounded text-sm"
                    >
                      <option value={2025}>2025</option>
                      <option value={2024}>2024</option>
                      <option value={2023}>2023</option>
                    </select>
                    <span className="text-sm">년</span>

                    <select
                      value={filters.downloadPeriod.endMonth}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          downloadPeriod: {
                            ...prev.downloadPeriod,
                            endMonth: parseInt(e.target.value),
                          },
                        }))
                      }
                      className="px-2 py-1 border border-gray-300 rounded text-sm"
                    >
                      {Array.from({ length: 12 }, (_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {i + 1}
                        </option>
                      ))}
                    </select>
                    <span className="text-sm">월</span>

                    <select
                      value={filters.downloadPeriod.endDay}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          downloadPeriod: {
                            ...prev.downloadPeriod,
                            endDay: parseInt(e.target.value),
                          },
                        }))
                      }
                      className="px-2 py-1 border border-gray-300 rounded text-sm"
                    >
                      {Array.from({ length: 31 }, (_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {i + 1}
                        </option>
                      ))}
                    </select>
                    <span className="text-sm">일</span>
                  </div>
                </div>

                <div>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "today",
                      "7days",
                      "10days",
                      "15days",
                      "1month",
                      "3months",
                      "6months",
                    ].map((period) => (
                      <button
                        key={period}
                        onClick={() =>
                          setFilters((prev) => ({
                            ...prev,
                            downloadInterval: period as any,
                          }))
                        }
                        className={`px-3 py-1 text-sm border rounded ${
                          filters.downloadInterval === period
                            ? "bg-blue-500 text-white border-blue-500"
                            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {period === "today"
                          ? "오늘"
                          : period === "7days"
                            ? "7일"
                            : period === "10days"
                              ? "10일"
                              : period === "15days"
                                ? "15일"
                                : period === "1month"
                                  ? "1개월"
                                  : period === "3months"
                                    ? "3개월"
                                    : period === "6months"
                                      ? "6개월"
                                      : period}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 상품 등록하기 버튼 */}
            <div className="flex justify-center pt-4">
              <button
                onClick={handleFetchProducts}
                disabled={isLoading}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center gap-2 font-medium"
              >
                {isLoading && (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                )}
                � 상품 조회하기
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <div className="bg-white border rounded-lg p-12 text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {malls.find((m) => m.id === activeTab)?.name} 상품 정보를 불러오는
            중...
          </h3>
          <p className="text-gray-600">
            필터 조건에 맞는 상품 데이터를 조회하고 있습니다.
          </p>
        </div>
      )}

      {/* Results */}
      {externalProducts.length > 0 && !isLoading && (
        <div className="bg-white border rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <span>{malls.find((m) => m.id === activeTab)?.emoji}</span>
                {malls.find((m) => m.id === activeTab)?.name} 상품 조회 결과
              </h2>
              <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                총 {externalProducts.length}개 상품
              </span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleImportSelected}
                disabled={selectedProducts.length === 0}
                className="px-4 py-2 text-sm text-blue-600 border border-blue-300 rounded hover:bg-blue-50 disabled:text-gray-400 disabled:border-gray-300"
              >
                선택 등록 ({selectedProducts.length})
              </button>
              <button
                onClick={handleImportAll}
                className="px-4 py-2 text-sm text-white bg-blue-500 rounded hover:bg-blue-600"
              >
                전체 등록
              </button>
            </div>
          </div>

          {/* 필터 적용 현황 */}
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-sm text-blue-800">
              <span className="font-medium">적용된 필터:</span>
              {filters.optionDisplay && (
                <span className="ml-2 bg-blue-100 px-2 py-1 rounded text-xs">
                  옵션명 작용
                </span>
              )}
              {filters.productNameSearch && (
                <span className="ml-2 bg-blue-100 px-2 py-1 rounded text-xs">
                  상품명: {filters.productNameSearch}
                </span>
              )}
              {filters.displayStatus !== "all" && (
                <span className="ml-2 bg-blue-100 px-2 py-1 rounded text-xs">
                  진열:{" "}
                  {filters.displayStatus === "display"
                    ? "진열함"
                    : filters.displayStatus === "hide"
                      ? "진열안함"
                      : "품절"}
                </span>
              )}
              {filters.downloadInterval !== "today" && (
                <span className="ml-2 bg-blue-100 px-2 py-1 rounded text-xs">
                  기간:{" "}
                  {filters.downloadInterval === "7days"
                    ? "7일"
                    : filters.downloadInterval === "1month"
                      ? "1개월"
                      : filters.downloadInterval === "3months"
                        ? "3개월"
                        : filters.downloadInterval === "6months"
                          ? "6개월"
                          : filters.downloadInterval}
                </span>
              )}
            </div>
          </div>

          {/* Select All */}
          <div className="mb-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedProducts.length === externalProducts.length}
                onChange={handleSelectAll}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label className="text-sm text-gray-700">전체 선택</label>
            </div>
          </div>

          {/* Products Grid - 메이크샵 스타일 */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    선택
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    상품명
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    상품코드
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    카테고리
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    판매가
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    재고
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    상태
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    등록일
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    바코드
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {externalProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product.id)}
                        onChange={() => handleProductSelect(product.id)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {product.externalName}
                        </div>
                        <div className="text-xs text-gray-500">
                          브랜드: {product.brand}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-600 font-mono">
                        {product.externalCode}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-600">
                        {product.category}
                      </div>
                      <div className="text-xs text-gray-400">
                        코드: {product.categoryCode}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-gray-900">
                        ₩{product.price.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-600">
                        {product.stockQty}개
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        <div>
                          {product.productStatus === "sale" && (
                            <span className="inline-flex px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                              판매중
                            </span>
                          )}
                          {product.productStatus === "stop" && (
                            <span className="inline-flex px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                              판매중지
                            </span>
                          )}
                          {product.productStatus === "soldout" && (
                            <span className="inline-flex px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                              품절
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">
                          진열: {product.displayStatus === "Y" ? "○" : "×"} |
                          판매: {product.sellStatus === "Y" ? "○" : "×"}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-600">
                        {product.registDate}
                      </div>
                      <div className="text-xs text-gray-400">
                        수정: {product.modifyDate}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm">
                        {product.hasBarcode ? (
                          <span className="inline-flex px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                            있음
                          </span>
                        ) : (
                          <span className="inline-flex px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                            없음
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Import Statistics */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
              <div className="text-2xl font-bold text-blue-600">
                {externalProducts.length}
              </div>
              <div className="text-sm text-blue-700">총 상품 수</div>
            </Card>
            <Card className="bg-gradient-to-br from-green-50 to-green-100">
              <div className="text-2xl font-bold text-green-600">
                {
                  externalProducts.filter((p) => p.productStatus === "sale")
                    .length
                }
              </div>
              <div className="text-sm text-green-700">판매중 상품</div>
            </Card>
            <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100">
              <div className="text-2xl font-bold text-yellow-600">
                {externalProducts.filter((p) => p.hasBarcode).length}
              </div>
              <div className="text-sm text-yellow-700">바코드 보유</div>
            </Card>
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
              <div className="text-2xl font-bold text-purple-600">
                {selectedProducts.length}
              </div>
              <div className="text-sm text-purple-700">선택된 상품</div>
            </Card>
          </div>

          {/* Import Policy Notice */}
          <Card className="mt-6 bg-yellow-50 border-yellow-200">
            <h4 className="text-sm font-medium text-yellow-800 mb-2">
              📋 등록 정책
            </h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>
                • 외부 상품코드가 기존 상품과 중복되는 경우 자동으로 번호가
                추가됩니다.
              </li>
              <li>
                • 바코드가 없는 상품은 FULGO 바코드 정책에 따라 자동 생성됩니다.
              </li>
              <li>• 카테고리 매핑이 없는 경우 "기타" 카테고리로 분류됩니다.</li>
              <li>• 등록 후 상품 목록에서 추가 정보를 수정할 수 있습니다.</li>
              <li>
                • 진열 상태와 판매 상태는 외부 쇼핑몰 설정이 우선 적용됩니다.
              </li>
            </ul>
          </Card>
        </div>
      )}

      {/* Empty State */}
      {externalProducts.length === 0 && !isLoading && (
        <Card className="text-center p-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">
              {malls.find((m) => m.id === activeTab)?.emoji || "🛒"}
            </span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {malls.find((m) => m.id === activeTab)?.name} 상품이 없습니다
          </h3>
          <p className="text-gray-600 mb-6">
            연결 상태를 확인하고 필터 조건을 변경한 후 다시 조회해주세요.
          </p>

          {/* 체크리스트 */}
          <div className="text-left max-w-md mx-auto bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-3">확인 사항:</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    activeTab === "makeshop" ? "bg-green-400" : "bg-yellow-400"
                  }`}
                ></span>
                {malls.find((m) => m.id === activeTab)?.name} API 연결 상태
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                인증 정보 및 권한 설정
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
                필터 조건 (상품명, 카테고리, 기간 등)
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                판매처 상품 등록 현황
              </li>
            </ul>
          </div>

          <Button
            variant="secondary"
            onClick={() => handleFetchProducts()}
            className="mt-6"
          >
            다시 조회하기
          </Button>
        </Card>
      )}
    </Container>
  );
};

export default ProductImportPage;
