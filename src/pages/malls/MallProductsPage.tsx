import React, { useEffect, useMemo, useState } from "react";
import { Container } from "../../design-system";
import MallProductManager from "../../components/malls/MallProductManager";
import EditProductModal from "../../components/malls/EditProductModal";
import MallExtraInfoManager from "../../components/malls/MallExtraInfoManager";
import MallCategoryMapping from "../../components/malls/MallCategoryMapping";
// classifications are loaded via API in effects below
import TableExportButton from "../../components/common/TableExportButton";

type Mall = {
  id: string;
  name: string;
  status: "active" | "inactive";
  totalProducts: number;
};

type MallProduct = {
  id: number;
  productId: string;
  name: string;
  mallProductId: string;
  mallProductName: string;
  price: number;
  mallPrice: number;
  stock: number;
  mallStock: number;
  status: "active" | "inactive";
  syncStatus: "synced" | "price_diff" | "stock_diff" | "out_of_stock" | "error";
  lastSync: string;
  mallUrl: string;
  category: string;
};

const MallProductsPage: React.FC = () => {
  const [selectedMall, setSelectedMall] = useState<string>("");
  const [products, setProducts] = useState<MallProduct[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 20;
  const [showManager, setShowManager] = useState(false);
  const [showEditModal, setShowEditModal] = useState<{
    productId: string;
  } | null>(null);
  const [showExtraInfoModal, setShowExtraInfoModal] = useState(false);
  const [showCategoryMapModal, setShowCategoryMapModal] = useState(false);
  const [categoryMappings, setCategoryMappings] = useState<
    Record<string, string>
  >({});
  const [pathToId, setPathToId] = useState<Record<string, string>>({});
  const [extraInfo, setExtraInfo] = useState<Record<string, string>>({});
  const [overrides, setOverrides] = useState<Record<string, any>>({});

  const malls: Mall[] = [
    {
      id: "naver",
      name: "네이버 스마트스토어",
      status: "active",
      totalProducts: 1245,
    },
    { id: "coupang", name: "쿠팡", status: "active", totalProducts: 856 },
    { id: "gmarket", name: "G마켓", status: "active", totalProducts: 634 },
    { id: "11st", name: "11번가", status: "active", totalProducts: 423 },
    { id: "wemakeprice", name: "위메프", status: "active", totalProducts: 289 },
    { id: "cafe24", name: "카페24", status: "inactive", totalProducts: 156 },
  ];

  const sampleProducts: MallProduct[] = useMemo(
    () => [
      {
        id: 1,
        productId: "SAMSUNG-S24U-001",
        name: "삼성 갤럭시 S24 Ultra",
        mallProductId: "NAVER001",
        mallProductName: "[삼성전자] 갤럭시 S24 울트라 256GB 티타늄 그레이",
        price: 1299000,
        mallPrice: 1299000,
        stock: 25,
        mallStock: 25,
        status: "active",
        syncStatus: "synced",
        lastSync: "2025-01-20 14:30:00",
        mallUrl: "https://smartstore.naver.com/products/123456",
        category: "전자제품 > 스마트폰",
      },
      {
        id: 2,
        productId: "LG-GRAM17-001",
        name: "LG 그램 17인치 노트북",
        mallProductId: "NAVER002",
        mallProductName: "[LG전자] 그램 17인치 i7 16GB 1TB 스노우 화이트",
        price: 2290000,
        mallPrice: 2190000,
        stock: 8,
        mallStock: 8,
        status: "active",
        syncStatus: "price_diff",
        lastSync: "2025-01-20 14:25:00",
        mallUrl: "https://smartstore.naver.com/products/123457",
        category: "전자제품 > 노트북",
      },
      {
        id: 3,
        productId: "DYSON-V15D-001",
        name: "다이슨 V15 디텍트 무선청소기",
        mallProductId: "NAVER003",
        mallProductName: "[다이슨] V15 디텍트 무선청소기 골드/퍼플",
        price: 899000,
        mallPrice: 899000,
        stock: 15,
        mallStock: 12,
        status: "active",
        syncStatus: "stock_diff",
        lastSync: "2025-01-20 14:20:00",
        mallUrl: "https://smartstore.naver.com/products/123458",
        category: "가전제품 > 청소기",
      },
      {
        id: 4,
        productId: "AP-SHS-JA001",
        name: "아모레퍼시픽 설화수 자음생크림",
        mallProductId: "NAVER004",
        mallProductName: "[설화수] 자음생크림 60ml 정품",
        price: 195000,
        mallPrice: 195000,
        stock: 0,
        mallStock: 0,
        status: "inactive",
        syncStatus: "out_of_stock",
        lastSync: "2025-01-20 14:15:00",
        mallUrl: "https://smartstore.naver.com/products/123459",
        category: "화장품/뷰티 > 스킨케어",
      },
    ],
    [],
  );

  useEffect(() => {
    if (selectedMall) setProducts(sampleProducts);
    else setProducts([]);
  }, [selectedMall, sampleProducts]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("mallProductOverrides");
      const parsed = raw ? JSON.parse(raw) : {};
      setOverrides(parsed[selectedMall] || {});
    } catch (e) {
      setOverrides({});
    }
  }, [selectedMall]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("mallCategoryMappings");
      const parsed = raw ? JSON.parse(raw) : {};
      setCategoryMappings(parsed[selectedMall] || {});
    } catch (e) {
      setCategoryMappings({});
    }
    try {
      const raw2 = localStorage.getItem("mallExtraInfo");
      const parsed2 = raw2 ? JSON.parse(raw2) : {};
      setExtraInfo(parsed2[selectedMall] || {});
    } catch (e) {
      setExtraInfo({});
    }
  }, [selectedMall]);

  // build path -> id map for classifications
  useEffect(() => {
    let mounted = true;
    fetch("/api/meta/classifications")
      .then((r) =>
        r.ok
          ? r.json().then((b) => b.classifications || [])
          : Promise.resolve([]),
      )
      .then((data: any[]) => {
        if (!mounted) return;
        const p2i: Record<string, string> = {};
        const walk = (nodes: any[], parents: string[] = []) => {
          nodes.forEach((n) => {
            const path = parents.concat(n.name).join(" > ");
            p2i[path] = n.id;
            if (n.children) walk(n.children, parents.concat(n.name));
          });
        };
        walk(data || []);
        setPathToId(p2i);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  const applyOverridesToProduct = (product: MallProduct) => {
    const byKey = overrides?.[product.productId];
    if (byKey) return { ...product, ...byKey };
    const found = Object.values(overrides || {}).find(
      (o: any) => o.productId === product.productId,
    );
    return found ? { ...product, ...found } : product;
  };

  const filteredProducts = products.filter((product) => {
    const effective = applyOverridesToProduct(product);
    const matchesSearch =
      effective.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      effective.mallProductName
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || product.syncStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / itemsPerPage),
  );
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const selectedMallInfo = malls.find((m) => m.id === selectedMall);

  const exportData = products.map((p) => ({
    productId: p.productId,
    name: p.name,
    mallProductId: p.mallProductId,
    mallProductName: p.mallProductName,
    price: p.price,
    mallPrice: p.mallPrice,
    stock: p.stock,
    mallStock: p.mallStock,
    syncStatus: p.syncStatus,
    lastSync: p.lastSync,
    category: p.category,
  }));

  const getSyncStatusInfo = (status: string) => {
    const statusMap: Record<string, { text: string; color: string }> = {
      synced: {
        text: "동기화됨",
        color: "border border-gray-400 text-gray-700",
      },
      price_diff: {
        text: "가격 차이",
        color: "border border-gray-400 text-gray-700",
      },
      stock_diff: {
        text: "재고 차이",
        color: "border border-gray-400 text-gray-700",
      },
      out_of_stock: {
        text: "품절",
        color: "border border-gray-400 text-gray-700",
      },
      error: { text: "오류", color: "border border-gray-400 text-gray-700" },
    };
    return (
      statusMap[status] || {
        text: status,
        color: "border border-gray-400 text-gray-700",
      }
    );
  };

  const handleSyncProduct = (productId: number) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId
          ? {
              ...p,
              syncStatus: "synced",
              lastSync: new Date().toLocaleString("ko-KR"),
              mallPrice: p.price,
              mallStock: p.stock,
            }
          : p,
      ),
    );
    alert("상품이 동기화되었습니다.");
  };

  const handleSyncAll = () => {
    if (!window.confirm("모든 상품을 동기화하시겠습니까?")) return;
    setProducts((prev) =>
      prev.map((p) => ({
        ...p,
        syncStatus: "synced",
        lastSync: new Date().toLocaleString("ko-KR"),
        mallPrice: p.price,
        mallStock: p.stock,
      })),
    );
    alert("모든 상품이 동기화되었습니다.");
  };

  const handleDeleteProduct = (productId: number) => {
    if (!window.confirm("이 상품을 쇼핑몰에서 제거하시겠습니까?")) return;
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    alert("상품이 제거되었습니다.");
  };

  return (
    <Container maxWidth="full">
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            쇼핑몰별 상품 관리
          </h1>
          <p className="text-gray-600">
            각 쇼핑몰에 등록된 상품의 동기화 상태를 관리합니다.
          </p>
        </div>

        <div className="bg-white border rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">쇼핑몰 선택</h2>
            {selectedMall && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSyncAll}
                  className="px-4 py-2 border border-gray-400 text-gray-700 hover:bg-gray-100"
                >
                  전체 동기화
                </button>
                <button
                  onClick={() => setShowManager(true)}
                  className="px-3 py-2 bg-indigo-600 text-white rounded"
                >
                  쇼핑몰별 상품 관리
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {malls.map((mall) => (
              <div
                key={mall.id}
                onClick={() => setSelectedMall(mall.id)}
                className={`p-3 border cursor-pointer ${selectedMall === mall.id ? "border-gray-800 bg-gray-100" : "border-gray-300 hover:border-gray-400"} ${mall.status === "inactive" ? "opacity-50" : ""}`}
              >
                <div className="text-center">
                  <div className="text-lg mb-2">□</div>
                  <div className="text-sm text-gray-900">{mall.name}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {mall.totalProducts}개
                  </div>
                  <div
                    className={`text-xs mt-1 ${mall.status === "active" ? "text-gray-600" : "text-gray-400"}`}
                  >
                    {mall.status === "active" ? "연결" : "미연결"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {selectedMall ? (
          <>
            <div className="bg-white border rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {selectedMallInfo?.name} 상품 목록
                </h3>
                <div className="flex gap-2 items-center">
                  <button
                    onClick={() => setShowExtraInfoModal(true)}
                    className="px-3 py-1 border rounded text-sm"
                  >
                    부가 정보 관리
                  </button>
                  <button
                    onClick={() => setShowCategoryMapModal(true)}
                    className="px-3 py-1 border rounded text-sm"
                  >
                    카테고리 매핑
                  </button>
                  <TableExportButton
                    data={exportData}
                    fileName={`${selectedMall || "products"}-products.xlsx`}
                  />
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex-1 min-w-64">
                  <input
                    type="text"
                    placeholder="상품명"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">전체 상태</option>
                  <option value="synced">동기화됨</option>
                  <option value="price_diff">가격 차이</option>
                  <option value="stock_diff">재고 차이</option>
                  <option value="out_of_stock">품절</option>
                  <option value="error">오류</option>
                </select>
              </div>
            </div>

            <div className="bg-white border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 min-w-0">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        상품 정보
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        가격 비교
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        재고 비교
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        동기화 상태
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        마지막 동기화
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        관리
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paginatedProducts.map((product) => {
                      const syncInfo = getSyncStatusInfo(product.syncStatus);
                      const effective = applyOverridesToProduct(product);
                      return (
                        <tr key={product.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div>
                              <div className="flex items-center gap-2">
                                <div className="text-sm font-medium text-gray-900">
                                  {effective.name}
                                </div>
                                {((overrides && overrides[product.productId]) ||
                                  Object.values(overrides || {}).find(
                                    (o: any) =>
                                      o.productId === product.productId,
                                  )) && (
                                  <div className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                                    오버라이드
                                  </div>
                                )}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                코드: {effective.productId}
                              </div>
                              <div className="text-xs text-blue-600 mt-1">
                                쇼핑몰: {effective.mallProductName}
                              </div>
                              <div className="text-xs text-gray-400 mt-1">
                                {effective.category}
                                {(() => {
                                  const cid = pathToId[effective.category];
                                  const mapped = cid
                                    ? categoryMappings[cid]
                                    : categoryMappings[effective.category];
                                  return mapped ? (
                                    <span className="ml-2 text-xs text-green-600">
                                      → {mapped}
                                    </span>
                                  ) : null;
                                })()}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm">
                              <div
                                className={`${effective.price !== (effective.mallPrice || 0) ? "text-red-600" : "text-gray-900"}`}
                              >
                                기준: ₩{effective.price.toLocaleString()}
                              </div>
                              <div
                                className={`${effective.price !== (effective.mallPrice || 0) ? "text-red-600" : "text-gray-600"}`}
                              >
                                쇼핑몰: ₩
                                {(effective.mallPrice || 0).toLocaleString()}
                              </div>
                              {effective.price !==
                                (effective.mallPrice || 0) && (
                                <div className="text-xs text-red-500 mt-1">
                                  차이: ₩
                                  {Math.abs(
                                    effective.price -
                                      (effective.mallPrice || 0),
                                  ).toLocaleString()}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm">
                              <div
                                className={`${effective.stock !== (effective.mallStock || 0) ? "text-red-600" : "text-gray-900"}`}
                              >
                                기준: {effective.stock}개
                              </div>
                              <div
                                className={`${effective.stock !== (effective.mallStock || 0) ? "text-red-600" : "text-gray-600"}`}
                              >
                                쇼핑몰: {effective.mallStock || 0}개
                              </div>
                              {effective.stock !==
                                (effective.mallStock || 0) && (
                                <div className="text-xs text-red-500 mt-1">
                                  차이:{" "}
                                  {Math.abs(
                                    effective.stock -
                                      (effective.mallStock || 0),
                                  )}
                                  개
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex px-2 py-1 text-xs ${syncInfo.color}`}
                            >
                              {syncInfo.text}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {product.lastSync}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleSyncProduct(product.id)}
                                className="text-xs text-blue-600 hover:text-blue-900 border border-blue-300 px-2 py-1 rounded"
                              >
                                동기화
                              </button>
                              <a
                                href={product.mallUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-green-600 hover:text-green-900 border border-green-300 px-2 py-1 rounded"
                              >
                                보기
                              </a>
                              <button
                                onClick={() => handleDeleteProduct(product.id)}
                                className="text-xs text-red-600 hover:text-red-900 border border-red-300 px-2 py-1 rounded"
                              >
                                제거
                              </button>
                              <button
                                onClick={() =>
                                  setShowEditModal({
                                    productId: product.productId,
                                  })
                                }
                                className="text-xs text-indigo-600 hover:text-indigo-900 border border-indigo-300 px-2 py-1 rounded"
                              >
                                편집
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {[
                { label: "전체", count: products.length },
                {
                  label: "동기화됨",
                  count: products.filter((p) => p.syncStatus === "synced")
                    .length,
                },
                {
                  label: "가격 차이",
                  count: products.filter((p) => p.syncStatus === "price_diff")
                    .length,
                },
                {
                  label: "재고 차이",
                  count: products.filter((p) => p.syncStatus === "stock_diff")
                    .length,
                },
                {
                  label: "품절/오류",
                  count: products.filter((p) =>
                    ["out_of_stock", "error"].includes(p.syncStatus),
                  ).length,
                },
              ].map((stat, index) => (
                <div
                  key={index}
                  className="bg-white border border-gray-300 p-4 text-center"
                >
                  <div className="text-sm text-gray-700 mb-1">
                    □ {stat.label}
                  </div>
                  <div className="text-xl text-gray-900">{stat.count}</div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="bg-white border rounded-lg p-8 text-center">
            <div className="text-gray-400 text-lg mb-2">□</div>
            <p className="text-gray-600">
              상품을 관리할 쇼핑몰을 선택해주세요.
            </p>
          </div>
        )}

        {showManager && selectedMall && (
          <MallProductManager
            mallId={selectedMall}
            availableProducts={products.map((p) => ({
              productId: p.productId,
              name: p.name,
              mallProductName: p.mallProductName,
              mallPrice: p.mallPrice,
              mallStock: p.mallStock,
            }))}
            onClose={() => {
              setShowManager(false);
              try {
                const raw = localStorage.getItem("mallProductOverrides");
                const parsed = raw ? JSON.parse(raw) : {};
                setOverrides(parsed[selectedMall] || {});
              } catch (e) {
                setOverrides({});
              }
            }}
            onApply={(o) => setOverrides(o)}
          />
        )}
        {showEditModal && selectedMall && (
          <EditProductModal
            mallId={selectedMall}
            productId={showEditModal.productId}
            onClose={() => setShowEditModal(null)}
            onSaved={(o) => setOverrides(o)}
          />
        )}
        {showExtraInfoModal && selectedMall && (
          <MallExtraInfoManager
            mallId={selectedMall}
            onClose={() => setShowExtraInfoModal(false)}
            onApply={(v) => setExtraInfo(v)}
          />
        )}
        {showCategoryMapModal && selectedMall && (
          <MallCategoryMapping
            mallId={selectedMall}
            internalCategories={Array.from(
              new Set(
                (function flatten(t: any[], parents: string[] = []) {
                  const out: string[] = [];
                  t.forEach((n) => {
                    const path = parents.concat(n.name);
                    out.push(path.join(" > "));
                    if (n.children) out.push(...flatten(n.children, path));
                  });
                  return out;
                })(
                  /* loaded via /api/meta/classifications and stored in localStorage */ JSON.parse(
                    window.localStorage.getItem("productClassificationsTree") ||
                      "[]",
                  ),
                ),
              ),
            )}
            products={products}
            onClose={() => setShowCategoryMapModal(false)}
            onApply={(m) => setCategoryMappings(m)}
          />
        )}
      </div>
    </Container>
  );
};

export default MallProductsPage;
